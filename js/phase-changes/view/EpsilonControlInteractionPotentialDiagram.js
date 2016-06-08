// Copyright 2014-2015, University of Colorado Boulder

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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var InteractionPotentialCanvasNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialCanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // strings
  var interactionPotentialString = require( 'string!STATES_OF_MATTER/interactionPotential' );

  // constants

  // Size of handles as function of node width.
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.18;

  // Position of handle as function of node width.
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;

  var RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;

  /**
   *
   * @param {number} sigma - atom diameter
   * @param {number} epsilon - interaction strength
   * @param {boolean} wide - true if the wide screen version of the graph is needed, false if not.
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function EpsilonControlInteractionPotentialDiagram( sigma, epsilon, wide, multipleParticleModel, options ) {

    var epsilonControlInteractionPotentialDiagram = this;
    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, true );
    this.multipleParticleModel = multipleParticleModel;
    var accordionContent = new Node();

    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;

    // Add the line that will indicate the value of epsilon.
    this.epsilonLine = new Rectangle( -epsilonLineLength / 2, 0, epsilonLineLength, 1, {
      cursor: 'ns-resize',
      pickable: true,
      fill: EPSILON_LINE_COLOR,
      stroke: EPSILON_LINE_COLOR
    } );

    // Add the arrow node that will allow the user to control the value of
    // the epsilon parameter.
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
    var startDragY;
    var endDragY;
    this.epsilonResizeHandle.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
    this.epsilonResizeHandle.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        startDragY = epsilonControlInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
      },
      drag: function( event ) {
        endDragY = epsilonControlInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                          ( epsilonControlInteractionPotentialDiagram.getGraphHeight() / 2);
        multipleParticleModel.interactionStrengthProperty.value = multipleParticleModel.getEpsilon() + ( d * scaleFactor );
        epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
      }
    } ) );

    this.epsilonLine.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.epsilonLine );

    // touch area
    this.epsilonLine.touchArea = this.epsilonLine.localBounds.dilatedXY( 20, 20 );

    this.epsilonLine.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        startDragY = epsilonControlInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
      },
      drag: function( event ) {
        endDragY = epsilonControlInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                          ( epsilonControlInteractionPotentialDiagram.getGraphHeight() / 2);
        multipleParticleModel.interactionStrength = multipleParticleModel.getEpsilon() + ( d * scaleFactor );
        epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
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
    var titleNode = new Text( interactionPotentialString, { fill: '#FFFFFF', font: new PhetFont( { size: 13 } ) } );
    if ( titleNode.width > this.horizontalAxis.width ) {
      titleNode.scale( this.horizontalAxis.width / titleNode.width );
    }
    var accordionBox = new AccordionBox( accordionContentHBox, {
      titleNode: titleNode,
      fill: 'black',
      stroke: 'white',
      expandedProperty: multipleParticleModel.interactionExpandedProperty,
      contentAlign: 'center',
      titleAlignX: 'center',
      buttonAlign: 'left',
      cornerRadius: 4,
      contentYSpacing: -3,
      contentYMargin: 5,
      contentXMargin: 6,
      titleYMargin: 5,
      contentXSpacing: 6,
      minWidth: 169,
      buttonYMargin: 4,
      buttonXMargin: 6,
      buttonLength: 12,
      buttonTouchAreaXDilation: 15,
      buttonTouchAreaYDilation: 6
    } );
    this.addChild( accordionBox );

    // update interactivity state
    this.updateInteractivityState();

    this.setLjPotentialParameters( multipleParticleModel.getSigma(), multipleParticleModel.getEpsilon() );
    this.drawPotentialCurve();

    // Update the text when the value or units changes.
    Property.multilink( [ multipleParticleModel.moleculeTypeProperty, multipleParticleModel.interactionStrengthProperty ],
      function( moleculeType, interactionStrength ) {
        if ( multipleParticleModel.currentMolecule === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
          multipleParticleModel.setEpsilon( interactionStrength );
        }
        epsilonControlInteractionPotentialDiagram.updateInteractivityState();
        // call when interaction strength change
        epsilonControlInteractionPotentialDiagram.setLjPotentialParameters( multipleParticleModel.getSigma(), multipleParticleModel.getEpsilon() );
        epsilonControlInteractionPotentialDiagram.drawPotentialCurve();
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

      //  draw potential curve
      if ( this.interactionPotentialCanvasNode !== undefined ) {
        this.interactionPotentialCanvasNode.update( new Color('yellow') );
      }
    },

    /**
     * @private
     */
    updateInteractivityState: function() {
      this.interactionEnabled = ( this.multipleParticleModel.getMoleculeType() === StatesOfMatterConstants.USER_DEFINED_MOLECULE );
    }
  } );
} );


