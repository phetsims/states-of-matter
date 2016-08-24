// Copyright 2014-2015, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential -
 * monatomic (i.e. one atom per molecule) version.
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
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function MonatomicVerletAlgorithm( multipleParticleModel ) {
    AbstractVerletAlgorithm.call( this, multipleParticleModel );
    this.positionUpdater = MonatomicAtomPositionUpdater;
    this.epsilon = 1; // controls the strength of particle interaction

    // reusable vectors for reducing allocations
    this.force = new Vector2();
    this.velocityIncrement = new Vector2();
  }

  statesOfMatter.register( 'MonatomicVerletAlgorithm', MonatomicVerletAlgorithm );

  return inherit( AbstractVerletAlgorithm, MonatomicVerletAlgorithm, {

    /**
     * @param {number} scaledEpsilon
     * @public
     */
    setScaledEpsilon: function( scaledEpsilon ) {
      this.epsilon = scaledEpsilon;
    },

    /**
     * @returns {number}
     * @public
     */
    getPressure: function() {
      return this.pressure;
    },

    /**
     * @returns {number}
     * @public
     */
    getTemperature: function() {
      return this.temperature;
    },

    /**
     * @returns {number}
     * @public
     */
    getScaledEpsilon: function() {
      return this.epsilon;
    },

    /**
     * Update the motion of the particles and the forces that are acting upon them.  This is the heart of this class,
     * and it is here that the actual Verlet algorithm is contained.
     * @public
     */
    updateForcesAndMotion: function( timeStep ) {

      var kineticEnergy = 0;
      var potentialEnergy = 0;

      // Obtain references to the model data and parameters so that we can perform fast manipulations.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var numberOfAtoms = moleculeDataSet.numberOfAtoms;
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeForces = moleculeDataSet.moleculeForces;
      var nextMoleculeForces = moleculeDataSet.nextMoleculeForces;

      var timeStepSqrHalf = timeStep * timeStep * 0.5;
      var timeStepHalf = timeStep / 2;

      var i;

      // TODO: Document what the offset is all about
      var offset = 0;
      if ( this.multipleParticleModel.currentMolecule === StatesOfMatterConstants.ARGON ){
        offset = 6;
      }

      if ( this.multipleParticleModel.currentMolecule === StatesOfMatterConstants.USER_DEFINED_MOLECULE ){
        offset = 4;
      }

      // Update the positions of all particles based on their current velocities and the forces acting on them.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        var yPos = moleculeCenterOfMassPositions[ i ].y + ( timeStep * moleculeVelocities[ i ].y ) +
                             ( timeStepSqrHalf * moleculeForces[ i ].y );
        var xPos = moleculeCenterOfMassPositions[ i ].x + ( timeStep * moleculeVelocities[ i ].x ) +
                   ( timeStepSqrHalf * moleculeForces[ i ].x );
        moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );
      }

      // Synchronize the molecule and atom positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet, offset );

      // Calculate the forces exerted on the particles by the container walls and by gravity.
      var pressureZoneWallForce = 0;
      for ( i = 0; i < numberOfAtoms; i++ ) {

        // Clear the previous calculation's particle forces.
        nextMoleculeForces[ i ].setXY( 0, 0 );

        // Get the force values caused by the container walls.
        this.calculateWallForce( moleculeCenterOfMassPositions[ i ], nextMoleculeForces[ i ] );

        // Accumulate this force value as part of the pressure being
        // exerted on the walls of the container.
        if ( nextMoleculeForces[ i ].y < 0 ) {
          pressureZoneWallForce += -nextMoleculeForces[ i ].y;
        }
        else if ( moleculeCenterOfMassPositions[ i ].y > this.multipleParticleModel.normalizedContainerHeight / 2 ) {
          // If the particle bounced on one of the walls above the midpoint, add
          // in that value to the pressure.
          pressureZoneWallForce += Math.abs( nextMoleculeForces[ i ].x );
        }

        nextMoleculeForces[ i ].setY( nextMoleculeForces[ i ].y - this.multipleParticleModel.gravitationalAcceleration );
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
      for ( i = 0; i < numberOfSafeAtoms; i++ ) {
        for ( var j = i + 1; j < numberOfSafeAtoms; j++ ) {

          var dx = moleculeCenterOfMassPositions[ i ].x - moleculeCenterOfMassPositions[ j ].x;
          var dy = moleculeCenterOfMassPositions[ i ].y - moleculeCenterOfMassPositions[ j ].y;
          var distanceSqrd = ( dx * dx ) + ( dy * dy );

          if ( distanceSqrd === 0 ) {
            // Handle the special case where the particles are right on top of each other by assigning an arbitrary
            // spacing. In general, this only happens when injecting new particles.
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
            this.force.setX( dx * forceScalar );
            this.force.setY( dy * forceScalar );
            nextMoleculeForces[ i ].add( this.force );
            nextMoleculeForces[ j ].subtract( this.force );
            potentialEnergy += 4 * r6inv * ( r6inv - 1 ) + 0.016316891136;
          }
        }
      }

      // Calculate the new velocities based on the old ones and the forces that are acting on the particle.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        this.velocityIncrement.setX( timeStepHalf * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ) );
        this.velocityIncrement.setY( timeStepHalf * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y ) );
        moleculeVelocities[ i ].add( this.velocityIncrement );
        kineticEnergy += ( ( moleculeVelocities[ i ].x * moleculeVelocities[ i ].x ) +
                           ( moleculeVelocities[ i ].y * moleculeVelocities[ i ].y ) ) / 2;
      }

      // Update the temperature.
      this.temperature = kineticEnergy / numberOfAtoms;

      // Replace the new forces with the old ones.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
      }
    }
  } );
} );
