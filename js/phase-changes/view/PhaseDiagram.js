// Copyright (c) 2002 - 2014. University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // strings
  var solidString = require( 'string!STATES_OF_MATTER/solid' );
  var pressureString = require( 'string!STATES_OF_MATTER/pressure' );
  var gasString = require( 'string!STATES_OF_MATTER/gas' );
  var liquidString = require( 'string!STATES_OF_MATTER/liquid' );
  var temperatureString = require( 'string!STATES_OF_MATTER/temperature' );
  var phaseDiagramString = require( 'string!STATES_OF_MATTER/phaseDiagram' );
  var triplePointString = require( 'string!STATES_OF_MATTER/triplePoint' );
  var criticalPointString = require( 'string!STATES_OF_MATTER/criticalPoint' );


  // Constants that control the size of the canvas.
  var WIDTH = 148;
  var HEIGHT = (WIDTH * 0.75);

  // Constants that control the look of the axes.
  var AXES_LINE_WIDTH = 1;
  var AXES_ARROW_HEAD_HEIGHT = 8 * AXES_LINE_WIDTH;
  var HORIZ_AXIS_SIZE_PROPORTION = 0.85;
  var VERT_AXIS_SIZE_PROPORTION = 0.85;
  var STATES_MAX_WIDTH = 35;
  var SMALLER_INNER_TEXT_WIDTH = 30;

  // Constants that control the location of the origin for the graph.
  var X_ORIGIN_OFFSET = 0.10 * WIDTH;
  var Y_ORIGIN_OFFSET = 0.85 * HEIGHT;
  var X_USABLE_RANGE = WIDTH * HORIZ_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;
  var Y_USABLE_RANGE = HEIGHT * ( VERT_AXIS_SIZE_PROPORTION - 0.11 );

  // Font for the labels used on the axes.
  var AXIS_LABEL_FONT_SIZE = 12;
  var AXIS_LABEL_FONT = new PhetFont( AXIS_LABEL_FONT_SIZE );

  // Fonts for labels in the interior of the diagram.
  var LARGER_INNER_FONT_SIZE = 12;
  var LARGER_INNER_FONT = new PhetFont( LARGER_INNER_FONT_SIZE );
  var SMALLER_INNER_FONT_SIZE = 10;
  var SMALLER_INNER_FONT = new PhetFont( SMALLER_INNER_FONT_SIZE );


  // Constants that control the appearance of the phase diagram for the
  // various substances.  Note that all points are controlled as proportions
  // of the overall graph size and not as absolute values.
  var POINT_MARKER_DIAMETER = 4;
  var CURRENT_STATE_MARKER_DIAMETER = 4;
  var DEFAULT_TOP_OF_SOLID_LIQUID_LINE = new Vector2( X_USABLE_RANGE * 0.40 + X_ORIGIN_OFFSET,
    Y_ORIGIN_OFFSET - Y_USABLE_RANGE );
  var TOP_OF_SOLID_LIQUID_LINE_FOR_WATER = new Vector2( X_USABLE_RANGE * 0.30 + X_ORIGIN_OFFSET,
    Y_ORIGIN_OFFSET - Y_USABLE_RANGE );
  var DEFAULT_TRIPLE_POINT = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.35),
    Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.2) );
  var DEFAULT_CRITICAL_POINT = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.8),
    Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.45) );
  var DEFAULT_SOLID_LABEL_LOCATION = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.2),
    Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.7) );
  var DEFAULT_LIQUID_LABEL_LOCATION = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.6),
    Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.7) );
  var DEFAULT_GAS_LABEL_LOCATION = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.6),
    Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.1) );

  /**
   *
   * @param {Property<Boolean>} expandedProperty - is to expand the phase diagram
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function PhaseDiagram( expandedProperty, options ) {

    Node.call( this );
    var accordionContent = new Node();

    // Variable that defines the normalized position of the current phase
    // state marker.
    this.currentStateMarkerPos = new Vector2();

    // phase diagram.  The order in which these are added is important.
    this.topOfSolidLiquidLine = new Vector2( DEFAULT_TOP_OF_SOLID_LIQUID_LINE.x,
      DEFAULT_TOP_OF_SOLID_LIQUID_LINE.y );

    // gas area background
    this.gasAreaBackground = new Path( null, {
      fill: '#FFBC00',
      stroke: '#FFBC00'
    } );
    accordionContent.addChild( this.gasAreaBackground );

    // super critical  area background
    this.superCriticalAreaBackground = new Path( null, {
      fill: '#C3DF53'
    } );
    accordionContent.addChild( this.superCriticalAreaBackground );

    // liquid area background
    this.liquidAreaBackground = new Path( null, {
      fill: '#83FFB9'
    } );
    accordionContent.addChild( this.liquidAreaBackground );

    //solid area background
    this.solidAreaBackground = new Path( null, {
      fill: '#C6BCD7'
    } );
    accordionContent.addChild( this.solidAreaBackground );

    this.solidLiquidLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    accordionContent.addChild( this.solidLiquidLine );

    this.solidGasLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    accordionContent.addChild( this.solidGasLine );

    this.liquidGasLine = new Path( null, { lineWidth: 1, stroke: 'black' } );
    accordionContent.addChild( this.liquidGasLine );

    this.triplePoint = new Path( new Shape()
      .ellipse( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ), { fill: 'black' } );
    accordionContent.addChild( this.triplePoint );

    this.criticalPoint = new Path( new Shape()
      .ellipse( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ), { fill: 'black' } );
    accordionContent.addChild( this.criticalPoint );

    // Create the labels that will exist inside the phase diagram.
    this.solidLabel = new Text( solidString, { font: LARGER_INNER_FONT, fill: 'black' } );
    accordionContent.addChild( this.solidLabel );
    if ( this.solidLabel.width > STATES_MAX_WIDTH ) {
      this.solidLabel.scale( STATES_MAX_WIDTH / this.solidLabel.width );
    }

    this.liquidLabel = new Text( liquidString, { font: LARGER_INNER_FONT, fill: 'black' } );
    accordionContent.addChild( this.liquidLabel );
    if ( this.liquidLabel.width > STATES_MAX_WIDTH ) {
      this.liquidLabel.scale( STATES_MAX_WIDTH / this.liquidLabel.width );
    }

    this.gasLabel = new Text( gasString, { font: LARGER_INNER_FONT, fill: 'black' } );
    accordionContent.addChild( this.gasLabel );
    if ( this.gasLabel.width > STATES_MAX_WIDTH ) {
      this.gasLabel.scale( STATES_MAX_WIDTH / this.gasLabel.width );
    }

    this.triplePointLabel = new MultiLineText( triplePointString, { font: SMALLER_INNER_FONT, fill: 'black', align: 'right' } );
    accordionContent.addChild( this.triplePointLabel );
    if ( this.triplePointLabel.width > SMALLER_INNER_TEXT_WIDTH ) {
      this.triplePointLabel.setScaleMagnitude( SMALLER_INNER_TEXT_WIDTH / this.triplePointLabel.width );
    }

    this.criticalPointLabel = new MultiLineText( criticalPointString, { font: SMALLER_INNER_FONT, fill: 'black', align: 'right' } );
    accordionContent.addChild( this.criticalPointLabel );
    if ( this.criticalPointLabel.width > SMALLER_INNER_TEXT_WIDTH ) {
      this.criticalPointLabel.setScaleMagnitude( SMALLER_INNER_TEXT_WIDTH / this.criticalPointLabel.width );
    }

    var horizontalAxis = new ArrowNode( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET,
      X_ORIGIN_OFFSET + (HORIZ_AXIS_SIZE_PROPORTION * WIDTH), Y_ORIGIN_OFFSET,
      {
        fill: 'white',
        stroke: 'white',
        headHeight: 8,
        headWidth: 8,
        tailWidth: 2
      } );
    accordionContent.addChild( horizontalAxis );

    var verticalAxis = new ArrowNode( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET,
      X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET - Y_USABLE_RANGE - AXES_ARROW_HEAD_HEIGHT,
      {
        fill: 'white',
        stroke: 'white',
        headHeight: 8,
        headWidth: 8,
        tailWidth: 2
      } );
    accordionContent.addChild( verticalAxis );
    // Create and add the labels for the axes.
    var horizontalAxisLabel = new Text( temperatureString, { font: AXIS_LABEL_FONT, fill: 'white' } );
    if ( horizontalAxisLabel.width > horizontalAxis.width ) {
      horizontalAxisLabel.scale( horizontalAxis.width / horizontalAxisLabel.width );
    }
    horizontalAxisLabel.setTranslation( horizontalAxis.centerX - horizontalAxisLabel.width / 2, Y_ORIGIN_OFFSET + horizontalAxisLabel.height * 1.2 );
    accordionContent.addChild( horizontalAxisLabel );

    var verticalAxisLabel = new Text( pressureString, { font: AXIS_LABEL_FONT, fill: 'white' } );
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

    var titleNode = new Text( phaseDiagramString, { fill: "#FFFFFF", font: new PhetFont( { size: 13 } ) } );

    if ( titleNode.width > horizontalAxis.width ) {
      titleNode.scale( horizontalAxis.width / titleNode.width );
    }
    var accordionBox = new AccordionBox( accordionContent,
      {
        titleNode: titleNode,
        fill: 'black',
        stroke: 'white',
        expandedProperty: expandedProperty,
        contentAlign: 'center',
        titleAlignX: 'center',
        buttonAlign: 'left',
        cornerRadius: 4,
        contentYSpacing: -15,
        contentYMargin: 5,
        contentXMargin: 5,
        minWidth: 169,
        buttonYMargin: 4,
        buttonXMargin: 5,
        buttonLength: 12,
        buttonTouchAreaDilatedX: 15,
        buttonTouchAreaDilatedY: 5
      } );
    this.addChild( accordionBox );

    // Draw the initial phase diagram.
    this.drawPhaseDiagram();

    // Set the initial position of the current phase state marker.
    this.setStateMarkerPos( 0, 0 );
    this.mutate( options );
  }

  return inherit( Node, PhaseDiagram, {

    /**
     * @public
     */
    drawPhaseDiagram: function() {
      // Place the triple point marker.
      this.triplePoint.setTranslation( DEFAULT_TRIPLE_POINT.x - POINT_MARKER_DIAMETER / 2,
        DEFAULT_TRIPLE_POINT.y - POINT_MARKER_DIAMETER / 2 );

      // Add the curve that separates the solid and gaseous regions.
      var solidGasCurve = new Shape().moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .quadraticCurveTo( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.2), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.02),
        DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y );
      this.solidGasLine.setShape( solidGasCurve );

      // Add the line that separates solid and liquid.
      var solidLiquidLine = new Shape()
        .lineTo( DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
        .lineTo( this.topOfSolidLiquidLine.x, this.topOfSolidLiquidLine.y );
      this.solidLiquidLine.setShape( solidLiquidLine );

      // Update the shape of the background for the area that represents the solid phase.
      var solidBackground = new Shape().moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .quadraticCurveTo( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.2), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.02),
        DEFAULT_TRIPLE_POINT.x, DEFAULT_TRIPLE_POINT.y )
        .lineTo( this.topOfSolidLiquidLine.x, this.topOfSolidLiquidLine.y )
        .lineTo( X_ORIGIN_OFFSET, (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) )
        .lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET )
        .close();
      this.solidAreaBackground.setShape( solidBackground );

      // Place the critical point marker.
      this.criticalPoint.setTranslation( DEFAULT_CRITICAL_POINT.x - POINT_MARKER_DIAMETER / 2,
        DEFAULT_CRITICAL_POINT.y - POINT_MARKER_DIAMETER / 2 );

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
        .lineTo( (this.topOfSolidLiquidLine.x), (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) )
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
      this.solidLabel.setTranslation( DEFAULT_SOLID_LABEL_LOCATION.x - this.solidLabel.width / 2,
        DEFAULT_SOLID_LABEL_LOCATION.y - this.solidLabel.height / 2 );
      this.liquidLabel.setTranslation( DEFAULT_LIQUID_LABEL_LOCATION.x - this.liquidLabel.width / 2,
        DEFAULT_LIQUID_LABEL_LOCATION.y - this.liquidLabel.height / 2 );
      this.gasLabel.setTranslation( DEFAULT_GAS_LABEL_LOCATION.x - this.gasLabel.width / 2,
        DEFAULT_GAS_LABEL_LOCATION.y );
      this.triplePointLabel.setTranslation( DEFAULT_TRIPLE_POINT.x - this.triplePointLabel.width - 7,
        DEFAULT_TRIPLE_POINT.y - this.triplePointLabel.height );
      this.criticalPointLabel.setTranslation( DEFAULT_CRITICAL_POINT.x - this.criticalPointLabel.width - 7,
        DEFAULT_CRITICAL_POINT.y - this.criticalPointLabel.height * 0.9 );

    },

    /**
     * Set the normalized position for this marker.
     * @public
     * @param normalizedTemperature - Temperature (X position) value between 0 and 1 (inclusive).
     * @param normalizedPressure    - Pressure (Y position) value between 0 and 1 (inclusive).
     */
    setStateMarkerPos: function( normalizedTemperature, normalizedPressure ) {
      if ( (normalizedTemperature < 0) || (normalizedTemperature > 1.0) || (normalizedPressure < 0) ||
           (normalizedPressure > 1.0) ) {
        // Parameter out of range - throw exception.
        console.error( "Value out of range, temperature = " + normalizedTemperature + ", pressure = " +
                       normalizedPressure );
      }
      this.currentStateMarkerPos.setXY( normalizedTemperature, normalizedPressure );
      var markerXPos = normalizedTemperature * X_USABLE_RANGE + X_ORIGIN_OFFSET - (CURRENT_STATE_MARKER_DIAMETER / 2);
      var markerYPos = -normalizedPressure * Y_USABLE_RANGE + Y_ORIGIN_OFFSET - (CURRENT_STATE_MARKER_DIAMETER / 2);
      // marker from being partially off of the diagram.
      if ( markerXPos + CURRENT_STATE_MARKER_DIAMETER > (X_USABLE_RANGE + X_ORIGIN_OFFSET) ) {
        markerXPos = X_USABLE_RANGE + X_ORIGIN_OFFSET - CURRENT_STATE_MARKER_DIAMETER;
      }
      if ( markerYPos < Y_ORIGIN_OFFSET - Y_USABLE_RANGE ) {
        markerYPos = Y_ORIGIN_OFFSET - Y_USABLE_RANGE;
      }
      this.currentStateMarker.setTranslation( markerXPos, markerYPos + this.currentStateMarker.height / 3 );
    },

    /**
     * Set the visibility of the state marker.
     * @public
     * @param {Boolean} isVisible
     */
    setStateMarkerVisible: function( isVisible ) {
      this.currentStateMarker.setVisible( isVisible );
    },

    /**
     * Set the phase diagram to be shaped such that it looks like water, which
     * is to say that the solid-liquid line leans to the left rather than to
     * the right, as it does for most substances.  Note that this is a very
     * non-general approach - it would be more general to allow the various
     * points in the graph (e.g. triple point, critical point) to be
     * positioned anywhere, but currently it isn't worth the extra effort to
     * do so.  Feel free if it is ever needed.
     * @public
     * @param {Boolean} depictingWater
     */
    setDepictingWater: function( depictingWater ) {
      if ( depictingWater ) {
        this.topOfSolidLiquidLine.setXY( TOP_OF_SOLID_LIQUID_LINE_FOR_WATER.x, TOP_OF_SOLID_LIQUID_LINE_FOR_WATER.y );
      }
      else {
        this.topOfSolidLiquidLine.setXY( DEFAULT_TOP_OF_SOLID_LIQUID_LINE.x, DEFAULT_TOP_OF_SOLID_LIQUID_LINE.y );
      }
      this.drawPhaseDiagram();
    }

  } );
} );
