// Copyright 2002-2011, University of Colorado
/**
 * Global state information that applies to all modules in the simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Property = require( 'AXON/Property' );
  var TemperatureUnits = require( 'STATES_OF_MATTER/states-of-matter/view/TemperatureUnits' );

  var whiteBackground = new BooleanProperty( false );
  var temperatureUnitsProperty = new Property( TemperatureUnits.KELVIN );

  return inherit( Object, StatesOfMatterGlobalState, {
    },
//statics
    {
      whiteBackground: whiteBackground,
      temperatureUnitsProperty: temperatureUnitsProperty
    } );
} );

