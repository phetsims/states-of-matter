// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model for an Andersen Thermostat, which adjusts the velocity of all atoms/molecules in the system by the same amount
 * in order to get the overall system temperature to the desired set point.  There is a short Wikipedia entry for this
 * algorithm at https://en.wikipedia.org/wiki/Andersen_thermostat.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  var PROPORTION_COMPENSATION_FACTOR = 0.25; // used for drift compensation, value empirically determined
  var INTEGRAL_COMPENSATION_FACTOR = 0.5; // used for drift compensation, value empirically determined

  /**
   * Constructor for the Andersen thermostat.
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet  - Data set on which operations will be performed.
   * @param {number} minTemperature  - The temperature that should be considered absolute zero, below which motion should cease
   * @constructor
   */
  function AndersenThermostat( moleculeDataSet, minTemperature ) {

    // @public target temperature in normalized model units
    this.targetTemperature = SOMConstants.INITIAL_TEMPERATURE;

    // @public minimum temperature in normalized model units, below this is considered absolute 0;
    this.minModelTemperature = minTemperature;

    // @private reference to the molecule data set
    this.moleculeDataSet = moleculeDataSet;

    // @private references to the various arrays within the data set, set up so that the calculations can be performed
    // as fast as as possible
    this.moleculeVelocities = moleculeDataSet.moleculeVelocities;
    this.moleculeRotationRates = moleculeDataSet.moleculeRotationRates;

    // @private - pseudo-random number generator
    this.random = phet.joist.random;

    // @private {Vector2} - reusable vector used for calculating velocity changes
    this.previousParticleVelocity = new Vector2( 0, 0 );

    // @private {Vector2} - vectors used to correct for a collective drift that can occur
    this.totalVelocityChangePreviousStep = new Vector2( 0, 0 );
    this.totalVelocityChangeThisStep = new Vector2( 0, 0 );
    this.accumulatedAverageVelocityChange = new Vector2( 0, 0 );
  }

  statesOfMatter.register( 'AndersenThermostat', AndersenThermostat );

  return inherit( Object, AndersenThermostat, {

    /**
     * @public
     */
    adjustTemperature: function() {

      // A Note to Future Maintainers: This code was originally provided by Paul Beale of the University of Colorado.
      // For many years, it had separate gamma values the X and Y directions, but those values were always set to the
      // same thing.  In early August of 2018, I (jbphet) refactored this to have a single gamma value in order to
      // reduce the number of calculations done and thus improve performance.  If it's ever needed, separate values
      // could be brought back for X and Y.

      var gamma;
      var temperature = this.targetTemperature;
      if ( temperature > this.minModelTemperature ) {

        // Use a values that will cause the molecules to stop moving pretty quickly if we are below the minimum
        // temperature, since we want to create the appearance of absolute zero.  Values were empirically determined.
        gamma = 0.999;
      }
      else {

        // Use a values that will cause the molecules to stop moving pretty quickly if we are below the minimum
        // temperature, since we want to create the appearance of absolute zero.  Values were empirically determined.
        gamma = 0.5;
        temperature = 0;
      }

      var massInverse = 1 / this.moleculeDataSet.moleculeMass;
      var inertiaInverse = 1 / this.moleculeDataSet.moleculeRotationalInertia;
      var scalingFactor = temperature * ( 1 - Math.pow( gamma, 2 ) );
      var velocityScalingFactor = Math.sqrt( massInverse * scalingFactor );
      var rotationScalingFactor = Math.sqrt( inertiaInverse * scalingFactor );
      var numMolecules = this.moleculeDataSet.getNumberOfMolecules();

      // Calculate a compensation factor for any overall drift that is being added by this thermostat.  Without this,
      // we often see solids drifting to the left or right for no apparent reason.  Compensation is only done in the X
      // direction since the Y direction wasn't visually problematic.  For more information on this, please see
      // https://github.com/phetsims/states-of-matter-basics/issues/15.
      var xCompensation = -this.totalVelocityChangePreviousStep.x / numMolecules * PROPORTION_COMPENSATION_FACTOR -
                          this.accumulatedAverageVelocityChange.x * INTEGRAL_COMPENSATION_FACTOR;

      for ( var i = 0; i < numMolecules; i++ ) {
        var moleculeVelocity = this.moleculeVelocities[ i ];
        this.previousParticleVelocity.set( moleculeVelocity );

        // Calculate the new x and y velocity for this particle.
        var xVel = moleculeVelocity.x * gamma + this.random.nextGaussian() * velocityScalingFactor + xCompensation;
        var yVel = moleculeVelocity.y * gamma + this.random.nextGaussian() * velocityScalingFactor;
        moleculeVelocity.setXY( xVel, yVel );
        this.moleculeRotationRates[ i ] = gamma * this.moleculeRotationRates[ i ] +
                                          this.random.nextGaussian() * rotationScalingFactor;
        this.totalVelocityChangeThisStep.addXY(
          xVel - this.previousParticleVelocity.x,
          yVel - this.previousParticleVelocity.y
        );
      }
      this.accumulatedAverageVelocityChange.addXY(
        this.totalVelocityChangeThisStep.x / numMolecules,
        this.totalVelocityChangeThisStep.y / numMolecules
      );
      this.totalVelocityChangePreviousStep.set( this.totalVelocityChangeThisStep );
    },

    /**
     * clear the accumulated velocity bias, should be done when this thermostat starts being used for a number of steps
     * in a row
     * @public
     */
    clearAccumulatedBias: function() {
      this.accumulatedAverageVelocityChange.setXY( 0, 0 );
      this.totalVelocityChangePreviousStep.setXY( 0, 0 );
    }
  } );
} );
