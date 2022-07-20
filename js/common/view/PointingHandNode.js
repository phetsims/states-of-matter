// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class represents a node that looks like a hand with an extended finger, and is generally used to push down on
 * things.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { DragListener, Image, Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import pointingHand_png from '../../../mipmaps/pointingHand_png.js';
import statesOfMatter from '../../statesOfMatter.js';
import MultipleParticleModel from '../model/MultipleParticleModel.js';

// constants
const WIDTH = 150; // in screen coords

class PointingHandNode extends Node {

  /**
   * @param {PhaseChangesModel} phaseChangesModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinate frames
   * @param {Object} [options]
   */
  constructor( phaseChangesModel, modelViewTransform, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super();

    // Add the up arrow.
    const upArrowNode = new ArrowNode( 0, 0, 0, 25, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true,
      rotation: 2 * Math.PI / 2
    } );

    // Add the down arrow.
    const downArrowNode = new ArrowNode( 0, 0, 0, 25, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true,
      top: upArrowNode.bottom + 5
    } );

    // Load and scale the image.  Scale was empirically determined.
    const pointingHandImageNode = new Image( pointingHand_png, {
      cursor: 'ns-resize',
      pickable: true
    } );
    pointingHandImageNode.scale( WIDTH / pointingHandImageNode.width );

    const hintNode = new Node( {
      children: [ upArrowNode, downArrowNode ],
      visible: false,
      top: pointingHandImageNode.bottom - 50, // adjusted a bit for better look
      left: pointingHandImageNode.right - 20 // adjusted a bit for better look
    } );

    let mouseOver = false;
    let beingDragged = false;

    const updateHintVisibility = () => {
      hintNode.setVisible( mouseOver || beingDragged );
    };

    // Set ourself up to listen for and handle mouse dragging events.
    let startY;
    let endY;
    let containerSizeAtDragStart;

    // add a listener to handle drag events
    pointingHandImageNode.addInputListener( new DragListener( {

      allowTouchSnag: true,

      start: event => {
        startY = this.globalToParentPoint( event.pointer.point ).y;
        beingDragged = true;
        containerSizeAtDragStart = phaseChangesModel.containerHeightProperty.get();
        updateHintVisibility();
      },

      drag: event => {
        endY = this.globalToParentPoint( event.pointer.point ).y;

        // Resize the container based on the amount that the node has moved.
        phaseChangesModel.setTargetContainerHeight(
          containerSizeAtDragStart + modelViewTransform.viewToModelDeltaY( endY - startY )
        );
        updateHintVisibility();
      },

      end: () => {

        // Set the target size to the current size, which will stop any change in size that is currently underway.
        if ( !phaseChangesModel.isExplodedProperty.value ) {
          phaseChangesModel.setTargetContainerHeight( phaseChangesModel.containerHeightProperty.get() );
        }
        beingDragged = false;
        updateHintVisibility();
      },

      tandem: options.tandem.createTandem( 'dragListener' )
    } ) );

    // The particle container can explode while this is being dragged and, if that happens, cancel the interaction.
    phaseChangesModel.isExplodedProperty.lazyLink( isExploded => {
      if ( isExploded ) {
        this.interruptSubtreeInput();
      }
    } );

    // add the listener that will show and hide the hint
    this.addInputListener( {
      enter: () => {
        mouseOver = true;
        updateHintVisibility();
      },
      exit: () => {
        mouseOver = false;
        updateHintVisibility();
      }
    } );

    // Add the child nodes.
    this.addChild( pointingHandImageNode );
    this.addChild( hintNode );

    // Expand the touch area (only on the image, since that's where the drag handler will be).
    pointingHandImageNode.touchArea = pointingHandImageNode.localBounds.dilatedXY( 10, 10 );

    // Add a listener to update the individual arrow visibility.
    phaseChangesModel.containerHeightProperty.link( particleContainerHeight => {
      if ( particleContainerHeight === MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT ) {

        // At the height limit, so only show the down arrow.
        upArrowNode.setVisible( false );
        downArrowNode.setVisible( true );
      }
      else if ( particleContainerHeight === MultipleParticleModel.PARTICLE_CONTAINER_MIN_HEIGHT ) {

        // Particle container all the way down, so show only the up arrow.
        upArrowNode.setVisible( true );
        downArrowNode.setVisible( false );
      }
      else {
        upArrowNode.setVisible( true );
        downArrowNode.setVisible( true );
      }
    } );

    // Set a value that will be used to position the fingertip.
    this.fingertipToBottomDistanceY = hintNode.bottom - pointingHandImageNode.bottom;

    this.mutate( options );
  }

  /**
   * Set the position of this node such that the tip of the finger is at the provided Y position.  The x position
   * remains unchanged.
   * @param {number} fingertipYPos
   * @public
   */
  setFingertipYPosition( fingertipYPos ) {
    this.bottom = fingertipYPos + this.fingertipToBottomDistanceY;
  }
}

statesOfMatter.register( 'PointingHandNode', PointingHandNode );
export default PointingHandNode;