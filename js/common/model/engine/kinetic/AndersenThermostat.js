// Copyright 2014-2017, University of Colorado Boulder

/**
 * Model for AndersonThermostat, which adjusts the velocity of all atoms/molecules in the system by the same amount in
 * order to get the overall system temperature to the desired set point.
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

    this.random = phet.joist.random;
  }

  statesOfMatter.register( 'AndersenThermostat', AndersenThermostat );

  return inherit( Object, AndersenThermostat, {

    /**
     * @public
     */
    adjustTemperature: function() {
      var gammaX = 0.9999;
      var gammaY = 0.9999;
      var temperature = this.targetTemperature;
      if ( temperature <= this.minModelTemperature ) {
        // Use a values that will cause the molecules to stop moving pretty quickly if we are below the minimum
        // temperature, since we want to create the appearance of absolute zero.  Values were empirically determined.
        gammaX = 0.5;
        gammaY = 0.5;
        temperature = 0;
      }

      var massInverse = 1 / this.moleculeDataSet.moleculeMass;
      var inertiaInverse = 1 / this.moleculeDataSet.moleculeRotationalInertia;
      var velocityScalingFactor = Math.sqrt( temperature * massInverse * ( 1 - Math.pow( gammaX, 2 ) ) );
      var rotationScalingFactor = Math.sqrt( temperature * inertiaInverse * ( 1 - Math.pow( gammaX, 2 ) ) );

      for ( var i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++ ) {
        var xVel = this.moleculeVelocities[ i ].x * gammaX +
                   this.random.nextGaussian() * velocityScalingFactor;
        var yVel = this.moleculeVelocities[ i ].y * gammaY +
                   this.random.nextGaussian() * velocityScalingFactor;
        this.moleculeVelocities[ i ].setXY( xVel, yVel );
        this.moleculeRotationRates[ i ] = gammaX * this.moleculeRotationRates[ i ] +
                                          this.random.nextGaussian() * rotationScalingFactor;
      }
    }
  } );
} );
