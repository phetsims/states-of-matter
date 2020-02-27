// Copyright 2020, University of Colorado Boulder

/**
 * enum for sim speed settings
 *
 * @author John Blanco
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import statesOfMatter from '../../statesOfMatter.js';

// @public
const SimSpeed = Enumeration.byKeys( [ 'NORMAL', 'SLOW_MOTION' ] );

statesOfMatter.register( 'SimSpeed', SimSpeed );
export default SimSpeed;