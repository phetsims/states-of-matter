// Copyright 2015-2017, University of Colorado Boulder

/**
 * AtomPair enum
 * @author Chandrashekar Bemagoni  (Actual Concepts)
 */
define( require => {
  'use strict';

  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  const AtomPair = {
    NEON_NEON: 'NEON_NEON',
    ARGON_ARGON: 'ARGON_ARGON',
    OXYGEN_OXYGEN: 'OXYGEN_OXYGEN',
    NEON_ARGON: 'NEON_ARGON',
    NEON_OXYGEN: 'NEON_OXYGEN',
    ARGON_OXYGEN: 'ARGON_OXYGEN',
    ADJUSTABLE: 'ADJUSTABLE'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( AtomPair ); }

  statesOfMatter.register( 'AtomPair', AtomPair );

  return AtomPair;
} );