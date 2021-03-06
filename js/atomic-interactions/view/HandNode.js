// Copyright 2015-2021, University of Colorado Boulder

/**
 * View for the hand node which looks like a cartoonish human hand with thumb and pointing finger expanded and the other
 * three fingers folded.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import handImage from '../../../../scenery-phet/images/hand_png.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const WIDTH = 80; // empirically determined to look good

class HandNode extends Node {

  /**
   * @param {DualAtomModel} dualAtomModel - model of the atomic interactions screen
   * @param {ScaledAtom} particle - model of the atom that is draggable
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {number} minX - grabbable particle min x position
   * @param {Object} [options]
   */
  constructor( dualAtomModel, particle, modelViewTransform, minX, options ) {

    options = merge( {
      cursor: 'pointer',
      tandem: Tandem.REQUIRED
    }, options );

    super( options );
    this.minX = minX; // @private

    // @private {ScaledAtom} - particle that will be moved if the hand is dragged
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
    let currentDragX;
    let particleStartXPosition;
    const inputListener = new DragListener( {

      start: event => {

        // Stop the model from moving the particle at the same time the user is moving it.
        dualAtomModel.setMotionPaused( true );
        startDragX = this.globalToParentPoint( event.pointer.point ).x;
        particleStartXPosition = this.particle.getX();
      },

      drag: event => {

        currentDragX = this.globalToParentPoint( event.pointer.point ).x;
        const dx = currentDragX - startDragX;
        const newXPosition = Math.max(
          particleStartXPosition + modelViewTransform.viewToModelDeltaX( dx ),
          modelViewTransform.viewToModelX( this.minX )
        );

        // Move the particle based on the amount of pointer movement.
        this.particle.setPosition( newXPosition, this.particle.getY() );
      },

      end: () => {

        // Let the model move the particles again.  Note that this happens even if the motion was paused by some other
        // means.
        dualAtomModel.setMotionPaused( false );
        dualAtomModel.movementHintVisibleProperty.set( false );
      },

      tandem: options.tandem.createTandem( 'dragListener' )
    } );
    this.addInputListener( inputListener );

    const positionListener = position => {
      this.x = modelViewTransform.modelToViewX( position.x );
    };

    // move the hint with the particle
    particle.positionProperty.link( positionListener );

    // add a linked element in phet-io to the property that controls this node's visibility
    this.addLinkedElement( dualAtomModel.movementHintVisibleProperty, {
      tandem: options.tandem.createTandem( 'movementHintVisibleProperty' )
    } );

    // dispose function
    this.disposeHandNode = () => {
      this.removeInputListener( inputListener );
      particle.positionProperty.unlink( positionListener );
      dualAtomModel.movementHintVisibleProperty.unlinkAttribute( visibilityListener );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeHandNode();
    super.dispose();
  }

  /**
   * @param {ScaledAtom} particle
   * @public
   */
  setParticle( particle ) {
    this.particle = particle;
  }

  /**
   * @returns {number}
   * @public
   */
  getMinX() {
    return this.minX;
  }

  /**
   * @param {number} minX
   * @public
   */
  setMinX( minX ) {
    this.minX = minX;
  }
}

statesOfMatter.register( 'HandNode', HandNode );
export default HandNode;