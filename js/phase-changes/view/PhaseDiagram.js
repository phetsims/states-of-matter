// Copyright 2014-2022, University of Colorado Boulder

/**
 * A phase diagram that is specific to the needs of the States of Matter simulation.  This is not very general.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import SOMColors from '../../common/view/SOMColors.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';

const criticalPointString = StatesOfMatterStrings.criticalPoint;
const gasString = StatesOfMatterStrings.gas;
const liquidString = StatesOfMatterStrings.liquid;
const pressureString = StatesOfMatterStrings.pressure;
const solidString = StatesOfMatterStrings.solid;
const temperatureString = StatesOfMatterStrings.temperature;
const triplePointString = StatesOfMatterStrings.triplePoint;

// constants that control the size of the canvas, empirically determined to work well for the needs of the sim
const WIDTH = 148;
const HEIGHT = ( WIDTH * 0.75 );

// constants that control the look of the axes.
const AXES_LINE_WIDTH = 2;
const AXES_ARROW_HEAD_HEIGHT = 4 * AXES_LINE_WIDTH;
const AXES_ARROW_HEAD_WIDTH = 4 * AXES_LINE_WIDTH;
const HORIZ_AXIS_SIZE_PROPORTION = 0.85;
const VERT_AXIS_SIZE_PROPORTION = 0.85;
const LIQUID_AND_GAS_LABEL_MAX_WIDTH = 35;
const SOLID_LABEL_MAX_WIDTH = 30;  // has to be narrow enough to fit on the graph when modified for water
const SMALLER_INNER_TEXT_WIDTH = 30;

// constants that control the position of the origin for the graph.
const X_ORIGIN_OFFSET = 0.10 * WIDTH;
const Y_ORIGIN_OFFSET = 0.85 * HEIGHT;
const X_USABLE_RANGE = WIDTH * HORIZ_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;
const Y_USABLE_RANGE = HEIGHT * ( VERT_AXIS_SIZE_PROPORTION - 0.11 );

// font for the labels used on the axes.
const AXIS_LABEL_FONT_SIZE = 12;
const AXIS_LABEL_FONT = new PhetFont( AXIS_LABEL_FONT_SIZE );

// fonts for labels in the interior of the diagram.
const LARGER_INNER_FONT_SIZE = 12;
const LARGER_INNER_FONT = new PhetFont( LARGER_INNER_FONT_SIZE );
const SMALLER_INNER_FONT_SIZE = 10;
const SMALLER_INNER_FONT = new PhetFont( SMALLER_INNER_FONT_SIZE );

// constants that control the appearance of the phase diagram for the various substances.  Note that all points are
// controlled as proportions of the overall graph size and not as absolute values.
const POINT_MARKER_DIAMETER = 2.5;
const CURRENT_STATE_MARKER_DIAMETER = 3.5;
const DEFAULT_TOP_OF_SOLID_LIQUID_LINE = new Vector2(
  X_USABLE_RANGE * 0.40 + X_ORIGIN_OFFSET,
  Y_ORIGIN_OFFSET - Y_USABLE_RANGE
);
const TOP_OF_SOLID_LIQUID_LINE_FOR_WATER = new Vector2(
  X_USABLE_RANGE * 0.30 + X_ORIGIN_OFFSET,
  Y_ORIGIN_OFFSET - Y_USABLE_RANGE
);
const DEFAULT_TRIPLE_POINT = new Vector2(
  X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.35 ),
  Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.2 )
);
const DEFAULT_CRITICAL_POSITION = new Vector2(
  X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.8 ),
  Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.45 )
);
const DEFAULT_SOLID_LABEL_POSITION = new Vector2(
  X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.195 ),
  Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.9 )
);
const WATER_SOLID_LABEL_POSITION = new Vector2(
  X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.16 ),
  Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.9 )
);
const DEFAULT_LIQUID_LABEL_POSITION = new Vector2(
  X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.65 ),
  Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.9 )
);
const DEFAULT_GAS_LABEL_POSITION = new Vector2(
  X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.7 ),
  Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.15 )
);

class PhaseDiagram extends Node {

  constructor() {

    super();

    // @private - object where the components of the phase diagram are collected
    const diagramComponents = {};

    diagramComponents.gasAreaBackground = new Path( null, {
      fill: '#FFBC00',
      stroke: '#FFBC00'
    } );
    this.addChild( diagramComponents.gasAreaBackground );

    diagramComponents.superCriticalAreaBackground = new Path( null, {
      fill: '#C3DF53'
    } );
    this.addChild( diagramComponents.superCriticalAreaBackground );

    diagramComponents.liquidAreaBackground = new Path( null, {
      fill: '#83FFB9'
    } );
    this.addChild( diagramComponents.liquidAreaBackground );

    diagramComponents.solidAreaBackground = new Path( null, {
      fill: '#AB9CC4'
    } );
    this.addChild( diagramComponents.solidAreaBackground );

    diagramComponents.solidLiquidLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    this.addChild( diagramComponents.solidLiquidLine );

    diagramComponents.solidGasLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    this.addChild( diagramComponents.solidGasLine );

    diagramComponents.liquidGasLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    this.addChild( diagramComponents.liquidGasLine );

    diagramComponents.triplePoint = new Path( new Shape()
      .ellipse( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ), { fill: 'black' } );
    this.addChild( diagramComponents.triplePoint );

    diagramComponents.criticalPoint = new Path( new Shape()
      .ellipse( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ), { fill: 'black' } );
    this.addChild( diagramComponents.criticalPoint );

    diagramComponents.solidLabel = new Text( solidString, {
      font: LARGER_INNER_FONT,
      fill: 'black',
      maxWidth: SOLID_LABEL_MAX_WIDTH
    } );
    this.addChild( diagramComponents.solidLabel );

    const liquidLabel = new Text( liquidString, {
      font: LARGER_INNER_FONT,
      fill: 'black',
      maxWidth: LIQUID_AND_GAS_LABEL_MAX_WIDTH
    } );
    this.addChild( liquidLabel );

    const gasLabel = new Text( gasString, {
      font: LARGER_INNER_FONT,
      fill: 'black',
      maxWidth: LIQUID_AND_GAS_LABEL_MAX_WIDTH
    } );
    this.addChild( gasLabel );

    const triplePointLabel = new RichText( triplePointString, {
      font: SMALLER_INNER_FONT,
      fill: 'black',
      align: 'right'
    } );
    this.addChild( triplePointLabel );
    if ( triplePointLabel.width > SMALLER_INNER_TEXT_WIDTH ) {
      triplePointLabel.setScaleMagnitude(
        SMALLER_INNER_TEXT_WIDTH / triplePointLabel.width
      );
    }

    const criticalPointLabel = new RichText( criticalPointString, {
      font: SMALLER_INNER_FONT,
      fill: 'black',
      align: 'right',
      maxWidth: SMALLER_INNER_TEXT_WIDTH
    } );
    this.addChild( criticalPointLabel );

    const horizontalAxis = new ArrowNode(
      X_ORIGIN_OFFSET,
      Y_ORIGIN_OFFSET,
      X_ORIGIN_OFFSET + ( HORIZ_AXIS_SIZE_PROPORTION * WIDTH ),
      Y_ORIGIN_OFFSET,
      {
        fill: SOMColors.controlPanelTextProperty,
        stroke: SOMColors.controlPanelTextProperty,
        headHeight: AXES_ARROW_HEAD_HEIGHT,
        headWidth: AXES_ARROW_HEAD_WIDTH,
        tailWidth: AXES_LINE_WIDTH
      }
    );
    this.addChild( horizontalAxis );

    const verticalAxis = new ArrowNode(
      X_ORIGIN_OFFSET,
      Y_ORIGIN_OFFSET,
      X_ORIGIN_OFFSET,
      Y_ORIGIN_OFFSET - Y_USABLE_RANGE - AXES_ARROW_HEAD_HEIGHT,
      {
        fill: SOMColors.controlPanelTextProperty,
        stroke: SOMColors.controlPanelTextProperty,
        headHeight: AXES_ARROW_HEAD_HEIGHT,
        headWidth: AXES_ARROW_HEAD_WIDTH,
        tailWidth: AXES_LINE_WIDTH
      }
    );
    this.addChild( verticalAxis );

    // Create and add the labels for the axes.
    const horizontalAxisLabel = new Text( temperatureString, {
      font: AXIS_LABEL_FONT,
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: horizontalAxis.width
    } );
    horizontalAxisLabel.setTranslation( horizontalAxis.centerX - horizontalAxisLabel.width / 2, Y_ORIGIN_OFFSET + horizontalAxisLabel.height * 1.2 );
    this.addChild( horizontalAxisLabel );

    const verticalAxisLabel = new Text( pressureString, {
      font: AXIS_LABEL_FONT,
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: verticalAxis.height
    } );
    verticalAxisLabel.setTranslation( X_ORIGIN_OFFSET - ( verticalAxisLabel.height / 1.5 ), verticalAxis.centerY + verticalAxisLabel.width / 2 );
    verticalAxisLabel.setRotation( 3 * Math.PI / 2 );
    this.addChild( verticalAxisLabel );

    // Create and add the marker that shows the current phase state.
    diagramComponents.currentStateMarker = new Path(
      new Shape().ellipse( 0, 0, CURRENT_STATE_MARKER_DIAMETER, CURRENT_STATE_MARKER_DIAMETER ),
      { fill: 'red' }
    );
    this.addChild( diagramComponents.currentStateMarker );

    // @private - flag that indicates whether water is being depicted, which alters aspects of the diagram
    this.depictingWater = false;

    // @private - components of the phase diagram, updated as changes occur in the model
    this.diagramComponents = diagramComponents;

    // position the labels - some of the values were empirically determined for optimal layout
    liquidLabel.center = DEFAULT_LIQUID_LABEL_POSITION;
    gasLabel.center = DEFAULT_GAS_LABEL_POSITION;
    triplePointLabel.right = DEFAULT_TRIPLE_POINT.x - 7;
    triplePointLabel.bottom = DEFAULT_TRIPLE_POINT.y;
    criticalPointLabel.right = DEFAULT_CRITICAL_POSITION.x - 7;
    criticalPointLabel.bottom = DEFAULT_CRITICAL_POSITION.y;

    // Perform the initial drawing of the diagram.
    this.updateBackground();

    // Set the initial position of the current phase state marker.
    this.setStateMarkerPos( 0, 0 );
  }

  /**
   * Update the background of the phase diagram, i.e. the shapes and lines over which the marker is positioned.
   * @private
   */
  updateBackground() {

    // Handle the variations due to water vs. non-water
    const topOfSolidLiquidLine = this.depictingWater ?
                                 TOP_OF_SOLID_LIQUID_LINE_FOR_WATER :
                                 DEFAULT_TOP_OF_SOLID_LIQUID_LINE;
    const solidLabelCenter = this.depictingWater ? WATER_SOLID_LABEL_POSITION : DEFAULT_SOLID_LABEL_POSITION;

    // convenience variable
    const diagramComponents = this.diagramComponents;

    // Place the triple point marker.
    diagramComponents.triplePoint.setTranslation( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y );

    // Add the curve that separates the solid and gaseous regions.
    const solidGasCurve = new Shape()
      .moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
      .quadraticCurveTo(
        X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.2 ),
        Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.02 ),
        DEFAULT_TRIPLE_POINT.x,
        DEFAULT_TRIPLE_POINT.y
      );
    diagramComponents.solidGasLine.setShape( solidGasCurve );

    // Add the line that separates solid and liquid.
    const solidLiquidLine = new Shape()
      .lineTo( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
      .lineToPoint( topOfSolidLiquidLine );
    diagramComponents.solidLiquidLine.setShape( solidLiquidLine );

    // Update the shape of the background for the area that represents the solid phase.
    const solidBackground = new Shape()
      .moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
      .quadraticCurveTo(
        X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.2 ),
        Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.02 ),
        DEFAULT_TRIPLE_POINT.x,
        DEFAULT_TRIPLE_POINT.y
      )
      .lineToPoint( topOfSolidLiquidLine )
      .lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET - Y_USABLE_RANGE )
      .lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
      .close();
    diagramComponents.solidAreaBackground.setShape( solidBackground );

    // Place the critical point marker.
    diagramComponents.criticalPoint.setTranslation( DEFAULT_CRITICAL_POSITION.x, DEFAULT_CRITICAL_POSITION.y );

    // Add the curve that separates liquid and gas.
    const controlCurveXPos = DEFAULT_TRIPLE_POINT.x + ( ( DEFAULT_CRITICAL_POSITION.x - DEFAULT_TRIPLE_POINT.x ) / 2 );
    const controlCurveYPos = DEFAULT_TRIPLE_POINT.y;
    const liquidGasCurve = new Shape()
      .moveTo( DEFAULT_TRIPLE_POINT.x - 1, DEFAULT_TRIPLE_POINT.y )
      .quadraticCurveTo(
        controlCurveXPos,
        controlCurveYPos,
        DEFAULT_CRITICAL_POSITION.x,
        DEFAULT_CRITICAL_POSITION.y
      );
    diagramComponents.liquidGasLine.setShape( liquidGasCurve );

    // liquid phase (it is expected that the solid shape overlays this one)
    const liquidBackground = new Shape()
      .moveTo( DEFAULT_TRIPLE_POINT.x - 1, DEFAULT_TRIPLE_POINT.y )
      .quadraticCurveTo(
        controlCurveXPos,
        controlCurveYPos,
        DEFAULT_CRITICAL_POSITION.x,
        DEFAULT_CRITICAL_POSITION.y
      )
      .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET - Y_USABLE_RANGE )
      .lineTo( topOfSolidLiquidLine.x, Y_ORIGIN_OFFSET - Y_USABLE_RANGE )
      .lineTo( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
      .close();
    diagramComponents.liquidAreaBackground.setShape( liquidBackground );

    // gas phase
    const gasBackground = new Shape()
      .moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
      .lineToPoint( DEFAULT_TRIPLE_POINT )
      .lineToPoint( DEFAULT_CRITICAL_POSITION )
      .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET )
      .lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
      .close();
    diagramComponents.gasAreaBackground.setShape( gasBackground );

    const superCriticalBackground = new Shape()
      .moveToPoint( DEFAULT_CRITICAL_POSITION )
      .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET )
      .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET - Y_USABLE_RANGE )
      .lineToPoint( DEFAULT_CRITICAL_POSITION )
      .close();

    diagramComponents.superCriticalAreaBackground.setShape( superCriticalBackground );

    // reposition any labels the need it
    diagramComponents.solidLabel.center = solidLabelCenter;
  }

  /**
   * Set the normalized position for this marker.
   * @param normalizedTemperature - Temperature (X position) value between 0 and 1 (inclusive).
   * @param normalizedPressure    - Pressure (Y position) value between 0 and 1 (inclusive).
   * @public
   */
  setStateMarkerPos( normalizedTemperature, normalizedPressure ) {

    // parameter checking
    assert && assert( normalizedTemperature >= 0 && normalizedTemperature <= 1, 'temperature value out of range' );
    assert && assert( normalizedPressure >= 0 && normalizedPressure <= 1, 'pressure value out of range' );

    // map the normalized temperature and pressure values to x and y positions on the graph
    let markerXPos = normalizedTemperature * X_USABLE_RANGE + X_ORIGIN_OFFSET;
    let markerYPos = -normalizedPressure * Y_USABLE_RANGE + Y_ORIGIN_OFFSET;

    // prevent marker from going off graph on right side
    markerXPos = Math.min( markerXPos, X_USABLE_RANGE + X_ORIGIN_OFFSET - CURRENT_STATE_MARKER_DIAMETER );
    markerYPos = Math.max( markerYPos, Y_ORIGIN_OFFSET - Y_USABLE_RANGE - CURRENT_STATE_MARKER_DIAMETER );

    // set the position of the marker node
    this.diagramComponents.currentStateMarker.centerX = markerXPos;
    this.diagramComponents.currentStateMarker.centerY = markerYPos;
  }

  /**
   * Set the visibility of the state marker.
   * @param {boolean} isVisible
   * @public
   */
  setStateMarkerVisible( isVisible ) {
    this.diagramComponents.currentStateMarker.setVisible( isVisible );
  }

  /**
   * Set the phase diagram to be shaped such that it looks more like the phase diagram water, which is to say that the
   * solid-liquid line leans to the left rather than to the right.  Note that this is a very non-general approach - it
   * would be more general to allow the various points in the graph (e.g. triple point, critical point) to be
   * positioned anywhere, but currently it isn't worth the extra effort to do so.  Feel free if it is ever needed.
   * @param {boolean} depictingWater
   * @public
   */
  setDepictingWater( depictingWater ) {
    this.depictingWater = depictingWater;
    this.updateBackground();
  }
}

statesOfMatter.register( 'PhaseDiagram', PhaseDiagram );
export default PhaseDiagram;