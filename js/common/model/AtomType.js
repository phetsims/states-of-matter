// Copyright 2014-2020, University of Colorado Boulder

/**
 * AtomType enum
 *
 * @author Aaron Davis
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import statesOfMatter from '../../statesOfMatter.js';

const AtomType = Enumeration.byKeys( ['NEON', 'ARGON', 'OXYGEN', 'HYDROGEN', 'ADJUSTABLE'] );

statesOfMatter.register( 'AtomType', AtomType );
export default AtomType;