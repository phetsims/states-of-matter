// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class extends the interaction potential diagram to allow the user to adjust the interaction strength parameter
 * (i.e. epsilon) through direct interaction with the graph.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import FillHighlightListener from '../../../../scenery-phet/js/input/FillHighlightListener.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import InteractionPotentialCanvasNode from '../../common/view/InteractionPotentialCanvasNode.js';
import InteractionPotentialDiagramNode from '../../common/view/InteractionPotentialDiagramNode.js';
import SOMColorProfile from '../../common/view/SOMColorProfile.js';
import statesOfMatterStrings from '../../states-of-matter-strings.js';
import statesOfMatter from '../../statesOfMatter.js';

const interactionPotentialString = statesOfMatterStrings.interactionPotential;

// Size of handles as function of node width.
const RESIZE_HANDLE_SIZE_PROPORTION = 0.18;

// Position of handle as function of node width.
const EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;

// other constants
const RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
const RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
const EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;
const POTENTIAL_LINE_COLOR = new Color( 'red' );

/**
 * @param {number} sigma - atom diameter
 * @param {number} epsilon - interaction strength
 * @param {boolean} wide - true if the wide screen version of the graph is needed, false if not.
 * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
 * @param {Object} [options] that can be passed on to the underlying node
 * @constructor
 */
