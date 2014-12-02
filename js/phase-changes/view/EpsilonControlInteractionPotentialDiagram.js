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
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  //var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );


// Size of handles as function of node width.
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.12;

  // Position of handle as function of node width.
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;
  var EPSILON_LINE_WIDTH = 1;

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

    this.model = model;
    var epsilonControlInteractionPotentialDiagram = this;
    this.epsilonResizeHandle = null;
    this.interactionPotentialDiagramNode = new InteractionPotentialDiagramNode( sigma, epsilon, wide );
    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, true );
    this.accordinContent = new Node();
    // Update the text when the value or units changes.
    /*  Property.multilink( [model.atomsProperty,  model.interactionStrengthProperty],
     function( atoms, interactionStrength ) {
     epsilonControlInteractionPotentialDiagram.updateInteractivityState();

     epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
     // call when interaction strength change
     epsilonControlInteractionPotentialDiagram.setLjPotentialParameters( model.getSigma(), model.getEpsilon() );

     } );*/

    model.atomsProperty.link( function( atoms ) {
      epsilonControlInteractionPotentialDiagram.updateInteractivityState();
      epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
      // call when interaction strength change
      epsilonControlInteractionPotentialDiagram.setLjPotentialParameters( model.getSigma(), model.getEpsilon() );

    } );
    model.interactionStrengthProperty.link( function( value ) {
      epsilonControlInteractionPotentialDiagram.updateInteractivityState();
      epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
      // call when interaction strength change
      epsilonControlInteractionPotentialDiagram.setLjPotentialParameters( model.getSigma(), model.getEpsilon() );

    } );


    this.accordinContent.addChild( this.ljPotentialGraph );

    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
    var epsilonShape = new Path( new Shape()
      .moveTo( -epsilonLineLength / 3, 0 )
      .lineTo( epsilonLineLength / 2, 0 ), {
      lineWidth: 2,
      stroke: '#31C431'
    } );
    this.epsilonLine = new Node( { cursor: 'pointer', pickable: true} );

    this.epsilonLine.addChild( epsilonShape );
    // the epsilon parameter.
    this.epsilonResizeHandle = new ArrowNode( 0, -20, 0, 20, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: 'black',
      doubleHead: true,
      pickable: true
    } );
    this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
    this.ljPotentialGraph.addChild( this.epsilonLine );
    var epsilonResizeHandleNode = this.epsilonResizeHandle;
    var startDragY, endDragY;
    this.epsilonResizeHandle.cursor = 'pointer';
    this.epsilonResizeHandle.addInputListener( new FillHighlightListener( '#33FF00', 'yellow' ) );
    this.epsilonResizeHandle.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          startDragY = epsilonResizeHandleNode.globalToParentPoint( event.pointer.point ).y;
        },
        drag: function( event ) {

          endDragY = epsilonResizeHandleNode.globalToParentPoint( event.pointer.point ).y;
          var d = endDragY - startDragY;
          var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                            ( epsilonControlInteractionPotentialDiagram.getGraphHeight() / 2);
          model.interactionStrengthProperty.value = model.getEpsilon() + ( d * scaleFactor );
          epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
          epsilonResizeHandleNode.setTranslation( epsilonControlInteractionPotentialDiagram.getGraphMin().x +
                                                  (epsilonControlInteractionPotentialDiagram.width *
                                                   EPSILON_HANDLE_OFFSET_PROPORTION),
            epsilonControlInteractionPotentialDiagram.getGraphMin().y );
        }
      } ) );

    // todo
    this.epsilonLine.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {

        },
        drag: function( event ) {

          console.log( "changing epsilon using epsilon line " );
        }
      } ) );


    var accordionBox = new AccordionBox( this.accordinContent,
      {
        titleNode: new Text( 'Interaction Diagram', { fill: "#FFFFFF", font: new PhetFont( { size: 12 } ) } ),
        fill: 'black',
        stroke: 'white',
        expandedProperty: model.interactionExpandedProperty,
        contentAlign: 'center',
        titleAlign: 'left',
        buttonAlign: 'left',
        cornerRadius: 4,
        contentYSpacing: -25,
        contentYMargin: 5,
        contentXMargin: 2,
        contentXSpacing: -10,
        buttonYMargin: 4,
        buttonXMargin: 6,
        buttonLength: 12,
        minWidth: 0
      } );
    this.addChild( accordionBox );
    // Update interactivity state.
    this.drawPotentialCurve();
    this.updateInteractivityState();

    // call when interaction strength change
    this.setLjPotentialParameters( 200, 200 );
    this.drawPotentialCurve();
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
      if ( this.epsilonResizeHandle !== null ) {
        var graphMin = this.getGraphMin();
        this.epsilonResizeHandle.setTranslation( graphMin.x + (this.width * EPSILON_HANDLE_OFFSET_PROPORTION),
          graphMin.y );
        this.epsilonResizeHandle.setVisible( this.interactionEnabled );
        this.epsilonResizeHandle.setPickable( this.interactionEnabled );
        this.epsilonLine.setTranslation( graphMin.x, graphMin.y + EPSILON_LINE_WIDTH );
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


