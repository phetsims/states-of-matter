// Copyright 2015-2020, University of Colorado Boulder

/**
 * enumeration of the various possible phases of matter
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import statesOfMatter from '../statesOfMatter.js';

const PhaseStateEnum = Enumeration.byKeys( [ 'SOLID', 'LIQUID', 'GAS', 'UNKNOWN' ] );
statesOfMatter.register( 'PhaseStateEnum', PhaseStateEnum );
export default PhaseStateEnum;