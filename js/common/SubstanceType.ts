// Copyright 2016-2024, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * enumeration of the different substances that can be selected to be in the container
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import statesOfMatter from '../statesOfMatter.js';

const SubstanceType = EnumerationDeprecated.byKeys( [ 'NEON', 'ARGON', 'DIATOMIC_OXYGEN', 'WATER', 'ADJUSTABLE_ATOM' ] );
statesOfMatter.register( 'SubstanceType', SubstanceType );
export default SubstanceType;