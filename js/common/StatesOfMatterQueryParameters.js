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

  var getQueryParameter = phet.chipper.getQueryParameter;

  var StatesOfMatterQueryParameters = {

    // fill the shape placement boards on the 'Explore' screen during startup, useful for testing
    PROJECTOR_MODE: !!getQueryParameter( 'projectorMode' )
  };

  statesOfMatter.register( 'StatesOfMatterQueryParameters', StatesOfMatterQueryParameters );

  return StatesOfMatterQueryParameters;
} );
