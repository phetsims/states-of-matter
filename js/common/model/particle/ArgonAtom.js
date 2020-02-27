// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class represents a single atom of argon in the model.
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
const RADIUS = Element.Ar.vanDerWaalsRadius;  // In picometers.
const MASS = Element.Ar.atomicWeight; // In atomic mass units.

/**
 * @param {number} x - atom x position in picometers
 * @param {number} y - atom y position in picometers
 * @constructor
 */
function ArgonAtom( x, y ) {
  SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.ARGON_COLOR );
}

statesOfMatter.register( 'ArgonAtom', ArgonAtom );

export default inherit( SOMAtom, ArgonAtom, {

    /**
     * @returns {string}
     * @public
     */
    getType: function() {
      return AtomType.ARGON;
    }
  },

  // public static final
  {
    RADIUS: RADIUS
  } );