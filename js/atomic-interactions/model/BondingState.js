// Copyright 2015, University of Colorado Boulder

/**
 * Enum that defines the bonding state between two atoms.
 */
define( function( require ) {
  'use strict';

  var BondingState = {
    UNBONDED: 'UNBONDED',
    BONDING: 'BONDING',
    BONDED: 'BONDED'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( BondingState ); }

  return BondingState;
} );

