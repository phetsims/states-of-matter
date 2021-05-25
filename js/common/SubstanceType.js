// Copyright 2016-2021, University of Colorado Boulder

/**
 * enumeration of the different substances that can be selected to be in the container
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import statesOfMatter from '../statesOfMatter.js';

const SubstanceType = Enumeration.byKeys( [ 'NEON', 'ARGON', 'DIATOMIC_OXYGEN', 'WATER', 'ADJUSTABLE_ATOM' ] );
statesOfMatter.register( 'SubstanceType', SubstanceType );
export default SubstanceType;