// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class extends the interaction potential diagram to allow the user to adjust the interaction strength parameter
 * (i.e. epsilon) through direct interaction with the graph.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InteractionPotentialCanvasNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialCanvasNode' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var interactionPotentialString = require( 'string!STATES_OF_MATTER/interactionPotential' );

  // Size of handles as function of node width.
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.18;

  // Position of handle as function of node width.
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;

  // other constants
  var RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;
  var POTENTIAL_LINE_COLOR = new Color( 'red' );

  /**
   * @param {number} sigma - atom diameter
   * @param {number} epsilon - interaction strength
   * @param {boolean} wide - true if the wide screen version of the graph is needed, false if not.
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function EpsilonControlInteractionPotentialDiagram( sigma, epsilon, wide, multipleParticleModel, options ) {

    var self = this;
    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, true );
    this.multipleParticleModel = multipleParticleModel;
    var accordionContent = new Node();

    // variables used to track dragging of controls related to epsilon value
    var startDragY;
    var endDragY;

    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
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
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = SOMConstants.MAX_EPSILON /
                          ( self.getGraphHeight() / 2);
        multipleParticleModel.interactionStrengthProperty.set( multipleParticleModel.getEpsilon() + ( d * scaleFactor ) );
        self.drawPotentialCurve();
      }
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
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = SOMConstants.MAX_EPSILON /
                          ( self.getGraphHeight() / 2);
        multipleParticleModel.interactionStrengthProperty.value = multipleParticleModel.getEpsilon() + ( d * scaleFactor );
        self.drawPotentialCurve();
      }
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

    var accordionContentHBox = new HBox( { children: [ accordionContent ] } );
    var titleNode = new Text( interactionPotentialString, {
      fill: SOMColorProfile.controlPanelTextProperty,
      font: new PhetFont( { size: 13 } )
    } );
    if ( titleNode.width > this.horizontalAxis.width ) {
      titleNode.scale( this.horizontalAxis.width / titleNode.width );
    }
    var accordionBox = new AccordionBox( accordionContentHBox, {
      titleNode: titleNode,
      fill: SOMColorProfile.controlPanelBackgroundProperty,
      stroke: SOMColorProfile.controlPanelStrokeProperty,
      expandedProperty: multipleParticleModel.interactionExpandedProperty,
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
      }
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


