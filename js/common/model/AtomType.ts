// Copyright 2014-2025, University of Colorado Boulder

/**
 * AtomType enum
 *
 * @author Aaron Davis
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import statesOfMatter from '../../statesOfMatter.js';

const AtomType = EnumerationDeprecated.byKeys( [ 'NEON', 'ARGON', 'OXYGEN', 'HYDROGEN', 'ADJUSTABLE' ] ) as IntentionalAny;

statesOfMatter.register( 'AtomType', AtomType );
export default AtomType;