// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class displays a phase diagram suitable for inclusion on the control
 * panel of a PhET simulation.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var criticalPointString = require( 'string!STATES_OF_MATTER/criticalPoint' );
  var gasString = require( 'string!STATES_OF_MATTER/gas' );
  var liquidString = require( 'string!STATES_OF_MATTER/liquid' );
  var phaseDiagramString = require( 'string!STATES_OF_MATTER/phaseDiagram' );
  var pressureString = require( 'string!STATES_OF_MATTER/pressure' );
  var solidString = require( 'string!STATES_OF_MATTER/solid' );
  var temperatureString = require( 'string!STATES_OF_MATTER/temperature' );
  var triplePointString = require( 'string!STATES_OF_MATTER/triplePoint' );

  // constants that control the size of the canvas.
  var WIDTH = 148;
  var HEIGHT = (WIDTH * 0.75);

  // constants that control the look of the axes.
  var AXES_LINE_WIDTH = 2;
  var AXES_ARROW_HEAD_HEIGHT = 4 * AXES_LINE_WIDTH;
  var HORIZ_AXIS_SIZE_PROPORTION = 0.85;
  var VERT_AXIS_SIZE_PROPORTION = 0.85;
  var LIQUID_AND_GAS_LABEL_MAX_WIDTH = 35;
  var SOLID_LABEL_MAX_WIDTH = 30; // has to be narrow enough to fit on the graph when modified for water
  var SMALLER_INNER_TEXT_WIDTH = 30;

  // constants that control the location of the origin for the graph.
  var X_ORIGIN_OFFSET = 0.10 * WIDTH;
  var Y_ORIGIN_OFFSET = 0.85 * HEIGHT;
  var X_USABLE_RANGE = WIDTH * HORIZ_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;
  var Y_USABLE_RANGE = HEIGHT * ( VERT_AXIS_SIZE_PROPORTION - 0.11 );

  // font for the labels used on the axes.
  var AXIS_LABEL_FONT_SIZE = 12;
  var AXIS_LABEL_FONT = new PhetFont( AXIS_LABEL_FONT_SIZE );

  // fonts for labels in the interior of the diagram.
  var LARGER_INNER_FONT_SIZE = 12;
  var LARGER_INNER_FONT = new PhetFont( LARGER_INNER_FONT_SIZE );
  var SMALLER_INNER_FONT_SIZE = 10;
  var SMALLER_INNER_FONT = new PhetFont( SMALLER_INNER_FONT_SIZE );

  // constants that control the appearance of the phase diagram for the various substances.  Note that all points are
  // controlled as proportions of the overall graph size and not as absolute values.
  var POINT_MARKER_DIAMETER = 2.5;
  var CURRENT_STATE_MARKER_DIAMETER = 3.5;
  var DEFAULT_TOP_OF_SOLID_LIQUID_LINE = new Vector2(
    X_USABLE_RANGE * 0.40 + X_ORIGIN_OFFSET,
    Y_ORIGIN_OFFSET - Y_USABLE_RANGE
  );
  var TOP_OF_SOLID_LIQUID_LINE_FOR_WATER = new Vector2(
    X_USABLE_RANGE * 0.30 + X_ORIGIN_OFFSET,
    Y_ORIGIN_OFFSET - Y_USABLE_RANGE
  );
  var DEFAULT_TRIPLE_POINT = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.35 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.2 )
  );
  var DEFAULT_CRITICAL_POINT = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.8 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.45 )
  );
  var DEFAULT_SOLID_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.19 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.75 )
  );
  var WATER_SOLID_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.16 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.75 )
  );
  var DEFAULT_LIQUID_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.65 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.75 )
  );
  var DEFAULT_GAS_LABEL_LOCATION = new Vector2(
    X_ORIGIN_OFFSET + ( X_USABLE_RANGE * 0.6 ),
    Y_ORIGIN_OFFSET - ( Y_USABLE_RANGE * 0.1 )
  );

  /**
   * @param {Property<boolean>} expandedProperty - is to expand the phase diagram
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function PhaseDiagram( expandedProperty, options ) {

    Node.call( this );
    var accordionContent = new Node();

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
    this.solidLabel = new Text( solidString, { font: LARGER_INNER_FONT, fill: 'black' } );
    accordionContent.addChild( this.solidLabel );
    if ( this.solidLabel.width > SOLID_LABEL_MAX_WIDTH ) {
      this.solidLabel.scale( SOLID_LABEL_MAX_WIDTH / this.solidLabel.width );
    }

    // @private
    this.liquidLabel = new Text( liquidString, { font: LARGER_INNER_FONT, fill: 'black' } );
    accordionContent.addChild( this.liquidLabel );
    if ( this.liquidLabel.width > LIQUID_AND_GAS_LABEL_MAX_WIDTH ) {
      this.liquidLabel.scale( LIQUID_AND_GAS_LABEL_MAX_WIDTH / this.liquidLabel.width );
    }

    // @private
    this.gasLabel = new Text( gasString, { font: LARGER_INNER_FONT, fill: 'black' } );
    accordionContent.addChild( this.gasLabel );
    if ( this.gasLabel.width > LIQUID_AND_GAS_LABEL_MAX_WIDTH ) {
      this.gasLabel.scale( LIQUID_AND_GAS_LABEL_MAX_WIDTH / this.gasLabel.width );
    }

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
      align: 'right'
    } );
    accordionContent.addChild( this.criticalPointLabel );
    if ( this.criticalPointLabel.width > SMALLER_INNER_TEXT_WIDTH ) {
      this.criticalPointLabel.setScaleMagnitude( SMALLER_INNER_TEXT_WIDTH / this.criticalPointLabel.width );
    }

    // @private - flag that indicates whether water is being depicted, which alters aspects of the diagram
    this.depictingWater = false;

    var horizontalAxis = new ArrowNode(
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

    var verticalAxis = new ArrowNode(
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
    var horizontalAxisLabel = new Text( temperatureString, {
      font: AXIS_LABEL_FONT,
      fill: SOMColorProfile.controlPanelTextProperty
    } );
    if ( horizontalAxisLabel.width > horizontalAxis.width ) {
      horizontalAxisLabel.scale( horizontalAxis.width / horizontalAxisLabel.width );
    }
    horizontalAxisLabel.setTranslation( horizontalAxis.centerX - horizontalAxisLabel.width / 2, Y_ORIGIN_OFFSET + horizontalAxisLabel.height * 1.2 );
    accordionContent.addChild( horizontalAxisLabel );

    var verticalAxisLabel = new Text( pressureString, {
      font: AXIS_LABEL_FONT,
      fill: SOMColorProfile.controlPanelTextProperty
    } );
    if ( verticalAxisLabel.width > verticalAxis.height ) {
      verticalAxisLabel.scale( verticalAxis.height / verticalAxisLabel.width );
    }
    verticalAxisLabel.setTranslation( X_ORIGIN_OFFSET - (verticalAxisLabel.height / 1.5  ), verticalAxis.centerY + verticalAxisLabel.width / 2 );
    verticalAxisLabel.setRotation( 3 * Math.PI / 2 );
    accordionContent.addChild( verticalAxisLabel );

    // Create and add the marker that shows the current phase state.
    this.currentStateMarker = new Path( new Shape()
      .ellipse( 0, 0, CURRENT_STATE_MARKER_DIAMETER, CURRENT_STATE_MARKER_DIAMETER ), { fill: 'red' } );
    accordionContent.addChild( this.currentStateMarker );

    var titleNode = new Text( phaseDiagramString, {
      fill: SOMColorProfile.controlPanelTextProperty,
      font: new PhetFont( { size: 13 } )
    } );

    if ( titleNode.width > horizontalAxis.width ) {
      titleNode.scale( horizontalAxis.width / titleNode.width );
    }
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
      buttonLength: 12,
      buttonTouchAreaXDilation: 15,
      buttonTouchAreaYDilation: 10
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
      var topOfSolidLiquidLine = this.depictingWater ?
                                 TOP_OF_SOLID_LIQUID_LINE_FOR_WATER :
                                 DEFAULT_TOP_OF_SOLID_LIQUID_LINE;
      var solidLabelLocation = this.depictingWater ? WATER_SOLID_LABEL_LOCATION : DEFAULT_SOLID_LABEL_LOCATION;

      // Place the triple point marker.
      this.triplePoint.setTranslation( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y );

      // Add the curve that separates the solid and gaseous regions.
      var solidGasCurve = new Shape().moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .quadraticCurveTo( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.2), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.02),
          DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y );
      this.solidGasLine.setShape( solidGasCurve );

      // Add the line that separates solid and liquid.
      var solidLiquidLine = new Shape()
        .lineTo( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
        .lineToPoint( topOfSolidLiquidLine );
      this.solidLiquidLine.setShape( solidLiquidLine );

      // Update the shape of the background for the area that represents the solid phase.
      var solidBackground = new Shape().moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .quadraticCurveTo( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.2), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.02),
          DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
        .lineToPoint( topOfSolidLiquidLine )
        .lineTo( X_ORIGIN_OFFSET, (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) )
        .lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .close();
      this.solidAreaBackground.setShape( solidBackground );

      // Place the critical point marker.
      this.criticalPoint.setTranslation( DEFAULT_CRITICAL_POINT.x,
        DEFAULT_CRITICAL_POINT.y );

      // Add the curve that separates liquid and gas.
      var controlCurveXPos = DEFAULT_TRIPLE_POINT.x + ((DEFAULT_CRITICAL_POINT.x - DEFAULT_TRIPLE_POINT.x) / 2);
      var controlCurveYPos = DEFAULT_TRIPLE_POINT.y;
      var liquidGasCurve = new Shape().moveTo( DEFAULT_TRIPLE_POINT.x - 1, DEFAULT_TRIPLE_POINT.y )
        .quadraticCurveTo( controlCurveXPos, controlCurveYPos,
          DEFAULT_CRITICAL_POINT.x, DEFAULT_CRITICAL_POINT.y );
      this.liquidGasLine.setShape( liquidGasCurve );

      // liquid phase.  (It is expected that the solid shape overlays this one. )
      var liquidBackground = new Shape().moveTo( DEFAULT_TRIPLE_POINT.x - 1, DEFAULT_TRIPLE_POINT.y )
        .quadraticCurveTo( controlCurveXPos, controlCurveYPos,
          DEFAULT_CRITICAL_POINT.x, DEFAULT_CRITICAL_POINT.y )
        .lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) )
        .lineTo( ( topOfSolidLiquidLine.x ), ( Y_ORIGIN_OFFSET - Y_USABLE_RANGE ) )
        .lineTo( (DEFAULT_TRIPLE_POINT.x), (DEFAULT_TRIPLE_POINT.y) ).close();
      this.liquidAreaBackground.setShape( liquidBackground );

      // gas phase
      var gasBackground = new Shape()
        .moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .lineTo( (DEFAULT_TRIPLE_POINT.x), (DEFAULT_TRIPLE_POINT.y) )
        .lineTo( (DEFAULT_CRITICAL_POINT.x), (DEFAULT_CRITICAL_POINT.y) )
        .lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET) )
        .lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .close();
      this.gasAreaBackground.setShape( gasBackground );

      var superCriticalBackground = new Shape()
        .moveTo( (DEFAULT_CRITICAL_POINT.x), (DEFAULT_CRITICAL_POINT.y) )
        .lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET) )
        .lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) )
        .lineTo( (DEFAULT_CRITICAL_POINT.x), (DEFAULT_CRITICAL_POINT.y) )
        .close();

      this.superCriticalAreaBackground.setShape( superCriticalBackground );

      // hopefully will work better for translated strings.
      this.solidLabel.setTranslation( solidLabelLocation.x - this.solidLabel.width / 2,
        solidLabelLocation.y - this.solidLabel.height / 2 );
      this.liquidLabel.setTranslation( DEFAULT_LIQUID_LABEL_LOCATION.x - this.liquidLabel.width / 2,
        DEFAULT_LIQUID_LABEL_LOCATION.y - this.liquidLabel.height / 2 );
      this.gasLabel.setTranslation( DEFAULT_GAS_LABEL_LOCATION.x - this.gasLabel.width / 2,
        DEFAULT_GAS_LABEL_LOCATION.y );
      this.triplePointLabel.setTranslation( DEFAULT_TRIPLE_POINT.x - this.triplePointLabel.width - 8,
        DEFAULT_TRIPLE_POINT.y - this.triplePointLabel.height );
      this.criticalPointLabel.setTranslation( DEFAULT_CRITICAL_POINT.x - this.criticalPointLabel.width - 8,
        DEFAULT_CRITICAL_POINT.y - this.criticalPointLabel.height * 0.9 );
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
      var markerXPos = normalizedTemperature * X_USABLE_RANGE + X_ORIGIN_OFFSET;
      var markerYPos = -normalizedPressure * Y_USABLE_RANGE + Y_ORIGIN_OFFSET;

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
