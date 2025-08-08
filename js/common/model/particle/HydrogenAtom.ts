// Copyright 2014-2020, University of Colorado Boulder

/**
 * The class represents a single atom of hydrogen in the model.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import statesOfMatter from '../../../statesOfMatter.js';
import AtomType from '../AtomType.js';
import ScaledAtom from './ScaledAtom.js';

class HydrogenAtom extends ScaledAtom {

  /**
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
   * @param {boolean} renderBelowOxygen - flag which says whether it has to be in the front or at the back of oxygen
   */
  constructor( x, y, renderBelowOxygen ) {
    super( AtomType.HYDROGEN, x, y );
    this.renderBelowOxygen = renderBelowOxygen; // @public, read-only
  }
}

statesOfMatter.register( 'HydrogenAtom', HydrogenAtom );
export default HydrogenAtom;