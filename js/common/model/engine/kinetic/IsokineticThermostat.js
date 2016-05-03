// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for an isokinetic thermostat that controls the kinetic energy of a set of particles such that the remain at
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
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  /**
   * Constructor for the Isokinetic thermostat.
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet -  Data set on which operations will be performed.
   * @param {number} minTemperature - The temperature that should be considered absolute zero, below which motion should cease.
   * @constructor
   */
  function IsokineticThermostat( moleculeDataSet, minTemperature ) {

    this.moleculeDataSet = moleculeDataSet;

    // Minimum temperature in normalized model units, below this is considered absolute 0;
    this.minModelTemperature = minTemperature;

    // Target temperature in normalized model units
    this.targetTemperature = StatesOfMatterConstants.INITIAL_TEMPERATURE;


    // Set up references to the various arrays within the data set so that
    // the calculations can be performed as fast as is possible.
    this.moleculeVelocities = moleculeDataSet.moleculeVelocities;
    this.moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
  }

  statesOfMatter.register( 'IsokineticThermostat', IsokineticThermostat );

  return inherit( Object, IsokineticThermostat, {
    /**
     * @public
     */
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
          centersOfMassKineticEnergy += 0.5 * this.moleculeDataSet.getMoleculeMass() *
                                        ( Math.pow( this.moleculeVelocities[ i ].x, 2 ) +
                                          Math.pow( this.moleculeVelocities[ i ].y, 2 ) );
        }
        measuredTemperature = centersOfMassKineticEnergy / numberOfMolecules;
      }

      // Adjust the temperature.
      this.adjustMeasuredTemperature( measuredTemperature );
    },

    /**
     * @public
     * @param {number} measuredTemperature
     */
    adjustMeasuredTemperature: function( measuredTemperature ) {

      // Calculate the scaling factor that will be used to adjust the temperature.
      var temperatureScaleFactor;
      if ( this.targetTemperature <= this.minModelTemperature ) {
        temperatureScaleFactor = 0;
      }
      else {
        temperatureScaleFactor = Math.sqrt( this.targetTemperature / measuredTemperature );
      }
      for ( var i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++ ) {
        this.moleculeVelocities[ i ].setXY( this.moleculeVelocities[ i ].x * temperatureScaleFactor,
          this.moleculeVelocities[ i ].y * temperatureScaleFactor );
        this.moleculeRotationRates[ i ] *= temperatureScaleFactor; // Doesn't hurt anything in the monatomic case.
      }
    }
  } );
} );
