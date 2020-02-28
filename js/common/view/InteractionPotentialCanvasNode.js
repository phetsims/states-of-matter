// Copyright 2015-2020, University of Colorado Boulder

/**
 * This type draws the interaction potential curve on a canvas.  This is done instead of using the Path node because
 * the curve requires numerous points and is therefore costly to render using a Path node.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author John Blanco
 */

import Utils from '../../../../dot/js/Utils.js';
import inherit from '../../../../phet-core/js/inherit.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const AXIS_LINE_WIDTH = 1;
const AXES_ARROW_HEAD_HEIGHT = 8 * AXIS_LINE_WIDTH;
const SIGMA_HANDLE_OFFSET_PROPORTION = 0.08;  // Position of handle as function of node width.
const EPSILON_LINE_WIDTH = 1;

/**
 * @param {InteractionPotentialDiagramNode} interactionDiagram
 * @param {boolean} isLjGraphWider  - true for wider graph else narrow graph
 * @param {Object} [options] that can be passed on to the underlying node
 * @constructor
 */
function InteractionPotentialCanvasNode( interactionDiagram, isLjGraphWider, options ) {
  CanvasNode.call( this, options );
  this.interactionDiagram = interactionDiagram; // @private
  this.isLjGraphWider = isLjGraphWider; // @private

  // For efficiency, pre-allocate the array that represents the Y positions of the curve.  The X positions are the
  // index into the array.
  this.curveYPositions = new Array( Utils.roundSymmetric( interactionDiagram.graphWidth ) );  // @private
}

statesOfMatter.register( 'InteractionPotentialCanvasNode', InteractionPotentialCanvasNode );

