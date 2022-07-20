// Copyright 2015-2022, University of Colorado Boulder

/**
 * Scenery node that shows the grid lines.  Highly leveraged from energy-skate-park's GridNode implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import ButtonNode from '../../../../sun/js/buttons/ButtonNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMColors from '../../common/view/SOMColors.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const MIN_LINES_HORIZONTAL = 5;
const GRID_LINES_OPTIONS = {
  stroke: SOMColors.ljGraphAxesAndGridColorProperty,
  lineWidth: 0.8,
  opacity: 0.6
};

class ZoomableGridNode extends Node {

  /**
   * @param atomsView
   * @param {number} offsetX
   * @param {number} offsetY
   * @param {number} width - width of the graph
   * @param {number} height - height of the graph
   * @param {Object} [options]
   */
  constructor( atomsView, offsetX, offsetY, width, height, options ) {

    options = merge( {
      addZoomButtons: true,
      tandem: Tandem.REQUIRED
    }, options );

    atomsView.horizontalLineCount = MIN_LINES_HORIZONTAL;

    super( options );

    // @private horizontal grid lines
    this.horizontalLinesNode = new Path( null, GRID_LINES_OPTIONS );

    // vertical grid lines
    const verticalLinesNode = new Path( null, GRID_LINES_OPTIONS );

    // @private - zoom level, passed in to the zoom button group if zoom is enabled
    this.zoomLevelProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'zoomFactorProperty' ),
      range: new Range( -2, 0 )
    } );

    if ( options.addZoomButtons ) {

      // Create the zoom button group that will allow the user to zoom in and out on the vertical range of the grid.
      const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup( this.zoomLevelProperty, {
        orientation: 'vertical',
        spacing: 5,

        // Position the zoom buttons to the left and top of the grid.  The numerical values were empirically determined
        // to match the design.
        right: offsetX - 15,
        top: offsetY - 5,

        magnifyingGlassNodeOptions: {
          glassRadius: 8
        },
        buttonOptions: {
          baseColor: '#FFD333',
          buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
          xMargin: 3,
          yMargin: 3
        },
        touchAreaXDilation: 8,
        touchAreaYDilation: 8,
        tandem: options.tandem.createTandem( 'zoomButtonGroup' )
      } );
      this.addChild( zoomButtonGroup );

      // Keep a record of the default scaling factor so that we can use it for scaling up and down.
      const nominalScalingFactor = atomsView.verticalScalingFactor;

      // Update the vertical scale of the graph as well as the number of horizontal lines when the zoom level changes.
      this.zoomLevelProperty.lazyLink( zoomFactor => {
        atomsView.horizontalLineCount = MIN_LINES_HORIZONTAL - 2 * zoomFactor; // empirically determined to look decent
        this.updateHorizontalLines( offsetX, offsetY, width, height, atomsView.horizontalLineCount );
        atomsView.verticalScalingFactor = nominalScalingFactor * Math.pow( 3.33, zoomFactor );
        atomsView.drawPotentialCurve();
      } );
    }

    // Add the vertical grid lines.
    const verticalLineShape = new Shape();
    for ( let x = 0; x < 4; x++ ) {
      const viewX = x * ( width / 3 );
      verticalLineShape.moveTo( viewX + offsetX, offsetY );
      verticalLineShape.lineTo( viewX + offsetX, height + offsetY );
    }
    verticalLinesNode.setShape( verticalLineShape );
    this.addChild( verticalLinesNode );

    // Add the horizontal grid lines.
    this.updateHorizontalLines( offsetX, offsetY, width, height, atomsView.horizontalLineCount );
    this.addChild( this.horizontalLinesNode );
  }

  /**
   * @param {number} offsetX
   * @param {number} offsetY
   * @param {number} width -- width of the grid
   * @param {number} height -- height of the grid
   * @param {number} horizontalLineCount -- number of horizontal lines
   * @public
   */
  updateHorizontalLines( offsetX, offsetY, width, height, horizontalLineCount ) {
    const horizontalLineShape = new Shape();
    for ( let y = 0; y < horizontalLineCount; y++ ) {
      const viewY = y * ( height / ( horizontalLineCount - 1 ) );
      horizontalLineShape.moveTo( offsetX, viewY + offsetY );
      horizontalLineShape.lineTo( width + offsetX, viewY + offsetY );
    }
    this.horizontalLinesNode.setShape( horizontalLineShape );
  }

  /**
   * restore initial state
   * @public
   */
  reset() {
    this.zoomLevelProperty.reset();
  }
}

statesOfMatter.register( 'ZoomableGridNode', ZoomableGridNode );
export default ZoomableGridNode;