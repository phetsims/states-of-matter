// Copyright 2002-2014, University of Colorado Boulder

/**
 * This is an abstract base class for classes that implement the Verlet
 * algorithm for simulating molecular interactions based on the Lennard-
 * Jones potential.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  // Constants that control various aspects of the Verlet algorithm.
  var TIME_STEP = 0.020;  // Time per simulation clock tick, in seconds.
  var PRESSURE_CALC_WEIGHTING = 0.999;
  var WALL_DISTANCE_THRESHOLD = 1.122462048309373017;
  var SAFE_INTER_MOLECULE_DISTANCE = 2.0;

  // Parameters that control the increasing of gravity as the temperature
  // approaches zero.  This is done to counteract the tendency of the
  // thermostat to slow falling molecules noticeably at low temps.  This is
  // a "hollywooding" thing.
  // var TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES = 0.10;
  // var LOW_TEMPERATURE_GRAVITY_INCREASE_RATE = 50;

  // Pressure at which explosion of the container will occur.
  var EXPLOSION_PRESSURE = 1.05;  // Currently set so that container blows roughly
  // when the pressure gauge hits its max value.

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function AbstractVerletAlgorithm( multipleParticleModel ) {
    this.multipleParticleModel = multipleParticleModel;
    this.potentialEnergy = 0;
    this.temperature = 0;

    PropertySet.call( this, {
      pressure: 0 // atm units
    } );
  }

  return inherit( PropertySet, AbstractVerletAlgorithm, {

    /**
     * Calculate the force exerted on a particle at the provided position by
     * the walls of the container.  The result is returned in the provided
     * vector.
     *
     * @param {Vector2} position       - Current position of the particle.
     * @param {Number} containerWidth  - Width of the container where particles are held.
     * @param {Number} containerHeight - Height of the container where particles are held.
     * @param {Vector2} resultantForce - Vector in which the resulting force is returned.
     */
    calculateWallForce: function( position, containerWidth, containerHeight, resultantForce ) {

      // Debug stuff - make sure this is being used correctly.
      assert && assert( resultantForce );
      assert && assert( position );

      // Non-debug run time check.
      if ( ( resultantForce === null ) || ( position === null ) ) {
        return;
      }

      var xPos = position.x;
      var yPos = position.y;

      var minDistance = WALL_DISTANCE_THRESHOLD * 0.8;
      var distance;

      if ( yPos < this.multipleParticleModel.normalizedContainerWidth ) {
        // Calculate the force in the X direction.
        if ( xPos < WALL_DISTANCE_THRESHOLD ) {
          // Close enough to the left wall to feel the force.
          if ( xPos < minDistance ) {
            if ( ( xPos < 0 ) && ( this.multipleParticleModel.isExploded ) ) {
              // The particle is outside the container after the
              // container has exploded, so don't let the walls
              // exert any force.
              xPos = Number.POSITIVE_INFINITY;
            }
            else {
              // Limit the distance, and thus the force, if we are really close.
              xPos = minDistance;
            }
          }
          resultantForce.setX( ( 48 / ( Math.pow( xPos, 13 ) ) ) - ( 24 / ( Math.pow( xPos, 7 ) ) ) );
          this.potentialEnergy += 4 / ( Math.pow( xPos, 12 ) ) - 4 / ( Math.pow( xPos, 6 ) ) + 1;
        }
        else if ( containerWidth - xPos < WALL_DISTANCE_THRESHOLD ) {
          // Close enough to the right wall to feel the force.
          distance = containerWidth - xPos;
          if ( distance < minDistance ) {
            if ( ( distance < 0 ) && ( this.multipleParticleModel.isExploded ) ) {
              // The particle is outside the container after the
              // container has exploded, so don't let the walls
              // exert any force.
              xPos = Number.POSITIVE_INFINITY;
            }
            else {
              distance = minDistance;
            }
          }
          resultantForce.setX( -( 48 / ( Math.pow( distance, 13 ) ) ) + ( 24 / ( Math.pow( distance, 7 ) ) ) );
          this.potentialEnergy += 4 / ( Math.pow( distance, 12 ) ) - 4 / ( Math.pow( distance, 6 ) ) + 1;
        }
      }

      // Calculate the force in the Y direction.
      if ( yPos < WALL_DISTANCE_THRESHOLD ) {
        // Close enough to the bottom wall to feel the force.
        if ( yPos < minDistance ) {
          if ( ( yPos < 0 ) && ( !this.multipleParticleModel.isExploded ) ) {
            // The particles are energetic enough to end up outside
            // the container, so consider it to be exploded (if it isn't already).
            this.multipleParticleModel.isExploded = true;
          }
          yPos = minDistance;
        }
        if ( !this.multipleParticleModel.isExploded || ( ( xPos > 0 ) && ( xPos < containerWidth ) ) ) {
          // Only calculate the force if the particle is inside the
          // container.
          resultantForce.setY( 48 / ( Math.pow( yPos, 13 ) ) - ( 24 / ( Math.pow( yPos, 7 ) ) ) );
          this.potentialEnergy += 4 / ( Math.pow( yPos, 12 ) ) - 4 / ( Math.pow( yPos, 6 ) ) + 1;
        }
      }
      else if ( ( containerHeight - yPos < WALL_DISTANCE_THRESHOLD ) && !this.multipleParticleModel.isExploded ) {
        // Close enough to the top to feel the force.
        distance = containerHeight - yPos;
        if ( distance < minDistance ) {
          distance = minDistance;
        }
        resultantForce.setY( -48 / ( Math.pow( distance, 13 ) ) + ( 24 / ( Math.pow( distance, 7 ) ) ) );
        this.potentialEnergy += 4 / ( Math.pow( distance, 12 ) ) - 4 / ( Math.pow( distance, 6 ) ) + 1;
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

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var numberOfSafeMolecules = moleculeDataSet.getNumberOfSafeMolecules();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

      if ( numberOfMolecules === numberOfSafeMolecules ) {
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

        // Find out if this molecule is still too close to all the "safe"
        // molecules to become safe itself.
        for ( var j = 0; j < numberOfSafeMolecules; j++ ) {
          if ( moleculeCenterOfMassPositions[ i ].distance( moleculeCenterOfMassPositions[ j ] ) <
               SAFE_INTER_MOLECULE_DISTANCE ) {
            moleculeIsUnsafe = true;
            break;
          }
        }

        if ( !moleculeIsUnsafe ) {
          // The molecule just tested was safe, so adjust the arrays
          // accordingly.
          if ( i !== numberOfSafeMolecules ) {
            // There is at least one unsafe atom/molecule in front of
            // this one in the arrays, so some swapping must be done
            // before the number of safe atoms can be incremented.

            // Swap the atoms that comprise the safe molecules with the
            // first unsafe one.
            var tempAtomPosition;
            for ( j = 0; j < atomsPerMolecule; j++ ) {
              tempAtomPosition = atomPositions[ ( numberOfSafeMolecules * atomsPerMolecule ) + j ];
              atomPositions[ ( numberOfSafeMolecules * atomsPerMolecule ) + j ] =
              atomPositions[ ( atomsPerMolecule * i ) + j ];
              atomPositions[ ( atomsPerMolecule * i ) + j ] = tempAtomPosition;
            }

            var firstUnsafeMoleculeIndex = numberOfSafeMolecules;

            var tempMoleculeCenterOfMassPosition = moleculeCenterOfMassPositions[ firstUnsafeMoleculeIndex ];
            moleculeCenterOfMassPositions[ firstUnsafeMoleculeIndex ] = moleculeCenterOfMassPositions[ i ];
            moleculeCenterOfMassPositions[ i ] = tempMoleculeCenterOfMassPosition;

            var tempMoleculeVelocity = moleculeVelocities[ firstUnsafeMoleculeIndex ];
            moleculeVelocities[ firstUnsafeMoleculeIndex ] = moleculeVelocities[ i ];
            moleculeVelocities[ i ] = tempMoleculeVelocity;

            var tempMoleculeForce = moleculeForces[ firstUnsafeMoleculeIndex ];
            moleculeForces[ firstUnsafeMoleculeIndex ] = moleculeForces[ i ];
            moleculeForces[ i ] = tempMoleculeForce;

            var tempMoleculeRotationAngle = moleculeRotationAngles[ firstUnsafeMoleculeIndex ];
            moleculeRotationAngles[ firstUnsafeMoleculeIndex ] = moleculeRotationAngles[ i ];
            moleculeRotationAngles[ i ] = tempMoleculeRotationAngle;

            var tempMoleculeRotationRate = moleculeRotationRates[ firstUnsafeMoleculeIndex ];
            moleculeRotationRates[ firstUnsafeMoleculeIndex ] = moleculeRotationRates[ i ];
            moleculeRotationRates[ i ] = tempMoleculeRotationRate;

            // Note: Don't worry about torque, since there isn't any until the molecules become "safe".
          }
          numberOfSafeMolecules++;
          moleculeDataSet.setNumberOfSafeMolecules( numberOfSafeMolecules );
        }
      }
    },

    setScaledEpsilon: function( scaledEpsilon ) {
      // In the base class this just issues a warning and has no effect.
      console.log( "Warning: Setting epsilon is not implemented for this class, request ignored." );
    },
    getScaledEpsilon: function() {
      // In the base class this just issues a warning and returns 0.
      console.log( "Warning: Getting scaled epsilon is not implemented for this class, returning zero." );
      return 0;
    },
    /**
     *
     * @param {Number} pressureZoneWallForce
     */
    updatePressure: function( pressureZoneWallForce ) {
      if ( this.multipleParticleModel.isExploded ) {
        // If the container has exploded, there is essentially no pressure.
        this.pressure = 0;
      }
      else {
        this.pressure = ( 1 - PRESSURE_CALC_WEIGHTING ) *
                        ( pressureZoneWallForce /
                          ( this.multipleParticleModel.normalizedContainerWidth + this.multipleParticleModel.normalizedContainerHeight ) ) +
                        PRESSURE_CALC_WEIGHTING * this.pressure;

        if ( ( this.pressure > EXPLOSION_PRESSURE ) && !this.multipleParticleModel.isExploded ) {
          // The pressure has reached the point where the container should
          // explode, so blow 'er up.
          this.multipleParticleModel.isExploded = true;
        }
      }
    },

    // static final
    TIME_STEP: TIME_STEP,
    TIME_STEP_SQR_HALF: TIME_STEP * TIME_STEP * 0.5,
    TIME_STEP_HALF: TIME_STEP / 2,
    PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD: 6.25,
    // Parameters that control the increasing of gravity as the temperature
    // approaches zero.  This is done to counteract the tendency of the
    // thermostat to slow falling molecules noticeably at low temps.  This is
    // a "hollywooding" thing.
    TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES: 0.10,
    LOW_TEMPERATURE_GRAVITY_INCREASE_RATE: 50,

    // Constant used to limit how close the atoms are allowed to get to one
    // another so that we don't end up getting crazy big forces.
    MIN_DISTANCE_SQUARED: 0.7225
  } );
} );
