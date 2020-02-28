// Copyright 2014-2020, University of Colorado Boulder

/**
 * The class represents a single atom of neon in the model.
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
const RADIUS = Element.Ne.vanDerWaalsRadius;   // In picometers.
const MASS = Element.Ne.atomicWeight; // In atomic mass units.
const EPSILON = 32.8; // epsilon/k-Boltzmann is in Kelvin.

/**
 * @param {number} x - position in picometers
 * @param {number} y - position in picometers
 * @constructor
 */
function NeonAtom( x, y ) {
  SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.NEON_COLOR );
}

statesOfMatter.register( 'NeonAtom', NeonAtom );

export default inherit( SOMAtom, NeonAtom, {

    getType: function() {

      /**
       * @returns {string}
       * @public
       */
      return AtomType.NEON;
    }
  },

  // public static final
  {
    RADIUS: RADIUS,
    EPSILON: EPSILON
  } );