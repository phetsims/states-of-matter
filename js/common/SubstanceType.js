// Copyright 2016-2019, University of Colorado Boulder

define( require => {
  'use strict';

  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  const SubstanceType = {
    NEON: 'NEON',
    ARGON: 'ARGON',
    DIATOMIC_OXYGEN: 'DIATOMIC_OXYGEN',
    WATER: 'WATER',
    ADJUSTABLE_ATOM: 'ADJUSTABLE_ATOM'
  };

  // verify that the enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( SubstanceType ); }

  statesOfMatter.register( 'SubstanceType', SubstanceType );

  return SubstanceType;
} );