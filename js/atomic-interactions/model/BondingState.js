// Copyright 2015, University of Colorado Boulder

/**
 * Enum that defines the bonding state between two atoms.
 */
define( function( require ) {
  'use strict';

  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  var BondingState = {
    UNBONDED: 'UNBONDED',
    BONDING: 'BONDING',
    BONDED: 'BONDED',
    ALLOWING_ESCAPE: 'ALLOWING_ESCAPE'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( BondingState ); }

  statesOfMatter.register( 'BondingState', BondingState );

  return BondingState;
} );

