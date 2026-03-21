// Copyright 2016-2026, University of Colorado Boulder

/**
 * enumeration of the different substances that can be selected to be in the container
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

const SubstanceType = EnumerationDeprecated.byKeys( [ 'NEON', 'ARGON', 'DIATOMIC_OXYGEN', 'WATER', 'ADJUSTABLE_ATOM' ] ) as IntentionalAny;
export default SubstanceType;
