// Copyright 2015-2020, University of Colorado Boulder

/**
 * PushPinNode represents the pushpin used to "pin" an atom in one position.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import pushPinImg from '../../../images/push-pin_png.js';
import statesOfMatter from '../../statesOfMatter.js';

class PushPinNode extends Node {

  constructor() {
    super();
    this.setPickable( false );
    const imageNode = new Image( pushPinImg );
    this.addChild( imageNode, { scale: 0.3 } ); // scale empirically determined
  }
}

statesOfMatter.register( 'PushPinNode', PushPinNode );
export default PushPinNode;