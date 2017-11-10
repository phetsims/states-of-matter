// Copyright 2014-2017, University of Colorado Boulder

/**
 * AtomType enum
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // NOTE: enum pattern recommends using {} for each value, but strings are more convenient for debugging
  var AtomType = Object.freeze( {
    NEON: 'NEON',
    ARGON: 'ARGON',
    OXYGEN: 'OXYGEN',
    HYDROGEN: 'HYDROGEN',
    ADJUSTABLE: 'ADJUSTABLE'
  } );

  statesOfMatter.register( 'AtomType', AtomType );

  return AtomType;
} );

