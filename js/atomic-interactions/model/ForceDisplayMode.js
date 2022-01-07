// Copyright 2020-2022, University of Colorado Boulder

/**
 * enumeration for the ways in which the forces can be depicted
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import statesOfMatter from '../../statesOfMatter.js';

const ForceDisplayMode = EnumerationDeprecated.byKeys( [ 'COMPONENTS', 'TOTAL', 'HIDDEN' ] );
statesOfMatter.register( 'ForceDisplayMode', ForceDisplayMode );
export default ForceDisplayMode;