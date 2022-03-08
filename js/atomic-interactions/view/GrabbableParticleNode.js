// Copyright 2015-2022, University of Colorado Boulder

/**
 * This extension of the ParticleNode class allows users to grab the node and move it, thus changing the position
 * within the underlying model.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import { DragListener } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';
import ParticleForceNode from './ParticleForceNode.js';

class GrabbableParticleNode extends ParticleForceNode {

  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {ScaledAtom} particle
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @param {number} minX - grabbable particle  min x position
   * @param {Tandem} tandem - support for exporting instances from the sim
   */
  constructor( dualAtomModel, particle, modelViewTransform, enableOverlap, minX, tandem ) {

    super( particle, modelViewTransform, enableOverlap, tandem );

    // @private
    this.minX = minX;

    // This node will need to be pickable so the user can grab it.
    this.setPickable( true );

    // Put a cursor handler into place.
    this.cursor = 'pointer';

    let startDragX;
    let endDragX;
    let initialStartX = this.x;

    const inputListener = new DragListener( {
      allowTouchSnag: true,

      start: event => {

        // Stop the model from moving the particle at the same time the user is moving it.
        dualAtomModel.setMotionPaused( true );
        initialStartX = this.x;
        startDragX = this.globalToParentPoint( event.pointer.point ).x;
      },

      drag: event => {

        endDragX = this.globalToParentPoint( event.pointer.point ).x;
        const d = endDragX - startDragX;

        // Make sure we don't exceed the positional limits.
        const newPosX = Math.max( initialStartX + d, this.minX );

        // Move the particle based on the amount of mouse movement.
        this.particle.setPosition( modelViewTransform.viewToModelX( newPosX ), particle.positionProperty.value.y );
      },

      end: () => {

        // Let the model move the particles again.  Note that this happens even if the motion was paused by some other
        // means.
        dualAtomModel.setMotionPaused( false );
        dualAtomModel.movementHintVisibleProperty.set( false );
      },

      tandem: tandem.createTandem( 'dragListener' )
    } );

    this.addInputListener( inputListener );

    // dispose function
    this.disposeGrabbableParticleNode = () => {
      this.removeInputListener( inputListener );
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeGrabbableParticleNode();
    super.dispose();
  }

  /**
   * @returns {number}
   * @public
   */
  getMinX() {
    return this.minX;
  }

  /**
   * @param {number} minX - min x position
   * @public
   */
  setMinX( minX ) {
    this.minX = minX;
  }
}

statesOfMatter.register( 'GrabbableParticleNode', GrabbableParticleNode );
export default GrabbableParticleNode;