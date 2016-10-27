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

  var StatesOfMatterQueryParameters = QueryStringMachine.getAll( {

    // fill the shape placement boards on the 'Explore' screen during startup, useful for testing
    projectorMode: { type: 'flag' },

    // show some debug information on the first screen related to timing in the multi-particle model
    debugTimeStep: { type: 'flag' }
  } );

  statesOfMatter.register( 'StatesOfMatterQueryParameters', StatesOfMatterQueryParameters );

  return StatesOfMatterQueryParameters;
} );
