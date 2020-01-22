// Copyright 2014-2019, University of Colorado Boulder

/**
 * a phase diagram suitable for inclusion on the control panel of a PhET simulation
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Shape = require( 'KITE/Shape' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const criticalPointString = require( 'string!STATES_OF_MATTER/criticalPoint' );
  const gasString = require( 'string!STATES_OF_MATTER/gas' );
  const liquidString = require( 'string!STATES_OF_MATTER/liquid' );
  const phaseDiagramString = require( 'string!STATES_OF_MATTER/phaseDiagram' );
  const pressureString = require( 'string!STATES_OF_MATTER/pressure' );
  const solidString = require( 'string!STATES_OF_MATTER/solid' );
  const temperatureString = require( 'string!STATES_OF_MATTER/temperature' );
  const triplePointString = require( 'string!STATES_OF_MATTER/triplePoint' );

  // constants that control the size of the canvas.
  const WIDTH = 148;
  const HEIGHT = (WIDTH * 0.75);

  // constants that control the look of the axes.
  const AXES_LINE_WIDTH = 2;
  const AXES_ARROW_HEAD_HEIGHT = 4 * AXES_LINE_WIDTH;
  const HORIZ_AXIS_SIZE_PROPORTION = 0.85;
  const VERT_AXIS_SIZE_PROPORTION = 0.85;
  const LIQUID_AND_GAS_LABEL_MAX_WIDTH = 35;
  const SOLID_LABEL_MAX_WIDTH = 30;  // has to be narrow enough to fit on the graph when modified for water
  const SMALLER_INNER_TEXT_WIDTH = 30;

  // constants that control the location of the origin for the graph.
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
  const DEFAULT_CRITICAL_POINT = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.8 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.45 )
  );
  const DEFAULT_SOLID_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.195 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.9 )
  );
  const WATER_SOLID_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.16 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.9 )
  );
  const DEFAULT_LIQUID_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.65 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.9 )
  );
  const DEFAULT_GAS_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.7 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.15 )
  );

  /**
   * @param {Property<boolean>} expandedProperty - is to expand the phase diagram
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function PhaseDiagram( expandedProperty, options ) {

    Node.call( this );
    const accordionContent = new Node();

    // @private gas area background
    this.gasAreaBackground = new Path( null, {
      fill: '#FFBC00',
      stroke: '#FFBC00'
    } );
    accordionContent.addChild( this.gasAreaBackground );

    // @private super critical area background
    this.superCriticalAreaBackground = new Path( null, {
      fill: '#C3DF53'
    } );
    accordionContent.addChild( this.superCriticalAreaBackground );

    // @private liquid area background
    this.liquidAreaBackground = new Path( null, {
      fill: '#83FFB9'
    } );
    accordionContent.addChild( this.liquidAreaBackground );

    // @private solid area background
    this.solidAreaBackground = new Path( null, {
      fill: '#AB9CC4'
    } );
    accordionContent.addChild( this.solidAreaBackground );

    // @private
    this.solidLiquidLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    accordionContent.addChild( this.solidLiquidLine );

    // @private
    this.solidGasLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    accordionContent.addChild( this.solidGasLine );

    // @private
    this.liquidGasLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    accordionContent.addChild( this.liquidGasLine );

    // @private
    this.triplePoint = new Path( new Shape()
      .ellipse( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ), { fill: 'black' } );
    accordionContent.addChild( this.triplePoint );

    // @private
    this.criticalPoint = new Path( new Shape()
      .ellipse( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ), { fill: 'black' } );
    accordionContent.addChild( this.criticalPoint );

    // @private
    this.solidLabel = new Text( solidString, {
      font: LARGER_INNER_FONT,
      fill: 'black',
      maxWidth: SOLID_LABEL_MAX_WIDTH
    } );
    accordionContent.addChild( this.solidLabel );

    // @private
    this.liquidLabel = new Text( liquidString, {
      font: LARGER_INNER_FONT,
      fill: 'black',
      maxWidth: LIQUID_AND_GAS_LABEL_MAX_WIDTH
    } );
    accordionContent.addChild( this.liquidLabel );

    // @private
    this.gasLabel = new Text( gasString, {
      font: LARGER_INNER_FONT,
      fill: 'black',
      maxWidth: LIQUID_AND_GAS_LABEL_MAX_WIDTH
    } );
    accordionContent.addChild( this.gasLabel );

    // @private
    this.triplePointLabel = new MultiLineText( triplePointString, {
      font: SMALLER_INNER_FONT,
      fill: 'black',
      align: 'right'
    } );
    accordionContent.addChild( this.triplePointLabel );
    if ( this.triplePointLabel.width > SMALLER_INNER_TEXT_WIDTH ) {
      this.triplePointLabel.setScaleMagnitude( SMALLER_INNER_TEXT_WIDTH / this.triplePointLabel.width );
    }

    // @private
    this.criticalPointLabel = new MultiLineText( criticalPointString, {
      font: SMALLER_INNER_FONT,
      fill: 'black',
      align: 'right',
      maxWidth: SMALLER_INNER_TEXT_WIDTH
    } );
    accordionContent.addChild( this.criticalPointLabel );

    // @private - flag that indicates whether water is being depicted, which alters aspects of the diagram
    this.depictingWater = false;

    const horizontalAxis = new ArrowNode(
      X_ORIGIN_OFFSET,
      Y_ORIGIN_OFFSET,
      X_ORIGIN_OFFSET + (HORIZ_AXIS_SIZE_PROPORTION * WIDTH),
      Y_ORIGIN_OFFSET,
      {
        fill: SOMColorProfile.controlPanelTextProperty,
        stroke: SOMColorProfile.controlPanelTextProperty,
        headHeight: 8,
        headWidth: 8,
        tailWidth: AXES_LINE_WIDTH
      }
    );
    accordionContent.addChild( horizontalAxis );

    const verticalAxis = new ArrowNode(
      X_ORIGIN_OFFSET,
      Y_ORIGIN_OFFSET,
      X_ORIGIN_OFFSET,
      Y_ORIGIN_OFFSET - Y_USABLE_RANGE - AXES_ARROW_HEAD_HEIGHT,
      {
        fill: SOMColorProfile.controlPanelTextProperty,
        stroke: SOMColorProfile.controlPanelTextProperty,
        headHeight: 8,
        headWidth: 8,
        tailWidth: AXES_LINE_WIDTH
      }
    );
    accordionContent.addChild( verticalAxis );

    // Create and add the labels for the axes.
    const horizontalAxisLabel = new Text( temperatureString, {
      font: AXIS_LABEL_FONT,
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: horizontalAxis.width
    } );
    horizontalAxisLabel.setTranslation( horizontalAxis.centerX - horizontalAxisLabel.width / 2, Y_ORIGIN_OFFSET + horizontalAxisLabel.height * 1.2 );
    accordionContent.addChild( horizontalAxisLabel );

    const verticalAxisLabel = new Text( pressureString, {
      font: AXIS_LABEL_FONT,
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: verticalAxis.height
    } );
    verticalAxisLabel.setTranslation( X_ORIGIN_OFFSET - (verticalAxisLabel.height / 1.5  ), verticalAxis.centerY + verticalAxisLabel.width / 2 );
    verticalAxisLabel.setRotation( 3 * Math.PI / 2 );
    accordionContent.addChild( verticalAxisLabel );

    // Create and add the marker that shows the current phase state.
    this.currentStateMarker = new Path( new Shape()
      .ellipse( 0, 0, CURRENT_STATE_MARKER_DIAMETER, CURRENT_STATE_MARKER_DIAMETER ), { fill: 'red' } );
    accordionContent.addChild( this.currentStateMarker );

    const titleNode = new Text( phaseDiagramString, {
      fill: SOMColorProfile.controlPanelTextProperty,
      font: new PhetFont( { size: 13 } ),
      maxWidth: horizontalAxis.width
    } );

    this.accordionBox = new AccordionBox( accordionContent, {
      titleNode: titleNode,
      fill: SOMColorProfile.controlPanelBackgroundProperty,
      stroke: SOMColorProfile.controlPanelStrokeProperty,
      expandedProperty: expandedProperty,
      contentAlign: 'center',
      titleAlignX: 'center',
      buttonAlign: 'left',
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      contentYSpacing: -15,
      contentYMargin: 5,
      contentXMargin: 5,
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
      buttonYMargin: 4,
      buttonXMargin: 5,
      expandCollapseButtonOptions: {
        sideLength: 12,
        touchAreaXDilation: 15,
        touchAreaYDilation: 10
      },
      tandem: options.tandem.createTandem( 'accordionBox' )
    } );
    this.addChild( this.accordionBox );

    // Draw the initial phase diagram.
    this.drawPhaseDiagram();

    // Set the initial position of the current phase state marker.
    this.setStateMarkerPos( 0, 0 );
    this.mutate( options );
  }

  statesOfMatter.register( 'PhaseDiagram', PhaseDiagram );

  return inherit( Node, PhaseDiagram, {

    /**
     * @public
     */
    drawPhaseDiagram: function() {

      // Handle the variations due to water vs. non-water
      const topOfSolidLiquidLine = this.depictingWater ?
                                 TOP_OF_SOLID_LIQUID_LINE_FOR_WATER :
                                 DEFAULT_TOP_OF_SOLID_LIQUID_LINE;
      const solidLabelCenter = this.depictingWater ? WATER_SOLID_LABEL_LOCATION : DEFAULT_SOLID_LABEL_LOCATION;

      // Place the triple point marker.
      this.triplePoint.setTranslation( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y );

      // Add the curve that separates the solid and gaseous regions.
      const solidGasCurve = new Shape()
        .moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .quadraticCurveTo(
          X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.2 ),
          Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.02 ),
          DEFAULT_TRIPLE_POINT.x,
          DEFAULT_TRIPLE_POINT.y
        );
      this.solidGasLine.setShape( solidGasCurve );

      // Add the line that separates solid and liquid.
      const solidLiquidLine = new Shape()
        .lineTo( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
        .lineToPoint( topOfSolidLiquidLine );
      this.solidLiquidLine.setShape( solidLiquidLine );

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
      this.solidAreaBackground.setShape( solidBackground );

      // Place the critical point marker.
      this.criticalPoint.setTranslation( DEFAULT_CRITICAL_POINT.x, DEFAULT_CRITICAL_POINT.y );

      // Add the curve that separates liquid and gas.
      const controlCurveXPos = DEFAULT_TRIPLE_POINT.x + ( ( DEFAULT_CRITICAL_POINT.x - DEFAULT_TRIPLE_POINT.x ) / 2 );
      const controlCurveYPos = DEFAULT_TRIPLE_POINT.y;
      const liquidGasCurve = new Shape()
        .moveTo( DEFAULT_TRIPLE_POINT.x - 1, DEFAULT_TRIPLE_POINT.y )
        .quadraticCurveTo(
          controlCurveXPos,
          controlCurveYPos,
          DEFAULT_CRITICAL_POINT.x,
          DEFAULT_CRITICAL_POINT.y
        );
      this.liquidGasLine.setShape( liquidGasCurve );

      // liquid phase (it is expected that the solid shape overlays this one)
      const liquidBackground = new Shape()
        .moveTo( DEFAULT_TRIPLE_POINT.x - 1, DEFAULT_TRIPLE_POINT.y )
        .quadraticCurveTo(
          controlCurveXPos,
          controlCurveYPos,
          DEFAULT_CRITICAL_POINT.x,
          DEFAULT_CRITICAL_POINT.y
        )
        .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET - Y_USABLE_RANGE )
        .lineTo( topOfSolidLiquidLine.x, Y_ORIGIN_OFFSET - Y_USABLE_RANGE )
        .lineTo( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
        .close();
      this.liquidAreaBackground.setShape( liquidBackground );

      // gas phase
      const gasBackground = new Shape()
        .moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .lineToPoint( DEFAULT_TRIPLE_POINT )
        .lineToPoint( DEFAULT_CRITICAL_POINT )
        .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET )
        .lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .close();
      this.gasAreaBackground.setShape( gasBackground );

      const superCriticalBackground = new Shape()
        .moveToPoint( DEFAULT_CRITICAL_POINT )
        .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET )
        .lineTo( X_ORIGIN_OFFSET + X_USABLE_RANGE, Y_ORIGIN_OFFSET - Y_USABLE_RANGE )
        .lineToPoint( DEFAULT_CRITICAL_POINT )
        .close();

      this.superCriticalAreaBackground.setShape( superCriticalBackground );

      // position the labels - some of the values were empirically determined for optimal layout
      this.solidLabel.center = solidLabelCenter;
      this.liquidLabel.center = DEFAULT_LIQUID_LABEL_LOCATION;
      this.gasLabel.center = DEFAULT_GAS_LABEL_LOCATION;
      this.triplePointLabel.right = DEFAULT_TRIPLE_POINT.x - 7;
      this.triplePointLabel.bottom = DEFAULT_TRIPLE_POINT.y;
      this.criticalPointLabel.right = DEFAULT_CRITICAL_POINT.x - 7;
      this.criticalPointLabel.bottom = DEFAULT_CRITICAL_POINT.y;
    },

    /**
     * Set the normalized position for this marker.
     * @param normalizedTemperature - Temperature (X position) value between 0 and 1 (inclusive).
     * @param normalizedPressure    - Pressure (Y position) value between 0 and 1 (inclusive).
     * @public
     */
    setStateMarkerPos: function( normalizedTemperature, normalizedPressure ) {

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
      this.currentStateMarker.centerX = markerXPos;
      this.currentStateMarker.centerY = markerYPos;
    },

    /**
     * Set the visibility of the state marker.
     * @param {boolean} isVisible
     * @public
     */
    setStateMarkerVisible: function( isVisible ) {
      this.currentStateMarker.setVisible( isVisible );
    },

    /**
     * Set the phase diagram to be shaped such that it looks more like the phase diagram water, which is to say that the
     * solid-liquid line leans to the left rather than to the right.  Note that this is a very non-general approach - it
     * would be more general to allow the various points in the graph (e.g. triple point, critical point) to be
     * positioned anywhere, but currently it isn't worth the extra effort to do so.  Feel free if it is ever needed.
     * @param {boolean} depictingWater
     * @public
     */
    setDepictingWater: function( depictingWater ) {
      this.depictingWater = depictingWater;
      this.drawPhaseDiagram();
    }

  } );
} );
