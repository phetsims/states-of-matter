// Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for AndersonThermostat, which adjusts the velocity of all
 * molecules in the system by the same amount in order to get the overall
 * system temperature to the desired set point.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'STATES_OF_MATTER/common/model/Random' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  /**
   * Constructor for the Isokinetic thermostat.
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet Data set on which operations will be performed.
   * @param {Number} minTemperature The temperature that should be considered absolute zero, below which motion should cease
   * @constructor
   */
  function AndersenThermostat( moleculeDataSet, minTemperature ) {

    this.moleculeDataSet = moleculeDataSet;
    this.targetTemperature = StatesOfMatterConstants.INITIAL_TEMPERATURE;
    this.minModelTemperature = minTemperature;
    this.moleculeVelocities = moleculeDataSet.moleculeVelocities;
    this.moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
    this.random = new Random();
  }

  return inherit( Object, AndersenThermostat, {
    /**
     * @public
     */
    adjustTemperature: function() {
      var gammaX = 0.9999;
      var gammaY = 0.9999;
      var temperature = this.targetTemperature;
      if ( temperature <= this.minModelTemperature ) {
        // Use a values that will cause the molecules to stop
        // moving if we are below the minimum temperature, since
        // we want to create the appearance of absolute zero.
        gammaX = 0.992;
        gammaY = 0.999; // Scale a little differently in Y direction so particles don't stop falling when absolute zero is reached.
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
