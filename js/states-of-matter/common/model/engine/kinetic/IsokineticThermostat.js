// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class implements a thermostat that adjusts the velocity of all
 * molecules in the system by the same amount in order to get the overall
 * system temperature to the desired set point.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

  /**
   * Constructor for the Isokinetic thermostat.
   *
   * @param moleculeDataSet - Data set on which operations will be performed.
   * @param minTemperature  - The temperature that should be considered
   *                        considered absolute zero, below which motion should cease.
   */
  function IsokineticThermostat( moleculeDataSet, minTemperature ) {
    //------------------------------------------------------------------------
    // Instance Data
    //------------------------------------------------------------------------
    this.m_moleculeDataSet;
    this.m_moleculeVelocities;
    this.m_moleculeRotationRates;
    // Target temperature in normalized model units.
    this.m_targetTemperature;
    // Minimum temperature in normalized model units, below this is considered absolute 0;
    this.m_minModelTemperature;
    m_moleculeDataSet = moleculeDataSet;
    m_targetTemperature = MultipleParticleModel.INITIAL_TEMPERATURE;
    m_minModelTemperature = minTemperature;
    // the calculations can be performed as fast as is possible.
    m_moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
    m_moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
  }

  return inherit( Object, IsokineticThermostat, {
//------------------------------------------------------------------------
// Getters and Setters
//------------------------------------------------------------------------
    setTargetTemperature: function( temperature ) {
      m_targetTemperature = temperature;
    },
//------------------------------------------------------------------------
// Other Public Methods
//------------------------------------------------------------------------
    adjustTemperature: function() {
      // Calculate the internal temperature of the system from the kinetic energy.
      var measuredTemperature;
      var numberOfMolecules = m_moleculeDataSet.getNumberOfMolecules();
      if ( m_moleculeDataSet.getAtomsPerMolecule() > 1 ) {
        // Include rotational inertia in the calculation.
        var centersOfMassKineticEnergy = 0;
        var rotationalKineticEnergy = 0;
        for ( var i = 0; i < numberOfMolecules; i++ ) {
          centersOfMassKineticEnergy += 0.5 * m_moleculeDataSet.getMoleculeMass() * (Math.pow( m_moleculeVelocities[i].getX(), 2 ) + Math.pow( m_moleculeVelocities[i].getY(), 2 ));
          rotationalKineticEnergy += 0.5 * m_moleculeDataSet.getMoleculeRotationalInertia() * Math.pow( m_moleculeRotationRates[i], 2 );
        }
        measuredTemperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
      }
      else {
        var centersOfMassKineticEnergy = 0;
        for ( var i = 0; i < m_moleculeDataSet.getNumberOfMolecules(); i++ ) {
          // For single-atom molecules, exclude rotational inertia from the calculation.
          centersOfMassKineticEnergy += 0.5 * m_moleculeDataSet.getMoleculeMass() * (Math.pow( m_moleculeVelocities[i].getX(), 2 ) + Math.pow( m_moleculeVelocities[i].getY(), 2 ));
        }
        measuredTemperature = centersOfMassKineticEnergy / numberOfMolecules;
      }
      // Adjust the temperature.
      adjustTemperature( measuredTemperature );
    },
    adjustTemperature: function( measuredTemperature ) {
      // temperature.
      var temperatureScaleFactor;
      if ( m_targetTemperature <= m_minModelTemperature ) {
        temperatureScaleFactor = 0;
      }
      else {
        temperatureScaleFactor = Math.sqrt( m_targetTemperature / measuredTemperature );
      }
      for ( var i = 0; i < m_moleculeDataSet.getNumberOfMolecules(); i++ ) {
        m_moleculeVelocities[i].setComponents( m_moleculeVelocities[i].getX() * temperatureScaleFactor, m_moleculeVelocities[i].getY() * temperatureScaleFactor );
        // Doesn't hurt anything in the monatomic case.
        m_moleculeRotationRates[i] *= temperatureScaleFactor;
      }
    }
  } );
} );

