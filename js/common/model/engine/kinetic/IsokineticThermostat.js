// Copyright 2014-2017, University of Colorado Boulder

/**
 * Model for an isokinetic thermostat that controls the kinetic energy of a set of particles such that they remain at
 * a certain temperature.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MIN_POST_ZERO_VELOCITY = 0.1; // min velocity when warming up from absolute zero, empirically determined
  var MIN_X_VEL_WHEN_FALLING = 1.0; // a velocity below which x should not be scaled when falling,  empirically determined
  var COMPENSATION_FACTOR = 0.9; // an empirically determined factor to help with drift compensation, see usage below

  /**
   * Constructor for the Isokinetic thermostat.
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet -  Data set on which operations will be performed.
   * @param {number} minTemperature - The temperature that should be considered absolute zero, below which motion should cease.
   * @constructor
   */
  function IsokineticThermostat( moleculeDataSet, minTemperature ) {

    this.moleculeDataSet = moleculeDataSet; // @private

    // @public, target temperature in normalized model units
    this.targetTemperature = SOMConstants.INITIAL_TEMPERATURE;

    // @private, minimum temperature in normalized model units, below this is considered absolute 0
    this.minModelTemperature = minTemperature;

    // @private, previous scale factor from temperature adjust calculation
    this.previousTemperatureScaleFactor = 1;

    // @private, references to the various arrays within the data set so that the calculations can be performed as fast
    // as is possible.
    this.moleculeVelocities = moleculeDataSet.moleculeVelocities;
    this.moleculeRotationRates = moleculeDataSet.moleculeRotationRates;

    // @private {Vector2} - reusable vector used for calculating velocity changes
    this.previousParticleVelocity = new Vector2( 0, 0 );

    // @private {Vector2} - used to correct for a collective drift that can occur
    this.totalVelocityChangeThisStep = new Vector2( 0, 0 );
    this.accumulatedAverageVelocityChange = new Vector2( 0, 0 );
  }

  statesOfMatter.register( 'IsokineticThermostat', IsokineticThermostat );

  return inherit( Object, IsokineticThermostat, {

    /**
     * @param {number} measuredTemperature - measured temperature of particles, in model units
     * @public
     */
    adjustTemperature: function( measuredTemperature ) {

      var i;
      var numberOfParticles = this.moleculeDataSet.getNumberOfMolecules();

      // Calculate the scaling factor that will be used to adjust the temperature.
      var temperatureScaleFactor;
      if ( this.targetTemperature > this.minModelTemperature ) {
        temperatureScaleFactor = Math.sqrt( this.targetTemperature / measuredTemperature );
      }
      else {

        // The particles are at absolute zero, so stop all motion.
        temperatureScaleFactor = 0;
      }

      // Clear the vector the is used to sum velocity changes - it's only used in the 'normal' case.
      this.totalVelocityChangeThisStep.setXY( 0, 0 );

      if ( this.previousTemperatureScaleFactor !== 0 ||
           temperatureScaleFactor === 0 ||
           measuredTemperature > this.minModelTemperature ) {

        // This is the 'normal' case, where the scale factor is used to adjust the energy of the particles.
        for ( i = 0; i < numberOfParticles; i++ ) {

          var moleculeVelocity = this.moleculeVelocities[ i ];
          this.previousParticleVelocity.set( moleculeVelocity );

          if ( moleculeVelocity.y < 0 ) {

            // The particle is falling.  To avoid unnatural looking behavior and to prevent particles from getting
            // suspended in midair at absolute zero, don't scale down the Y velocity.  However, to avoid a situation
            // where the particle is bouncing straight up and down, also stop scaling the X velocity when below a
            // certain temperature.
            if ( Math.abs( moleculeVelocity.x ) > MIN_X_VEL_WHEN_FALLING ) {
              moleculeVelocity.x = moleculeVelocity.x * temperatureScaleFactor;
            }
          }
          else {

            // Scale both the x and y velocities.  This has a factor that compensates for drift that can occur if the
            // substance has a bit of velocity in one direction when this thermostat starts running.  Only the x
            // direction is compensated since the design team decided that the behavior in the y direction isn't
            // problematic. See https://github.com/phetsims/states-of-matter/issues/214 for more info and history.
            moleculeVelocity.setXY(
              moleculeVelocity.x * temperatureScaleFactor - this.accumulatedAverageVelocityChange.x * COMPENSATION_FACTOR,
              moleculeVelocity.y * temperatureScaleFactor
            );
          }

          // Scale the rotation rates (this has no effect in the monatomic case).
          this.moleculeRotationRates[ i ] *= temperatureScaleFactor;

          // Track the total of all velocity changes - used to correct for drift
          this.totalVelocityChangeThisStep.addXY(
            moleculeVelocity.x - this.previousParticleVelocity.x,
            moleculeVelocity.y - this.previousParticleVelocity.y
          );
        }
      }
      else {

        // The temperature has just risen above the minimum model temperature (essentially absolute zero), so we need
        // to make sure all particles have a reasonable amount of kinetic energy, otherwise some of them can appear to
        // get stuck on the bottom of the container since they have no energy to scale.  Only linear kinetic energy is
        // adjusted here, since it is simpler and seems to work.
        for ( i = 0; i < numberOfParticles; i++ ) {
          var angle = phet.joist.random.nextDouble() * Math.PI;
          if ( angle < 0 ) {
            angle += Math.PI;
          }
          this.moleculeVelocities[ i ].setPolar( MIN_POST_ZERO_VELOCITY, angle );
        }
      }

      // Save the scaling factor for next time.
      this.previousTemperatureScaleFactor = temperatureScaleFactor;

      // Accumulate the average velocity changes that have occurred, used for drift compensation.
      this.accumulatedAverageVelocityChange.addXY(
        this.totalVelocityChangeThisStep.x / numberOfParticles,
        this.totalVelocityChangeThisStep.y / numberOfParticles
      );
    },

    /**
     * clear the accumulated velocity bias, should be done when this thermostat starts being used for a number of steps
     * in a row
     * @public
     */
    clearAccumulatedBias: function() {
      this.accumulatedAverageVelocityChange.setXY( 0, 0 );
    }
  } );
} );
