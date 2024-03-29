// Copyright 2020-2024, University of Colorado Boulder

/**
 * enumeration for the ways in which the forces can be depicted
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import statesOfMatter from '../../statesOfMatter.js';

const ForceDisplayMode = EnumerationDeprecated.byKeys( [ 'COMPONENTS', 'TOTAL', 'HIDDEN' ] );
statesOfMatter.register( 'ForceDisplayMode', ForceDisplayMode );
export default ForceDisplayMode;