// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  var SOMQueryParameters = QueryStringMachine.getAll( {

    // Default to displaying degrees Celsius instead of Kelvin, requested by user(s), see
    // https://github.com/phetsims/states-of-matter/issues/216
    defaultCelsius: { type: 'flag' }
  } );

  statesOfMatter.register( 'SOMQueryParameters', SOMQueryParameters );

  return SOMQueryParameters;
} );
