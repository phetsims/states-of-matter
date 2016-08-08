// Copyright 2014-2015, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential.
 * This version is used specifically for simulating water, i.e. H2O.
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
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

  // parameters used for "hollywooding" of the water crystal
  var WATER_FULLY_MELTED_TEMPERATURE = 0.3;
  var WATER_FULLY_MELTED_ELECTROSTATIC_FORCE = 1.0;
  var WATER_FULLY_FROZEN_TEMPERATURE = 0.22;
  var WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE = 4.0;
  var MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER = 3.0;

  /**
   * @param {MultipleParticleModel}  multipleParticleModel of the simulation
   * @constructor
   */
  function WaterVerletAlgorithm( multipleParticleModel ) {

    this.positionUpdater = WaterAtomPositionUpdater;
    AbstractVerletAlgorithm.call( this, multipleParticleModel );

    // Set up references to all data that is expected to remain constant, done for optimal performance.  Most of these
    // are arrays that contain information about the positions, forces, and so forth for each atom or molecule.  This
    // makes an assumption that these references will not change during the life of this object, so this isn't ideal in
    // terms of coupling, but it improves performance.
    this.moleculeDataSet = multipleParticleModel.getMoleculeDataSetRef();
    this.moleculeCenterOfMassPositions = this.moleculeDataSet.getMoleculeCenterOfMassPositions();
    this.atomPositions = this.moleculeDataSet.getAtomPositions();
    this.moleculeVelocities = this.moleculeDataSet.getMoleculeVelocities();
    this.moleculeForces = this.moleculeDataSet.getMoleculeForces();
    this.nextMoleculeForces = this.moleculeDataSet.getNextMoleculeForces();
    this.moleculeRotationAngles = this.moleculeDataSet.getMoleculeRotationAngles();
    this.moleculeRotationRates = this.moleculeDataSet.getMoleculeRotationRates();
    this.moleculeTorques = this.moleculeDataSet.getMoleculeTorques();
    this.nextMoleculeTorques = this.moleculeDataSet.getNextMoleculeTorques();

    // Initialize other values that will be needed for the force and motion calculations.
    this.massInverse = 1 / this.moleculeDataSet.getMoleculeMass();
    this.inertiaInverse = 1 / this.moleculeDataSet.getMoleculeRotationalInertia();
    this.normalizedContainerWidth = multipleParticleModel.getNormalizedContainerWidth();

    // reusable vector, used in order to minimize allocations
    this.force = new Vector2();
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
      //var moleculeDataSet = this.multipleParticleModel.getMoleculeDataSetRef(); // TODO: Could this be done in constructor?
      var numberOfMolecules = this.moleculeDataSet.getNumberOfMolecules();
      //var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      //var atomPositions = moleculeDataSet.getAtomPositions();
      //var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      //var moleculeForces = moleculeDataSet.getMoleculeForces();
      //var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
      //var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      //var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      //var moleculeTorques = moleculeDataSet.getMoleculeTorques();
      //var nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();

      // Initialize other values that will be needed for the calculations.
      // TODO: Could these next two be done in constructor?
      //var massInverse = 1 / moleculeDataSet.getMoleculeMass();
      //var inertiaInverse = 1 / moleculeDataSet.getMoleculeRotationalInertia();
      // Get the values that can vary from the model for use in calculations below.
      var normalizedContainerHeight = this.multipleParticleModel.getNormalizedContainerHeight();
      //var normalizedContainerWidth = this.multipleParticleModel.getNormalizedContainerWidth();
      var pressureZoneWallForce = 0;
      var temperatureSetPoint = this.multipleParticleModel.getTemperatureSetPoint();
      var timeStepSqrHalf = timeStep * timeStep * 0.5;
      var timeStepHalf = timeStep / 2;

      // Verify that this is being used on an appropriate data set.
      assert && assert( this.moleculeDataSet.getAtomsPerMolecule() === 3 );

      // Set up the values for the charges that will be used when calculating the coloumb interactions.
      var q0;
      var temperatureFactor;

      // A scaling factor is added here for the repulsive portion of the Lennard-Jones force.  The idea is that the
      // force goes up at lower temperatures in order to make the ice appear more spacious.  This is not real physics,
      // it is "hollywooding" in order to get the crystalline behavior we need for ice.
      var repulsiveForceScalingFactor;
      var r2inv;
      var r6inv;
      var forceScalar;

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
      var normalCharges = [ -2 * q0, q0, q0 ];
      var alteredCharges = [ -2 * q0, 1.67 * q0, 0.33 * q0 ];

      // Update center of mass positions and angles for the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xPos = this.moleculeCenterOfMassPositions[ i ].x + ( timeStep * this.moleculeVelocities[ i ].x ) +
                   ( timeStepSqrHalf * this.moleculeForces[ i ].x * this.massInverse );
        var yPos = this.moleculeCenterOfMassPositions[ i ].y + ( timeStep * this.moleculeVelocities[ i ].y ) +
                   ( timeStepSqrHalf * this.moleculeForces[ i ].y * this.massInverse );
        this.moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );
        this.moleculeRotationAngles[ i ] += ( timeStep * this.moleculeRotationRates[ i ] ) +
                                            ( timeStepSqrHalf * this.moleculeTorques[ i ] * this.inertiaInverse );
      }
      this.positionUpdater.updateAtomPositions( this.moleculeDataSet );

      // Calculate the force from the walls.  This force is assumed to act on the center of mass, so there is no torque.
      for ( i = 0; i < numberOfMolecules; i++ ) {

        // Clear the previous calculation's particle forces and torques.
        this.nextMoleculeForces[ i ].setXY( 0, 0 );
        this.nextMoleculeTorques[ i ] = 0;

        // Get the force values caused by the container walls.
        this.calculateWallForce(
          this.moleculeCenterOfMassPositions[ i ],
          this.normalizedContainerWidth,
          normalizedContainerHeight,
          this.nextMoleculeForces[ i ]
        );

        // Accumulate this force value as part of the pressure being exerted on the walls of the container.
        if ( this.nextMoleculeForces[ i ].y < 0 ) {
          pressureZoneWallForce += -this.nextMoleculeForces[ i ].y;
        }
        else if ( this.moleculeCenterOfMassPositions[ i ].y > this.multipleParticleModel.getNormalizedContainerHeight() / 2 ) {

          // If the particle bounced on one of the walls above the midpoint, add in that value to the pressure.
          pressureZoneWallForce += Math.abs( this.nextMoleculeForces[ i ].x );
        }

        // Add in the effect of gravity.
        var gravitationalAcceleration = this.multipleParticleModel.getGravitationalAcceleration();
        if ( this.multipleParticleModel.getTemperatureSetPoint() < this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES ) {

          // Below a certain temperature, gravity is increased to counteract some odd-looking behavior caused by the
          // thermostat.
          gravitationalAcceleration = gravitationalAcceleration *
                                      ( ( this.TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES -
                                          this.multipleParticleModel.getTemperatureSetPoint() ) *
                                        this.LOW_TEMPERATURE_GRAVITY_INCREASE_RATE + 1 );
        }
        this.nextMoleculeForces[ i ].setY( this.nextMoleculeForces[ i ].y - gravitationalAcceleration );
      }

      // Update the pressure calculation.
      this.updatePressure( pressureZoneWallForce );

      // If there are any atoms that are currently designated as "unsafe", check them to see if they can be moved into
      // the "safe" category.
      if ( this.moleculeDataSet.getNumberOfSafeMolecules() < numberOfMolecules ) {
        this.updateMoleculeSafety();
      }

      // Calculate the force and torque due to inter-particle interactions.
      for ( i = 0; i < this.moleculeDataSet.getNumberOfSafeMolecules(); i++ ) {

        // Select which charges to use for this molecule.  This is part of the "hollywooding" to make the solid form
        // appear more crystalline.
        var chargesA;
        if ( i % 2 === 0 ) {
          chargesA = normalCharges;
        }
        else {
          chargesA = alteredCharges;
        }
        for ( var j = i + 1; j < this.moleculeDataSet.getNumberOfSafeMolecules(); j++ ) {

          // Select charges for this molecule.
          var chargesB;
          if ( j % 2 === 0 ) {
            chargesB = normalCharges;
          }
          else {
            chargesB = alteredCharges;
          }

          // Calculate Lennard-Jones potential between mass centers.
          var dx = this.moleculeCenterOfMassPositions[ i ].x - this.moleculeCenterOfMassPositions[ j ].x;
          var dy = this.moleculeCenterOfMassPositions[ i ].y - this.moleculeCenterOfMassPositions[ j ].y;
          var distanceSquared = dx * dx + dy * dy;
          if ( distanceSquared < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {

            // Calculate the Lennard-Jones interaction forces.
            if ( distanceSquared < this.MIN_DISTANCE_SQUARED ) {
              distanceSquared = this.MIN_DISTANCE_SQUARED;
            }
            r2inv = 1 / distanceSquared;
            r6inv = r2inv * r2inv * r2inv;

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
            forceScalar = 48 * r2inv * r6inv * ( ( r6inv * repulsiveForceScalingFactor) - 0.5 );
            this.force.setX( dx * forceScalar );
            this.force.setY( dy * forceScalar );
            this.nextMoleculeForces[ i ].add( this.force );
            this.nextMoleculeForces[ j ].subtract( this.force );
            this.potentialEnergy += 4 * r6inv * ( r6inv - 1 ) + 0.016316891136;
          }
          if ( distanceSquared < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {

            // Calculate coulomb-like interactions between atoms on individual water molecules.
            for ( var ii = 0; ii < 3; ii++ ) {
              for ( var jj = 0; jj < 3; jj++ ) {
                if ( ( ( 3 * i + ii + 1 ) % 6 === 0 ) || ( ( 3 * j + jj + 1 ) % 6 === 0 ) ) {

                  // This is a hydrogen atom that is not going to be included in the calculation in order to try to
                  // create a more crystalline solid.  This is part of the "hollywooding" that we do to create a better
                  // looking water crystal at low temperatures.
                  continue;
                }
                dx = this.atomPositions[ 3 * i + ii ].x - this.atomPositions[ 3 * j + jj ].x;
                dy = this.atomPositions[ 3 * i + ii ].y - this.atomPositions[ 3 * j + jj ].y;
                distanceSquared = (dx * dx + dy * dy);
                if ( distanceSquared < this.MIN_DISTANCE_SQUARED ) {
                  distanceSquared = this.MIN_DISTANCE_SQUARED;
                }
                r2inv = 1 / distanceSquared;
                forceScalar = chargesA[ ii ] * chargesB[ jj ] * r2inv * r2inv;
                this.force.setX( dx * forceScalar );
                this.force.setY( dy * forceScalar );
                this.nextMoleculeForces[ i ].add( this.force );
                this.nextMoleculeForces[ j ].subtract( this.force );
                var atomPosition = this.atomPositions[ 3 * i + ii ];
                this.nextMoleculeTorques[ i ] += ( atomPosition.x - this.moleculeCenterOfMassPositions[ i ].x ) * this.force.y -
                                                 ( atomPosition.y - this.moleculeCenterOfMassPositions[ i ].y ) * this.force.x;
                this.nextMoleculeTorques[ j ] -= ( atomPosition.x - this.moleculeCenterOfMassPositions[ j ].x ) * this.force.y -
                                                 ( atomPosition.y - this.moleculeCenterOfMassPositions[ j ].y ) * this.force.x;
              }
            }
          }
        }
      }

      // Update the velocities and rotation rates and calculate kinetic energy.
      var centersOfMassKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      for ( i = 0; i < numberOfMolecules; i++ ) {

        // vars needed for calculation
        var moleculeVelocity = this.moleculeVelocities[ i ];
        var moleculeForce = this.moleculeForces[ i ];
        var nextMoleculeForce = this.nextMoleculeForces[ i ];
        var moleculeRotationRate = this.moleculeRotationRates[ i ];
        var moleculeTorque = this.moleculeTorques[ i ];
        var nextMoleculeTorque = this.nextMoleculeTorques[ i ];

        // calculation
        var xVel = moleculeVelocity.x + timeStepHalf * ( moleculeForce.x + nextMoleculeForce.x ) * this.massInverse;
        var yVel = moleculeVelocity.y + timeStepHalf * ( moleculeForce.y + nextMoleculeForce.y ) * this.massInverse;
        moleculeVelocity.setXY( xVel, yVel );
        moleculeRotationRate += timeStepHalf * ( moleculeTorque + nextMoleculeTorque ) * this.inertiaInverse;
        centersOfMassKineticEnergy += 0.5 * this.moleculeDataSet.getMoleculeMass() *
                                      moleculeVelocity.x * moleculeVelocity.x +
                                      moleculeVelocity.y * moleculeVelocity.y;
        rotationalKineticEnergy += 0.5 * this.moleculeDataSet.getMoleculeRotationalInertia() *
                                   moleculeRotationRate * moleculeRotationRate;

        // Move the newly calculated forces and torques into the current spots.
        moleculeForce.setXY( nextMoleculeForce.x, nextMoleculeForce.y );
        this.moleculeTorques[ i ] = nextMoleculeTorque;
      }

      // Record the calculated temperature.
      this.temperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
    }
  } );
} );

