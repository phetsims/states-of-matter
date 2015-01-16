// Copyright 2002-2014, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction
 * based on the Lennard-Jones potential - monatomic (i.e. one atom per
 * molecule) version.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var AbstractVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/AbstractVerletAlgorithm' );
  var MonatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/MonatomicAtomPositionUpdater' );

  /**
   * @param {MultipleParticleModel} model
   * @constructor
   */
  function MonatomicVerletAlgorithm( model ) {
    AbstractVerletAlgorithm.call( this, model );
    this.positionUpdater = new MonatomicAtomPositionUpdater();
    this.epsilon = 1; // Controls the strength of particle interaction.
  }

  return inherit( AbstractVerletAlgorithm, MonatomicVerletAlgorithm, {
    /**
     *
     * @param {Number} scaledEpsilon
     */
    setScaledEpsilon: function( scaledEpsilon ) {
      this.epsilon = scaledEpsilon;
    },
    getPressure: function() {
      return this.pressure;
    },

    getTemperature: function() {
      return this.temperature;
    },


    getScaledEpsilon: function() {
      return this.epsilon;
    },

    /**
     * Update the motion of the particles and the forces that are acting upon
     * them.  This is the heart of this class, and it is here that the actual
     * Verlet algorithm is contained.
     */
    updateForcesAndMotion: function() {

      var kineticEnergy = 0;
      var potentialEnergy = 0;

      // Obtain references to the model data and parameters so that we can perform fast manipulations.
      var moleculeDataSet = this.model.moleculeDataSet;
      var numberOfAtoms = moleculeDataSet.numberOfAtoms;
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeForces = moleculeDataSet.moleculeForces;
      var nextMoleculeForces = moleculeDataSet.nextMoleculeForces;

      var i;

      // Update the positions of all particles based on their current
      // velocities and the forces acting on them.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        var xPos = moleculeCenterOfMassPositions[ i ].x + ( this.TIME_STEP * moleculeVelocities[ i ].x ) +
                   ( this.TIME_STEP_SQR_HALF * moleculeForces[ i ].x );
        var yPos = moleculeCenterOfMassPositions[ i ].y + ( this.TIME_STEP * moleculeVelocities[ i ].y ) +
                   ( this.TIME_STEP_SQR_HALF * moleculeForces[ i ].y );
        moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );
      }

      // Calculate the forces exerted on the particles by the container walls and by gravity.
      var pressureZoneWallForce = 0;
      for ( i = 0; i < numberOfAtoms; i++ ) {

        // Clear the previous calculation's particle forces.
        nextMoleculeForces[ i ].setXY( 0, 0 );

        // Get the force values caused by the container walls.
        this.calculateWallForce( moleculeCenterOfMassPositions[ i ], this.model.normalizedContainerWidth,
          this.model.normalizedContainerHeight, nextMoleculeForces[ i ] );

        // Accumulate this force value as part of the pressure being
        // exerted on the walls of the container.
        if ( nextMoleculeForces[ i ].y < 0 ) {
          pressureZoneWallForce += -nextMoleculeForces[ i ].y;
        }
        else if ( moleculeCenterOfMassPositions[ i ].y > this.model.normalizedContainerHeight / 2 ) {
          // If the particle bounced on one of the walls above the midpoint, add
          // in that value to the pressure.
          pressureZoneWallForce += Math.abs( nextMoleculeForces[ i ].x );
        }

        nextMoleculeForces[ i ].setY( nextMoleculeForces[ i ].y - this.model.gravitationalAcceleration );
      }

      // Update the pressure calculation.
      this.updatePressure( pressureZoneWallForce );

      // If there are any atoms that are currently designated as "unsafe",
      // check them to see if they can be moved into the "safe" category.
      if ( moleculeDataSet.numberOfSafeMolecules < numberOfAtoms ) {
        this.updateMoleculeSafety();
      }

      var numberOfSafeAtoms = moleculeDataSet.numberOfSafeMolecules;

      // Calculate the forces created through interactions with other particles.
      var force = new Vector2();
      for ( i = 0; i < numberOfSafeAtoms; i++ ) {
        for ( var j = i + 1; j < numberOfSafeAtoms; j++ ) {

          var dx = moleculeCenterOfMassPositions[ i ].x - moleculeCenterOfMassPositions[ j ].x;
          var dy = moleculeCenterOfMassPositions[ i ].y - moleculeCenterOfMassPositions[ j ].y;
          var distanceSqrd = ( dx * dx ) + ( dy * dy );

          if ( distanceSqrd === 0 ) {
            // Handle the special case where the particles are right
            // on top of each other by assigning an arbitrary spacing.
            // In general, this only happens when injecting new
            // particles.
            dx = 1;
            dy = 1;
            distanceSqrd = 2;
          }

          if ( distanceSqrd < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            // This pair of particles is close enough to one another
            // that we need to calculate their interaction forces.
            if ( distanceSqrd < this.MIN_DISTANCE_SQUARED ) {
              distanceSqrd = this.MIN_DISTANCE_SQUARED;
            }
            var r2inv = 1 / distanceSqrd;
            var r6inv = r2inv * r2inv * r2inv;
            var forceScalar = 48 * r2inv * r6inv * ( r6inv - 0.5 ) * this.epsilon;
            force.setX( dx * forceScalar );
            force.setY( dy * forceScalar );
            nextMoleculeForces[ i ].add( force );
            nextMoleculeForces[ j ].subtract( force );
            potentialEnergy += 4 * r6inv * ( r6inv - 1 ) + 0.016316891136;
          }
        }
      }

      // Calculate the new velocities based on the old ones and the forces
      // that are acting on the particle.
      var velocityIncrement = new Vector2();
      for ( i = 0; i < numberOfAtoms; i++ ) {
        velocityIncrement.setX( this.TIME_STEP_HALF * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ) );
        velocityIncrement.setY( this.TIME_STEP_HALF * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y ) );
        moleculeVelocities[ i ].add( velocityIncrement );
        kineticEnergy += ( ( moleculeVelocities[ i ].x * moleculeVelocities[ i ].x ) +
                           ( moleculeVelocities[ i ].y * moleculeVelocities[ i ].y ) ) / 2;
      }

      // Record the calculated temperature.
      this.temperature = kineticEnergy / numberOfAtoms;

      // Synchronize the molecule and atom positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Replace the new forces with the old ones.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
      }
    }
  } );
} );
