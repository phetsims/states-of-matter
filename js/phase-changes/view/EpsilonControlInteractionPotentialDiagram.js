// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * This class extends the Interaction Potential diagram to allow the user to
 * adjust the interaction strength parameter (i.e. epsilon).
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Color = require( 'SCENERY/util/Color' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  // var Shape = require( 'KITE/Shape' );
  // var Path = require( 'SCENERY/nodes/Path' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );


  //strings
  var interactionDiagramTittle = require( 'string!STATES_OF_MATTER/interactionDiagram' );
// Size of handles as function of node width.
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.12;

  // Position of handle as function of node width.
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;
  // var EPSILON_LINE_WIDTH = 1;
  var RESIZE_HANDLE_NORMAL_COLOR = new Color( 51, 204, 51 );
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;

  /**
   *
   * @param sigma
   * @param epsilon
   * @param wide - True if the widescreen version of the graph is needed, false if not.
   * @param model
   * @param options
   * @constructor
   */
  function EpsilonControlInteractionPotentialDiagram( sigma, epsilon, wide, model, options ) {


    var epsilonControlInteractionPotentialDiagram = this;
    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, true );
    this.model = model;
    var accordionContent = new Node();
    accordionContent.addChild( this.horizontalAxisLabel );
    accordionContent.addChild( this.horizontalAxis );
    accordionContent.addChild( this.verticalAxisLabel );
    accordionContent.addChild( this.verticalAxis );
    accordionContent.addChild( this.ljPotentialGraph );
    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
    this.epsilonLine = new Rectangle( -epsilonLineLength / 2, 0, epsilonLineLength, 3, {
      cursor: 'ns-resize',
      pickable: true,
      fill: EPSILON_LINE_COLOR,
      stroke: EPSILON_LINE_COLOR
    } );

    // the epsilon parameter.
    this.epsilonResizeHandle = new ArrowNode( 0, -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, 0,
        RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, {
        headHeight: 10,
        headWidth: 10,
        tailWidth: 5,
        fill: RESIZE_HANDLE_NORMAL_COLOR,
        stroke: 'black',
        doubleHead: true,
        pickable: true,
        cursor: 'pointer'
      } );
    var startDragY, endDragY;
    this.epsilonResizeHandle.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
    this.epsilonResizeHandle.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          startDragY = epsilonControlInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
        },
        drag: function( event ) {
          endDragY = epsilonControlInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
          var d = endDragY - startDragY;
          startDragY = endDragY;
          var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                            ( epsilonControlInteractionPotentialDiagram.getGraphHeight() / 2);
          model.interactionStrengthProperty.value = model.getEpsilon() + ( d * scaleFactor );
          epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
        }
      } ) );

    this.epsilonLine.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.epsilonLine );
    this.epsilonLine.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          startDragY = epsilonControlInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
        },
        drag: function( event ) {
          endDragY = epsilonControlInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
          var d = endDragY - startDragY;
          startDragY = endDragY;
          var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                            ( epsilonControlInteractionPotentialDiagram.getGraphHeight() / 2);
          model.interactionStrength = model.getEpsilon() + ( d * scaleFactor );
          epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
        }
      } ) );
    var accordionBox = new AccordionBox( accordionContent,
      {
        titleNode: new Text( interactionDiagramTittle, { fill: "#FFFFFF", font: new PhetFont( { size: 12 } ) } ),
        fill: 'black',
        stroke: 'white',
        expandedProperty: model.interactionExpandedProperty,
        contentAlign: 'center',
        titleAlign: 'left',
        buttonAlign: 'left',
        cornerRadius: 4,
        contentYSpacing: 0,
        contentYMargin: 5,
        contentXMargin: 6,
        contentXSpacing: 6,
        buttonYMargin: 4,
        buttonXMargin: 6,
        buttonLength: 12,
        minWidth: 0
      } );
    this.addChild( accordionBox );
    // Update interactivity state.
    this.updateInteractivityState();

// call when interaction strength change
    this.setLjPotentialParameters( model.getSigma(), model.getEpsilon() );
    this.drawPotentialCurve();

    // Update the text when the value or units changes.
    Property.multilink( [model.moleculeTypeProperty, model.interactionStrengthProperty],
      function( moleculeType, interactionStrength ) {
        if ( model.currentMolecule === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
          model.setEpsilon( interactionStrength );
        }
        epsilonControlInteractionPotentialDiagram.updateInteractivityState();
        // call when interaction strength change
        epsilonControlInteractionPotentialDiagram.setLjPotentialParameters( model.getSigma(), model.getEpsilon() );
        epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
      } );

    this.mutate( options );
  }

  return inherit( InteractionPotentialDiagramNode, EpsilonControlInteractionPotentialDiagram, {

    /**
     * This is an override of the method in the base class that draws the
     * curve on the graph, and this override draws the controls that allow
     * the user to interact with the graph.
     */
    drawPotentialCurve: function() {
      // The bulk of the drawing is done by the base class.
      InteractionPotentialDiagramNode.prototype.drawPotentialCurve.call( this );
      // Now position the control handles.
      if ( this.epsilonResizeHandle !== undefined ) {
        var graphMin = this.getGraphMin();
        this.epsilonResizeHandle.setTranslation( graphMin.x + (this.width * EPSILON_HANDLE_OFFSET_PROPORTION), graphMin.y );
        this.epsilonResizeHandle.setVisible( this.interactionEnabled );
        this.epsilonResizeHandle.setPickable( this.interactionEnabled );
        this.epsilonLine.setTranslation( graphMin.x, graphMin.y );
        this.epsilonLine.setVisible( this.interactionEnabled );
        this.epsilonLine.setPickable( this.interactionEnabled );
      }
    },

    //private
    updateInteractivityState: function() {
      this.interactionEnabled = ( this.model.getMoleculeType() === StatesOfMatterConstants.USER_DEFINED_MOLECULE );
    }
  } );
} );


