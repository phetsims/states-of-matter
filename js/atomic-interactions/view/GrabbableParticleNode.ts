// Copyright 2015-2025, University of Colorado Boulder

/**
 * This extension of the ParticleNode class allows users to grab the node and move it, thus changing the position
 * within the underlying model.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import DualAtomModel from '../model/DualAtomModel.js';
import MotionAtom from '../model/MotionAtom.js';
import ParticleForceNode from './ParticleForceNode.js';

class GrabbableParticleNode extends ParticleForceNode {

  private minX: number;
  private readonly disposeGrabbableParticleNode: () => void;

  /**
   * @param dualAtomModel - model of the simulation
   * @param particle
   * @param modelViewTransform to convert between model and view co-ordinates
   * @param enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @param minX - grabbable particle  min x position
   * @param tandem - support for exporting instances from the sim
   */
  public constructor( dualAtomModel: DualAtomModel, particle: MotionAtom, modelViewTransform: ModelViewTransform2, enableOverlap: boolean, minX: number, tandem: Tandem ) {

    super( particle, modelViewTransform, enableOverlap, tandem );

    this.minX = minX;

    // This node will need to be pickable so the user can grab it.
    this.setPickable( true );

    // Put a cursor handler into place.
    this.cursor = 'pointer';

    let startDragX: number;
    let endDragX;
    let initialStartX = this.x;

    const dragListener = new DragListener( {
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

    this.addInputListener( dragListener );

    // dispose function
    this.disposeGrabbableParticleNode = () => {
      this.removeInputListener( dragListener );
    };
  }

  public override dispose(): void {
    this.disposeGrabbableParticleNode();
    super.dispose();
  }

  public getMinX(): number {
    return this.minX;
  }

  /**
   * @param minX - min x position
   */
  public setMinX( minX: number ): void {
    this.minX = minX;
  }
}

statesOfMatter.register( 'GrabbableParticleNode', GrabbableParticleNode );
export default GrabbableParticleNode;