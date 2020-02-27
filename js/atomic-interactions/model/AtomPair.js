// Copyright 2015-2020, University of Colorado Boulder

/**
 * AtomPair enumeration
 * @author John Blanco (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import statesOfMatter from '../../statesOfMatter.js';

const AtomPair = Enumeration.byKeys( [
  'NEON_NEON',
  'ARGON_ARGON',
  'OXYGEN_OXYGEN',
  'NEON_ARGON',
  'NEON_OXYGEN',
  'ARGON_OXYGEN',
  'ADJUSTABLE'
] );
statesOfMatter.register( 'AtomPair', AtomPair );
export default AtomPair;