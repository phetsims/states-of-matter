// Copyright 2015-2022, University of Colorado Boulder

/**
 * PushPinNode represents the pushpin used to "pin" an atom in one position.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { Image, Node } from '../../../../scenery/js/imports.js';
import pushPin_png from '../../../images/pushPin_png.js';
import statesOfMatter from '../../statesOfMatter.js';

class PushPinNode extends Node {

  constructor() {
    super();
    this.setPickable( false );
    const imageNode = new Image( pushPin_png );
    this.addChild( imageNode, { scale: 0.3 } ); // scale empirically determined
  }
}

statesOfMatter.register( 'PushPinNode', PushPinNode );
export default PushPinNode;