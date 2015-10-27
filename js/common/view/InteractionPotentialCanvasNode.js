// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class displays an interaction potential diagram.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  // constant that controls the range of data that is graphed
  var MAX_INTER_ATOM_DISTANCE = 1700; // in picometers
  var AXIS_LINE_WIDTH = 1;
  var AXES_ARROW_HEAD_HEIGHT = 8 * AXIS_LINE_WIDTH;

  // other constants
  var NUM_POINTS_IN_GRAPH = 40; // number of points used to portray the line, empirically determined to look decent
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08; // Position of handle as function of node width.
  var SIGMA_HANDLE_OFFSET_PROPORTION = 0.08;  // Position of handle as function of node width.
  var EPSILON_LINE_WIDTH = 1;

  /**
   * @param {InteractionPotentialDiagramNode} interactionDiagram
   * @param {boolean} isLjGraphWider  - true for wider graph else narrow graph
   * @param {Property<boolean>} projectorModeProperty - true to use the projector color scheme, false to use regular
   * color scheme
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function InteractionPotentialCanvasNode( interactionDiagram, isLjGraphWider, projectorModeProperty, options ) {
    CanvasNode.call( this, options );
    this.interactionDiagram = interactionDiagram;
    this.isLjGraphWider = isLjGraphWider;
    this.projectorModeProperty = projectorModeProperty;
  }

  return inherit( CanvasNode, InteractionPotentialCanvasNode, {

    /**
     * Paints the potential energy curve on the canvas node.
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      context.beginPath();
      context.moveTo( 0, 0 );
      this.interactionDiagram.graphMin.setXY( 0, 0 );
      this.interactionDiagram.zeroCrossingPoint.setXY( 0, 0 );
      var horizontalIndexMultiplier = MAX_INTER_ATOM_DISTANCE / this.interactionDiagram.graphWidth;
      for ( var i = 1; i < this.interactionDiagram.graphWidth; i++ ) {
        var potential = this.interactionDiagram.calculateLennardJonesPotential( i * horizontalIndexMultiplier );
        var yPos = ( ( this.interactionDiagram.graphHeight / 2 ) - ( potential * this.interactionDiagram.verticalScalingFactor ) );
        if ( yPos > this.interactionDiagram.graphMin.y ) {
          this.interactionDiagram.graphMin.setXY( i, yPos );
        }
        if ( (yPos > 0) && (yPos < this.interactionDiagram.graphHeight) ) {
          context.lineTo( i + this.interactionDiagram.graphXOrigin, yPos + AXES_ARROW_HEAD_HEIGHT );
          if ( (potential > 0) || (this.interactionDiagram.zeroCrossingPoint.x === 0) ) {
            // zero crossing point.
            this.interactionDiagram.zeroCrossingPoint.setXY( i, this.interactionDiagram.graphHeight / 2 );
          }
        }
        else {
          // Move to a good location from which to start graphing.
          if ( yPos > this.interactionDiagram.graphHeight ) {
            context.lineTo(
              i + this.interactionDiagram.graphXOrigin,
              this.interactionDiagram.graphHeight + AXES_ARROW_HEAD_HEIGHT
            );
            if ( (potential > 0) || ( this.interactionDiagram.zeroCrossingPoint.x === 0) ) {
              // zero crossing point.
              this.interactionDiagram.zeroCrossingPoint.setXY( i, this.interactionDiagram.graphHeight / 2 );
            }
          }
          if ( yPos < 0 ) {
            context.moveTo( i + 1 + this.interactionDiagram.graphXOrigin, AXES_ARROW_HEAD_HEIGHT );
          }
        }
      }
      context.strokeStyle = this.projectorModeProperty.value && this.isLjGraphWider ? 'red' : 'yellow';
      context.lineWidth = 2;
      context.stroke();

      this.interactionDiagram.epsilonArrowStartPt.setXY(
        this.interactionDiagram.graphMin.x,
        this.interactionDiagram.graphHeight / 2
      );
      //if ( this.interactionDiagram.epsilonArrowStartPt.distance( this.interactionDiagram.graphMin ) > 5 ) {
      //  //this.interactionDiagram.epsilonArrow.setVisible( true );
      //  try {
      //    if ( this.interactionDiagram.graphMin.y > this.interactionDiagram.graphHeight ) {
      //      this.interactionDiagram.epsilonArrowShape = new ArrowShape(
      //        this.interactionDiagram.graphMin.x,
      //        this.interactionDiagram.graphHeight,
      //        this.interactionDiagram.epsilonArrowStartPt.x,
      //        this.interactionDiagram.epsilonArrowStartPt.y,
      //        {
      //          doubleHead: this.interactionDiagram.graphMin.y - 10 < this.interactionDiagram.graphHeight,
      //          headHeight: 5, headWidth: 6, tailWidth: 2
      //        }
      //      );
      //      this.interactionDiagram.epsilonArrow.setShape( this.interactionDiagram.epsilonArrowShape );
      //    }
      //    else {
      //      this.interactionDiagram.epsilonArrowShape = new ArrowShape( this.interactionDiagram.graphMin.x, this.interactionDiagram.graphMin.y,
      //        this.interactionDiagram.epsilonArrowStartPt.x, this.interactionDiagram.epsilonArrowStartPt.y, {
      //          doubleHead: true, headHeight: 5, headWidth: 6, tailWidth: 2
      //        } );
      //      this.interactionDiagram.epsilonArrow.setShape( this.interactionDiagram.epsilonArrowShape );
      //    }
      //  }
      //  catch( e ) {
      //    console.error( 'Error: Caught exception while positioning epsilon arrow - ' + e );
      //  }
      //}
      //else {
        // Don't show the arrow if there isn't enough space.
      //this.interactionDiagram.epsilonArrow.setVisible( false );
      //}

      //this.interactionDiagram.epsilonLabel.setTranslation(
      //  this.interactionDiagram.graphMin.x + this.interactionDiagram.epsilonLabel.width,
      //  this.interactionDiagram.epsilonLabel.y
      //);

      // Position the arrow that depicts sigma along with its label.
      //this.interactionDiagram.sigmaLabel.setTranslation( this.interactionDiagram.zeroCrossingPoint.x / 2 - this.interactionDiagram.sigmaLabel.width / 2,
      //  this.interactionDiagram.graphHeight / 2 - this.interactionDiagram.sigmaLabel.height / 3 );
      //try {
      //  this.interactionDiagram.sigmaArrow.setTailAndTip( 0, this.interactionDiagram.graphHeight / 2,
      //    this.interactionDiagram.zeroCrossingPoint.x, this.interactionDiagram.zeroCrossingPoint.y );
      //}
      //catch( r ) {
      //  console.error( 'Error: Caught exception while positioning sigma arrow - ' + r );
      //}

      // Update the position of the marker in case the curve has moved.
      //this.interactionDiagram.setMarkerPosition( this.interactionDiagram.markerDistance );
      //
      //// Now position the control handles.
      //if ( this.interactionDiagram.epsilonResizeHandle !== undefined ) {
      //  var graphMin = this.interactionDiagram.getGraphMin();
      //  if ( this.isLjGraphWider ) {
      //    var epsilonResizeOffset = 5;
      //    this.interactionDiagram.epsilonResizeHandle.setTranslation( graphMin.x + epsilonResizeOffset +
      //                                                                (     this.interactionDiagram.widthOfGraph / 2 * EPSILON_HANDLE_OFFSET_PROPORTION ),
      //      graphMin.y - epsilonResizeOffset );
      //    this.interactionDiagram.epsilonResizeHandle.setVisible( this.interactionDiagram.interactionEnabled );
      //    this.interactionDiagram.epsilonLine.setTranslation( graphMin.x, graphMin.y + EPSILON_LINE_WIDTH );
      //    this.interactionDiagram.epsilonLine.setVisible( this.interactionDiagram.interactionEnabled );
      //  }
      //  else {
      //    this.interactionDiagram.epsilonResizeHandle.setTranslation( graphMin.x + (this.interactionDiagram.width * EPSILON_HANDLE_OFFSET_PROPORTION), graphMin.y );
      //    this.interactionDiagram.epsilonResizeHandle.setVisible( this.interactionDiagram.interactionEnabled );
      //    this.interactionDiagram.epsilonLine.setTranslation( graphMin.x, graphMin.y );
      //    this.interactionDiagram.epsilonLine.setVisible( this.interactionDiagram.interactionEnabled );
      //  }
      //}
      //if ( this.interactionDiagram.sigmaResizeHandle !== undefined ) {
      //  var zeroCrossingPoint = this.interactionDiagram.getZeroCrossingPoint();
      //  var arrowNodeXOffset = 5;
      //  this.interactionDiagram.sigmaResizeHandle.setTranslation( zeroCrossingPoint.x - arrowNodeXOffset,
      //    ( this.interactionDiagram.getGraphHeight() / 2 ) - 2 * SIGMA_HANDLE_OFFSET_PROPORTION * this.interactionDiagram.heightOfGraph );
      //  this.interactionDiagram.sigmaResizeHandle.setVisible( this.interactionDiagram.interactionEnabled );
      //}
    },

    update: function() {
      this.invalidatePaint();
    }
  } );
} );