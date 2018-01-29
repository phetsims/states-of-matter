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

  } );

  statesOfMatter.register( 'SOMQueryParameters', SOMQueryParameters );

  return SOMQueryParameters;
} );
