// Copyright 2002-2012, University of Colorado
/**
 * This is an abstract base class for classes that implement the Verlet
 * algorithm for simulating molecular interactions based on the Lennard-
 * Jones potential.
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
// Constants that control various aspects of the Verlet algorithm.
// Time per simulation clock tick, in seconds.
  var TIME_STEP = 0.020;
  var TIME_STEP_SQR_HALF = TIME_STEP * TIME_STEP * 0.5;
  var TIME_STEP_HALF = TIME_STEP / 2;
  var PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD = 6.25;
  var PRESSURE_CALC_WEIGHTING = 0.999;

  //private
  var WALL_DISTANCE_THRESHOLD = 1.122462048309373017;

  //private
  var SAFE_INTER_MOLECULE_DISTANCE = 2.0;
// Constant used to limit how close the atoms are allowed to get to one
// another so that we don't end up getting crazy big forces.
  var MIN_DISTANCE_SQUARED = 0.7225;
// Parameters that control the increasing of gravity as the temperature
// approaches zero.  This is done to counteract the tendency of the
// thermostat to slow falling molecules noticeably at low temps.  This is
// a "hollywooding" thing.
  var TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES = 0.10;
  var LOW_TEMPERATURE_GRAVITY_INCREASE_RATE = 50;
// Pressure at which explosion of the container will occur.
// Currently set so that container blows roughly

  //private
  var EXPLOSION_PRESSURE = 1.05;

  function AbstractVerletAlgorithm( model ) {
    // when the pressure gauge hits its max value.
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    this.m_model;
    this.m_potentialEnergy;
    this.m_pressure;
    this.m_temperature;
    m_model = model;
    m_potentialEnergy = 0;
    m_pressure = 0;
    m_temperature = 0;
  }

  return inherit( Object, AbstractVerletAlgorithm, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
// Protected Methods
//----------------------------------------------------------------------------
    /**
     * Calculate the force exerted on a particle at the provided position by
     * the walls of the container.  The result is returned in the provided
     * vector.
     *
     * @param position        - Current position of the particle.
     * @param containerWidth  - Width of the container where particles are held.
     * @param containerHeight - Height of the container where particles are held.
     * @param resultantForce  - Vector in which the resulting force is returned.
     */
    calculateWallForce: function( position, containerWidth, containerHeight, resultantForce ) {
      // Debug stuff - make sure this is being used correctly.
      assert && assert( resultantForce != null );
      assert && assert( position != null );
      // Non-debug run time check.
      if ( (resultantForce == null) || (position == null) ) {
        return;
      }
      var xPos = position.getX();
      var yPos = position.getY();
      var minDistance = WALL_DISTANCE_THRESHOLD * 0.8;
      var distance;
      if ( yPos < m_model.getNormalizedContainerWidth() ) {
        // Calculate the force in the X direction.
        if ( xPos < WALL_DISTANCE_THRESHOLD ) {
          // Close enough to the left wall to feel the force.
          if ( xPos < minDistance ) {
            if ( (xPos < 0) && (m_model.getContainerExploded()) ) {
              // exert any force.
              xPos = Number.POSITIVE_INFINITY;
            }
            else {
              // Limit the distance, and thus the force, if we are really close.
              xPos = minDistance;
            }
          }
          resultantForce.setX( (48 / (Math.pow( xPos, 13 ))) - (24 / (Math.pow( xPos, 7 ))) );
          m_potentialEnergy += 4 / (Math.pow( xPos, 12 )) - 4 / (Math.pow( xPos, 6 )) + 1;
        }
        else if ( containerWidth - xPos < WALL_DISTANCE_THRESHOLD ) {
          // Close enough to the right wall to feel the force.
          distance = containerWidth - xPos;
          if ( distance < minDistance ) {
            if ( (distance < 0) && (m_model.getContainerExploded()) ) {
              // exert any force.
              xPos = Number.POSITIVE_INFINITY;
            }
            else {
              distance = minDistance;
            }
          }
          resultantForce.setX( -(48 / (Math.pow( distance, 13 ))) + (24 / (Math.pow( distance, 7 ))) );
          m_potentialEnergy += 4 / (Math.pow( distance, 12 )) - 4 / (Math.pow( distance, 6 )) + 1;
        }
      }
      // Calculate the force in the Y direction.
      if ( yPos < WALL_DISTANCE_THRESHOLD ) {
        // Close enough to the bottom wall to feel the force.
        if ( yPos < minDistance ) {
          if ( (yPos < 0) && (!m_model.getContainerExploded()) ) {
            // isn't already).
            m_model.explodeContainer();
          }
          yPos = minDistance;
        }
        if ( !m_model.getContainerExploded() || ((xPos > 0) && (xPos < containerWidth)) ) {
          // container.
          resultantForce.setY( 48 / (Math.pow( yPos, 13 )) - (24 / (Math.pow( yPos, 7 ))) );
          m_potentialEnergy += 4 / (Math.pow( yPos, 12 )) - 4 / (Math.pow( yPos, 6 )) + 1;
        }
      }
      else if ( (containerHeight - yPos < WALL_DISTANCE_THRESHOLD) && !m_model.getContainerExploded() ) {
        // Close enough to the top to feel the force.
        distance = containerHeight - yPos;
        if ( distance < minDistance ) {
          distance = minDistance;
        }
        resultantForce.setY( -48 / (Math.pow( distance, 13 )) + (24 / (Math.pow( distance, 7 ))) );
        m_potentialEnergy += 4 / (Math.pow( distance, 12 )) - 4 / (Math.pow( distance, 6 )) + 1;
      }
    },
    /**
     * Update the safety status of any molecules that may have previously been
     * designated as unsafe.  An "unsafe" molecule is one that was injected
     * into the container and was found to be so close to one or more of the
     * other molecules that if its interaction forces were calculated, it
     * would be given a ridiculously large amount of kinetic energy that could
     * end up launching it out of the container.
     */
    updateMoleculeSafety: function() {
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
      var numberOfSafeMolecules = moleculeDataSet.getNumberOfSafeMolecules();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      if ( numberOfMolecules == numberOfSafeMolecules ) {
        // Nothing to do, so quit now.
        return;
      }
      var atomsPerMolecule = moleculeDataSet.getAtomsPerMolecule();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeForces = moleculeDataSet.getMoleculeForces();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      for ( var i = numberOfSafeMolecules; i < numberOfMolecules; i++ ) {
        var moleculeIsUnsafe = false;
        // molecules to become safe itself.
        for ( var j = 0; j < numberOfSafeMolecules; j++ ) {
          if ( moleculeCenterOfMassPositions[i].distance( moleculeCenterOfMassPositions[j] ) < SAFE_INTER_MOLECULE_DISTANCE ) {
            moleculeIsUnsafe = true;
            break;
          }
        }
        if ( !moleculeIsUnsafe ) {
          // accordingly.
          if ( i != numberOfSafeMolecules ) {
            // first unsafe one.
            var tempAtomPosition;
            for ( var j = 0; j < atomsPerMolecule; j++ ) {
              tempAtomPosition = atomPositions[(numberOfSafeMolecules * atomsPerMolecule) + j];
              atomPositions[(numberOfSafeMolecules * atomsPerMolecule) + j] = atomPositions[(atomsPerMolecule * i) + j];
              atomPositions[(atomsPerMolecule * i) + j] = tempAtomPosition;
            }
            var firstUnsafeMoleculeIndex = numberOfSafeMolecules;
            var tempMoleculeCenterOfMassPosition;
            tempMoleculeCenterOfMassPosition = moleculeCenterOfMassPositions[firstUnsafeMoleculeIndex];
            moleculeCenterOfMassPositions[firstUnsafeMoleculeIndex] = moleculeCenterOfMassPositions[i];
            moleculeCenterOfMassPositions[i] = tempMoleculeCenterOfMassPosition;
            var tempMoleculeVelocity;
            tempMoleculeVelocity = moleculeVelocities[firstUnsafeMoleculeIndex];
            moleculeVelocities[firstUnsafeMoleculeIndex] = moleculeVelocities[i];
            moleculeVelocities[i] = tempMoleculeVelocity;
            var tempMoleculeForce;
            tempMoleculeForce = moleculeForces[firstUnsafeMoleculeIndex];
            moleculeForces[firstUnsafeMoleculeIndex] = moleculeForces[i];
            moleculeForces[i] = tempMoleculeForce;
            var tempMoleculeRotationAngle;
            tempMoleculeRotationAngle = moleculeRotationAngles[firstUnsafeMoleculeIndex];
            moleculeRotationAngles[firstUnsafeMoleculeIndex] = moleculeRotationAngles[i];
            moleculeRotationAngles[i] = tempMoleculeRotationAngle;
            var tempMoleculeRotationRate;
            tempMoleculeRotationRate = moleculeRotationRates[firstUnsafeMoleculeIndex];
            moleculeRotationRates[firstUnsafeMoleculeIndex] = moleculeRotationRates[i];
            moleculeRotationRates[i] = tempMoleculeRotationRate;
          }
          numberOfSafeMolecules++;
          moleculeDataSet.setNumberOfSafeMolecules( numberOfSafeMolecules );
        }
      }
    },
    updatePressure: function( pressureZoneWallForce ) {
      if ( m_model.getContainerExploded() ) {
        // If the container has exploded, there is essentially no pressure.
        m_pressure = 0;
      }
      else {
        m_pressure = (1 - PRESSURE_CALC_WEIGHTING) * (pressureZoneWallForce / (m_model.getNormalizedContainerWidth() + m_model.getNormalizedContainerHeight())) + PRESSURE_CALC_WEIGHTING * m_pressure;
        if ( (m_pressure > EXPLOSION_PRESSURE) && !m_model.getContainerExploded() ) {
          // explode, so blow 'er up.
          m_model.explodeContainer();
        }
      }
    },
    setScaledEpsilon: function( scaledEpsilon ) {
      // In the base class this just issues a warning and has no effect.
      System.err.println( "Warning: Setting epsilon is not implemented for this class, request ignored." );
    },
    getScaledEpsilon: function() {
      // In the base class this just issues a warning and returns 0.
      System.err.println( "Warning: Getting scaled epsilon is not implemented for this class, returning zero." );
      return 0;
    }
  } );
} );

