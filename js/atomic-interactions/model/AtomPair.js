// Copyright 2015-2020, University of Colorado Boulder

/**
 * AtomPair enumeration
 * @author John Blanco (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import AtomType from '../../common/model/AtomType.js';
import statesOfMatter from '../../statesOfMatter.js';

const AtomPair = Enumeration.byMap( {
  NEON_NEON: { fixedAtomType: AtomType.NEON, movableAtomType: AtomType.NEON },
  ARGON_ARGON: { fixedAtomType: AtomType.ARGON, movableAtomType: AtomType.ARGON },
  OXYGEN_OXYGEN: { fixedAtomType: AtomType.OXYGEN, movableAtomType: AtomType.OXYGEN },
  NEON_ARGON: { fixedAtomType: AtomType.NEON, movableAtomType: AtomType.ARGON },
  NEON_OXYGEN: { fixedAtomType: AtomType.NEON, movableAtomType: AtomType.OXYGEN },
  ARGON_OXYGEN: { fixedAtomType: AtomType.ARGON, movableAtomType: AtomType.OXYGEN },
  ADJUSTABLE: { fixedAtomType: AtomType.ADJUSTABLE, movableAtomType: AtomType.ADJUSTABLE }
  }
);

statesOfMatter.register( 'AtomPair', AtomPair );
export default AtomPair;