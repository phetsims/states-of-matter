// Copyright 2002-2012, University of Colorado
/**
 * This class implements what is known as an Andersen Thermostat for adjusting
 * the kinetic energy in a set of molecules toward a desired setpoint.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'java.util.Random' );
  var Vector2 = require( 'DOT/Vector2' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

  /**
   * Constructor for the Andersen thermostat.
   *
   * @param moleculeDataSet - Data set on which operations will be performed.
   * @param minTemperature  - The temperature that should be considered
   *                        considered absolute zero, below which motion should cease.
   */
  function AndersenThermostat( moleculeDataSet, minTemperature ) {
    //------------------------------------------------------------------------
    // Instance Data
    //------------------------------------------------------------------------
    this.m_moleculeDataSet;
    this.m_moleculeVelocities;
    this.m_moleculeRotationRates;
    this.m_rand;
    // Target temperature in normalized model units.
    this.m_targetTemperature;
    // Minimum temperature in normalized model units, below this is considered absolute 0;
    this.m_minModelTemperature;
    m_moleculeDataSet = moleculeDataSet;
    m_targetTemperature = MultipleParticleModel.INITIAL_TEMPERATURE;
    m_minModelTemperature = minTemperature;
    m_rand = new Random();
    // the calculations can be performed as fast as is possible.
    m_moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
    m_moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
  }

  return inherit( Object, AndersenThermostat, {
//------------------------------------------------------------------------
// Other Public Methods
//------------------------------------------------------------------------
    adjustTemperature: function() {
      var gammaX = 0.9999;
      var gammaY = gammaX;
      var temperature = m_targetTemperature;
      if ( temperature <= m_minModelTemperature ) {
        // we want to create the appearance of absolute zero.
        gammaX = 0.992;
        // Scale a little differently in Y direction so particles don't
        gammaY = 0.999;
        // stop falling when absolute zero is reached.
        temperature = 0;
      }
      var massInverse = 1 / m_moleculeDataSet.getMoleculeMass();
      var inertiaInverse = 1 / m_moleculeDataSet.getMoleculeRotationalInertia();
      var velocityScalingFactor = Math.sqrt( temperature * massInverse * (1 - Math.pow( gammaX, 2 )) );
      var rotationScalingFactor = Math.sqrt( temperature * inertiaInverse * (1 - Math.pow( gammaX, 2 )) );
      for ( var i = 0; i < m_moleculeDataSet.getNumberOfMolecules(); i++ ) {
        var xVel = m_moleculeVelocities[i].getX() * gammaX + m_rand.nextGaussian() * velocityScalingFactor;
        var yVel = m_moleculeVelocities[i].getY() * gammaY + m_rand.nextGaussian() * velocityScalingFactor;
        m_moleculeVelocities[i].setComponents( xVel, yVel );
        m_moleculeRotationRates[i] = gammaX * m_moleculeRotationRates[i] + m_rand.nextGaussian() * rotationScalingFactor;
      }
    },
    adjustTemperature: function( kineticEnergy ) {
      adjustTemperature();
    },
    setTargetTemperature: function( temperature ) {
      m_targetTemperature = temperature;
    }
  } );
} );

