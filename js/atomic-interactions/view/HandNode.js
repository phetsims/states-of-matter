// Copyright 2015-2020, University of Colorado Boulder

/**
 * View for the hand node which looks like a cartoonish human hand with thumb and pointing finger expanded and the other
 * three fingers folded.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // images
  const handImage = require( 'image!SCENERY_PHET/hand.png' );

  // constants
  const WIDTH = 80; // empirically determined to look good

  /**
   * @param {DualAtomModel} dualAtomModel - model of the atomic interactions screen
   * @param {SOMAtom} particle - model of the atom that is draggable
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {number} minX - grabbable particle min x position
   * @param {Tandem} tandem
   * @constructor
   */
  function HandNode( dualAtomModel, particle, modelViewTransform, minX, tandem ) {

    Node.call( this, { cursor: 'pointer', tandem: tandem } );
    const self = this;
    this.minX = minX; // @private

    // @private {SOMAtom} - particle that will be moved if the hand is dragged
    this.particle = particle;

    // add the main image that represents the hand
    this.addChild( new Image( handImage, {
      minWidth: WIDTH,
      maxWidth: WIDTH,
      y: modelViewTransform.modelToViewY( this.particle.positionProperty.get().y )
    } ) );

    // control visibility
    const visibilityListener = dualAtomModel.movementHintVisibleProperty.linkAttribute( this, 'visible' );

    // add the drag handler
    let startDragX;
    let endDragX;
    const inputListener = new SimpleDragHandler( {

      start: function( event ) {

        // Stop the model from moving the particle at the same time the user is moving it.
        dualAtomModel.setMotionPaused( true );
        startDragX = self.globalToParentPoint( event.pointer.point ).x;
      },

      drag: function( event ) {

        endDragX = self.globalToParentPoint( event.pointer.point ).x;
        const d = endDragX - startDragX;
        startDragX = endDragX;        // Make sure we don't exceed the positional limits.
        const newPosX = Math.max( modelViewTransform.modelToViewX( self.particle.getX() ) + d, self.minX );

        // Move the particle based on the amount of mouse movement.
        self.particle.setPosition( modelViewTransform.viewToModelX( newPosX ), self.particle.getY() );
      },

      end: function() {

        // Let the model move the particles again.  Note that this happens even if the motion was paused by some other
        // means.
        dualAtomModel.setMotionPaused( false );
        dualAtomModel.movementHintVisibleProperty.set( false );
      },

      tandem: tandem.createTandem( 'dragHandler' )
    } );
    this.addInputListener( inputListener );

    // move the hint with the particle
    function positionListener( position ) {
      self.x = modelViewTransform.modelToViewX( position.x );
    }

    particle.positionProperty.link( positionListener );

    // dispose function
    this.disposeHandNode = function() {
      self.removeInputListener( inputListener );
      particle.positionProperty.unlink( positionListener );
      dualAtomModel.movementHintVisibleProperty.unlinkAttribute( visibilityListener );
    };
  }

  statesOfMatter.register( 'HandNode', HandNode );

  return inherit( Node, HandNode, {

    dispose: function() {
      this.disposeHandNode();
      Node.prototype.dispose.call( this );
    },

    /**
     * @param {SOMAtom} particle
     * @public
     */
    setParticle: function( particle ) {
      this.particle = particle;
    },

    /**
     * @returns {number}
     * @public
     */
    getMinX: function() {
      return this.minX;
    },

    /**
     * @param {number} minX
     * @public
     */
    setMinX: function( minX ) {
      this.minX = minX;
    }
  } );
} );