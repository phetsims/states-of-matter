// Copyright 2015, University of Colorado Boulder

/**
 * PushPinNode represents the pushpin used to "pin" an atom in one location.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // images
  var pushPinImg = require( 'image!STATES_OF_MATTER/push-pin.png' );

  /**
   * @constructor
   */
  function PushPinNode() {
    Node.call( this );
    this.setPickable( false );

    var imageNode = new Image( pushPinImg );
    this.addChild( imageNode, { scale: 0.3 } ); // scale empirically determined
  }

  statesOfMatter.register( 'PushPinNode', PushPinNode );

  return inherit( Node, PushPinNode );
} );
