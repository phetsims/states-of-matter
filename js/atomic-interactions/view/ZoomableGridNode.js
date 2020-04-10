// Copyright 2015-2020, University of Colorado Boulder

/**
 * Scenery node that shows the grid lines.  Highly leveraged from energy-skate-park's GridNode implementation.
 *
 * @author Sam Reid
 * @author Siddhartha Chinthapally
 */

import merge from '../../../../phet-core/js/merge.js';
import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import ZoomButton from '../../../../scenery-phet/js/buttons/ZoomButton.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RectangularButtonView from '../../../../sun/js/buttons/RectangularButtonView.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const MAX_LINES_HORIZONTAL = 9;
const MIN_LINES_HORIZONTAL = 5;
const ZOOM_INCREMENT = 2; // lines per zoom

/**
 * @param atomsView
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {number} width - width of the graph
 * @param {number} height - height of the graph
 * @param {Object} [options]
 * @constructor
 */
function ZoomableGridNode( atomsView, offsetX, offsetY, width, height, options ) {

  options = merge( {
    addZoomButtons: true,
    tandem: Tandem.REQUIRED
  }, options );

  Node.call( this, options );
  const self = this;
  atomsView.horizontalLineCount = MIN_LINES_HORIZONTAL;

  // @private horizontal grid lines
  this.horizontalLinesNode = new Path( null, {
    stroke: 'white',
    lineWidth: 0.8,
    opacity: 0.6
  } );

  // @private vertical grid lines
  this.verticalLinesNode = new Path( null, {
    stroke: 'white',
    lineWidth: 0.8,
    opacity: 0.6
  } );

  if ( options.addZoomButtons ) {

    // @private zoom in button
    this.zoomInButton = new ZoomButton( {
      listener: function() {
        atomsView.horizontalLineCount -= ZOOM_INCREMENT;
        self.setHorizontalLines( offsetX, offsetY, width, height, atomsView.horizontalLineCount );
        atomsView.verticalScalingFactor *= 3.33;
        atomsView.drawPotentialCurve();
      },
      baseColor: '#FFD333',
      radius: 8,
      xMargin: 3,
      yMargin: 3,
      disabledBaseColor: '#EDEDED',
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
      touchAreaXDilation: 10,
      touchAreaYDilation: 8,
      touchAreaYShift: -7,
      tandem: options.tandem.createTandem( 'zoomInButton' )
    } );
    this.zoomInButton.enabled = false;

    // @private zoom out button
    this.zoomOutButton = new ZoomButton( {
      listener: function() {
        atomsView.horizontalLineCount += ZOOM_INCREMENT;
        self.setHorizontalLines( offsetX, offsetY, width, height, atomsView.horizontalLineCount );
        atomsView.verticalScalingFactor /= 3.33;
        atomsView.drawPotentialCurve();
      },
      baseColor: '#FFD333',
      radius: 8,
      xMargin: 3,
      yMargin: 3,
      disabledBaseColor: '#EDEDED',
      buttonAppearanceStrategy: RectangularButtonView.FlatAppearanceStrategy,
      in: false,
      touchAreaXDilation: 10,
      touchAreaYDilation: 8,
      touchAreaYShift: 7,
      tandem: options.tandem.createTandem( 'zoomOutButton' )
    } );
    this.zoomOutButton.enabled = true;
    this.addChild( this.zoomInButton );
    this.addChild( this.zoomOutButton );
  }

  this.addChild( this.horizontalLinesNode );
  this.addChild( this.verticalLinesNode );

  this.verticalLines = [];
  for ( let x = 0; x < 4; x++ ) {
    const viewX = x * ( width / 3 );
    this.verticalLines.push( {
      x1: viewX + offsetX, y1: offsetY,
      x2: viewX + offsetX, y2: height + offsetY
    } );
  }
  const verticalLineShape = new Shape();
  let line;
  for ( var i = 0; i < this.verticalLines.length; i++ ) {
    line = this.verticalLines[ i ];
    verticalLineShape.moveTo( line.x1, line.y1 );
    verticalLineShape.lineTo( line.x2, line.y2 );
  }
  this.verticalLinesNode.setShape( verticalLineShape );

  this.horizontalLines = [];
  for ( let y = 0; y < atomsView.horizontalLineCount; y++ ) {
    const viewY = y * ( height / ( atomsView.horizontalLineCount - 1 ) );
    this.horizontalLines.push( {
      x1: offsetX,
      y1: viewY + offsetY,
      x2: width + offsetX,
      y2: viewY + offsetY
    } );
  }
  const horizontalLineShape = new Shape();
  for ( i = 0; i < this.horizontalLines.length; i++ ) {
    line = this.horizontalLines[ i ];
    horizontalLineShape.moveTo( line.x1, line.y1 );
    horizontalLineShape.lineTo( line.x2, line.y2 );
  }
  this.horizontalLinesNode.setShape( horizontalLineShape );
}

statesOfMatter.register( 'ZoomableGridNode', ZoomableGridNode );

export default inherit( Node, ZoomableGridNode, {

  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @param {number} width -- width of the grid
   * @param {number} height -- height of the grid
   * @param {number} horizontalLineCount -- number of horizontal lines
   * @public
   */
  setHorizontalLines: function( offsetX, offsetY, width, height, horizontalLineCount ) {

    this.horizontalLines = [];
    for ( let y = 0; y < horizontalLineCount; y++ ) {
      const viewY = y * ( height / ( horizontalLineCount - 1 ) );
      this.horizontalLines.push( {
        x1: offsetX,
        y1: viewY + offsetY,
        x2: width + offsetX,
        y2: viewY + offsetY
      } );
    }
    const horizontalLineShape = new Shape();
    let line;
    for ( let i = 0; i < this.horizontalLines.length; i++ ) {
      line = this.horizontalLines[ i ];
      horizontalLineShape.moveTo( line.x1, line.y1 );
      horizontalLineShape.lineTo( line.x2, line.y2 );
    }
    this.horizontalLinesNode.setShape( horizontalLineShape );
    if ( this.zoomOutButton ) {
      this.zoomOutButton.enabled = ( horizontalLineCount < MAX_LINES_HORIZONTAL );
    }
    if ( this.zoomInButton ) {
      this.zoomInButton.enabled = ( horizontalLineCount > MIN_LINES_HORIZONTAL );
    }
  }
} );