// Copyright 2015-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * View for the hand node which looks like a cartoonish human hand with thumb and pointing finger expanded and the other
 * three fingers folded.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import hand_png from '../../../../scenery-phet/images/hand_png.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node, { type NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import DualAtomModel from '../model/DualAtomModel.js';
import ScaledAtom from '../../common/model/particle/ScaledAtom.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

// constants
const WIDTH = 80; // empirically determined to look good

type SelfOptions = EmptySelfOptions;

type HandNodeOptions = SelfOptions & NodeOptions;

class HandNode extends Node {

  private minX: number;

  // particle that will be moved if the hand is dragged
  private particle: ScaledAtom;

  private disposeHandNode: () => void;

  /**
   * @param dualAtomModel - model of the atomic interactions screen
   * @param particle - model of the atom that is draggable
   * @param modelViewTransform to convert between model and view co-ordinates
   * @param minX - grabbable particle min x position
   * @param [providedOptions]
   */
  public constructor( dualAtomModel: DualAtomModel, particle: ScaledAtom, modelViewTransform: ModelViewTransform2, minX: number, providedOptions?: HandNodeOptions ) {

    const options = optionize<HandNodeOptions, SelfOptions, NodeOptions>()( {
      cursor: 'pointer',
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );
    this.minX = minX;

    this.particle = particle;

    // add the main image that represents the hand
    this.addChild( new Image( hand_png, {
      minWidth: WIDTH,
      maxWidth: WIDTH,
      y: modelViewTransform.modelToViewY( this.particle.positionProperty.get().y )
    } ) );

    // control visibility
    const visibilityListener = visible => {this.visible = visible;};
    dualAtomModel.movementHintVisibleProperty.link( visibilityListener );

    // add the drag handler
    let startDragX;
    let currentDragX;
    let particleStartXPosition;
    const dragListener = new DragListener( {

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
    this.addInputListener( dragListener );

    const positionListener = position => {
      this.x = modelViewTransform.modelToViewX( position.x );
    };

    // move the hint with the particle
    particle.positionProperty.link( positionListener );

    // add a linked element in phet-io to the property that controls this node's visibility
    this.addLinkedElement( dualAtomModel.movementHintVisibleProperty, {
      tandemName: 'movementHintVisibleProperty'
    } );

    // dispose function
    this.disposeHandNode = () => {
      this.removeInputListener( dragListener );
      particle.positionProperty.unlink( positionListener );
      dualAtomModel.movementHintVisibleProperty.unlink( visibilityListener );
    };
  }

  public dispose(): void {
    this.disposeHandNode();
    super.dispose();
  }

  /**
   * @param particle
   */
  public setParticle( particle: ScaledAtom ): void {
    this.particle = particle;
  }

  public getMinX(): number {
    return this.minX;
  }

  /**
   * @param minX
   */
  public setMinX( minX: number ): void {
    this.minX = minX;
  }
}

statesOfMatter.register( 'HandNode', HandNode );
export default HandNode;