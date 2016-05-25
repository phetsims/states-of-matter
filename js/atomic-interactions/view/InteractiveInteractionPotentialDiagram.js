// Copyright 2015, University of Colorado Boulder

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
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColorProfile = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColorProfile' );
  var Shape = require( 'KITE/Shape' );
  var InteractionPotentialCanvasNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialCanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );

  //constants
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.05;  // Size of handles as function of node width.
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08; // Position of handle as function of node width.
  var RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;

  /**
   * @param {number} sigma - Initial value of sigma, a.k.a. the atom diameter
   * @param {number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param {boolean} wide - true if the wide screen version of the graph is needed, false if not.
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

    // Add the arrow nodes that will allow the user to control the parameters of the LJ potential.
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
        // Stop the particle from moving in the model.
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

        var atom = dualAtomModel.getMovableAtomRef();
        endDragX = interactiveInteractionPotentialDiagram.positionMarker.globalToParentPoint( event.pointer.point ).x;
        var xDifference = endDragX - startDragX;

        var scaleFactor = interactiveInteractionPotentialDiagram.MAX_INTER_ATOM_DISTANCE /
                          ( interactiveInteractionPotentialDiagram.getGraphWidth());
        if( atom.getX() + ( xDifference * scaleFactor ) > atom.getRadius() * 1.8  ) {
          startDragX = endDragX;
          // Move the particle based on the amount of mouse movement.
          var newPosX = Math.max( atom.getX() + ( xDifference * scaleFactor ), atom.getRadius() * 1.8 );
          atom.setPosition( newPosX, atom.getY() );
        }
      },

      end: function() {
        // Let the model move the particle again.  Note that this happens
        // even if the motion was paused by some other means.
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
      }
    );

    this.interactionPotentialCanvasNode = new InteractionPotentialCanvasNode( this,
      true,
      {
        canvasBounds: new Bounds2( 0, 0, 500, this.graphHeight + 10 )
      } );
    this.addChild( this.interactionPotentialCanvasNode );
    StatesOfMatterColorProfile.ljGraphLineColorProperty.link( function( color ) {
      interactiveInteractionPotentialDiagram.interactionPotentialCanvasNode.update( color );
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
    this.verticalAxis.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.horizontalAxis.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.verticalAxis.stroke = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.horizontalAxis.stroke = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.epsilonArrow.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.sigmaArrow.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.epsilonLabel.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.sigmaLabel.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.epsilonArrow.stroke = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.gridNode.verticalLinesNode.stroke = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.horizontalAxisLabel.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.verticalAxisLabel.fill = StatesOfMatterColorProfile.ljGraphColorsModeProperty;
    this.gridNode.horizontalLinesNode.stroke = StatesOfMatterColorProfile.ljGraphColorsModeProperty;

    this.mutate( options );
  }

  statesOfMatter.register( 'InteractiveInteractionPotentialDiagram', InteractiveInteractionPotentialDiagram );

  return inherit( InteractionPotentialDiagramNode, InteractiveInteractionPotentialDiagram, {

    /**
     *
     * This is an override of the method in the base class that draws the
     * curve on the graph, and this override draws the controls that allow
     * the user to interact with the graph.
     * @override
     * @protected
     */
    drawPotentialCurve: function() {

      //  draw potential curve
      if ( this.interactionPotentialCanvasNode !== undefined ) {
        this.interactionPotentialCanvasNode.update( StatesOfMatterColorProfile.ljGraphLineColorProperty.value );
      }
    },

    /**
     * @private
     */
    updateInteractivityState: function() {
      this.interactionEnabled = ( this.dualAtomModel.getFixedAtomType() === AtomType.ADJUSTABLE );
    }
  } );
} );
