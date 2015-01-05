// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class extends the Interaction Potential diagram to allow the user to
 * change the curve through direct interaction with it.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  var Property = require( 'AXON/Property' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var AtomicInteractionColors = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/AtomicInteractionColors' );

  var RESIZE_HANDLE_SIZE_PROPORTION = 0.05;
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;
  var SIGMA_HANDLE_OFFSET_PROPORTION = 0.08;
  var RESIZE_HANDLE_NORMAL_COLOR = new Color( 153, 255, 0 );//new Color( 51, 204, 51 );
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = 'yellow';//new Color( 153, 255, 0 );
  var EPSILON_LINE_WIDTH = 1;
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;

  /**
   *
   * @param { Number } sigma
   * @param { Number } epsilon
   * @param { Number } wide
   * @param {DualAtomModel}model
   * @param {Object} options that can be passed on to the underlying node
   * @constructor
   */

  function InteractiveInteractionPotentialDiagram( sigma, epsilon, wide, model, options ) {

    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide );
    this.model = model;
    var interactiveInteractionPotentialDiagram = this;


    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
    this.epsilonLine = new Rectangle( -epsilonLineLength / 4, 0, epsilonLineLength / 2, 3, {
      cursor: 'ns-resize',
      pickable: true,
      fill: EPSILON_LINE_COLOR,
      stroke: EPSILON_LINE_COLOR
    } );
    this.epsilonLine.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    var startDragY, endDragY;
    this.epsilonLine.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        model.setMotionPaused( true );
        startDragY = interactiveInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
      },
      drag: function( event ) {
        endDragY = interactiveInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                          ( interactiveInteractionPotentialDiagram.getGraphHeight() / 2);
        model.interactionStrengthProperty.value = model.getEpsilon() + ( d * scaleFactor);
      },
      end: function() {
        model.setMotionPaused( false );
      }
    } ) );
    this.epsilonLineLayer.addChild( this.epsilonLine );

    // Add the arrow nodes that will allow the user to control the
    // parameters of the LJ potential.
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
    this.epsilonResizeHandle.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
    this.epsilonResizeHandle.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        model.setMotionPaused( true );
        startDragY = interactiveInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
      },
      drag: function( event ) {
        endDragY = interactiveInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                          ( interactiveInteractionPotentialDiagram.getGraphHeight() / 2);
        model.interactionStrengthProperty.value = model.getEpsilon() + ( d * scaleFactor);
      },
      end: function() {
        model.setMotionPaused( false );
      }
    } ) );

    // add sigma arrow node
    this.sigmaResizeHandle = new ArrowNode( -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, 0,
        RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, 0, {
        headHeight: 10,
        headWidth: 10,
        tailWidth: 5,
        fill: RESIZE_HANDLE_NORMAL_COLOR,
        stroke: 'black',
        doubleHead: true,
        pickable: true,
        cursor: 'pointer'
      } );
    this.sigmaResizeHandle.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.sigmaResizeHandle );
    var startDragX, endDragX;
    this.sigmaResizeHandle.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        model.setMotionPaused( true );
        startDragX = interactiveInteractionPotentialDiagram.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
      },
      drag: function( event ) {
        endDragX = interactiveInteractionPotentialDiagram.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        startDragX = endDragX;
        var scaleFactor = interactiveInteractionPotentialDiagram.MAX_INTER_ATOM_DISTANCE /
                          ( interactiveInteractionPotentialDiagram.getGraphWidth());
        var atomDiameter = model.getSigma() + ( d * scaleFactor);
        model.atomDiameterProperty.value = atomDiameter > StatesOfMatterConstants.MIN_SIGMA ?
                                           (atomDiameter < StatesOfMatterConstants.MAX_SIGMA ? atomDiameter :
                                            StatesOfMatterConstants.MAX_SIGMA) : StatesOfMatterConstants.MIN_SIGMA;
      },
      end: function() {
        model.setMotionPaused( false );
      }
    } ) );

    // Add the ability to grab and move the position marker.
    // This node will need to be pickable so the user can grab it.
    this.positionMarker.setPickable( true );
    this.positionMarker.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        model.setMotionPaused( true );
        startDragX = interactiveInteractionPotentialDiagram.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
      },
      drag: function( event ) {
        endDragX = interactiveInteractionPotentialDiagram.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        startDragX = endDragX;
        var atom = model.getMovableAtomRef();
        var scaleFactor = interactiveInteractionPotentialDiagram.MAX_INTER_ATOM_DISTANCE /
                          ( interactiveInteractionPotentialDiagram.getGraphWidth());
        var newPosX = Math.max( atom.getX() + ( d * scaleFactor ), atom.getRadius() * 1.8 );
        atom.setPosition( newPosX, atom.getY() );
      },
      end: function() {
        model.setMotionPaused( false );
      }
    } ) );
    Property.multilink( [model.moleculeTypeProperty, model.interactionStrengthProperty, model.atomDiameterProperty],
      function( moleculeType, interactionStrength, atomDiameter ) {

        if ( moleculeType === AtomType.ADJUSTABLE ) {
          model.setBothAtomTypes( AtomType.ADJUSTABLE );
          model.setEpsilon( interactionStrength );
          model.setAdjustableAtomSigma( atomDiameter );
        }
        interactiveInteractionPotentialDiagram.positionMarker.changeColor( model.movableAtom.color );
        interactiveInteractionPotentialDiagram.setLjPotentialParameters( model.getSigma(), model.getEpsilon() );
        interactiveInteractionPotentialDiagram.updateInteractivityState();
        interactiveInteractionPotentialDiagram.drawPotentialCurve();
      } );

    // Update interactivity state.
    this.updateInteractivityState();
    // Redraw the potential curve.
    this.drawPotentialCurve();
    this.addChild( this.horizontalAxisLabel );
    this.addChild( this.horizontalAxis );
    this.addChild( this.verticalAxisLabel );
    this.addChild( this.verticalAxis );
    this.addChild( this.ljPotentialGraph );

    // applying color scheme to lj graph elements
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.verticalAxis, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.horizontalAxis, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.verticalAxis, 'stroke' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.horizontalAxis, 'stroke' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.epsilonArrow, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.sigmaArrow, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.epsilonArrow, 'stroke' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.gridNode.verticalLinesNode, 'stroke' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.horizontalAxisLabel, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.verticalAxisLabel, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.gridNode.horizontalLinesNode, 'stroke' );
    AtomicInteractionColors.linkAttribute( 'potentialEnergyLine', this.potentialEnergyLine, 'stroke' );
    this.mutate( options );
  }

  return inherit( InteractionPotentialDiagramNode, InteractiveInteractionPotentialDiagram, {
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
        this.epsilonResizeHandle.setTranslation( graphMin.x +
                                                 ( this.widthOfGraph / 2 * EPSILON_HANDLE_OFFSET_PROPORTION ),
          graphMin.y );
        this.epsilonResizeHandle.setVisible( this.interactionEnabled );
        this.epsilonResizeHandle.setPickable( this.interactionEnabled );
        this.epsilonLine.setTranslation( graphMin.x, graphMin.y + EPSILON_LINE_WIDTH );
        this.epsilonLine.setVisible( this.interactionEnabled );
        this.epsilonLine.setPickable( this.interactionEnabled );
      }
      if ( this.sigmaResizeHandle !== undefined ) {
        var zeroCrossingPoint = this.getZeroCrossingPoint();
        this.sigmaResizeHandle.setTranslation( zeroCrossingPoint.x,
            ( this.getGraphHeight() / 2 ) - SIGMA_HANDLE_OFFSET_PROPORTION * this.heightOfGraph );
        this.sigmaResizeHandle.setVisible( this.interactionEnabled );
        this.sigmaResizeHandle.setPickable( this.interactionEnabled );
      }
    },
    updateInteractivityState: function() {
      this.interactionEnabled = ( this.model.getFixedAtomType() === AtomType.ADJUSTABLE );

    }
  } );
} );
