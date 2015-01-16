// Copyright 2002-2013, University of Colorado Boulder

/**
 * Model for IsokineticThermostat. It is for adjusting the kinetic energy in a set of molecules toward a desired
 * setpoint.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  /**
   * Constructor for the Andersen thermostat.
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet Data set on which operations will be performed.
   * @param {Number} minTemperature The temperature that should be considered absolute zero, below which motion should cease.
   * @constructor
   */
  function IsokineticThermostat( moleculeDataSet, minTemperature ) {
    this.moleculeDataSet = moleculeDataSet;
    this.targetTemperature = StatesOfMatterConstants.INITIAL_TEMPERATURE;
    this.minModelTemperature = minTemperature;

    this.moleculeVelocities = moleculeDataSet.moleculeVelocities;
    this.moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
  }

  return inherit( Object, IsokineticThermostat, {

    adjustTemperature: function() {
      // Calculate the internal temperature of the system from the kinetic energy.
      var measuredTemperature;
      var i;
      var numberOfMolecules = this.moleculeDataSet.getNumberOfMolecules();
      var centersOfMassKineticEnergy = 0;
      if ( this.moleculeDataSet.atomsPerMolecule > 1 ) {
        // Include rotational inertia in the calculation.
        var rotationalKineticEnergy = 0;
        for ( i = 0; i < numberOfMolecules; i++ ) {

          centersOfMassKineticEnergy += 0.5 * this.moleculeDataSet.getMoleculeMass() *
                                                                                     ( Math.pow( this.moleculeVelocities[ i ].x, 2 ) +
                                                                                       Math.pow( this.moleculeVelocities[ i ].y, 2 ) );
          rotationalKineticEnergy += 0.5 * this.moleculeDataSet.getMoleculeRotationalInertia() *
                                                                                               Math.pow( this.moleculeRotationRates[ i ], 2 );
        }
        measuredTemperature = ( centersOfMassKineticEnergy + rotationalKineticEnergy ) / numberOfMolecules / 1.5;
      }
      else {
        for ( i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++ ) {
          // For single-atom molecules, exclude rotational inertia from the calculation.
          centersOfMassKineticEnergy += 0.5 * this.moleculeDataSet.moleculeMass *
                                                                                ( Math.pow( this.moleculeVelocities[ i ].x, 2 ) +
                                                                                  Math.pow( this.moleculeVelocities[ i ].y, 2 ) );
        }
        measuredTemperature = centersOfMassKineticEnergy / numberOfMolecules;
      }

      // Adjust the temperature.
      this.adjustMeasuredTemperature( measuredTemperature );
    },

    /**
     *
     * @param {Number} measuredTemperature
     */
    adjustMeasuredTemperature: function( measuredTemperature ) {

      // Calculate the scaling factor that will be used to adjust the temperature.
      var temperatureScaleFactor = ( this.targetTemperature <= this.minModelTemperature ) ? 0 :
                                   Math.sqrt( this.targetTemperature / measuredTemperature );
      // Adjust the temperature by scaling the velocity of each molecule by the appropriate amount.
      for ( var i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++ ) {
        this.moleculeVelocities[ i ].setXY( this.moleculeVelocities[ i ].x * temperatureScaleFactor,
          this.moleculeVelocities[ i ].y * temperatureScaleFactor );
        this.moleculeRotationRates[ i ] *= temperatureScaleFactor; // Doesn't hurt anything in the monatomic case.
      }
    }

  } );
} );
