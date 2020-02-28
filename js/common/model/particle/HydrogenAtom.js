// Copyright 2014-2020, University of Colorado Boulder

/**
 * The class represents a single atom of hydrogen in the model.
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
const RADIUS = Element.H.vanDerWaalsRadius;   // In picometers.
const MASS = Element.H.atomicWeight; // In atomic mass units.

/**
 * @param {number} x - atom x position in picometers
 * @param {number} y - atom y position in picometers
 * @param {boolean} renderBelowOxygen - flag which says whether it has to be in the front or at the back of oxygen
 * @constructor
 */
function HydrogenAtom( x, y, renderBelowOxygen ) {
  SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.HYDROGEN_COLOR );
  this.renderBelowOxygen = renderBelowOxygen; // @public, read-only
}

statesOfMatter.register( 'HydrogenAtom', HydrogenAtom );

export default inherit( SOMAtom, HydrogenAtom, {

    /**
     * @public
     * @returns {string}
     */
    getType: function() {
      return AtomType.HYDROGEN;
    }

  },

  // public static final
  {
    RADIUS: RADIUS
  } );