function EpsilonControlInteractionPotentialDiagram( sigma, epsilon, wide, multipleParticleModel, options ) {

  options = merge( { tandem: Tandem.REQUIRED }, options );

  const self = this;
  InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, true, options.tandem );
  this.multipleParticleModel = multipleParticleModel;
  const accordionContent = new Node();

  // variables used to track dragging of controls related to epsilon value
  let startDragY;
  let endDragY;

  // Add the line that will indicate the value of epsilon.
  const epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
  this.epsilonLine = new Rectangle( -epsilonLineLength / 2, 0, epsilonLineLength, 1, {
    cursor: 'ns-resize',
    pickable: true,
    fill: EPSILON_LINE_COLOR,
    stroke: EPSILON_LINE_COLOR
  } );
  this.epsilonLine.addInputListener( new FillHighlightListener(
    RESIZE_HANDLE_NORMAL_COLOR,
    RESIZE_HANDLE_HIGHLIGHTED_COLOR
  ) );
  this.ljPotentialGraph.addChild( this.epsilonLine );
  this.epsilonLine.touchArea = this.epsilonLine.localBounds.dilatedXY( 20, 20 );
  this.epsilonLine.addInputListener( new SimpleDragHandler( {

    start: function( event ) {
      startDragY = self.epsilonLine.globalToParentPoint( event.pointer.point ).y;
    },

    drag: function( event ) {
      endDragY = self.epsilonLine.globalToParentPoint( event.pointer.point ).y;
      const d = endDragY - startDragY;
      startDragY = endDragY;
      const scaleFactor = SOMConstants.MAX_EPSILON / ( self.getGraphHeight() / 2 );
      multipleParticleModel.interactionStrengthProperty.set(
        Utils.clamp(
          multipleParticleModel.getEpsilon() + ( d * scaleFactor ),
          SOMConstants.MIN_ADJUSTABLE_EPSILON,
          SOMConstants.MAX_ADJUSTABLE_EPSILON
        )
      );
      self.drawPotentialCurve();
    },

    tandem: options.tandem.createTandem( 'epsilonLineDragHandler' )

  } ) );

  // Add the arrow node that will allow the user to control the value of the epsilon parameter.
  this.epsilonResizeHandle = new ArrowNode( 0, -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, 0,
    RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, {
      headHeight: 10,
      headWidth: 15,
      tailWidth: 6,
      fill: RESIZE_HANDLE_NORMAL_COLOR,
      stroke: 'black',
      doubleHead: true,
      pickable: true,
      cursor: 'pointer'
    } );
  this.epsilonResizeHandle.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
    RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
  this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
  this.epsilonResizeHandle.addInputListener( new SimpleDragHandler( {

    start: function( event ) {
      startDragY = self.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
    },

    drag: function( event ) {
      endDragY = self.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
      const d = endDragY - startDragY;
      startDragY = endDragY;
      const scaleFactor = SOMConstants.MAX_EPSILON / ( self.getGraphHeight() / 2 );
      multipleParticleModel.interactionStrengthProperty.set(
        Utils.clamp(
          multipleParticleModel.getEpsilon() + ( d * scaleFactor ),
          SOMConstants.MIN_ADJUSTABLE_EPSILON,
          SOMConstants.MAX_ADJUSTABLE_EPSILON
        )
      );
      self.drawPotentialCurve();
    },

    tandem: options.tandem.createTandem( 'epsilonResizeDragHandler' )
  } ) );

  this.interactionPotentialCanvasNode = new InteractionPotentialCanvasNode( this, false, {
    canvasBounds: new Bounds2( 0, 0, 125, this.graphHeight )
  } );

  accordionContent.addChild( this.centerAxis );
  accordionContent.addChild( this.horizontalAxisLabel );
  accordionContent.addChild( this.horizontalAxis );
  accordionContent.addChild( this.verticalAxisLabel );
  accordionContent.addChild( this.verticalAxis );
  accordionContent.addChild( this.interactionPotentialCanvasNode );
  accordionContent.addChild( this.ljPotentialGraph );

  const accordionContentHBox = new HBox( { children: [ accordionContent ] } );
  const titleNode = new Text( interactionPotentialString, {
    fill: SOMColorProfile.controlPanelTextProperty,
    font: new PhetFont( { size: 13 } )
  } );
  if ( titleNode.width > this.horizontalAxis.width ) {
    titleNode.scale( this.horizontalAxis.width / titleNode.width );
  }
  const accordionBox = new AccordionBox( accordionContentHBox, {
    titleNode: titleNode,
    fill: SOMColorProfile.controlPanelBackgroundProperty,
    stroke: SOMColorProfile.controlPanelStrokeProperty,
    expandedProperty: multipleParticleModel.interactionPotentialDiagramExpandedProperty,
    contentAlign: 'center',
    titleAlignX: 'center',
    buttonAlign: 'left',
    cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
    contentYSpacing: -3,
    contentYMargin: 5,
    contentXMargin: 6,
    contentXSpacing: 6,
    minWidth: options.minWidth,
    maxWidth: options.maxWidth,
    buttonYMargin: 4,
    buttonXMargin: 6,
    expandCollapseButtonOptions: {
      sideLength: 12,
      touchAreaXDilation: 15,
      touchAreaYDilation: 10
    },
    tandem: options.tandem.createTandem( 'accordionBox' )
  } );
  this.addChild( accordionBox );

  // update interactivity state
  this.updateInteractivityState();

  this.setLjPotentialParameters( multipleParticleModel.getSigma(), multipleParticleModel.getEpsilon() );
  this.drawPotentialCurve();

  // Update the graph when the substance or interaction strength changes.
  Property.multilink(
    [ multipleParticleModel.substanceProperty, multipleParticleModel.interactionStrengthProperty ],
    function( substance, interactionStrength ) {
      if ( substance === SubstanceType.ADJUSTABLE_ATOM ) {
        multipleParticleModel.setEpsilon( interactionStrength );
      }
      self.updateInteractivityState();
      // call when interaction strength change
      self.setLjPotentialParameters( multipleParticleModel.getSigma(), multipleParticleModel.getEpsilon() );
      self.drawPotentialCurve();
    }
  );

  this.mutate( options );
}

statesOfMatter.register( 'EpsilonControlInteractionPotentialDiagram', EpsilonControlInteractionPotentialDiagram );

export default inherit( InteractionPotentialDiagramNode, EpsilonControlInteractionPotentialDiagram, {

  /**
   *
   * This is an override of the method in the base class that draws the
   * curve on the graph, and this override draws the controls that allow
   * the user to interact with the graph.
   * @private
   * @override
   */
  drawPotentialCurve: function() {

    // draw potential curve
    if ( this.interactionPotentialCanvasNode !== undefined ) {
      this.interactionPotentialCanvasNode.update( POTENTIAL_LINE_COLOR );
    }
  },

  /**
   * @private
   */
  updateInteractivityState: function() {
    this.interactionEnabled = this.multipleParticleModel.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM;
  }
} );