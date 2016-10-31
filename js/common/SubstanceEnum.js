// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  var SubstanceEnum = {
    NEON: 'NEON',
    ARGON: 'ARGON',
    DIATOMIC_OXYGEN: 'DIATOMIC_OXYGEN',
    WATER: 'WATER',
    USER_DEFINED_MOLECULE: 'USER_DEFINED_MOLECULE'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( SubstanceEnum ); }

  statesOfMatter.register( 'SubstanceEnum', SubstanceEnum );

  return SubstanceEnum;
} );