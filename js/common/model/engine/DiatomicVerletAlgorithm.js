// Copyright 2014-2015, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction
 * based on the Lennard-Jones potential.  This is the diatomic (i.e. two atoms
 * per molecule) version.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var AbstractVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/AbstractVerletAlgorithm' );
  var DiatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/DiatomicAtomPositionUpdater' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @param {MultipleParticleModel} multipleParticleModel - Model of a set of particles
   * @constructor
   */
  function DiatomicVerletAlgorithm( multipleParticleModel ) {

    this.positionUpdater = DiatomicAtomPositionUpdater;
    AbstractVerletAlgorithm.call( this, multipleParticleModel );

    // Reusable force vector, created here to reduce allocations.
    this.force = new Vector2();
  }

  statesOfMatter.register( 'DiatomicVerletAlgorithm', DiatomicVerletAlgorithm );

  return inherit( AbstractVerletAlgorithm, DiatomicVerletAlgorithm, {

    /**
     * @public
     * @returns {number}
     */
    getPressure: function() {
      return this.pressure;
    },

    /**
     * @public
     * @returns {number}
     */
    getTemperature: function() {
      return this.temperature;
    },

    /**
     * Update the motion of the particles and the forces that are acting upon
     * them.  This is the heart of this class, and it is here that the actual
     * Verlet algorithm is contained.
     * @public
     */
    updateForcesAndMotion: function( timeStep ) {

      // Obtain references to the model data and parameters so that we can
      // perform fast manipulations.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeForces = moleculeDataSet.getMoleculeForces();
      var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      var moleculeTorques = moleculeDataSet.getMoleculeTorques();
      var nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();

      // Initialize other values that will be needed for the calculation.
      var massInverse = 1 / moleculeDataSet.getMoleculeMass();
      var inertiaInverse = 1 / moleculeDataSet.getMoleculeRotationalInertia();
      var normalizedContainerHeight = this.multipleParticleModel.getNormalizedContainerHeight();
      var normalizedContainerWidth = this.multipleParticleModel.getNormalizedContainerWidth();
      var pressureZoneWallForce = 0;
      var timeStepSqrHalf = timeStep * timeStep * 0.5;
      var timeStepHalf = timeStep / 2;

      // Update center of mass positions and angles for the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xPos = moleculeCenterOfMassPositions[ i ].x +
                   ( timeStep * moleculeVelocities[ i ].x ) +
                   ( timeStepSqrHalf * moleculeForces[ i ].x * massInverse);
        var yPos = moleculeCenterOfMassPositions[ i ].y +
                   ( timeStep * moleculeVelocities[ i ].y) +
                   ( timeStepSqrHalf * moleculeForces[ i ].y * massInverse);
        moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );
        moleculeRotationAngles[ i ] += ( timeStep * moleculeRotationRates[ i ]) +
                                       ( timeStepSqrHalf * moleculeTorques[ i ] * inertiaInverse);
      }
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Calculate the force from the walls.  This force is assumed to act
      // on the center of mass, so there is no torque.
      // Calculate the forces exerted on the particles by the container
      // walls and by gravity.
      for ( i = 0; i < numberOfMolecules; i++ ) {

        // Clear the previous calculation's particle forces and torques.
        nextMoleculeForces[ i ].setXY( 0, 0 );
        nextMoleculeTorques[ i ] = 0;

        // Get the force values caused by the container walls.
        this.calculateWallForce( moleculeCenterOfMassPositions[ i ], normalizedContainerWidth,
          normalizedContainerHeight, nextMoleculeForces[ i ] );

        // Accumulate this force value as part of the pressure being
        // exerted on the walls of the container.
        if ( nextMoleculeForces[ i ].y < 0 ) {
          pressureZoneWallForce += -nextMoleculeForces[ i ].y;
        }
        else if ( moleculeCenterOfMassPositions[ i ].y > this.multipleParticleModel.normalizedContainerHeight / 2 ) {

          // If the particle bounced on one of the walls above the midpoint, add
          // in that value to the press
          pressureZoneWallForce += Math.abs( nextMoleculeForces[ i ].x );
        }

        // Add in the effect of gravity.
        var gravitationalAcceleration = this.multipleParticleModel.gravitationalAcceleration;
        if ( this.multipleParticleModel.temperatureSetPoint < this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES ) {

          // Below a certain temperature, gravity is increased to counteract some odd-looking behavior
          // caused by the thermostat.
          gravitationalAcceleration = gravitationalAcceleration *
                                      ((this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES -
                                        this.multipleParticleModel.temperatureSetPoint) *
                                       this.LOW_TEMPERATURE_GRAVITY_INCREASE_RATE + 1);
        }
        nextMoleculeForces[ i ].setY( nextMoleculeForces[ i ].y - gravitationalAcceleration );
      }

      // Update the pressure calculation.
      this.updatePressure( pressureZoneWallForce );

      // If there are any atoms that are currently designated as "unsafe",
      // check them to see if they can be moved into the "safe" category.
      if ( moleculeDataSet.numberOfSafeMolecules < numberOfMolecules ) {
        this.updateMoleculeSafety();
      }
      // Calculate the force and torque due to inter-particle interactions.
      for ( i = 0; i < moleculeDataSet.numberOfSafeMolecules; i++ ) {
        for ( var j = i + 1; j < moleculeDataSet.numberOfSafeMolecules; j++ ) {
          for ( var ii = 0; ii < 2; ii++ ) {
            for ( var jj = 0; jj < 2; jj++ ) {

              // Calculate the distance between the potentially
              // interacting atoms.
              var dx = atomPositions[ 2 * i + ii ].x - atomPositions[ 2 * j + jj ].x;
              var dy = atomPositions[ 2 * i + ii ].y - atomPositions[ 2 * j + jj ].y;
              var distanceSquared = dx * dx + dy * dy;
              if ( distanceSquared < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
                if ( distanceSquared < this.MIN_DISTANCE_SQUARED ) {
                  distanceSquared = this.MIN_DISTANCE_SQUARED;
                }
                // Calculate the Lennard-Jones interaction forces.
                var r2inv = 1 / distanceSquared;
                var r6inv = r2inv * r2inv * r2inv;
                var forceScalar = 48 * r2inv * r6inv * (r6inv - 0.5);
                var fx = dx * forceScalar;
                var fy = dy * forceScalar;
                this.force.setXY( fx, fy );
                nextMoleculeForces[ i ].add( this.force );
                nextMoleculeForces[ j ].subtract( this.force );
                nextMoleculeTorques[ i ] += (atomPositions[ 2 * i + ii ].x - moleculeCenterOfMassPositions[ i ].x) * fy -
                                            (atomPositions[ 2 * i + ii ].y - moleculeCenterOfMassPositions[ i ].y) * fx;
                nextMoleculeTorques[ j ] -= (atomPositions[ 2 * j + jj ].x - moleculeCenterOfMassPositions[ j ].x) * fy -
                                            (atomPositions[ 2 * j + jj ].y - moleculeCenterOfMassPositions[ j ].y) * fx;
                this.potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
              }
            }
          }
        }
      }

      // Update center of mass velocities and angles and calculate kinetic
      // energy.
      var centersOfMassKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      for ( i = 0; i < numberOfMolecules; i++ ) {
        var xVel = moleculeVelocities[ i ].x +
                   timeStepHalf * (moleculeForces[ i ].x + nextMoleculeForces[ i ].x) * massInverse;
        var yVel = moleculeVelocities[ i ].y +
                   timeStepHalf * (moleculeForces[ i ].y + nextMoleculeForces[ i ].y) * massInverse;
        moleculeVelocities[ i ].setXY( xVel, yVel );
        moleculeRotationRates[ i ] += timeStepHalf * (moleculeTorques[ i ] + nextMoleculeTorques[ i ]) *
                                      inertiaInverse;
        centersOfMassKineticEnergy += 0.5 * moleculeDataSet.moleculeMass *
                                      (Math.pow( moleculeVelocities[ i ].x, 2 ) + Math.pow( moleculeVelocities[ i ].y, 2 ));
        rotationalKineticEnergy += 0.5 * moleculeDataSet.moleculeRotationalInertia *
                                   Math.pow( moleculeRotationRates[ i ], 2 );
        // Move the newly calculated forces and torques into the current spots.
        moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
        moleculeTorques[ i ] = nextMoleculeTorques[ i ];
      }
      // Record the calculated temperature.
      this.temperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
    }
  } );
} );
