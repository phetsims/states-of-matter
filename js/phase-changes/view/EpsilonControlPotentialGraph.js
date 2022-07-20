// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class extends the interaction potential diagram to allow the user to adjust the interaction strength parameter
 * (i.e. epsilon) through direct interaction with the graph.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Color, DragListener, PressListener, Rectangle } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import InteractionPotentialCanvasNode from '../../common/view/InteractionPotentialCanvasNode.js';
import PotentialGraphNode from '../../common/view/PotentialGraphNode.js';
import statesOfMatter from '../../statesOfMatter.js';

// Size of handles as function of node width.
const RESIZE_HANDLE_SIZE_PROPORTION = 0.18;

// Position of handle as function of node width.
const EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;

// other constants
const RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
const RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
const EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;
const POTENTIAL_LINE_COLOR = new Color( 'red' );

class EpsilonControlPotentialGraph extends PotentialGraphNode {

  /**
   * @param {number} sigma - atom diameter
   * @param {number} epsilon - interaction strength
   * @param {PhaseChangesModel} phaseChangesModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( sigma, epsilon, phaseChangesModel, options ) {

    options = merge( { tandem: Tandem.REQUIRED }, options );

    super( sigma, epsilon, {
      allowInteraction: true,
      tandem: options.tandem
    } );

    // @public, read-only - flag that signifies if interaction is enabled,
    this.interactionEnabled = false;

    // variables used to track dragging of controls related to epsilon value
    let startDragY;
    let endDragY;

    // Add the line that will indicate the value of epsilon.
    const controlLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
    this.epsilonControls.line = new Rectangle( -controlLineLength / 2, 0, controlLineLength, 1, {
      cursor: 'ns-resize',
      pickable: true,
      fill: EPSILON_LINE_COLOR,
      stroke: EPSILON_LINE_COLOR,
      tandem: this.interactiveControlsLayer.tandem.createTandem( 'epsilonLine' ),
      phetioReadOnly: true
    } );
    this.interactiveControlsLayer.addChild( this.epsilonControls.line );
    this.epsilonControls.line.touchArea = this.epsilonControls.line.localBounds.dilatedXY( 20, 20 );

    // Highlight this control when the user is hovering over it and/or using it.
    const epsilonLinePressListener = new PressListener( { attach: false, tandem: Tandem.OPT_OUT } );
    this.epsilonControls.line.addInputListener( epsilonLinePressListener );
    epsilonLinePressListener.isHighlightedProperty.link( isHighlighted => {
      this.epsilonControls.line.stroke = isHighlighted ? RESIZE_HANDLE_HIGHLIGHTED_COLOR : RESIZE_HANDLE_NORMAL_COLOR;
    } );

    // drag listener
    this.epsilonControls.line.addInputListener( new DragListener( {

      start: event => {
        startDragY = this.epsilonControls.line.globalToParentPoint( event.pointer.point ).y;
      },

      drag: event => {
        endDragY = this.epsilonControls.line.globalToParentPoint( event.pointer.point ).y;
        const d = endDragY - startDragY;
        startDragY = endDragY;
        const scaleFactor = SOMConstants.MAX_EPSILON / ( this.getGraphHeight() / 2 );
        phaseChangesModel.adjustableAtomInteractionStrengthProperty.set(
          Utils.clamp(
            phaseChangesModel.getEpsilon() + ( d * scaleFactor ),
            SOMConstants.MIN_ADJUSTABLE_EPSILON,
            SOMConstants.MAX_ADJUSTABLE_EPSILON
          )
        );
        this.drawPotentialCurve();
      },

      tandem: this.epsilonControls.line.tandem.createTandem( 'dragListener' )
    } ) );

    // Add the arrow node that will allow the user to control the value of the epsilon parameter.
    this.epsilonControls.arrow = new ArrowNode(
      0,
      -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2,
      0,
      RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2,
      {
        headHeight: 10,
        headWidth: 15,
        tailWidth: 6,
        fill: RESIZE_HANDLE_NORMAL_COLOR,
        stroke: 'black',
        doubleHead: true,
        pickable: true,
        cursor: 'pointer',
        tandem: this.interactiveControlsLayer.tandem.createTandem( 'epsilonArrow' ),
        phetioReadOnly: true
      }
    );
    this.interactiveControlsLayer.addChild( this.epsilonControls.arrow );
    this.epsilonControls.arrow.addInputListener( new DragListener( {

      start: event => {
        startDragY = this.epsilonControls.arrow.globalToParentPoint( event.pointer.point ).y;
      },

      drag: event => {
        endDragY = this.epsilonControls.arrow.globalToParentPoint( event.pointer.point ).y;
        const d = endDragY - startDragY;
        startDragY = endDragY;
        const scaleFactor = SOMConstants.MAX_EPSILON / ( this.getGraphHeight() / 2 );
        phaseChangesModel.adjustableAtomInteractionStrengthProperty.set(
          Utils.clamp(
            phaseChangesModel.getEpsilon() + ( d * scaleFactor ),
            SOMConstants.MIN_ADJUSTABLE_EPSILON,
            SOMConstants.MAX_ADJUSTABLE_EPSILON
          )
        );
        this.drawPotentialCurve();
      },

      tandem: this.epsilonControls.arrow.tandem.createTandem( 'dragListener' )
    } ) );
    const epsilonArrowPressListener = new PressListener( { attach: false, tandem: Tandem.OPT_OUT } );
    this.epsilonControls.arrow.addInputListener( epsilonArrowPressListener );
    epsilonArrowPressListener.isHighlightedProperty.link( isHighlighted => {
      this.epsilonControls.arrow.fill = isHighlighted ? RESIZE_HANDLE_HIGHLIGHTED_COLOR : RESIZE_HANDLE_NORMAL_COLOR;
    } );

    this.interactionPotentialCanvasNode = new InteractionPotentialCanvasNode( this, {
      canvasBounds: new Bounds2( 0, 0, 125, this.graphHeight )
    } );

    // Update the graph when the substance or interaction strength changes.
    Multilink.multilink(
      [ phaseChangesModel.substanceProperty, phaseChangesModel.adjustableAtomInteractionStrengthProperty ],
      substance => {
        this.interactionEnabled = substance === SubstanceType.ADJUSTABLE_ATOM;
        this.setLjPotentialParameters( phaseChangesModel.getSigma(), phaseChangesModel.getEpsilon() );
        this.drawPotentialCurve();
      }
    );
  }

  /**
   * This is an override of the method in the base class that draws the curve on the graph, and this override draws the
   * controls that allow the user to interact with the graph.
   * @private
   * @override
   */
  drawPotentialCurve() {

    // draw potential curve
    if ( this.interactionPotentialCanvasNode !== undefined ) {
      this.interactionPotentialCanvasNode.update( POTENTIAL_LINE_COLOR );
    }
  }
}

statesOfMatter.register( 'EpsilonControlPotentialGraph', EpsilonControlPotentialGraph );
export default EpsilonControlPotentialGraph;