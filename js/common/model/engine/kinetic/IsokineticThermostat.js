// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model for an isokinetic thermostat that controls the kinetic energy of a set of particles such that they remain at
 * a certain temperature.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Vector2 from '../../../../../../dot/js/Vector2.js';
import statesOfMatter from '../../../../statesOfMatter.js';
import SOMConstants from '../../../SOMConstants.js';

// constants
const MIN_POST_ZERO_VELOCITY = 0.1; // min velocity when warming up from absolute zero, empirically determined
const MIN_X_VEL_WHEN_FALLING = 1.0; // a velocity below which x should not be scaled when falling,  empirically determined
const COMPENSATION_FACTOR = 0.9; // an empirically determined factor to help with drift compensation, see usage below

class IsokineticThermostat {

  /**
   * Constructor for the Isokinetic thermostat.
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet -  Data set on which operations will be performed.
   * @param {number} minTemperature - The temperature that should be considered absolute zero, below which motion should cease.
   */
  constructor( moleculeDataSet, minTemperature ) {

    this.moleculeDataSet = moleculeDataSet; // @private

    // @public, target temperature in normalized model units
    this.targetTemperature = SOMConstants.INITIAL_TEMPERATURE;

    // @private, minimum temperature in normalized model units, below this is considered absolute 0
    this.minModelTemperature = minTemperature;

    // @private, previous scale factor from temperature adjust calculation
    this.previousTemperatureScaleFactor = 1;

    // @private {Vector2} - reusable vector used for calculating velocity changes
    this.previousParticleVelocity = new Vector2( 0, 0 );

    // @private {Vector2} - used to correct for a collective drift that can occur, see usage for details
    this.totalVelocityChangeThisStep = new Vector2( 0, 0 );
    this.accumulatedAverageVelocityChange = new Vector2( 0, 0 );
  }

  /**
   * @param {number} measuredTemperature - measured temperature of particles, in model units
   * @public
   */
  adjustTemperature( measuredTemperature ) {

    let i;
    const numberOfParticles = this.moleculeDataSet.getNumberOfMolecules();

    // Calculate the scaling factor that will be used to adjust the temperature.
    let temperatureScaleFactor;
    if ( this.targetTemperature > this.minModelTemperature ) {
      temperatureScaleFactor = Math.sqrt( this.targetTemperature / measuredTemperature );
    }
    else {

      // The particles are at absolute zero, so stop all motion.
      temperatureScaleFactor = 0;
      this.accumulatedAverageVelocityChange.setXY( 0, 0 );
    }

    // Clear the vector the is used to sum velocity changes - it's only used in the 'normal' case.
    this.totalVelocityChangeThisStep.setXY( 0, 0 );

    // local vars for convenience and performance
    const moleculeVelocities = this.moleculeDataSet.moleculeVelocities;
    const moleculeRotationRates = this.moleculeDataSet.moleculeRotationRates;

    if ( this.previousTemperatureScaleFactor !== 0 ||
         temperatureScaleFactor === 0 ||
         measuredTemperature > this.minModelTemperature ) {

      // This is the 'normal' case, where the scale factor is used to adjust the energy of the particles.
      for ( i = 0; i < numberOfParticles; i++ ) {

        const moleculeVelocity = moleculeVelocities[ i ];
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
        moleculeRotationRates[ i ] *= temperatureScaleFactor;

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
        let angle = phet.joist.random.nextDouble() * Math.PI;
        if ( angle < 0 ) {
          angle += Math.PI;
        }
        moleculeVelocities[ i ].setPolar( MIN_POST_ZERO_VELOCITY, angle );
      }
    }

    // Save the scaling factor for next time.
    this.previousTemperatureScaleFactor = temperatureScaleFactor;

    // Accumulate the average velocity changes that have occurred, used for drift compensation.
    this.accumulatedAverageVelocityChange.addXY(
      this.totalVelocityChangeThisStep.x / numberOfParticles,
      this.totalVelocityChangeThisStep.y / numberOfParticles
    );
  }

  /**
   * clear the accumulated velocity bias, should be done when this thermostat starts being used for a number of steps
   * in a row
   * @public
   */
  clearAccumulatedBias() {
    this.accumulatedAverageVelocityChange.setXY( 0, 0 );
  }

  /**
   * Set a new data set to be used in subsequent calculations.
   * !!!! This should only be used for phet-io !!!!
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   * @public
   */
  setDataSet( moleculeDataSet ) {
    assert && assert(
      phet.joist.sim.isSettingPhetioStateProperty.value,
      'this method is intended to be used only in support of state setting via phet-io'
    );
    this.moleculeDataSet = moleculeDataSet;
    this.clearAccumulatedBias();
  }
}

statesOfMatter.register( 'IsokineticThermostat', IsokineticThermostat );
export default IsokineticThermostat;