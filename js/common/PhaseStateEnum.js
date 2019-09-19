// Copyright 2015-2017, University of Colorado Boulder

define( require => {
  'use strict';

  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  const PhaseStateEnum = {
    SOLID: 'SOLID',
    LIQUID: 'LIQUID',
    GAS: 'GAS',
    UNKNOWN: 'UNKNOWN'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( PhaseStateEnum ); }

  statesOfMatter.register( 'PhaseStateEnum', PhaseStateEnum );

  return PhaseStateEnum;
} );