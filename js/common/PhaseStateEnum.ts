// Copyright 2015-2024, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * enumeration of the various possible phases of matter
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import statesOfMatter from '../statesOfMatter.js';

const PhaseStateEnum = EnumerationDeprecated.byKeys( [ 'SOLID', 'LIQUID', 'GAS', 'UNKNOWN' ] ) as IntentionalAny;
statesOfMatter.register( 'PhaseStateEnum', PhaseStateEnum );
export default PhaseStateEnum;