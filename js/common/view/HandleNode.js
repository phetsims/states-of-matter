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
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  /**
   *
   * @constructor
   */
  function HandleNode() {

    Node.call( this );
    var handleScale = 0.22;
    // add handle middle shape
    var handleNodeUpperMiddleShapeTopY = 5;
    var handleNodeUpperMiddleShapeMiddleY = 10;
    var handleNodeUpperMiddleShapeBottomY = 30;
    var handleNodeLowerMiddleShapeTopY = 49;
    var handleNodeLowerMiddleShapeMiddleY = 65;
    var handleNodeLowerMiddleShapeBottomY = 69;
    var middleShape = new Path( new Shape()
      .moveTo( 0, 67 )
      .lineTo( 0, 7 )
      .quadraticCurveTo( 10, handleNodeUpperMiddleShapeTopY, 16, handleNodeUpperMiddleShapeMiddleY )
      .quadraticCurveTo( 28, handleNodeUpperMiddleShapeBottomY, 39, handleNodeUpperMiddleShapeMiddleY )
      .quadraticCurveTo( 48, handleNodeUpperMiddleShapeTopY, 55, handleNodeUpperMiddleShapeMiddleY )
      .quadraticCurveTo( 67, handleNodeUpperMiddleShapeBottomY, 77, handleNodeUpperMiddleShapeMiddleY )
      .quadraticCurveTo( 89, handleNodeUpperMiddleShapeTopY, 98, handleNodeUpperMiddleShapeMiddleY )
      .quadraticCurveTo( 106, handleNodeUpperMiddleShapeBottomY, 116, handleNodeUpperMiddleShapeMiddleY )
      .quadraticCurveTo( 127, handleNodeUpperMiddleShapeTopY, 137, handleNodeUpperMiddleShapeMiddleY )
      .lineTo( 137, 66 )
      .quadraticCurveTo( 130, handleNodeLowerMiddleShapeBottomY, 120, handleNodeLowerMiddleShapeMiddleY )
      .quadraticCurveTo( 109, handleNodeLowerMiddleShapeTopY, 99, handleNodeLowerMiddleShapeMiddleY )
      .quadraticCurveTo( 89, handleNodeLowerMiddleShapeBottomY, 83, handleNodeLowerMiddleShapeMiddleY )
      .quadraticCurveTo( 70, handleNodeLowerMiddleShapeTopY, 60, handleNodeLowerMiddleShapeMiddleY )
      .quadraticCurveTo( 48, handleNodeLowerMiddleShapeBottomY, 42, handleNodeLowerMiddleShapeMiddleY )
      .quadraticCurveTo( 30, handleNodeLowerMiddleShapeTopY, 20, handleNodeLowerMiddleShapeMiddleY )
      .lineTo( 0, 66 )
      .close(), {
      lineWidth: 3,
      stroke: 'black',
      scale: handleScale,
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
      fill: 'black',
      scale: handleScale,
      right: middleShape.left,
      y: middleShape.centerY - 3
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
      fill: 'black',
      scale: handleScale,
      y: middleShape.centerY - 2,
      left: middleShape.right
    } );
    this.addChild( rightShape );
    leftShape.setScaleMagnitude( handleScale, 0.16 );
    rightShape.setScaleMagnitude( handleScale, 0.16 );
  }

  return inherit( Node, HandleNode );

} );