export default inherit( CanvasNode, InteractionPotentialCanvasNode, {

  /**
   * Paints the potential energy curve.
   * @param {CanvasRenderingContext2D} context
   * @public
   */
  paintCanvas: function( context ) {
    context.beginPath();
    context.moveTo( 0, 0 );
    for ( let i = 1; i < this.curveYPositions.length; i++ ) {

      const yPos = this.curveYPositions[ i ];

      if ( ( yPos > 0 ) && ( yPos < this.interactionDiagram.graphHeight ) ) {

        // This point is on the graph, draw a line to it.
        context.lineTo( i + this.interactionDiagram.graphXOrigin, yPos + AXES_ARROW_HEAD_HEIGHT );
      }
      else {

        // This line is off the graph - move to a good location from which to start or continue graphing.
        if ( yPos < 0 ) {
          context.moveTo( i + 1 + this.interactionDiagram.graphXOrigin, AXES_ARROW_HEAD_HEIGHT );
        }
        else {
          context.lineTo(
            i + this.interactionDiagram.graphXOrigin,
            this.interactionDiagram.graphHeight + AXES_ARROW_HEAD_HEIGHT
          );
        }
      }
    }
    context.strokeStyle = this.strokeColor;
    context.lineWidth = 2;
    context.stroke();
  },

  update: function( color ) {
    this.strokeColor = color.toCSS();

    // Calculate the points that comprise the curve and record several key values along the way the will be used to
    // position the various arrows and labels.
    this.interactionDiagram.graphMin.setXY( 0, 0 );
    this.interactionDiagram.zeroCrossingPoint.setXY( 0, 0 );
    const sigmaHandleYPos = ( this.interactionDiagram.getGraphHeight() / 2 ) -
                            2 * SIGMA_HANDLE_OFFSET_PROPORTION * this.interactionDiagram.heightOfGraph;
    let sigmaHandleXPos = 0;
    const horizontalIndexMultiplier = this.interactionDiagram.GRAPH_X_RANGE / this.interactionDiagram.graphWidth;
    let previousPotential = Number.POSITIVE_INFINITY;
    let previousYPos = Number.NEGATIVE_INFINITY;
    for ( let i = 1; i < this.interactionDiagram.graphWidth; i++ ) {
      const potential = this.interactionDiagram.calculateLennardJonesPotential( i * horizontalIndexMultiplier );
      const yPos = ( ( this.interactionDiagram.graphHeight / 2 ) - ( potential * this.interactionDiagram.verticalScalingFactor ) );

      // Record the data that will be used in the paintCanvas method to render the curve.
      this.curveYPositions[ i ] = yPos;

      // Record the position of the min Y value since the epsilon arrow needs to be positioned near this point.
      if ( yPos > this.interactionDiagram.graphMin.y ) {
        this.interactionDiagram.graphMin.setXY( i, yPos );
      }

      // Record the point where the sigma resize handle should be positioned.
      if ( yPos > sigmaHandleYPos && previousYPos < sigmaHandleYPos ) {
        sigmaHandleXPos = i;
      }

      // Record the zero crossing point since the sigma arrow will need to use it to set its size and position.
      if ( previousPotential > 0 && potential < 0 ) {
        this.interactionDiagram.zeroCrossingPoint.setXY( i, this.interactionDiagram.graphHeight / 2 );
      }
      previousPotential = potential;
      previousYPos = yPos;
    }

    // Position the epsilon arrow, which is a vertical double-headed arrow between the bottom of the well and the x axis.
    this.interactionDiagram.epsilonArrowStartPt.setXY(
      this.interactionDiagram.graphMin.x,
      this.interactionDiagram.graphHeight / 2
    );
    if ( this.interactionDiagram.epsilonArrowStartPt.distance( this.interactionDiagram.graphMin ) > 5 ) {
      this.interactionDiagram.epsilonArrow.setVisible( true );
      const doubleHead = this.interactionDiagram.graphMin.y <= this.interactionDiagram.graphHeight ||
                         this.interactionDiagram.graphMin.y - 10 < this.interactionDiagram.graphHeight;
      const tailY = this.interactionDiagram.graphMin.y > this.interactionDiagram.graphHeight ?
                    this.interactionDiagram.graphHeight : this.interactionDiagram.graphMin.y;
      this.interactionDiagram.epsilonArrowShape = new ArrowShape(
        this.interactionDiagram.graphMin.x,
        tailY,
        this.interactionDiagram.epsilonArrowStartPt.x,
        this.interactionDiagram.epsilonArrowStartPt.y,
        { doubleHead: doubleHead, headHeight: 5, headWidth: 6, tailWidth: 2 }
      );
      this.interactionDiagram.epsilonArrow.setShape( this.interactionDiagram.epsilonArrowShape );
    }
    else {
      // Don't show the arrow if there isn't enough space.
      this.interactionDiagram.epsilonArrow.setVisible( false );
    }

    // Position the epsilon label.
    this.interactionDiagram.epsilonLabel.left = this.interactionDiagram.graphMin.x - 2;
    this.interactionDiagram.epsilonLabel.bottom = this.interactionDiagram.graphHeight / 2 - 2;

    // Position the arrow that depicts sigma, which is a horizontal double-headed arrow between the y axis and the
    // first point at which the potential crosses the x axis.
    this.interactionDiagram.sigmaArrow.setTailAndTip(
      0,
      this.interactionDiagram.graphHeight / 2,
      this.interactionDiagram.zeroCrossingPoint.x,
      this.interactionDiagram.zeroCrossingPoint.y
    );

    // Position the sigma label.
    this.interactionDiagram.sigmaLabel.setTranslation(
      this.interactionDiagram.zeroCrossingPoint.x / 2 - this.interactionDiagram.sigmaLabel.width / 2,
      this.interactionDiagram.graphHeight / 2 - this.interactionDiagram.sigmaLabel.height / 3
    );

    // Update the position of the marker in case the curve has moved.
    this.interactionDiagram.setMarkerPosition( this.interactionDiagram.markerDistance );

    // Position the control handles if used.
    if ( this.interactionDiagram.epsilonResizeHandle !== undefined ) {
      const graphMin = this.interactionDiagram.getGraphMin();
      this.interactionDiagram.epsilonLine.setTranslation( graphMin.x, graphMin.y + EPSILON_LINE_WIDTH );
      this.interactionDiagram.epsilonResizeHandle.setVisible( this.interactionDiagram.interactionEnabled );
      this.interactionDiagram.epsilonLine.setVisible( this.interactionDiagram.interactionEnabled );
      this.interactionDiagram.epsilonResizeHandle.centerX = this.interactionDiagram.epsilonLine.right;
      this.interactionDiagram.epsilonResizeHandle.centerY = this.interactionDiagram.epsilonLine.centerY;
    }
    if ( this.interactionDiagram.sigmaResizeHandle !== undefined ) {
      this.interactionDiagram.sigmaResizeHandle.centerX = sigmaHandleXPos;
      this.interactionDiagram.sigmaResizeHandle.centerY = sigmaHandleYPos;
      this.interactionDiagram.sigmaResizeHandle.setVisible( this.interactionDiagram.interactionEnabled );
    }

    // indicate that this should be repainted during the next paint cycle
    this.invalidatePaint();
  }
} );