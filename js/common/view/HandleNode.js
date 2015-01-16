// Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the particle container handle node. It looks like a smooth sinewave at the top and the bottom.
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  /**
   *
   * @param { MultipleParticleModel } model
   * @constructor
   */
  function HandleNode( model, modelViewTransform ) {

    Node.call( this );
    var handleNode = this;
    // add handle middle shape
    var middleShape = new Path( new Shape()
      .moveTo( 0, 67 )
      .lineTo( 0, 7 )
      .quadraticCurveTo( 10, 5, 16, 10 )
      .quadraticCurveTo( 28, 30, 39, 10 )
      .quadraticCurveTo( 48, 5, 55, 10 )
      .quadraticCurveTo( 67, 30, 77, 10 )
      .quadraticCurveTo( 89, 5, 98, 10 )
      .quadraticCurveTo( 106, 30, 116, 10 )
      .quadraticCurveTo( 127, 5, 137, 10 )
      .quadraticCurveTo( 146, 30, 156, 10 )
      .quadraticCurveTo( 166, 5, 176, 10 )
      .lineTo( 176, 66 )
      .quadraticCurveTo( 167, 69, 162, 65 )
      .quadraticCurveTo( 146, 49, 136, 65 )
      .quadraticCurveTo( 130, 69, 120, 65 )
      .quadraticCurveTo( 109, 49, 99, 65 )
      .quadraticCurveTo( 89, 69, 83, 65 )
      .quadraticCurveTo( 70, 49, 60, 65 )
      .quadraticCurveTo( 48, 69, 42, 65 )
      .quadraticCurveTo( 30, 49, 20, 65 )
      .lineTo( 0, 66 )
      .close(), {
      lineWidth: 3,
      stroke: 'black',
      scale: 0.25,
      fill: new LinearGradient( 0, 0, 0, 70 )
        .addColorStop( 0, '#8C8E90' )
        .addColorStop( 0.3, '#B7B8B9' )
        .addColorStop( 0.6, '#FFFFFF' )
        .addColorStop( 0.8, '#B2B3B4' )
        .addColorStop( 0.9, '#838587' )
    } );
    this.addChild( middleShape );

    // add handle left shape
    var leftShape = new Path( new Shape()
      .moveTo( 34, 7 )
      .lineTo( 34, 22 )
      .lineTo( 27, 23 )
      .quadraticCurveTo( 26, 24, 25, 26 )
      .lineTo( 25, 72 )
      .lineTo( 33, 85 )
      .lineTo( 0, 85 )
      .lineTo( 8, 72 )
      .lineTo( 8, 20 )
      .quadraticCurveTo( 17, 12, 23, 7 )
      .close(), {
      lineWidth: 3,
      stroke: 'black',
      fill: 'black', scale: 0.25
    } );


    this.addChild( leftShape );


    // add handle right shape
    var rightShape = new Path( new Shape()
      .moveTo( 0, 2 )
      .lineTo( 7, 2 )
      .quadraticCurveTo( 15, 8, 21, 15 )
      .lineTo( 19, 70 )
      .lineTo( 26, 84 )
      .lineTo( 0, 84 )
      .lineTo( 6, 71 )
      .lineTo( 6, 23 )
      .quadraticCurveTo( 5, 19, 4, 15 )
      .lineTo( 0, 17 )
      .lineTo( 0, 2 )
      .close(), {
      lineWidth: 3,
      stroke: 'black',
      fill: 'black', scale: 0.25
    } );
    this.addChild( rightShape );

    leftShape.right = middleShape.left;
    leftShape.y = middleShape.centerY - 3;
    rightShape.y = middleShape.centerY - 2;
    rightShape.left = middleShape.right;

    // Set ourself up to listen for and handle mouse dragging events.
    var startY, endY;

    this.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          startY = handleNode.globalToParentPoint( event.pointer.point ).y;
          handleNode.mouseMovementAmount = 0;
          handleNode.containerSizeAtDragStart = model.getParticleContainerHeight();
        },
        drag: function( event ) {
          endY = handleNode.globalToParentPoint( event.pointer.point ).y;
          handleNode.mouseMovementAmount = (endY - startY);
          // Resize the container based on the amount that the node has moved.
          model.setTargetParticleContainerHeight(
            handleNode.containerSizeAtDragStart +
            modelViewTransform.viewToModelDeltaY( handleNode.mouseMovementAmount ) );
        },
        end: function() {
          // in size that is currently underway.
          model.setTargetParticleContainerHeight( model.getParticleContainerHeight() );

        }
      } ) );
  }

  return inherit( Node, HandleNode );

} );