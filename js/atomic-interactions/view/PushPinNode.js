// Copyright 2015-2020, University of Colorado Boulder

/**
 * PushPinNode represents the pushpin used to "pin" an atom in one location.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import pushPinImg from '../../../images/push-pin_png.js';
import statesOfMatter from '../../statesOfMatter.js';

/**
 * @constructor
 */
function PushPinNode() {
  Node.call( this );
  this.setPickable( false );
  const imageNode = new Image( pushPinImg );
  this.addChild( imageNode, { scale: 0.3 } ); // scale empirically determined
}

statesOfMatter.register( 'PushPinNode', PushPinNode );

inherit( Node, PushPinNode );
export default PushPinNode;