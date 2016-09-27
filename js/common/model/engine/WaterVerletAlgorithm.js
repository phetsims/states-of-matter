// Copyright 2014-2015, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential.
 * This version is used specifically for simulating water, i.e. H2O, and also includes calculations for the charge
 * distributions present in this molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Jonathan Olson
 */
define( function( require ) {
  'use strict';

  // modules
  var AbstractVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/AbstractVerletAlgorithm' );
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

  // constants, mostly parameters used for "hollywooding" of the water crystal
  var WATER_FULLY_MELTED_TEMPERATURE = 0.3;
  var WATER_FULLY_MELTED_ELECTROSTATIC_FORCE = 1.0;
  var WATER_FULLY_FROZEN_TEMPERATURE = 0.22;
  var WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE = 4.0;
  var MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER = 3.0;
  var MAX_ROTATION_RATE = 16; // revolutions per second, empirically determined, see usage below

  /**
   * @param {MultipleParticleModel}  multipleParticleModel of the simulation
   * @constructor
   */
  function WaterVerletAlgorithm( multipleParticleModel ) {

    this.positionUpdater = WaterAtomPositionUpdater;
    AbstractVerletAlgorithm.call( this, multipleParticleModel );

    // precompute a couple of values to save time later
    this.massInverse = 1 / multipleParticleModel.moleculeDataSet.getMoleculeMass();
    this.inertiaInverse = 1 / multipleParticleModel.moleculeDataSet.getMoleculeRotationalInertia();

    // pre-allocate arrays so that they don't have to be reallocated with each force and position update
    this.normalCharges = new Array( 3 );
    this.alteredCharges = new Array( 3 );
  }

  statesOfMatter.register( 'WaterVerletAlgorithm', WaterVerletAlgorithm );

  return inherit( AbstractVerletAlgorithm, WaterVerletAlgorithm, {

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
     * Update the motion of the particles and the forces that are acting upon them.  This is the heart of this class,
     * and it is here that the actual Verlet algorithm is contained.
     * @public
     */
    updateForcesAndMotion: function( timeStep ) {

      // Obtain references to the model data and parameters so that we can perform fast manipulations.
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

      // Initialize other values that will be needed for the calculations.
      var temperatureSetPoint = this.multipleParticleModel.getTemperatureSetPoint();

      // Verify that this is being used on an appropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );

      // Set up the values for the charges that will be used when calculating the coloumb interactions.
      var q0;
      var temperatureFactor;

      // A scaling factor is added here for the repulsive portion of the Lennard-Jones force.  The idea is that the
      // force goes up at lower temperatures in order to make the ice appear more spacious.  This is not real physics,
      // it is "hollywooding" in order to get the crystalline behavior we need for ice.
      var repulsiveForceScalingFactor;

      if ( temperatureSetPoint < WATER_FULLY_FROZEN_TEMPERATURE ) {

        // Use stronger electrostatic forces in order to create more of a crystal structure.
        q0 = WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE;
      }
      else if ( temperatureSetPoint > WATER_FULLY_MELTED_TEMPERATURE ) {

        // Use weaker electrostatic forces in order to create more of an appearance of liquid.
        q0 = WATER_FULLY_MELTED_ELECTROSTATIC_FORCE;
      }
      else {
        // We are somewhere in between the temperature for being fully melted or frozen, so scale accordingly.
        temperatureFactor = ( temperatureSetPoint - WATER_FULLY_FROZEN_TEMPERATURE ) /
                            ( WATER_FULLY_MELTED_TEMPERATURE - WATER_FULLY_FROZEN_TEMPERATURE );
        q0 = WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE -
             ( temperatureFactor * ( WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE - WATER_FULLY_MELTED_ELECTROSTATIC_FORCE ) );
      }
      this.normalCharges[ 0 ] = -2 * q0;
      this.normalCharges[ 1 ] = q0;
      this.normalCharges[ 2 ] = q0;
      this.alteredCharges[ 0 ] = -2 * q0;
      this.alteredCharges[ 1 ] = 1.67 * q0;
      this.alteredCharges[ 2 ] = 0.33 * q0;

      this.updatePositionsAndAngles(
        moleculeDataSet,
        numberOfMolecules,
        moleculeCenterOfMassPositions,
        timeStep,
        moleculeVelocities,
        moleculeDataSet.insideContainer,
        moleculeRotationAngles,
        moleculeRotationRates,
        moleculeTorques,
        moleculeForces
      );

      this.updateForceAndPressure(
        numberOfMolecules,
        nextMoleculeForces,
        nextMoleculeTorques,
        moleculeCenterOfMassPositions,
        temperatureSetPoint,
        timeStep
      );

      // If there are any atoms that are currently designated as "unsafe", check them to see if they can be moved into
      // the "safe" category.
      if ( moleculeDataSet.getNumberOfSafeMolecules() < numberOfMolecules ) {
        this.updateMoleculeSafety();
      }

      // Set the value of the scaling factor used to adjust how the water behaves as temperature changes, part of the
      // "hollywooding" that we do to make water freeze and thaw the way we want it to.
      if ( temperatureSetPoint > WATER_FULLY_MELTED_TEMPERATURE ) {

        // No scaling of the repulsive force.
        repulsiveForceScalingFactor = 1;
      }
      else if ( temperatureSetPoint < WATER_FULLY_FROZEN_TEMPERATURE ) {

        // Scale by the max to force space in the crystal.
        repulsiveForceScalingFactor = MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER;
      }
      else {

        // We are somewhere between fully frozen and fully liquified, so adjust the scaling factor accordingly.
        temperatureFactor = ( temperatureSetPoint - WATER_FULLY_FROZEN_TEMPERATURE) /
                            ( WATER_FULLY_MELTED_TEMPERATURE - WATER_FULLY_FROZEN_TEMPERATURE );
        repulsiveForceScalingFactor = MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER -
                                      ( temperatureFactor * (MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER - 1 ) );
      }

      this.calculateInterParticleInteractions(
        moleculeDataSet,
        moleculeCenterOfMassPositions,
        repulsiveForceScalingFactor,
        nextMoleculeForces,
        nextMoleculeTorques,
        atomPositions
      );

      this.updateVelocityRotationAndEnergy(
        moleculeDataSet,
        numberOfMolecules,
        moleculeVelocities,
        timeStep,
        moleculeForces,
        nextMoleculeForces,
        moleculeRotationRates,
        moleculeTorques,
        nextMoleculeTorques
      );
    },

    updatePositionsAndAngles: function( moleculeDataSet, numberOfMolecules, moleculeCenterOfMassPositions, timeStep,
                                            moleculeVelocities, insideContainer, moleculeRotationAngles,
                                            moleculeRotationRates, moleculeTorques, moleculeForces ) {

      var timeStepSqrHalf = timeStep * timeStep * 0.5;

      // Update center of mass positions and angles for the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // calculate new position based on velocity and time
        var xPos = moleculeCenterOfMassPositions[ i ].x + ( timeStep * moleculeVelocities[ i ].x ) +
                   ( timeStepSqrHalf * moleculeForces[ i ].x * this.massInverse );
        var yPos = moleculeCenterOfMassPositions[ i ].y + ( timeStep * moleculeVelocities[ i ].y ) +
                   ( timeStepSqrHalf * moleculeForces[ i ].y * this.massInverse );

        // update this particle's inside/outside status and, if necessary, clamp its position
        if ( insideContainer[ i ] && !this.isNormalizedPositionInContainer( xPos, yPos ) ) {

          // if this particle just blew out the top, that's fine - just update its status
          if ( moleculeCenterOfMassPositions[ i ].y <= this.multipleParticleModel.normalizedTotalContainerHeight &&
               yPos > this.multipleParticleModel.normalizedTotalContainerHeight ) {
            insideContainer[ i ] = false;
          }
          else {
            // This particle must have blown out the side due to an extreme velocity - reposition it inside the
            // container as though it bounced off the side and reverse its velocity.
            if ( xPos > this.multipleParticleModel.normalizedContainerWidth ) {
              xPos = this.multipleParticleModel.normalizedContainerWidth;
              moleculeVelocities[ i ].x = -moleculeVelocities[ i ].x;
            }
            else if ( xPos < 0 ) {
              xPos = 0;
              moleculeVelocities[ i ].x = -moleculeVelocities[ i ].x;
            }

            if ( yPos < 0 ) {
              yPos = 0;
              moleculeVelocities[ i ].y = -moleculeVelocities[ i ].y;
            }
          }
        }

        // set new position and rate of rotation
        moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );
        moleculeRotationAngles[ i ] += ( timeStep * moleculeRotationRates[ i ] ) +
                                       ( timeStepSqrHalf * moleculeTorques[ i ] * this.inertiaInverse );
      }
      this.positionUpdater.updateAtomPositions( moleculeDataSet );
    },

    updateForceAndPressure: function( numberOfMolecules, nextMoleculeForces, nextMoleculeTorques,
                                      moleculeCenterOfMassPositions, temperatureSetPoint, timeStep ) {
      var pressureZoneWallForce = 0;

      // Calculate the force from the walls.  This force is assumed to act on the center of mass, so there is no torque.
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Clear the previous calculation's particle forces and torques.
        nextMoleculeForces[ i ].setXY( 0, 0 );
        nextMoleculeTorques[ i ] = 0;

        // Get the force values caused by the container walls.
        this.calculateWallForce( moleculeCenterOfMassPositions[ i ], nextMoleculeForces[ i ] );

        // Accumulate this force value as part of the pressure being exerted on the walls of the container.
        if ( nextMoleculeForces[ i ].y < 0 ) {
          pressureZoneWallForce += -nextMoleculeForces[ i ].y;
        }
        else if ( moleculeCenterOfMassPositions[ i ].y > this.multipleParticleModel.getNormalizedContainerHeight() / 2 ) {

          // If the particle bounced on one of the walls above the midpoint, add in that value to the pressure.
          pressureZoneWallForce += Math.abs( nextMoleculeForces[ i ].x );
        }

        // Add in the effect of gravity.
        var gravitationalAcceleration = this.multipleParticleModel.getGravitationalAcceleration();
        if ( temperatureSetPoint < this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES ) {

          // Below a certain temperature, gravity is increased to counteract some odd-looking behavior caused by the
          // thermostat.
          gravitationalAcceleration = gravitationalAcceleration *
                                      ( ( this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES - temperatureSetPoint ) *
                                        this.LOW_TEMPERATURE_GRAVITY_INCREASE_RATE + 1 );
        }
        nextMoleculeForces[ i ].setY( nextMoleculeForces[ i ].y - gravitationalAcceleration );
      }

      // Update the pressure calculation.
      this.updatePressure( pressureZoneWallForce, timeStep );
    },

    calculateInterParticleInteractions: function( moleculeDataSet, moleculeCenterOfMassPositions,
                                                  repulsiveForceScalingFactor, nextMoleculeForces, nextMoleculeTorques,
                                                  atomPositions ) {

      // Calculate the force and torque due to inter-particle interactions.
      var numberOfSafeMolecules = moleculeDataSet.getNumberOfSafeMolecules();
      for ( var i = 0; i < numberOfSafeMolecules; i++ ) {
        var moleculeCenterOfMassPosition1 = moleculeCenterOfMassPositions[ i ];
        var m1x = moleculeCenterOfMassPosition1.x;
        var m1y = moleculeCenterOfMassPosition1.y;

        // Select which charges to use for this molecule.  This is part of the "hollywooding" to make the solid form
        // appear more crystalline.
        var chargesA;
        if ( i % 2 === 0 ) {
          chargesA = this.normalCharges;
        }
        else {
          chargesA = this.alteredCharges;
        }

        for ( var j = i + 1; j < numberOfSafeMolecules; j++ ) {
          var moleculeCenterOfMassPosition2 = moleculeCenterOfMassPositions[ j ];
          var m2x = moleculeCenterOfMassPosition2.x;
          var m2y = moleculeCenterOfMassPosition2.y;

          // Calculate Lennard-Jones potential between mass centers.
          var dx = m1x - m2x;
          var dy = m1y - m2y;
          var distanceSquared = dx * dx + dy * dy;
          if ( distanceSquared < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            // Select charges for the other molecule.
            var chargesB;
            if ( j % 2 === 0 ) {
              chargesB = this.normalCharges;
            }
            else {
              chargesB = this.alteredCharges;
            }

            // Calculate the Lennard-Jones interaction forces.
            distanceSquared = Math.max( distanceSquared, this.MIN_DISTANCE_SQUARED );
            var r2inv = 1 / distanceSquared;
            var r6inv = r2inv * r2inv * r2inv;

            var forceScalar = 48 * r2inv * r6inv * ( ( r6inv * repulsiveForceScalingFactor ) - 0.5 );
            var forceX = dx * forceScalar;
            var forceY = dy * forceScalar;
            nextMoleculeForces[ i ].addXY( forceX, forceY );
            nextMoleculeForces[ j ].subtractXY( forceX, forceY );
            this.potentialEnergy += 4 * r6inv * ( r6inv - 1 ) + 0.016316891136;

            // Calculate coulomb-like interactions between atoms on individual water molecules.
            for ( var ii = 0; ii < 3; ii++ ) {
              var atomIndex1 = 3 * i + ii;
              if ( ( atomIndex1 + 1 ) % 6 === 0 ) {

                // This is a hydrogen atom that is not going to be included in the calculation in order to try to
                // create a more crystalline solid.  This is part of the "hollywooding" that we do to create a better
                // looking water crystal at low temperatures.
                continue;
              }

              var chargeAii = chargesA[ ii ];
              var atomPosition1 = atomPositions[ atomIndex1 ];
              var a1x = atomPosition1.x;
              var a1y = atomPosition1.y;

              for ( var jj = 0; jj < 3; jj++ ) {
                var atomIndex2 = 3 * j + jj;
                if ( ( atomIndex2 + 1 ) % 6 === 0 ) {

                  // This is a hydrogen atom that is not going to be included in the calculation in order to try to
                  // create a more crystalline solid.  This is part of the "hollywooding" that we do to create a better
                  // looking water crystal at low temperatures.
                  continue;
                }

                var atomPosition2 = atomPositions[ atomIndex2 ];
                var a2x = atomPosition2.x;
                var a2y = atomPosition2.y;

                dx = atomPosition1.x - atomPosition2.x;
                dy = atomPosition1.y - atomPosition2.y;
                distanceSquared = ( dx * dx + dy * dy );
                distanceSquared = Math.max( distanceSquared, this.MIN_DISTANCE_SQUARED );
                r2inv = 1 / distanceSquared;
                forceScalar = chargeAii * chargesB[ jj ] * r2inv * r2inv;
                forceX = dx * forceScalar;
                forceY = dy * forceScalar;
                nextMoleculeForces[ i ].addXY( forceX, forceY );
                nextMoleculeForces[ j ].subtractXY( forceX, forceY );
                nextMoleculeTorques[ i ] += ( a1x - m1x ) * forceY - ( a1y - m1y ) * forceX;
                nextMoleculeTorques[ j ] -= ( a2x - m2x ) * forceY - ( a2y - m2y ) * forceX;
              }
            }
          }
        }
      }
    },

    updateVelocityRotationAndEnergy: function( moleculeDataSet, numberOfMolecules, moleculeVelocities, timeStep,
                                               moleculeForces, nextMoleculeForces, moleculeRotationRates,
                                               moleculeTorques, nextMoleculeTorques ) {
      var timeStepHalf = timeStep / 2;

      // Update the velocities and rotation rates and calculate kinetic energy.
      var centersOfMassKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xVel = moleculeVelocities[ i ].x + timeStepHalf * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ) * this.massInverse;
        var yVel = moleculeVelocities[ i ].y + timeStepHalf * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y ) * this.massInverse;
        moleculeVelocities[ i ].setXY( xVel, yVel );
        var rotationRate = moleculeRotationRates[ i ] +
                           timeStepHalf * ( moleculeTorques[ i ] + nextMoleculeTorques[ i ] ) * this.inertiaInverse;

        // If needed, clamp the rotation rate to an empirically determined max to prevent runaway rotation, see
        // https://github.com/phetsims/states-of-matter/issues/152
        if ( rotationRate > MAX_ROTATION_RATE ) {
          rotationRate = MAX_ROTATION_RATE;
        }
        else if ( rotationRate < -MAX_ROTATION_RATE ) {
          rotationRate = -MAX_ROTATION_RATE;
        }
        moleculeRotationRates[ i ] = rotationRate;

        // calculate the kinetic energy
        centersOfMassKineticEnergy += 0.5 * moleculeDataSet.getMoleculeMass() *
                                      moleculeVelocities[ i ].x * moleculeVelocities[ i ].x +
                                      moleculeVelocities[ i ].y * moleculeVelocities[ i ].y;
        rotationalKineticEnergy += 0.5 * moleculeDataSet.getMoleculeRotationalInertia() *
                                   moleculeRotationRates[ i ] * moleculeRotationRates[ i ];

        // Move the newly calculated forces and torques into the current spots.
        moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
        moleculeTorques[ i ] = nextMoleculeTorques[ i ];
      }

      // Record the calculated temperature.
      this.temperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
    }
  } );
} );
