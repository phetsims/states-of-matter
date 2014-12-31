// Copyright 2002-2011, University of Colorado
/**
 * View for the hand node which looks like a human hand with thumb and pointing finger expanded and the other three
 * fingers folded.
 *
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

  /***
   *
   * @param model
   * @param particle
   * @param mvt
   * @param minX
   * @param maxX
   * @constructor
   */
  function HandNode( model, particle, mvt, minX, maxX ) {

    Node.call( this );
    var handNode = this;
    var handShape = new Path( new Shape()
      .moveTo( 11, 67 )
      .quadraticCurveTo( 0, 58, 12, 54 )//thumb round
      .quadraticCurveTo( 26, 57, 42, 63 )//thumb right
      .quadraticCurveTo( 24, 36, 9, 14 )//index left
      .quadraticCurveTo( 1, 7, 12, 3 )//index left round
      .quadraticCurveTo( 20, 0, 24, 6 )//index right round
      .quadraticCurveTo( 29, 13, 38, 23 )//index right
      .quadraticCurveTo( 50, 14, 62, 22 )//middle round
      .quadraticCurveTo( 74, 14, 84, 23 )//ring round
      .quadraticCurveTo( 98, 15, 104, 24 )//baby round
      .quadraticCurveTo( 116, 38, 128, 58 )//hand right
      .quadraticCurveTo( 140, 75, 125, 87 )//hand right round
      .quadraticCurveTo( 100, 105, 76, 97 )//hand left round
      .quadraticCurveTo( 50, 84, 13, 68 )//hand left
      .close(), {
      lineWidth: 1,
      stroke: 'black',
      fill: 'white'
    } );
    this.addChild( handShape );
    var startDragX;
    var endDragX;
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        // Stop the model from moving the particle at the same time the user
        // is moving it.
        model.setMotionPaused( true );
        startDragX = handNode.globalToParentPoint( event.pointer.point ).x;
      },
      drag: function( event ) {
        // Only allow the user to move unbonded atoms.
        if ( model.getBondingState() !== model.BONDING_STATE_UNBONDED ) {
          // Need to release the bond before we can move the atom.
          model.releaseBond();
        }
        endDragX = handNode.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        startDragX = endDragX;        // Make sure we don't exceed the positional limits.
        var newPosX = mvt.modelToViewX( particle.getX() ) + d;
        if ( newPosX > maxX ) {
          newPosX = maxX;
        }
        else if ( newPosX < minX ) {
          newPosX = minX;
        }
        // Move the particle based on the amount of mouse movement.
        particle.setPosition( mvt.viewToModelX( newPosX ), particle.getY() );
      },
      end: function() {
        // Let the model move the particles again.  Note that this happens
        // even if the motion was paused by some other means.
        model.setMotionPaused( false );
        handNode.setVisible( false )
      }
    } ) );
    model.movableAtom.positionProperty.link( function( position ) {
      handNode.setTranslation( mvt.modelToViewX( position.x ), mvt.modelToViewY( position.y ) );
    } );


  }

  return inherit( Node, HandNode )

} );