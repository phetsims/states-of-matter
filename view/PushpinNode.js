// Copyright 2002-2011, University of Colorado
/**
 * PushpinNode represents the pushpin used to "pin" an atom in one location.
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var pushPinImg = require( 'image!ATOMIC_INTERACTIONS/push-pin.png' );

  function PushpinNode() {
    Node.call( this );
    this.setPickable( false );

    var imageNode = new Image( pushPinImg );
    imageNode.setTranslation( -this.getWidth(), -this.getHeight() );

    this.addChild( imageNode, {scale: 0.3} );
  }

  return inherit( Node, PushpinNode );
} );
