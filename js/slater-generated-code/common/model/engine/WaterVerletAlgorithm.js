// Copyright 2002-2014, University of Colorado Boulder
/**
 * Implementation of the Verlet algorithm for simulating molecular interaction
 * based on the Lennard-Jones potential.  This version is used specifically
 * for simulating water, i.e. H2O.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var Vector2 = require( 'DOT/Vector2' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// Parameters used for "hollywooding" of the water crystal.

  //private
  var WATER_FULLY_MELTED_TEMPERATURE = 0.3;

  //private
  var WATER_FULLY_MELTED_ELECTROSTATIC_FORCE = 1.0;

  //private
  var WATER_FULLY_FROZEN_TEMPERATURE = 0.22;

  //private
  var WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE = 4.0;

  //private
  var MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER = 3.0;

  function WaterVerletAlgorithm( model ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    this.m_positionUpdater = new WaterAtomPositionUpdater();
    AbstractVerletAlgorithm.call( this, model );
  }

  return inherit( AbstractVerletAlgorithm, WaterVerletAlgorithm, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    getPressure: function() {
      return m_pressure;
    },
    getTemperature: function() {
      return m_temperature;
    },
    /**
     * Update the motion of the particles and the forces that are acting upon
     * them.  This is the heart of this class, and it is here that the actual
     * Verlet algorithm is contained.
     */
    updateForcesAndMotion: function() {
      // perform fast manipulations.
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
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
      var normalizedContainerHeight = m_model.getNormalizedContainerHeight();
      var normalizedContainerWidth = m_model.getNormalizedContainerWidth();
      var pressureZoneWallForce = 0;
      var temperatureSetPoint = m_model.getTemperatureSetPoint();
      // Verify that this is being used on an appropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() == 3 );
      // calculating the coloumb interactions.
      var q0;
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
        var temperatureFactor = (temperatureSetPoint - WATER_FULLY_FROZEN_TEMPERATURE) / (WATER_FULLY_MELTED_TEMPERATURE - WATER_FULLY_FROZEN_TEMPERATURE);
        q0 = WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE - (temperatureFactor * (WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE - WATER_FULLY_MELTED_ELECTROSTATIC_FORCE));
      }
      var normalCharges = new double[]
      { -2 * q0, q0, q0 }
      ;
      var alteredCharges = new double[]
      { -2 * q0, 1.67 * q0, 0.33 * q0 }
      ;
      // Update center of mass positions and angles for the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xPos = moleculeCenterOfMassPositions[i].getX() + (TIME_STEP * moleculeVelocities[i].getX()) + (TIME_STEP_SQR_HALF * moleculeForces[i].getX() * massInverse);
        var yPos = moleculeCenterOfMassPositions[i].getY() + (TIME_STEP * moleculeVelocities[i].getY()) + (TIME_STEP_SQR_HALF * moleculeForces[i].getY() * massInverse);
        moleculeCenterOfMassPositions[i].setLocation( xPos, yPos );
        moleculeRotationAngles[i] += (TIME_STEP * moleculeRotationRates[i]) + (TIME_STEP_SQR_HALF * moleculeTorques[i] * inertiaInverse);
      }
      m_positionUpdater.updateAtomPositions( moleculeDataSet );
      // on the center of mass, so there is no torque.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        // Clear the previous calculation's particle forces and torques.
        nextMoleculeForces[i].setComponents( 0, 0 );
        nextMoleculeTorques[i] = 0;
        // Get the force values caused by the container walls.
        calculateWallForce( moleculeCenterOfMassPositions[i], normalizedContainerWidth, normalizedContainerHeight, nextMoleculeForces[i] );
        // exerted on the walls of the container.
        if ( nextMoleculeForces[i].getY() < 0 ) {
          pressureZoneWallForce += -nextMoleculeForces[i].getY();
        }
        else if ( moleculeCenterOfMassPositions[i].getY() > m_model.getNormalizedContainerHeight() / 2 ) {
          // in that value to the pressure.
          pressureZoneWallForce += Math.abs( nextMoleculeForces[i].getX() );
        }
        // Add in the effect of gravity.
        var gravitationalAcceleration = m_model.getGravitationalAcceleration();
        if ( m_model.getTemperatureSetPoint() < TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES ) {
          // caused by the thermostat.
          gravitationalAcceleration = gravitationalAcceleration * ((TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES - m_model.getTemperatureSetPoint()) * LOW_TEMPERATURE_GRAVITY_INCREASE_RATE + 1);
        }
        nextMoleculeForces[i].setY( nextMoleculeForces[i].getY() - gravitationalAcceleration );
      }
      // Update the pressure calculation.
      updatePressure( pressureZoneWallForce );
      // check them to see if they can be moved into the "safe" category.
      if ( moleculeDataSet.getNumberOfSafeMolecules() < numberOfMolecules ) {
        updateMoleculeSafety();
      }
      // Calculate the force and torque due to inter-particle interactions.
      var force = new Vector2();
      for ( var i = 0; i < moleculeDataSet.getNumberOfSafeMolecules(); i++ ) {
        // the "hollywooding" to make the solid form appear more crystalline.
        var chargesA;
        if ( i % 2 == 0 ) {
          chargesA = normalCharges;
        }
        else {
          chargesA = alteredCharges;
        }
        for ( var j = i + 1; j < moleculeDataSet.getNumberOfSafeMolecules(); j++ ) {
          // Select charges for this molecule.
          var chargesB;
          if ( j % 2 == 0 ) {
            chargesB = normalCharges;
          }
          else {
            chargesB = alteredCharges;
          }
          // Calculate Lennard-Jones potential between mass centers.
          var dx = moleculeCenterOfMassPositions[i].getX() - moleculeCenterOfMassPositions[j].getX();
          var dy = moleculeCenterOfMassPositions[i].getY() - moleculeCenterOfMassPositions[j].getY();
          var distanceSquared = dx * dx + dy * dy;
          if ( distanceSquared < PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            if ( distanceSquared < MIN_DISTANCE_SQUARED ) {
              distanceSquared = MIN_DISTANCE_SQUARED;
            }
            var r2inv = 1 / distanceSquared;
            var r6inv = r2inv * r2inv * r2inv;
            // crystalline behavior we need for ice.
            var repulsiveForceScalingFactor;
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
              var temperatureFactor = (temperatureSetPoint - WATER_FULLY_FROZEN_TEMPERATURE) / (WATER_FULLY_MELTED_TEMPERATURE - WATER_FULLY_FROZEN_TEMPERATURE);
              repulsiveForceScalingFactor = MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER - (temperatureFactor * (MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER - 1));
            }
            var forceScalar = 48 * r2inv * r6inv * ((r6inv * repulsiveForceScalingFactor) - 0.5);
            force.setX( dx * forceScalar );
            force.setY( dy * forceScalar );
            nextMoleculeForces[i].add( force );
            nextMoleculeForces[j].subtract( force );
            m_potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
          }
          if ( distanceSquared < PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            // individual water molecules.
            for ( var ii = 0; ii < 3; ii++ ) {
              for ( var jj = 0; jj < 3; jj++ ) {
                if ( ((3 * i + ii + 1) % 6 == 0) || ((3 * j + jj + 1) % 6 == 0) ) {
                  // low temperatures.
                  continue;
                }
                dx = atomPositions[3 * i + ii].getX() - atomPositions[3 * j + jj].getX();
                dy = atomPositions[3 * i + ii].getY() - atomPositions[3 * j + jj].getY();
                var r2inv = 1 / (dx * dx + dy * dy);
                var forceScalar = chargesA[ii] * chargesB[jj] * r2inv * r2inv;
                force.setX( dx * forceScalar );
                force.setY( dy * forceScalar );
                nextMoleculeForces[i].add( force );
                nextMoleculeForces[j].subtract( force );
                nextMoleculeTorques[i] += (atomPositions[3 * i + ii].getX() - moleculeCenterOfMassPositions[i].getX()) * force.getY() - (atomPositions[3 * i + ii].getY() - moleculeCenterOfMassPositions[i].getY()) * force.getX();
                nextMoleculeTorques[j] -= (atomPositions[3 * j + jj].getX() - moleculeCenterOfMassPositions[j].getX()) * force.getY() - (atomPositions[3 * j + jj].getY() - moleculeCenterOfMassPositions[j].getY()) * force.getX();
              }
            }
          }
        }
      }
      // energy.
      var centersOfMassKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xVel = moleculeVelocities[i].getX() + TIME_STEP_HALF * (moleculeForces[i].getX() + nextMoleculeForces[i].getX()) * massInverse;
        var yVel = moleculeVelocities[i].getY() + TIME_STEP_HALF * (moleculeForces[i].getY() + nextMoleculeForces[i].getY()) * massInverse;
        moleculeVelocities[i].setComponents( xVel, yVel );
        moleculeRotationRates[i] += TIME_STEP_HALF * (moleculeTorques[i] + nextMoleculeTorques[i]) * inertiaInverse;
        centersOfMassKineticEnergy += 0.5 * moleculeDataSet.getMoleculeMass() * (Math.pow( moleculeVelocities[i].getX(), 2 ) + Math.pow( moleculeVelocities[i].getY(), 2 ));
        rotationalKineticEnergy += 0.5 * moleculeDataSet.getMoleculeRotationalInertia() * Math.pow( moleculeRotationRates[i], 2 );
        // Move the newly calculated forces and torques into the current spots.
        moleculeForces[i].setComponents( nextMoleculeForces[i].getX(), nextMoleculeForces[i].getY() );
        moleculeTorques[i] = nextMoleculeTorques[i];
      }
      // Record the calculated temperature.
      m_temperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
    }
  } );
} );

