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
  var AtomicInteractionColors = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionColors' );
  var Shape = require( 'KITE/Shape' );

  //constants
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.05;
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;
  var SIGMA_HANDLE_OFFSET_PROPORTION = 0.08;
  var RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
  var EPSILON_LINE_WIDTH = 1;
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;

  /**
   *
   * @param {Number} sigma - Initial value of sigma, a.k.a. the atom diameter
   * @param {Number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param {Boolean} wide - true if the wide screen version of the graph is needed, false if not.
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */

  function InteractiveInteractionPotentialDiagram( sigma, epsilon, wide, dualAtomModel, options ) {

    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide );
    this.dualAtomModel = dualAtomModel;
    var interactiveInteractionPotentialDiagram = this;

    this.interactionEnabled = false;
    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 1.2;
    this.epsilonLine = new Rectangle( -epsilonLineLength / 2, 0, epsilonLineLength, 1, {
      cursor: 'ns-resize',
      pickable: true,
      fill: EPSILON_LINE_COLOR,
      stroke: EPSILON_LINE_COLOR
    } );
    this.epsilonLine.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.epsilonLine.touchArea = this.epsilonLine.localBounds.dilatedXY( 8, 8 );
    var startDragY;
    var endDragY;
    this.epsilonLine.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        dualAtomModel.setMotionPaused( true );
        startDragY = interactiveInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
      },
      drag: function( event ) {
        endDragY = interactiveInteractionPotentialDiagram.epsilonLine.globalToParentPoint( event.pointer.point ).y;
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                          ( interactiveInteractionPotentialDiagram.getGraphHeight() / 2);
        dualAtomModel.interactionStrengthProperty.value = dualAtomModel.getEpsilon() + ( d * scaleFactor);
      },
      end: function() {
        dualAtomModel.setMotionPaused( false );
      }
    } ) );
    this.epsilonLineLayer.addChild( this.epsilonLine );

    var arrowNodeOptions = {
      headHeight: 10,
      headWidth: 18,
      tailWidth: 7,
      fill: RESIZE_HANDLE_NORMAL_COLOR,
      stroke: 'black',
      doubleHead: true,
      pickable: true,
      cursor: 'pointer'
    };

    // Add the arrow nodes that will allow the user to control the
    // parameters of the LJ potential.
    this.epsilonResizeHandle = new ArrowNode( 0, -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, 0,
      RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph, arrowNodeOptions );
    this.epsilonResizeHandle.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
    this.epsilonResizeHandle.touchArea = this.epsilonResizeHandle.localBounds.dilatedXY( 3, 10 );
    this.epsilonResizeHandle.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        dualAtomModel.setMotionPaused( true );
        startDragY = interactiveInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
      },
      drag: function( event ) {
        endDragY = interactiveInteractionPotentialDiagram.epsilonResizeHandle.globalToParentPoint( event.pointer.point ).y;
        var d = endDragY - startDragY;
        startDragY = endDragY;
        var scaleFactor = StatesOfMatterConstants.MAX_EPSILON /
                          ( interactiveInteractionPotentialDiagram.getGraphHeight() / 2);
        dualAtomModel.interactionStrengthProperty.value = dualAtomModel.getEpsilon() + ( d * scaleFactor);
      },
      end: function() {
        dualAtomModel.setMotionPaused( false );
      }
    } ) );

    // add sigma arrow node
    this.sigmaResizeHandle = new ArrowNode( -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2, 0,
      RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph * 1.2, 0, arrowNodeOptions );
    this.sigmaResizeHandle.addInputListener( new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR ) );
    this.ljPotentialGraph.addChild( this.sigmaResizeHandle );
    this.sigmaResizeHandle.touchArea = this.sigmaResizeHandle.localBounds.dilatedXY( 10, 5 );
    var startDragX;
    var endDragX;
    this.sigmaResizeHandle.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        dualAtomModel.setMotionPaused( true );
        startDragX = interactiveInteractionPotentialDiagram.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
      },
      drag: function( event ) {
        endDragX = interactiveInteractionPotentialDiagram.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        startDragX = endDragX;
        var scaleFactor = interactiveInteractionPotentialDiagram.MAX_INTER_ATOM_DISTANCE /
                          ( interactiveInteractionPotentialDiagram.getGraphWidth());
        var atomDiameter = dualAtomModel.getSigma() + ( d * scaleFactor);
        dualAtomModel.atomDiameterProperty.value = atomDiameter > StatesOfMatterConstants.MIN_SIGMA ?
                                                   (atomDiameter < StatesOfMatterConstants.MAX_SIGMA ? atomDiameter :
                                                    StatesOfMatterConstants.MAX_SIGMA) : StatesOfMatterConstants.MIN_SIGMA;
      },
      end: function() {
        dualAtomModel.setMotionPaused( false );
      }
    } ) );

    // Add the ability to grab and move the position marker.
    // This node will need to be pickable so the user can grab it.
    this.positionMarker.setPickable( true );
    this.positionMarker.touchArea = Shape.circle( 0, 0, 13 );
    this.positionMarker.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        dualAtomModel.setMotionPaused( true );
        startDragX = interactiveInteractionPotentialDiagram.positionMarker.globalToParentPoint( event.pointer.point ).x;
      },
      drag: function( event ) {
        // Only allow the user to move unbonded atoms.
        if ( dualAtomModel.getBondingState() !== dualAtomModel.BONDING_STATE_UNBONDED ) {
          // Need to release the bond before we can move the atom.
          dualAtomModel.releaseBond();
        }
        dualAtomModel.isHandNodeVisible = false;
        endDragX = interactiveInteractionPotentialDiagram.positionMarker.globalToParentPoint( event.pointer.point ).x;
        var xDifference = endDragX - startDragX;
        startDragX = endDragX;
        var atom = dualAtomModel.getMovableAtomRef();
        var scaleFactor = interactiveInteractionPotentialDiagram.MAX_INTER_ATOM_DISTANCE /
                          ( interactiveInteractionPotentialDiagram.getGraphWidth());
        var newPosX = Math.max( atom.getX() + ( xDifference * scaleFactor ), atom.getRadius() * 1.8 );
        atom.setPosition( newPosX, atom.getY() );
      },
      end: function() {
        dualAtomModel.setMotionPaused( false );
      }
    } ) );

    Property.multilink( [ dualAtomModel.atomPairProperty, dualAtomModel.interactionStrengthProperty, dualAtomModel.atomDiameterProperty ],
      function( moleculeType, interactionStrength, atomDiameter ) {

        if ( moleculeType === AtomType.ADJUSTABLE ) {
          dualAtomModel.setBothAtomTypes( AtomType.ADJUSTABLE );
          dualAtomModel.setEpsilon( interactionStrength );
          dualAtomModel.setAdjustableAtomSigma( atomDiameter );
        }
        interactiveInteractionPotentialDiagram.positionMarker.changeColor( dualAtomModel.movableAtom.color );
        interactiveInteractionPotentialDiagram.setLjPotentialParameters( dualAtomModel.getSigma(), dualAtomModel.getEpsilon() );
        interactiveInteractionPotentialDiagram.updateInteractivityState();
        interactiveInteractionPotentialDiagram.drawPotentialCurve();
      } );

    // Update interactivity state.
    this.updateInteractivityState();
    // Redraw the potential curve.
    this.drawPotentialCurve();
    this.addChild( this.horizontalAxisLabel );

    this.addChild( this.verticalAxisLabel );

    this.addChild( this.verticalAxis );
    this.addChild( this.ljPotentialGraph );
    this.addChild( this.horizontalAxis );

    // applying color scheme to lj graph elements
    // Todo: Is a single link better than multiple linkAttributes for the same property?
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.verticalAxis, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.horizontalAxis, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.verticalAxis, 'stroke' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.horizontalAxis, 'stroke' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.epsilonArrow, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.sigmaArrow, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.epsilonLabel, 'fill' );
    AtomicInteractionColors.linkAttribute( 'ljGraphColorsMode', this.sigmaLabel, 'fill' );
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
        var epsilonResizeOffset = 5;
        this.epsilonResizeHandle.setTranslation( graphMin.x + epsilonResizeOffset +
                                                 ( this.widthOfGraph / 2 * EPSILON_HANDLE_OFFSET_PROPORTION ),
          graphMin.y - epsilonResizeOffset );
        this.epsilonResizeHandle.setVisible( this.interactionEnabled );
        this.epsilonResizeHandle.setPickable( this.interactionEnabled );
        this.epsilonLine.setTranslation( graphMin.x, graphMin.y + EPSILON_LINE_WIDTH );
        this.epsilonLine.setVisible( this.interactionEnabled );
        this.epsilonLine.setPickable( this.interactionEnabled );
      }
      if ( this.sigmaResizeHandle !== undefined ) {
        var zeroCrossingPoint = this.getZeroCrossingPoint();
        var arrowNodeXOffset = 5;
        this.sigmaResizeHandle.setTranslation( zeroCrossingPoint.x - arrowNodeXOffset,
          ( this.getGraphHeight() / 2 ) - 2 * SIGMA_HANDLE_OFFSET_PROPORTION * this.heightOfGraph );
        this.sigmaResizeHandle.setVisible( this.interactionEnabled );
        this.sigmaResizeHandle.setPickable( this.interactionEnabled );
      }
    },

    updateInteractivityState: function() {
      this.interactionEnabled = ( this.dualAtomModel.getFixedAtomType() === AtomType.ADJUSTABLE );
    }
  } );
} );
