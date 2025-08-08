// Copyright 2015-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * PushPinNode represents the pushpin used to "pin" an atom in one position.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import pushPin_png from '../../../images/pushPin_png.js';
import statesOfMatter from '../../statesOfMatter.js';

class PushPinNode extends Node {

  public constructor() {
    super();
    this.setPickable( false );
    const imageNode = new Image( pushPin_png );
    this.addChild( imageNode, { scale: 0.3 } ); // scale empirically determined
  }
}

statesOfMatter.register( 'PushPinNode', PushPinNode );
export default PushPinNode;