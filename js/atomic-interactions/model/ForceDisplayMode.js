// Copyright 2020-2021, University of Colorado Boulder

/**
 * enumeration for the ways in which the forces can be depicted
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import statesOfMatter from '../../statesOfMatter.js';

const ForceDisplayMode = Enumeration.byKeys( [ 'COMPONENTS', 'TOTAL', 'HIDDEN' ] );
statesOfMatter.register( 'ForceDisplayMode', ForceDisplayMode );
export default ForceDisplayMode;