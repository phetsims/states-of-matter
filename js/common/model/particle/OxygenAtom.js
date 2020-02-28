// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class represents a single atom of oxygen in the model.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import Element from '../../../../../nitroglycerin/js/Element.js';
import inherit from '../../../../../phet-core/js/inherit.js';
import statesOfMatter from '../../../statesOfMatter.js';
import SOMConstants from '../../SOMConstants.js';
import AtomType from '../AtomType.js';
import SOMAtom from './SOMAtom.js';

// constants
const RADIUS = Element.O.vanDerWaalsRadius;   // In picometers.
const MASS = Element.O.atomicWeight; // In atomic mass units.

/**
 * @param {number} x - atom x position in picometers
 * @param {number} y - atom y  position in picometers
 * @constructor
 */
function OxygenAtom( x, y ) {
  SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.OXYGEN_COLOR );
}

statesOfMatter.register( 'OxygenAtom', OxygenAtom );

export default inherit( SOMAtom, OxygenAtom, {

    /**
     * @returns {string}
     * @public
     */
    getType: function() {
      return AtomType.OXYGEN;
    }
  },

  // public static final
  {
    RADIUS: RADIUS
  } );