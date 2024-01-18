// Copyright 2015-2022, University of Colorado Boulder

/**
 * enumeration of the various possible phases of matter
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import statesOfMatter from '../statesOfMatter.js';

const PhaseStateEnum = EnumerationDeprecated.byKeys( [ 'SOLID', 'LIQUID', 'GAS', 'UNKNOWN' ] );
statesOfMatter.register( 'PhaseStateEnum', PhaseStateEnum );
export default PhaseStateEnum;