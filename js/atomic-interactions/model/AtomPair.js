// Copyright 2015-2022, University of Colorado Boulder

/**
 * AtomPair enumeration
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import AtomType from '../../common/model/AtomType.js';
import statesOfMatter from '../../statesOfMatter.js';

const AtomPair = EnumerationDeprecated.byMap( {
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