// Copyright 2014-2022, University of Colorado Boulder

/**
 * AtomType enum
 *
 * @author Aaron Davis
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import statesOfMatter from '../../statesOfMatter.js';

const AtomType = EnumerationDeprecated.byKeys( [ 'NEON', 'ARGON', 'OXYGEN', 'HYDROGEN', 'ADJUSTABLE' ] );

statesOfMatter.register( 'AtomType', AtomType );
export default AtomType;