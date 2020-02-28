// Copyright 2014-2020, University of Colorado Boulder

/**
 * AtomType enum
 *
 * @author Aaron Davis
 */

import statesOfMatter from '../../statesOfMatter.js';

// NOTE: enum pattern recommends using {} for each value, but strings are more convenient for debugging
const AtomType = Object.freeze( {
  NEON: 'NEON',
  ARGON: 'ARGON',
  OXYGEN: 'OXYGEN',
  HYDROGEN: 'HYDROGEN',
  ADJUSTABLE: 'ADJUSTABLE'
} );

statesOfMatter.register( 'AtomType', AtomType );

export default AtomType;