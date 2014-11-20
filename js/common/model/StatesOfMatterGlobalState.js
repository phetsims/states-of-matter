// Copyright 2002-2014, University of Colorado Boulder
/**
 * Global state information that applies to all modules in the simulation.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var TemperatureUnits = require( 'STATES_OF_MATTER/states-of-matter/view/TemperatureUnits' );

  var whiteBackground = new BooleanProperty( false );
  var temperatureUnitsProperty = new Property( TemperatureUnits.KELVIN );

  function StatesOfMatterGlobalState() {

  }

  return inherit( Object, StatesOfMatterGlobalState, {
    },
//statics
    {
      whiteBackground: whiteBackground,
      temperatureUnitsProperty: temperatureUnitsProperty
    } );
} );

