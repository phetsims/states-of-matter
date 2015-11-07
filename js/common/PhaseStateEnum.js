// Copyright 2015, University of Colorado Boulder

define( function( require ) {
  'use strict';

  var PhaseStateEnum = {
    SOLID: 'SOLID',
    LIQUID: 'LIQUID',
    GAS: 'GAS',
    UNKNOWN: 'UNKNOWN'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( PhaseStateEnum ); }

  return PhaseStateEnum;
} );