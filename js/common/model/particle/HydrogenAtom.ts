// Copyright 2014-2025, University of Colorado Boulder

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

  public readonly renderBelowOxygen: boolean;

  /**
   * @param x - atom x position in picometers
   * @param y - atom y position in picometers
   * @param renderBelowOxygen - flag which says whether it has to be in the front or at the back of oxygen
   */
  public constructor( x: number, y: number, renderBelowOxygen: boolean ) {
    super( AtomType.HYDROGEN, x, y );
    this.renderBelowOxygen = renderBelowOxygen;
  }
}

statesOfMatter.register( 'HydrogenAtom', HydrogenAtom );
export default HydrogenAtom;