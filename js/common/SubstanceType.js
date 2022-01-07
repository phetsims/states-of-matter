// Copyright 2016-2022, University of Colorado Boulder

/**
 * enumeration of the different substances that can be selected to be in the container
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import statesOfMatter from '../statesOfMatter.js';

const SubstanceType = EnumerationDeprecated.byKeys( [ 'NEON', 'ARGON', 'DIATOMIC_OXYGEN', 'WATER', 'ADJUSTABLE_ATOM' ] );
statesOfMatter.register( 'SubstanceType', SubstanceType );
export default SubstanceType;