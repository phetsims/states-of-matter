// Copyright 2002-2012, University of Colorado
/**
 * Implementation of the Verlet algorithm for simulating molecular interaction
 * based on the Lennard-Jones potential - diatomic (i.e. two atoms per
 * molecule) version.
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

  function DiatomicVerletAlgorithm( model ) {
    //----------------------------------------------------------------------------
    // Class Data
    //----------------------------------------------------------------------------
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    this.m_positionUpdater = new DiatomicAtomPositionUpdater();
    AbstractVerletAlgorithm.call( this, model );
  }

  return inherit( AbstractVerletAlgorithm, DiatomicVerletAlgorithm, {
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
      // Update center of mass positions and angles for the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xPos = moleculeCenterOfMassPositions[i].getX() + (TIME_STEP * moleculeVelocities[i].getX()) + (TIME_STEP_SQR_HALF * moleculeForces[i].getX() * massInverse);
        var yPos = moleculeCenterOfMassPositions[i].getY() + (TIME_STEP * moleculeVelocities[i].getY()) + (TIME_STEP_SQR_HALF * moleculeForces[i].getY() * massInverse);
        moleculeCenterOfMassPositions[i].setLocation( xPos, yPos );
        moleculeRotationAngles[i] += (TIME_STEP * moleculeRotationRates[i]) + (TIME_STEP_SQR_HALF * moleculeTorques[i] * inertiaInverse);
      }
      m_positionUpdater.updateAtomPositions( moleculeDataSet );
      // walls and by gravity.
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
        for ( var j = i + 1; j < moleculeDataSet.getNumberOfSafeMolecules(); j++ ) {
          for ( var ii = 0; ii < 2; ii++ ) {
            for ( var jj = 0; jj < 2; jj++ ) {
              // interacting atoms.
              var dx = atomPositions[2 * i + ii].getX() - atomPositions[2 * j + jj].getX();
              var dy = atomPositions[2 * i + ii].getY() - atomPositions[2 * j + jj].getY();
              var distanceSquared = dx * dx + dy * dy;
              if ( distanceSquared < PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
                if ( distanceSquared < MIN_DISTANCE_SQUARED ) {
                  distanceSquared = MIN_DISTANCE_SQUARED;
                }
                // Calculate the Lennard-Jones interaction forces.
                var r2inv = 1 / distanceSquared;
                var r6inv = r2inv * r2inv * r2inv;
                var forceScalar = 48 * r2inv * r6inv * (r6inv - 0.5);
                var fx = dx * forceScalar;
                var fy = dy * forceScalar;
                force.setComponents( fx, fy );
                nextMoleculeForces[i].add( force );
                nextMoleculeForces[j].subtract( force );
                nextMoleculeTorques[i] += (atomPositions[2 * i + ii].getX() - moleculeCenterOfMassPositions[i].getX()) * fy - (atomPositions[2 * i + ii].getY() - moleculeCenterOfMassPositions[i].getY()) * fx;
                nextMoleculeTorques[j] -= (atomPositions[2 * j + jj].getX() - moleculeCenterOfMassPositions[j].getX()) * fy - (atomPositions[2 * j + jj].getY() - moleculeCenterOfMassPositions[j].getY()) * fx;
                m_potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
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

