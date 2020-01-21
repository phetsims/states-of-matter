// Copyright 2015-2020, University of Colorado Boulder

/**
 * AtomPair enumeration
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  const AtomPair = Enumeration.byKeys( [
    'NEON_NEON',
    'ARGON_ARGON',
    'OXYGEN_OXYGEN',
    'NEON_ARGON',
    'NEON_OXYGEN',
    'ARGON_OXYGEN',
    'ADJUSTABLE'
  ] );
  return statesOfMatter.register( 'AtomPair', AtomPair );
} );