// Copyright 2015-2021, University of Colorado Boulder

/**
 * This type draws the interaction potential curve on a canvas.  This is done instead of using the Path node because
 * the curve requires numerous points and is therefore costly to render using a Path node.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author John Blanco
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import { CanvasNode } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const AXIS_LINE_WIDTH = 1;
const AXES_ARROW_HEAD_HEIGHT = 8 * AXIS_LINE_WIDTH;
const SIGMA_HANDLE_OFFSET_PROPORTION = 0.08;  // Position of handle as function of node width.
const EPSILON_LINE_WIDTH = 1;

class InteractionPotentialCanvasNode extends CanvasNode {

  /**
   * @param {PotentialGraphNode} potentialGraphNode
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( potentialGraphNode, options ) {
    super( options );
    this.potentialGraph = potentialGraphNode; // @private

    // @private {number[]} - ror efficiency, pre-allocate the array that represents the Y positions of the curve.  The X
    // positions are the indexes into the array.
    this.curveYPositions = new Array( Utils.roundSymmetric( potentialGraphNode.graphWidth ) );

    // @private {Vector2} - reusable vector for positioning the epsilon arrow
    this.epsilonArrowStartPoint = new Vector2( 0, 0 );
  }

  /**
   * Paints the potential energy curve.
   * @param {CanvasRenderingContext2D} context
   * @public
   */
  paintCanvas( context ) {
    context.beginPath();
    context.moveTo( 0, 0 );
    for ( let i = 1; i < this.curveYPositions.length; i++ ) {

      const yPos = this.curveYPositions[ i ];

      if ( ( yPos > 0 ) && ( yPos < this.potentialGraph.graphHeight ) ) {

        // This point is on the graph, draw a line to it.
        context.lineTo( i + this.potentialGraph.graphXOrigin, yPos + AXES_ARROW_HEAD_HEIGHT );
      }
      else {

        // This line is off the graph - move to a good position from which to start or continue graphing.
        if ( yPos < 0 ) {
          context.moveTo( i + 1 + this.potentialGraph.graphXOrigin, AXES_ARROW_HEAD_HEIGHT );
        }
        else {
          context.lineTo(
            i + this.potentialGraph.graphXOrigin,
            this.potentialGraph.graphHeight + AXES_ARROW_HEAD_HEIGHT
          );
        }
      }
    }
    context.strokeStyle = this.strokeColor;
    context.lineWidth = 2;
    context.stroke();
  }

  /**
   * @param {Color} color
   * @public
   */
  update( color ) {
    this.strokeColor = color.toCSS();

    // Calculate the points that comprise the curve and record several key values along the way the will be used to
    // position the various arrows and labels.
    this.potentialGraph.graphMin.setXY( 0, 0 );
    this.potentialGraph.zeroCrossingPoint.setXY( 0, 0 );
    const sigmaHandleYPos = ( this.potentialGraph.getGraphHeight() / 2 ) -
                            2 * SIGMA_HANDLE_OFFSET_PROPORTION * this.potentialGraph.heightOfGraph;
    let sigmaHandleXPos = 0;
    const horizontalIndexMultiplier = this.potentialGraph.xRange / this.potentialGraph.graphWidth;
    let previousPotential = Number.POSITIVE_INFINITY;
    let previousYPos = Number.NEGATIVE_INFINITY;
    for ( let i = 1; i < this.potentialGraph.graphWidth; i++ ) {
      const potential = this.potentialGraph.calculateLennardJonesPotential( i * horizontalIndexMultiplier );
      const yPos = ( ( this.potentialGraph.graphHeight / 2 ) - ( potential * this.potentialGraph.verticalScalingFactor ) );

      // Record the data that will be used in the paintCanvas method to render the curve.
      this.curveYPositions[ i ] = yPos;

      // Record the position of the min Y value since the epsilon arrow needs to be positioned near this point.
      if ( yPos > this.potentialGraph.graphMin.y ) {
        this.potentialGraph.graphMin.setXY( i, yPos );
      }

      // Record the point where the sigma resize handle should be positioned.
      if ( yPos > sigmaHandleYPos && previousYPos < sigmaHandleYPos ) {
        sigmaHandleXPos = i;
      }

      // Record the zero crossing point since the sigma arrow will need to use it to set its size and position.
      if ( previousPotential > 0 && potential < 0 ) {
        this.potentialGraph.zeroCrossingPoint.setXY( i, this.potentialGraph.graphHeight / 2 );
      }
      previousPotential = potential;
      previousYPos = yPos;
    }

    // Position the epsilon arrow, which is a vertical double-headed arrow between the bottom of the well and the x axis.
    this.epsilonArrowStartPoint.setXY(
      this.potentialGraph.graphMin.x,
      this.potentialGraph.graphHeight / 2
    );
    if ( this.epsilonArrowStartPoint.distance( this.potentialGraph.graphMin ) > 5 ) {
      this.potentialGraph.epsilonArrow.setVisible( true );
      const doubleHead = this.potentialGraph.graphMin.y <= this.potentialGraph.graphHeight ||
                         this.potentialGraph.graphMin.y - 10 < this.potentialGraph.graphHeight;
      const tailY = this.potentialGraph.graphMin.y > this.potentialGraph.graphHeight ?
                    this.potentialGraph.graphHeight : this.potentialGraph.graphMin.y;
      this.potentialGraph.epsilonArrowShape = new ArrowShape(
        this.potentialGraph.graphMin.x,
        tailY,
        this.epsilonArrowStartPoint.x,
        this.epsilonArrowStartPoint.y,
        { doubleHead: doubleHead, headHeight: 5, headWidth: 6, tailWidth: 2 }
      );
      this.potentialGraph.epsilonArrow.setShape( this.potentialGraph.epsilonArrowShape );
    }
    else {
      // Don't show the arrow if there isn't enough space.
      this.potentialGraph.epsilonArrow.setVisible( false );
    }

    // Position the epsilon label.
    this.potentialGraph.epsilonLabel.left = this.potentialGraph.graphMin.x - 2;
    this.potentialGraph.epsilonLabel.bottom = this.potentialGraph.graphHeight / 2 - 2;

    // Position the arrow that depicts sigma, which is a horizontal double-headed arrow between the y axis and the
    // first point at which the potential crosses the x axis.
    this.potentialGraph.sigmaArrow.setTailAndTip(
      0,
      this.potentialGraph.graphHeight / 2,
      this.potentialGraph.zeroCrossingPoint.x,
      this.potentialGraph.zeroCrossingPoint.y
    );

    // Position the sigma label.
    this.potentialGraph.sigmaLabel.setTranslation(
      this.potentialGraph.zeroCrossingPoint.x / 2 - this.potentialGraph.sigmaLabel.width / 2,
      this.potentialGraph.graphHeight / 2 - this.potentialGraph.sigmaLabel.height / 3
    );

    // If the interaction potential graph includes a position marker, update its position in case the curve has moved.
    if ( this.potentialGraph.positionMarker ) {
      this.potentialGraph.setMarkerPosition( this.potentialGraph.markerDistance );
    }

    // Position the control handles if used.
    if ( this.potentialGraph.epsilonControls.arrow ) {
      const graphMin = this.potentialGraph.getGraphMin();
      this.potentialGraph.epsilonControls.line.setTranslation( graphMin.x, graphMin.y + EPSILON_LINE_WIDTH );
      this.potentialGraph.epsilonControls.arrow.setVisible( this.potentialGraph.interactionEnabled );
      this.potentialGraph.epsilonControls.line.setVisible( this.potentialGraph.interactionEnabled );
      this.potentialGraph.epsilonControls.arrow.centerX = this.potentialGraph.epsilonControls.line.right;
      this.potentialGraph.epsilonControls.arrow.centerY = this.potentialGraph.epsilonControls.line.centerY;
    }
    if ( this.potentialGraph.sigmaControls.arrow ) {
      this.potentialGraph.sigmaControls.arrow.centerX = sigmaHandleXPos;
      this.potentialGraph.sigmaControls.arrow.centerY = sigmaHandleYPos;
      this.potentialGraph.sigmaControls.arrow.setVisible( this.potentialGraph.interactionEnabled );
    }

    // indicate that this should be repainted during the next paint cycle
    this.invalidatePaint();
  }
}

statesOfMatter.register( 'InteractionPotentialCanvasNode', InteractionPotentialCanvasNode );
export default InteractionPotentialCanvasNode;