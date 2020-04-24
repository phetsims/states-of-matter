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
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import InteractionPotentialCanvasNode from '../../common/view/InteractionPotentialCanvasNode.js';
import InteractionPotentialDiagramNode from '../../common/view/InteractionPotentialDiagramNode.js';
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
  InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, { tandem: options.tandem } );
  this.multipleParticleModel = multipleParticleModel;

  // Create a parent tandem for the epsilon parameter control subcomponents, requested by reviewers in
  // https://github.com/phetsims/states-of-matter/issues/265.
  const epsilonParameterTandem = options.tandem.createTandem( 'epsilonParameter' );

  // variables used to track dragging of controls related to epsilon value
  let startDragY;
  let endDragY;

  // Add the line that will indicate the value of epsilon.
  const controlLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
  this.controlLine = new Rectangle( -controlLineLength / 2, 0, controlLineLength, 1, {
    cursor: 'ns-resize',
    pickable: true,
    fill: EPSILON_LINE_COLOR,
    stroke: EPSILON_LINE_COLOR,
    tandem: epsilonParameterTandem.createTandem( 'controlLine' )
  } );
  this.controlLine.addInputListener( new FillHighlightListener(
    RESIZE_HANDLE_NORMAL_COLOR,
    RESIZE_HANDLE_HIGHLIGHTED_COLOR
  ) );
  this.ljPotentialGraph.addChild( this.controlLine );
  this.controlLine.touchArea = this.controlLine.localBounds.dilatedXY( 20, 20 );

  // drag listener
  this.controlLine.addInputListener( new SimpleDragHandler( {

    start: function( event ) {
      startDragY = self.controlLine.globalToParentPoint( event.pointer.point ).y;
    },

    drag: function( event ) {
      endDragY = self.controlLine.globalToParentPoint( event.pointer.point ).y;
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

    tandem: this.controlLine.tandem.createTandem( 'dragListener' )
  } ) );

  // Add the arrow node that will allow the user to control the value of the epsilon parameter.
  this.controlArrow = new ArrowNode( 0, -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, 0,
    RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, {
      headHeight: 10,
      headWidth: 15,
      tailWidth: 6,
      fill: RESIZE_HANDLE_NORMAL_COLOR,
      stroke: 'black',
      doubleHead: true,
      pickable: true,
      cursor: 'pointer',
      tandem: epsilonParameterTandem.createTandem( 'controlArrow' )
    } );
  this.controlArrow.addInputListener(
    new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR, RESIZE_HANDLE_HIGHLIGHTED_COLOR )
  );
  this.ljPotentialGraph.addChild( this.controlArrow );
  this.controlArrow.addInputListener( new SimpleDragHandler( {

    start: function( event ) {
      startDragY = self.controlArrow.globalToParentPoint( event.pointer.point ).y;
    },

    drag: function( event ) {
      endDragY = self.controlArrow.globalToParentPoint( event.pointer.point ).y;
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

    tandem: this.controlArrow.tandem.createTandem( 'dragListener' )
  } ) );

  this.interactionPotentialCanvasNode = new InteractionPotentialCanvasNode( this, false, {
    canvasBounds: new Bounds2( 0, 0, 125, this.graphHeight )
  } );

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