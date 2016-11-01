// Copyright 2015, University of Colorado Boulder

/**
 * View for the hand node which looks like a human hand with thumb and pointing finger expanded and the other three
 * fingers folded.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // images
  var handImage = require( 'image!SCENERY_PHET/hand.png' );

  // constants
  var WIDTH = 80; // empirically determined to look good

  /***
   * @param {DualAtomModel} dualAtomModel - model of the atomic interactions screen
   * @param {StatesOfMatterAtom} particle - model of the atom that is draggable
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {number} minX - grabbable particle min x position
   * @param {number} maxX - grabbable particle max x position
   * @constructor
   */
  function HandNode( dualAtomModel, particle, modelViewTransform, minX, maxX ) {

    Node.call( this, { cursor: 'pointer' } );
    var self = this;
    this.minX = minX;
    this.maxX = maxX;
    this.addChild( new Image( handImage, { minWidth: WIDTH, maxWidth: WIDTH } ) );
    var startDragX;
    var endDragX;

    this.addInputListener( new SimpleDragHandler( {

      start: function( event ) {

        // Stop the model from moving the particle at the same time the user is moving it.
        dualAtomModel.setMotionPaused( true );
        startDragX = self.globalToParentPoint( event.pointer.point ).x;
      },

      drag: function( event ) {

        // Only allow the user to move unbonded atoms.
        if ( dualAtomModel.bondingState !== dualAtomModel.BONDING_STATE_UNBONDED ) {

          // Need to release the bond before we can move the atom.
          dualAtomModel.releaseBond();
        }
        endDragX = self.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        startDragX = endDragX;        // Make sure we don't exceed the positional limits.
        var newPosX = modelViewTransform.modelToViewX( particle.getX() ) + d;
        if ( newPosX > self.maxX ) {
          newPosX = self.maxX;
        }
        else if ( newPosX < self.minX ) {
          newPosX = self.minX;
        }
        // Move the particle based on the amount of mouse movement.
        particle.setPosition( modelViewTransform.viewToModelX( newPosX ), particle.getY() );
      },

      end: function() {

        // Let the model move the particles again.  Note that this happens even if the motion was paused by some otherz
        // means.
        dualAtomModel.setMotionPaused( false );
        dualAtomModel.isHandNodeVisible = false;
        self.setVisible( false );
      }
    } ) );

    dualAtomModel.movableAtom.positionProperty.link( function( position ) {
      self.setTranslation( modelViewTransform.modelToViewX( position.x ),
        modelViewTransform.modelToViewY( position.y ) );
    } );
  }

  statesOfMatter.register( 'HandNode', HandNode );

  return inherit( Node, HandNode, {

    /**
     * @public
     * @returns {number}
     */
    getMinX: function() {
      return this.minX;
    },

    /**
     *
     * @param {number} minX - particle min x  position
     */
    setMinX: function( minX ) {
      this.minX = minX;
    },

    /**
     * @public
     * @returns {number}
     */
    getMaxX: function() {
      return this.maxX;
    },

    /**
     * @param {number} maxX - particle max x  position
     */
    setMaxX: function( maxX ) {
      this.maxX = maxX;
    }
  } );
} );