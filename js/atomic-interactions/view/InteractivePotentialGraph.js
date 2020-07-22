// Copyright 2015-2020, University of Colorado Boulder

/**
 * This class extends the Interaction Potential diagram to allow the user to change the curve through direct interaction
 * with both the sigma and epsilon parameter of the LJ potential.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Shape from '../../../../kite/js/Shape.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import PressListener from '../../../../scenery/js/listeners/PressListener.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import AtomType from '../../common/model/AtomType.js';
import SOMConstants from '../../common/SOMConstants.js';
import InteractionPotentialCanvasNode from '../../common/view/InteractionPotentialCanvasNode.js';
import PotentialGraphNode from '../../common/view/PotentialGraphNode.js';
import SOMColorProfile from '../../common/view/SOMColorProfile.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const RESIZE_HANDLE_SIZE_PROPORTION = 0.05;  // Size of handles as function of node width.
const EPSILON_HANDLE_OFFSET_PROPORTION = 0.08; // Position of handle as function of node width.
const RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
const RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
const EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;
const POTENTIAL_LINE_COLOR = new Color( 'red' );

class InteractivePotentialGraph extends PotentialGraphNode {

  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( dualAtomModel, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super(
      dualAtomModel.getSigma(),
      dualAtomModel.getEpsilon(),
      {
        includePositionMarker: true,
        allowInteraction: true,
        wide: true,
        zoomable: options.zoomable,
        tandem: options.tandem
      }
    );

    // @private
    this.dualAtomModel = dualAtomModel;
    this.minXForAtom = Number.NEGATIVE_INFINITY;

    // @public, read-only
    this.interactionEnabled = false;

    // Create a convenience function for adding a drag handler that adjusts epsilon, this is done to avoid code duplication.
    let startDragY;
    let endDragY;

    const addEpsilonDragListener = ( node, tandem ) => {
      node.addInputListener( new DragListener( {

        start: event => {
          dualAtomModel.setMotionPaused( true );
          startDragY = node.globalToParentPoint( event.pointer.point ).y;
        },

        drag: event => {
          endDragY = node.globalToParentPoint( event.pointer.point ).y;
          const d = endDragY - startDragY;
          startDragY = endDragY;
          const scaleFactor = SOMConstants.MAX_EPSILON / ( this.getGraphHeight() / 2 );
          dualAtomModel.adjustableAtomInteractionStrengthProperty.value = dualAtomModel.getEpsilon() + ( d * scaleFactor );
        },

        end: event => {
          dualAtomModel.setMotionPaused( false );
        },

        tandem: tandem
      } ) );
    };

    // Add a parent node for the epsilon controls
    const epsilonLayer = new Node( { tandem: this.interactiveControlsLayer.tandem.createTandem( 'epsilon' ) } );
    this.interactiveControlsLayer.addChild( epsilonLayer );

    // Add the line that will indicate and control the value of epsilon.
    const epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 1.2;
    this.epsilonControls.line = new Line( -epsilonLineLength / 2, 0, epsilonLineLength, 0, {
      cursor: 'ns-resize',
      pickable: true,
      fill: EPSILON_LINE_COLOR,
      stroke: EPSILON_LINE_COLOR,
      lineWidth: 2,
      tandem: epsilonLayer.tandem.createTandem( 'epsilonLine' ),
      phetioReadOnly: true
    } );
    this.epsilonControls.line.touchArea = this.epsilonControls.line.localBounds.dilatedXY( 8, 8 );
    this.epsilonControls.line.mouseArea = this.epsilonControls.line.localBounds.dilatedXY( 0, 4 );
    addEpsilonDragListener( this.epsilonControls.line, this.epsilonControls.line.tandem.createTandem( 'dragListener' ) );
    epsilonLayer.addChild( this.epsilonControls.line );

    // Highlight this control when the user is hovering over it and/or using it.
    const epsilonLinePressListener = new PressListener( { attach: false } );
    this.epsilonControls.line.addInputListener( epsilonLinePressListener );
    epsilonLinePressListener.isHighlightedProperty.link( isHighlighted => {
      this.epsilonControls.line.stroke = isHighlighted ? RESIZE_HANDLE_HIGHLIGHTED_COLOR : RESIZE_HANDLE_NORMAL_COLOR;
    } );

    // Add the arrow nodes that will allow the user to control the epsilon value.
    const arrowNodeOptions = {
      headHeight: 10,
      headWidth: 18,
      tailWidth: 7,
      fill: RESIZE_HANDLE_NORMAL_COLOR,
      stroke: 'black',
      doubleHead: true,
      pickable: true,
      cursor: 'pointer',
      phetioReadOnly: true
    };
    this.epsilonControls.arrow = new ArrowNode(
      0,
      -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2,
      0,
      RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph,
      merge( { tandem: epsilonLayer.tandem.createTandem( 'epsilonArrow' ) }, arrowNodeOptions )
    );
    const epsilonArrowPressListener = new PressListener( { attach: false } );
    this.epsilonControls.arrow.addInputListener( epsilonArrowPressListener );
    epsilonArrowPressListener.isHighlightedProperty.link( isHighlighted => {
      this.epsilonControls.arrow.fill = isHighlighted ? RESIZE_HANDLE_HIGHLIGHTED_COLOR : RESIZE_HANDLE_NORMAL_COLOR;
    } );
    epsilonLayer.addChild( this.epsilonControls.arrow );
    this.epsilonControls.arrow.touchArea = this.epsilonControls.arrow.localBounds.dilatedXY( 3, 10 );
    addEpsilonDragListener( this.epsilonControls.arrow, this.epsilonControls.arrow.tandem.createTandem( 'dragListener' ) );

    // add a layer for the sigma controls (for consistency with the epsilon controls)
    const sigmaLayer = new Node( { tandem: this.interactiveControlsLayer.tandem.createTandem( 'sigma' ) } );
    this.interactiveControlsLayer.addChild( sigmaLayer );

    // add sigma arrow node
    this.sigmaControls.arrow = new ArrowNode(
      -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2,
      0,
      RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph * 1.2,
      0,
      merge( { tandem: sigmaLayer.tandem.createTandem( 'sigmaArrow' ) }, arrowNodeOptions )
    );
    const sigmaArrowPressListener = new PressListener( { attach: false } );
    this.sigmaControls.arrow.addInputListener( sigmaArrowPressListener );
    sigmaArrowPressListener.isHighlightedProperty.link( isHighlighted => {
      this.sigmaControls.arrow.fill = isHighlighted ? RESIZE_HANDLE_HIGHLIGHTED_COLOR : RESIZE_HANDLE_NORMAL_COLOR;
    } );

    sigmaLayer.addChild( this.sigmaControls.arrow );
    this.sigmaControls.arrow.touchArea = this.sigmaControls.arrow.localBounds.dilatedXY( 10, 5 );
    let startDragX;
    let endDragX;
    this.sigmaControls.arrow.addInputListener( new DragListener( {

      start: event => {
        dualAtomModel.setMotionPaused( true );
        startDragX = this.sigmaControls.arrow.globalToParentPoint( event.pointer.point ).x;
      },

      drag: event => {
        endDragX = this.sigmaControls.arrow.globalToParentPoint( event.pointer.point ).x;
        const d = endDragX - startDragX;
        startDragX = endDragX;
        const scaleFactor = this.xRange / ( this.getGraphWidth() );
        const atomDiameter = dualAtomModel.getSigma() + ( d * scaleFactor );
        dualAtomModel.adjustableAtomDiameterProperty.value = atomDiameter > SOMConstants.MIN_SIGMA ?
                                                             ( atomDiameter < SOMConstants.MAX_SIGMA ? atomDiameter :
                                                               SOMConstants.MAX_SIGMA ) : SOMConstants.MIN_SIGMA;
      },

      end: event => {
        dualAtomModel.setMotionPaused( false );
      },

      tandem: this.sigmaControls.arrow.tandem.createTandem( 'dragListener' )
    } ) );

    // Add the ability to grab and move the position marker. This node will need to be pickable so the user can grab it.
    this.positionMarker.setPickable( true );
    this.positionMarker.touchArea = Shape.circle( 0, 0, 13 );
    this.positionMarker.addInputListener( new DragListener( {
        allowTouchSnag: true,

        start: event => {

          // Stop the particle from moving in the model.
          dualAtomModel.setMotionPaused( true );
          startDragX = this.positionMarker.globalToParentPoint( event.pointer.point ).x;
        },

        drag: event => {

          // Make sure the movement hint is now hidden, since the user has figured out what to drag.
          dualAtomModel.movementHintVisibleProperty.set( false );

          // Move the movable atom based on this drag event.
          const atom = dualAtomModel.movableAtom;
          endDragX = this.positionMarker.globalToParentPoint( event.pointer.point ).x;
          const xDifference = endDragX - startDragX;
          const scaleFactor = this.xRange / ( this.getGraphWidth() );
          const newPosX = Math.max( atom.getX() + ( xDifference * scaleFactor ), this.minXForAtom );
          atom.setPosition( newPosX, atom.getY() );
          startDragX = endDragX;
        },

        end: event => {
          // Let the model move the particle again.  Note that this happens
          // even if the motion was paused by some other means.
          dualAtomModel.setMotionPaused( false );
        },

        tandem: this.positionMarker.tandem.createTandem( 'dragListener' )
      }
    ) );

    // update the marker color when the movable atom changes
    dualAtomModel.movableAtom.atomTypeProperty.link( () => {
      this.positionMarker.changeColor( dualAtomModel.movableAtom.color );
    } );

    Property.multilink(
      [dualAtomModel.atomPairProperty, dualAtomModel.adjustableAtomInteractionStrengthProperty, dualAtomModel.adjustableAtomDiameterProperty],
      () => {
        this.setLjPotentialParameters( dualAtomModel.getSigma(), dualAtomModel.getEpsilon() );
        this.updateInteractivityState();
        this.drawPotentialCurve();
      }
    );

    this.interactionPotentialCanvasNode = new InteractionPotentialCanvasNode(
      this,
      { canvasBounds: new Bounds2( 0, 0, this.graphWidth, this.graphHeight ) }
    );

    // Update interactivity state.
    this.updateInteractivityState();

    // Redraw the potential curve.
    this.drawPotentialCurve();

    // Add children
    this.addChild( this.horizontalAxisLabel );
    this.addChild( this.verticalAxisLabel );
    this.addChild( this.centerAxis );
    this.addChild( this.interactionPotentialCanvasNode );
    this.addChild( this.verticalAxis );
    this.addChild( this.horizontalAxis );
    this.addChild( this.ljPotentialGraph );

    // applying color scheme to lj graph elements
    this.verticalAxis.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.horizontalAxis.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.verticalAxis.stroke = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.horizontalAxis.stroke = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonArrow.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonArrow.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.sigmaArrow.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonLabel.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.sigmaLabel.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonArrow.stroke = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.gridNode.verticalLinesNode.stroke = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.horizontalAxisLabel.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.verticalAxisLabel.fill = SOMColorProfile.ljGraphAxesAndGridColorProperty;
    this.gridNode.horizontalLinesNode.stroke = SOMColorProfile.ljGraphAxesAndGridColorProperty;

    this.mutate( options );
  }


  /**
   * This is an override of the method in the base class that draws the curve on the graph, and this override draws
   * the controls that allow the user to interact with the graph.
   * @override
   * @protected
   */
  drawPotentialCurve() {

    //  draw potential curve
    if ( this.interactionPotentialCanvasNode !== undefined ) {
      this.interactionPotentialCanvasNode.update( POTENTIAL_LINE_COLOR );
    }
  }

  /**
   * Set the lowest allowed X position to which the movable atom can be set.
   * @param {number} minXForAtom
   * @public
   */
  setMinXForAtom( minXForAtom ) {
    this.minXForAtom = minXForAtom;
  }

  /**
   * @private
   */
  updateInteractivityState() {
    this.interactionEnabled = ( this.dualAtomModel.fixedAtom.getType() === AtomType.ADJUSTABLE );
  }

  /**
   * @override
   * @public
   */
  setMolecular( molecular ) {
    super.setMolecular( molecular );

    // Move the horizontal label down a little bit from where the superclass puts it, otherwise adjustment arrow can
    // overlap it.
    this.horizontalAxisLabel.top += 8; // amount empirically determined
  }
}

statesOfMatter.register( 'InteractivePotentialGraph', InteractivePotentialGraph );
export default InteractivePotentialGraph;