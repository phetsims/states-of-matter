// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class extends the interaction potential diagram to allow the user to adjust the interaction strength parameter
 * (i.e. epsilon) through direct interaction with the graph.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Color = require( 'SCENERY/util/Color' );
  const FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InteractionPotentialCanvasNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialCanvasNode' );
  const InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );

  // strings
  const interactionPotentialString = require( 'string!STATES_OF_MATTER/interactionPotential' );

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

    this.horizontalAxis.centerY -= 5;
    this.verticalAxisLabel.centerY -= 5;
    this.verticalAxis.centerY -= 5;
    this.interactionPotentialCanvasNode.centerY -= 5;
    this.ljPotentialGraph.centerY -= 5;

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

  return inherit( InteractionPotentialDiagramNode, EpsilonControlInteractionPotentialDiagram, {

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
} );


