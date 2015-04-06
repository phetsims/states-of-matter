// Copyright 2002-2015, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction
 * based on the Lennard-Jones potential.  This version is used specifically
 * for simulating water, i.e. H2O.
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
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

// Parameters used for "hollywooding" of the water crystal.


  var WATER_FULLY_MELTED_TEMPERATURE = 0.3;
  var WATER_FULLY_MELTED_ELECTROSTATIC_FORCE = 1.0;
  var WATER_FULLY_FROZEN_TEMPERATURE = 0.22;
  var WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE = 4.0;
  var MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER = 3.0;

  /**
   *
   * @param {MultipleParticleModel}  multipleParticleModel of the simulation
   * @constructor
   */
  function WaterVerletAlgorithm( multipleParticleModel ) {

    this.positionUpdater = new WaterAtomPositionUpdater();
    AbstractVerletAlgorithm.call( this, multipleParticleModel );

    // Creating here to reduce allocations.
    this.force = new Vector2();
  }

  return inherit( AbstractVerletAlgorithm, WaterVerletAlgorithm, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    getPressure: function() {
      return this.pressure;
    },
    getTemperature: function() {
      return this.temperature;
    },
    /**
     * @public
     * Update the motion of the particles and the forces that are acting upon
     * them.  This is the heart of this class, and it is here that the actual
     * Verlet algorithm is contained.
     */
    updateForcesAndMotion: function() {
      // perform fast manipulations.
      var moleculeDataSet = this.multipleParticleModel.getMoleculeDataSetRef();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeForces = moleculeDataSet.getMoleculeForces();
      var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
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
      var temperatureSetPoint = this.multipleParticleModel.getTemperatureSetPoint();
      // Verify that this is being used on an appropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );
      // calculating the coloumb interactions.
      var q0;
      var temperatureFactor;
      var repulsiveForceScalingFactor;
      var r2inv;
      var r6inv;
      var forceScalar;
      // Calculate the force and torque due to inter-particle interactions.
      if ( temperatureSetPoint < WATER_FULLY_FROZEN_TEMPERATURE ) {
        // a crystal structure.
        q0 = WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE;
      }
      else if ( temperatureSetPoint > WATER_FULLY_MELTED_TEMPERATURE ) {
        // appearance of liquid.
        q0 = WATER_FULLY_MELTED_ELECTROSTATIC_FORCE;
      }
      else {
        // melted or frozen, so scale accordingly.
        temperatureFactor = (temperatureSetPoint - WATER_FULLY_FROZEN_TEMPERATURE) /
                            (WATER_FULLY_MELTED_TEMPERATURE - WATER_FULLY_FROZEN_TEMPERATURE);
        q0 = WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE -
             (temperatureFactor * (WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE - WATER_FULLY_MELTED_ELECTROSTATIC_FORCE));
      }
      var normalCharges = [ -2 * q0, q0, q0 ];
      var alteredCharges = [ -2 * q0, 1.67 * q0, 0.33 * q0 ];
      // Update center of mass positions and angles for the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xPos = moleculeCenterOfMassPositions[ i ].x + (this.TIME_STEP * moleculeVelocities[ i ].x) +
                   (this.TIME_STEP_SQR_HALF * moleculeForces[ i ].x * massInverse);
        var yPos = moleculeCenterOfMassPositions[ i ].y + (this.TIME_STEP * moleculeVelocities[ i ].y) +
                   (this.TIME_STEP_SQR_HALF * moleculeForces[ i ].y * massInverse);
        moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );
        moleculeRotationAngles[ i ] += (this.TIME_STEP * moleculeRotationRates[ i ]) +
                                       (this.TIME_STEP_SQR_HALF * moleculeTorques[ i ] * inertiaInverse);
      }
      this.positionUpdater.updateAtomPositions( moleculeDataSet );
      // on the center of mass, so there is no torque.
      for ( i = 0; i < numberOfMolecules; i++ ) {
        // Clear the previous calculation's particle forces and torques.
        nextMoleculeForces[ i ].setXY( 0, 0 );
        nextMoleculeTorques[ i ] = 0;
        // Get the force values caused by the container walls.
        this.calculateWallForce( moleculeCenterOfMassPositions[ i ], normalizedContainerWidth, normalizedContainerHeight,
          nextMoleculeForces[ i ] );
        // exerted on the walls of the container.
        if ( nextMoleculeForces[ i ].y < 0 ) {
          pressureZoneWallForce += -nextMoleculeForces[ i ].y;
        }
        else if ( moleculeCenterOfMassPositions[ i ].y > this.multipleParticleModel.getNormalizedContainerHeight() / 2 ) {
          // in that value to the pressure.
          pressureZoneWallForce += Math.abs( nextMoleculeForces[ i ].x );
        }
        // Add in the effect of gravity.
        var gravitationalAcceleration = this.multipleParticleModel.getGravitationalAcceleration();
        if ( this.multipleParticleModel.getTemperatureSetPoint() < this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES ) {
          // caused by the thermostat.
          gravitationalAcceleration = gravitationalAcceleration *
                                      ((this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES -
                                        this.multipleParticleModel.getTemperatureSetPoint()) *
                                       this.LOW_TEMPERATURE_GRAVITY_INCREASE_RATE + 1);
        }
        nextMoleculeForces[ i ].setY( nextMoleculeForces[ i ].y - gravitationalAcceleration );
      }
      // Update the pressure calculation.
      this.updatePressure( pressureZoneWallForce );
      // check them to see if they can be moved into the "safe" category.
      if ( moleculeDataSet.getNumberOfSafeMolecules() < numberOfMolecules ) {
        this.updateMoleculeSafety();
      }

      for ( i = 0; i < moleculeDataSet.getNumberOfSafeMolecules(); i++ ) {
        // the "hollywooding" to make the solid form appear more crystalline.
        var chargesA;
        if ( i % 2 === 0 ) {
          chargesA = normalCharges;
        }
        else {
          chargesA = alteredCharges;
        }
        for ( var j = i + 1; j < moleculeDataSet.getNumberOfSafeMolecules(); j++ ) {
          // Select charges for this molecule.
          var chargesB;
          if ( j % 2 === 0 ) {
            chargesB = normalCharges;
          }
          else {
            chargesB = alteredCharges;
          }
          // Calculate Lennard-Jones potential between mass centers.
          var dx = moleculeCenterOfMassPositions[ i ].x - moleculeCenterOfMassPositions[ j ].x;
          var dy = moleculeCenterOfMassPositions[ i ].y - moleculeCenterOfMassPositions[ j ].y;
          var distanceSquared = dx * dx + dy * dy;
          if ( distanceSquared < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            if ( distanceSquared < this.MIN_DISTANCE_SQUARED ) {
              distanceSquared = this.MIN_DISTANCE_SQUARED;
            }
            r2inv = 1 / distanceSquared;
            r6inv = r2inv * r2inv * r2inv;
            // crystalline behavior we need for ice.

            if ( temperatureSetPoint > WATER_FULLY_MELTED_TEMPERATURE ) {
              // No scaling of the repulsive force.
              repulsiveForceScalingFactor = 1;
            }
            else if ( temperatureSetPoint < WATER_FULLY_FROZEN_TEMPERATURE ) {
              // Scale by the max to force space in the crystal.
              repulsiveForceScalingFactor = MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER;
            }
            else {
              // liquified, so adjust the scaling factor accordingly.
              temperatureFactor = (temperatureSetPoint - WATER_FULLY_FROZEN_TEMPERATURE) /
                                  (WATER_FULLY_MELTED_TEMPERATURE - WATER_FULLY_FROZEN_TEMPERATURE);
              repulsiveForceScalingFactor = MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER -
                                            (temperatureFactor * (MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER - 1));
            }
            forceScalar = 48 * r2inv * r6inv * ((r6inv * repulsiveForceScalingFactor) - 0.5);
            this.force.setX( dx * forceScalar );
            this.force.setY( dy * forceScalar );
            nextMoleculeForces[ i ].add( this.force );
            nextMoleculeForces[ j ].subtract( this.force );
            this.potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
          }
          if ( distanceSquared < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            // individual water molecules.
            for ( var ii = 0; ii < 3; ii++ ) {
              for ( var jj = 0; jj < 3; jj++ ) {
                if ( ((3 * i + ii + 1) % 6 === 0) || ((3 * j + jj + 1) % 6 === 0) ) {
                  // low temperatures.
                  continue;
                }
                dx = atomPositions[ 3 * i + ii ].x - atomPositions[ 3 * j + jj ].x;
                dy = atomPositions[ 3 * i + ii ].y - atomPositions[ 3 * j + jj ].y;
                distanceSquared = (dx * dx + dy * dy);
                if ( distanceSquared < this.MIN_DISTANCE_SQUARED ) {
                  distanceSquared = this.MIN_DISTANCE_SQUARED;
                }
                r2inv = 1 / distanceSquared;
                forceScalar = chargesA[ ii ] * chargesB[ jj ] * r2inv * r2inv;
                this.force.setX( dx * forceScalar );
                this.force.setY( dy * forceScalar );
                nextMoleculeForces[ i ].add( this.force );
                nextMoleculeForces[ j ].subtract( this.force );
                nextMoleculeTorques[ i ] += (atomPositions[ 3 * i + ii ].x - moleculeCenterOfMassPositions[ i ].x) * this.force.y -
                                            (atomPositions[ 3 * i + ii ].y - moleculeCenterOfMassPositions[ i ].y) * this.force.x;
                nextMoleculeTorques[ j ] -= (atomPositions[ 3 * j + jj ].x - moleculeCenterOfMassPositions[ j ].x) * this.force.y -
                                            (atomPositions[ 3 * j + jj ].y - moleculeCenterOfMassPositions[ j ].y) * this.force.x;
              }
            }
          }
        }
      }
      // energy.
      var centersOfMassKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      for ( i = 0; i < numberOfMolecules; i++ ) {
        var xVel = moleculeVelocities[ i ].x + this.TIME_STEP_HALF *
                                               (moleculeForces[ i ].x + nextMoleculeForces[ i ].x) * massInverse;
        var yVel = moleculeVelocities[ i ].y + this.TIME_STEP_HALF * (moleculeForces[ i ].y +
                                                                      nextMoleculeForces[ i ].y) * massInverse;
        moleculeVelocities[ i ].setXY( xVel, yVel );
        moleculeRotationRates[ i ] += this.TIME_STEP_HALF * (moleculeTorques[ i ] + nextMoleculeTorques[ i ]) *
                                      inertiaInverse;
        centersOfMassKineticEnergy += 0.5 * moleculeDataSet.getMoleculeMass() *
                                      (Math.pow( moleculeVelocities[ i ].x, 2 ) + Math.pow( moleculeVelocities[ i ].y, 2 ));
        rotationalKineticEnergy += 0.5 * moleculeDataSet.getMoleculeRotationalInertia() *
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

