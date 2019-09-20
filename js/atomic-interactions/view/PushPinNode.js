// Copyright 2015-2019, University of Colorado Boulder

/**
 * PushPinNode represents the pushpin used to "pin" an atom in one location.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // images
  const pushPinImg = require( 'image!STATES_OF_MATTER/push-pin.png' );

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

  return inherit( Node, PushPinNode );
} );
