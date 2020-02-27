// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class represents an atom that has configurable radius.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import inherit from '../../../../../phet-core/js/inherit.js';
import statesOfMatter from '../../../statesOfMatter.js';
import SOMConstants from '../../SOMConstants.js';
import AtomType from '../AtomType.js';
import SOMAtom from './SOMAtom.js';

// constants
const DEFAULT_INTERACTION_POTENTIAL = SOMConstants.MAX_EPSILON / 2;
const DEFAULT_RADIUS = 175; // in picometers
const MASS = 25; // in atomic mass units

/**
 * @param {number} x - position
 * @param {number} y - position
 * @constructor
 */
function ConfigurableStatesOfMatterAtom( x, y ) {
  SOMAtom.call( this, x, y, DEFAULT_RADIUS, MASS, SOMConstants.ADJUSTABLE_ATTRACTION_COLOR );
}

statesOfMatter.register( 'ConfigurableStatesOfMatterAtom', ConfigurableStatesOfMatterAtom );

export default inherit( SOMAtom, ConfigurableStatesOfMatterAtom, {

    /**
     * @returns {string}
     * @public
     */
    getType: function() {
      return AtomType.ADJUSTABLE;
    },

    /**
     * @param {number} radius - atom radius in picometers
     * @public
     */
    setRadius: function( radius ) {
      this.radius = radius;
    }
  },
  // statics
  {
    DEFAULT_INTERACTION_POTENTIAL: DEFAULT_INTERACTION_POTENTIAL,
    DEFAULT_RADIUS: DEFAULT_RADIUS
  } );