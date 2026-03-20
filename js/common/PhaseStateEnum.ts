// Copyright 2015-2025, University of Colorado Boulder

/**
 * enumeration of the various possible phases of matter
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

const PhaseStateEnum = EnumerationDeprecated.byKeys( [ 'SOLID', 'LIQUID', 'GAS', 'UNKNOWN' ] ) as IntentionalAny;
export default PhaseStateEnum;
