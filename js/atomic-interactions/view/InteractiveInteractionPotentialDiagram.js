// Copyright 2015-2016, University of Colorado Boulder

/**
 * This class extends the Interaction Potential diagram to allow the user to change the curve through direct interaction
 * with it.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var AtomPair = require( 'STATES_OF_MATTER/atomic-interactions/model/AtomPair' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var BondingState = require( 'STATES_OF_MATTER/atomic-interactions/model/BondingState' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var FillHighlightListener = require( 'SCENERY_PHET/input/FillHighlightListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InteractionPotentialCanvasNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialCanvasNode' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColorProfile = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColorProfile' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // constants
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.05;  // Size of handles as function of node width.
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08; // Position of handle as function of node width.
  var RESIZE_HANDLE_NORMAL_COLOR = '#32FE00';
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;
  var POTENTIAL_LINE_COLOR = new Color( 'red' );

  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {boolean} wide - true if the wide screen version of the graph is needed, false if not
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function InteractiveInteractionPotentialDiagram( dualAtomModel, wide, options ) {

    InteractionPotentialDiagramNode.call( this, dualAtomModel.getSigma(), dualAtomModel.getEpsilon(), wide );
    var self = this;

    // @private
    this.dualAtomModel = dualAtomModel;
    this.minXForAtom = Number.NEGATIVE_INFINITY;

    // @public, read-only
    this.interactionEnabled = false;

    // Create a convenience function for adding a drag handler that adjusts epsilon, this is done to avoid code duplication.
    var startDragY;
    var endDragY;

    function addEpsilonDragHandler( node ) {
      node.addInputListener( new SimpleDragHandler( {

        start: function( event ) {
          dualAtomModel.setMotionPaused( true );
          startDragY = node.globalToParentPoint( event.pointer.point ).y;
        },

        drag: function( event ) {
          endDragY = node.globalToParentPoint( event.pointer.point ).y;
          var d = endDragY - startDragY;
          startDragY = endDragY;
          var scaleFactor = StatesOfMatterConstants.MAX_EPSILON / ( self.getGraphHeight() / 2 );
          dualAtomModel.interactionStrengthProperty.value = dualAtomModel.getEpsilon() + ( d * scaleFactor );
        },

        end: function() {
          dualAtomModel.setMotionPaused( false );
        }
      } ) );
    }

    // Add the line that will indicate and control the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 1.2;
    this.epsilonLine = new Rectangle( -epsilonLineLength / 2, 0, epsilonLineLength, 1, {
      cursor: 'ns-resize',
      pickable: true,
      fill: EPSILON_LINE_COLOR,
      stroke: EPSILON_LINE_COLOR
    } );
    this.epsilonLine.addInputListener(
      new FillHighlightListener( RESIZE_HANDLE_NORMAL_COLOR, RESIZE_HANDLE_HIGHLIGHTED_COLOR )
    );
    this.epsilonLine.touchArea = this.epsilonLine.localBounds.dilatedXY( 8, 8 );
    this.epsilonLine.mouseArea = this.epsilonLine.localBounds.dilatedXY( 0, 4 );
    addEpsilonDragHandler( this.epsilonLine );
    this.epsilonLineLayer.addChild( this.epsilonLine );

    // Add the arrow nodes that will allow the user to control the epsilon value.
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
    this.epsilonResizeHandle = new ArrowNode(
      0,
      -RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph / 2,
      0,
      RESIZE_HANDLE_SIZE_PROPORTION * this.widthOfGraph,
      arrowNodeOptions
    );
    this.epsilonResizeHandle.addInputListener( new FillHighlightListener(
      RESIZE_HANDLE_NORMAL_COLOR,
      RESIZE_HANDLE_HIGHLIGHTED_COLOR
    ) );
    this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
    this.epsilonResizeHandle.touchArea = this.epsilonResizeHandle.localBounds.dilatedXY( 3, 10 );
    addEpsilonDragHandler( this.epsilonResizeHandle );

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
        startDragX = self.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
      },

      drag: function( event ) {
        endDragX = self.sigmaResizeHandle.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        startDragX = endDragX;
        var scaleFactor = self.GRAPH_X_RANGE / ( self.getGraphWidth() );
        var atomDiameter = dualAtomModel.getSigma() + ( d * scaleFactor );
        dualAtomModel.atomDiameterProperty.value = atomDiameter > StatesOfMatterConstants.MIN_SIGMA ?
                                                   (atomDiameter < StatesOfMatterConstants.MAX_SIGMA ? atomDiameter :
                                                    StatesOfMatterConstants.MAX_SIGMA) : StatesOfMatterConstants.MIN_SIGMA;
      },

      end: function() {
        dualAtomModel.setMotionPaused( false );
      }
    } ) );

    // Add the ability to grab and move the position marker. This node will need to be pickable so the user can grab it.
    this.positionMarker.setPickable( true );
    this.positionMarker.touchArea = Shape.circle( 0, 0, 13 );
    this.positionMarker.addInputListener( new SimpleDragHandler( {

        start: function( event ) {
          // Stop the particle from moving in the model.
          dualAtomModel.setMotionPaused( true );
          startDragX = self.positionMarker.globalToParentPoint( event.pointer.point ).x;
        },

        drag: function( event ) {

          // If the atoms are bonded, release them.
          if ( dualAtomModel.bondingState !== BondingState.UNBONDED ) {
            dualAtomModel.releaseBond();
          }

          // Make sure the movement hint is now hidden, since the user has figured out what to drag.
          dualAtomModel.movementHintVisibleProperty.set( false );

          // Move the movable atom based on this drag event.
          var atom = dualAtomModel.movableAtom;
          endDragX = self.positionMarker.globalToParentPoint( event.pointer.point ).x;
          var xDifference = endDragX - startDragX;
          var scaleFactor = self.GRAPH_X_RANGE / ( self.getGraphWidth() );
          var newPosX = Math.max( atom.getX() + ( xDifference * scaleFactor ), self.minXForAtom );
          atom.setPosition( newPosX, atom.getY() );
          startDragX = endDragX;
        },

        end: function() {
          // Let the model move the particle again.  Note that this happens
          // even if the motion was paused by some other means.
          dualAtomModel.setMotionPaused( false );
        }
      }
    ) );

    Property.multilink(
      [ dualAtomModel.atomPairProperty, dualAtomModel.interactionStrengthProperty, dualAtomModel.atomDiameterProperty ],
      function( atomPair, interactionStrength, atomDiameter ) {
        if ( atomPair === AtomType.ADJUSTABLE ) {
          dualAtomModel.atomPairProperty.set( AtomPair.ADJUSTABLE );
          dualAtomModel.setEpsilon( interactionStrength );
          dualAtomModel.setAdjustableAtomSigma( atomDiameter );
        }
        self.positionMarker.changeColor( dualAtomModel.movableAtom.color );
        self.setLjPotentialParameters( dualAtomModel.getSigma(), dualAtomModel.getEpsilon() );
        self.updateInteractivityState();
        self.drawPotentialCurve();
      }
    );

    this.interactionPotentialCanvasNode = new InteractionPotentialCanvasNode(
      this,
      true,
      { canvasBounds: new Bounds2( 0, 0, this.graphWidth, this.graphHeight ) }
    );
    this.addChild( this.interactionPotentialCanvasNode );

    // Update interactivity state.
    this.updateInteractivityState();

    // Redraw the potential curve.
    this.drawPotentialCurve();
    this.addChild( this.horizontalAxisLabel );

    this.addChild( this.verticalAxisLabel );

    this.addChild( this.verticalAxis );
    this.addChild( this.horizontalAxis );
    this.addChild( this.ljPotentialGraph );

    // applying color scheme to lj graph elements
    this.verticalAxis.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.horizontalAxis.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.verticalAxis.stroke = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.horizontalAxis.stroke = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonArrow.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonArrow.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.sigmaArrow.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonLabel.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.sigmaLabel.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.epsilonArrow.stroke = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.gridNode.verticalLinesNode.stroke = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.horizontalAxisLabel.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.verticalAxisLabel.fill = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;
    this.gridNode.horizontalLinesNode.stroke = StatesOfMatterColorProfile.ljGraphAxesAndGridColorProperty;

    this.mutate( options );
  }

  statesOfMatter.register( 'InteractiveInteractionPotentialDiagram', InteractiveInteractionPotentialDiagram );

  return inherit( InteractionPotentialDiagramNode, InteractiveInteractionPotentialDiagram, {

    /**
     * This is an override of the method in the base class that draws the curve on the graph, and this override draws
     * the controls that allow the user to interact with the graph.
     * @override
     * @protected
     */
    drawPotentialCurve: function() {

      //  draw potential curve
      if ( this.interactionPotentialCanvasNode !== undefined ) {
        this.interactionPotentialCanvasNode.update( POTENTIAL_LINE_COLOR );
      }
    },

    /**
     * Set the lowest allowed X position to which the movable atom can be set.
     * @param {number} minXForAtom
     * @public
     */
    setMinXForAtom: function( minXForAtom ) {
      this.minXForAtom = minXForAtom;
    },

    /**
     * @private
     */
    updateInteractivityState: function() {
      this.interactionEnabled = ( this.dualAtomModel.fixedAtom.getType() === AtomType.ADJUSTABLE );
    },

    /**
     * @override
     */
    setMolecular: function( molecular ) {
      InteractionPotentialDiagramNode.prototype.setMolecular.call( this );
      // move the horizontal label down a little bit, otherwise adjustment arrow can overlap it
      this.horizontalAxisLabel.top += 8; // amount empirically determined
    }
  } );
} );
