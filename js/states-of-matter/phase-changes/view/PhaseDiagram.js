// Copyright 2002-2011, University of Colorado
/**
 * This class displays a phase diagram suitable for inclusion on the control
 * panel of a PhET simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension = require( 'java.awt.Dimension' );
  var Font = require( 'SCENERY/util/Font' );
  var GradientPaint = require( 'java.awt.GradientPaint' );
  var Paint = require( 'java.awt.Paint' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var Ellipse2D = require( 'java.awt.geom.Ellipse2D' );
  var GeneralPath = require( 'java.awt.geom.GeneralPath' );
  var Line2D = require( 'java.awt.geom.Line2D' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var QuadCurve2D = require( 'java.awt.geom.QuadCurve2D' );
  var ArrayList = require( 'java.util.ArrayList' );
  var ImageIcon = require( 'javax.swing.ImageIcon' );
  var JButton = require( 'javax.swing.JButton' );
  var PhetCommonResources = require( 'edu.colorado.phet.common.phetcommon.resources.PhetCommonResources' );
  var PhetUtilities = require( 'edu.colorado.phet.common.phetcommon.util.PhetUtilities' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var PhetPCanvas = require( 'edu.colorado.phet.common.piccolophet.PhetPCanvas' );
  var ArrowNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ArrowNode' );
  var HTMLNode = require( 'edu.colorado.phet.common.piccolophet.nodes.HTMLNode' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var CloseRequestListener = require( 'STATES_OF_MATTER/states-of-matter/module/CloseRequestListener' );
  var PPath = require( 'edu.umd.cs.piccolo.nodes.PPath' );
  var PText = require( 'edu.umd.cs.piccolo.nodes.PText' );
  var PSwing = require( 'edu.umd.cs.piccolox.pswing.PSwing' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// Constants that control the size of the canvas.

  //private
  var WIDTH = 200;

  //private
  var HEIGHT = (WIDTH * 0.8);
// Constants that control the look of the axes.

  //private
  var AXES_LINE_WIDTH = 1;

  //private
  var AXES_ARROW_HEAD_WIDTH = 5 * AXES_LINE_WIDTH;

  //private
  var AXES_ARROW_HEAD_HEIGHT = 8 * AXES_LINE_WIDTH;

  //private
  var HORIZ_AXIS_SIZE_PROPORTION = 0.88;

  //private
  var VERT_AXIS_SIZE_PROPORTION = 0.85;
// Constant for size of the close button.
// Button size as proportion of diagram height.

  //private
  var CLOSE_BUTTON_PROPORTION = 0.11;
// Constants that control the location of the origin for the graph.

  //private
  var X_ORIGIN_OFFSET = 0.10 * WIDTH;

  //private
  var Y_ORIGIN_OFFSET = 0.85 * HEIGHT;

  //private
  var X_USABLE_RANGE = WIDTH * HORIZ_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;

  //private
  var Y_USABLE_RANGE = HEIGHT * (VERT_AXIS_SIZE_PROPORTION - CLOSE_BUTTON_PROPORTION);
// Font for the labels used on the axes.

  //private
  var AXIS_LABEL_FONT_SIZE = 14;

  //private
  var AXIS_LABEL_FONT = new PhetFont( AXIS_LABEL_FONT_SIZE );
// Fonts for labels in the interior of the diagram.

  //private
  var LARGER_INNER_FONT_SIZE = 14;

  //private
  var LARGER_INNER_FONT = new PhetFont( LARGER_INNER_FONT_SIZE );

  //private
  var SMALLER_INNER_FONT_SIZE = 12;

  //private
  var SMALLER_INNER_FONT = new PhetFont( SMALLER_INNER_FONT_SIZE );
// Colors for the various sections of the diagram.

  //private
  var BACKGROUND_COLOR_FOR_SOLID = new Color( 0xC6BDD6 );

  //private
  var BACKGROUND_COLOR_FOR_LIQUID = new Color( 0x88FFBB );

  //private
  var BACKGROUND_COLOR_FOR_GAS = new Color( 0xFFBB00 );

  //private
  var CURRENT_STATE_MARKER_COLOR = Color.RED;
// Constants that control the appearance of the phase diagram for the
// various substances.  Note that all points are controlled as proportions
// of the overall graph size and not as absolute values.

  //private
  var POINT_MARKER_DIAMETER = 4;

  //private
  var CURRENT_STATE_MARKER_DIAMETER = 7;

  //private
  var DEFAULT_TOP_OF_SOLID_LIQUID_LINE = new Vector2( X_USABLE_RANGE * 0.40 + X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET - Y_USABLE_RANGE );

  //private
  var TOP_OF_SOLID_LIQUID_LINE_FOR_WATER = new Vector2( X_USABLE_RANGE * 0.30 + X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET - Y_USABLE_RANGE );

  //private
  var DEFAULT_TRIPLE_POINT = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.35), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.2) );

  //private
  var DEFAULT_CRITICAL_POINT = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.8), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.45) );

  //private
  var DEFAULT_SOLID_LABEL_LOCATION = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.2), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.72) );

  //private
  var DEFAULT_LIQUID_LABEL_LOCATION = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.6), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.60) );

  //private
  var DEFAULT_GAS_LABEL_LOCATION = new Vector2( X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.6), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.15) );

  /**
   * Constructor.
   */
  function PhaseDiagram() {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    // Variables that define the appearance of the phase diagram.

    //private
    this.m_triplePoint;

    //private
    this.m_criticalPoint;

    //private
    this.m_solidLiquidLine;

    //private
    this.m_solidGasLine;

    //private
    this.m_solidAreaBackground;

    //private
    this.m_liquidGasLine;

    //private
    this.m_liquidAreaBackground;

    //private
    this.m_solidLabel;

    //private
    this.m_liquidLabel;

    //private
    this.m_gasLabel;

    //private
    this.m_gasAreaBackground;

    //private
    this.m_superCriticalAreaBackground;

    //private
    this.m_triplePointLabel;

    //private
    this.m_criticalPointLabel;

    //private
    this.m_currentStateMarker;

    //private
    this.m_topOfSolidLiquidLine;
    // Variable that defines the normalized position of the current phase
    // state marker.
    this.m_currentStateMarkerPos;
    // Variables for implementing a button that can be used to hide the diagram.
    // Add the button that will allow the user to close (actually hide) the diagram.
    this.m_closeButton;
    this.m_closePSwing;
    // Et cetera

    //private
    this._listeners = [];
    m_currentStateMarkerPos = new Vector2();
    setPreferredSize( new Dimension( WIDTH, HEIGHT ) );
    setBackground( StatesOfMatterConstants.CONTROL_PANEL_COLOR );
    setBorder( null );
    // phase diagram.  The order in which these are added is important.
    m_topOfSolidLiquidLine = new Vector2( DEFAULT_TOP_OF_SOLID_LIQUID_LINE.getX(), DEFAULT_TOP_OF_SOLID_LIQUID_LINE.getY() );
    m_gasAreaBackground = new PPath();
    m_gasAreaBackground.setPaint( BACKGROUND_COLOR_FOR_GAS );
    m_gasAreaBackground.setStrokePaint( BACKGROUND_COLOR_FOR_GAS );
    addWorldChild( m_gasAreaBackground );
    m_superCriticalAreaBackground = new PPath();
    m_superCriticalAreaBackground.setPaint( getSuperCriticalRegionPaint() );
    m_superCriticalAreaBackground.setStrokePaint( getSuperCriticalRegionPaint() );
    addWorldChild( m_superCriticalAreaBackground );
    m_liquidAreaBackground = new PPath();
    m_liquidAreaBackground.setPaint( BACKGROUND_COLOR_FOR_LIQUID );
    m_liquidAreaBackground.setStrokePaint( BACKGROUND_COLOR_FOR_LIQUID );
    addWorldChild( m_liquidAreaBackground );
    m_solidAreaBackground = new PPath();
    m_solidAreaBackground.setPaint( BACKGROUND_COLOR_FOR_SOLID );
    m_solidAreaBackground.setStrokePaint( BACKGROUND_COLOR_FOR_SOLID );
    addWorldChild( m_solidAreaBackground );
    m_solidLiquidLine = new PPath();
    addWorldChild( m_solidLiquidLine );
    m_solidGasLine = new PPath();
    addWorldChild( m_solidGasLine );
    m_liquidGasLine = new PPath();
    addWorldChild( m_liquidGasLine );
    m_triplePoint = new PPath( new Ellipse2D.Number( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ) );
    m_triplePoint.setPaint( Color.BLACK );
    addWorldChild( m_triplePoint );
    m_criticalPoint = new PPath( new Ellipse2D.Number( 0, 0, POINT_MARKER_DIAMETER, POINT_MARKER_DIAMETER ) );
    m_criticalPoint.setPaint( Color.BLACK );
    addWorldChild( m_criticalPoint );
    // Create the labels that will exist inside the phase diagram.
    m_solidLabel = new PText( StatesOfMatterStrings.PHASE_DIAGRAM_SOLID );
    m_solidLabel.setFont( LARGER_INNER_FONT );
    addWorldChild( m_solidLabel );
    m_liquidLabel = new PText( StatesOfMatterStrings.PHASE_DIAGRAM_LIQUID );
    m_liquidLabel.setFont( LARGER_INNER_FONT );
    addWorldChild( m_liquidLabel );
    m_gasLabel = new PText( StatesOfMatterStrings.PHASE_DIAGRAM_GAS );
    m_gasLabel.setFont( LARGER_INNER_FONT );
    addWorldChild( m_gasLabel );
    m_triplePointLabel = new HTMLNode( StatesOfMatterStrings.PHASE_DIAGRAM_TRIPLE_POINT );
    m_triplePointLabel.setFont( SMALLER_INNER_FONT );
    addWorldChild( m_triplePointLabel );
    m_criticalPointLabel = new HTMLNode( StatesOfMatterStrings.PHASE_DIAGRAM_CRITICAL_POINT );
    m_criticalPointLabel.setFont( SMALLER_INNER_FONT );
    addWorldChild( m_criticalPointLabel );
    var horizontalAxis = new ArrowNode( new Vector2( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET ), new Vector2( X_ORIGIN_OFFSET + (HORIZ_AXIS_SIZE_PROPORTION * WIDTH), Y_ORIGIN_OFFSET ), AXES_ARROW_HEAD_HEIGHT, AXES_ARROW_HEAD_WIDTH, AXES_LINE_WIDTH );
    horizontalAxis.setPaint( Color.BLACK );
    addWorldChild( horizontalAxis );
    var verticalAxis = new ArrowNode( new Vector2( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET ), new Vector2( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET - Y_USABLE_RANGE - AXES_ARROW_HEAD_HEIGHT ), AXES_ARROW_HEAD_HEIGHT, AXES_ARROW_HEAD_WIDTH, AXES_LINE_WIDTH );
    verticalAxis.setPaint( Color.BLACK );
    addWorldChild( verticalAxis );
    // Create and add the labels for the axes.
    var horizontalAxisLabel = new PText( StatesOfMatterStrings.PHASE_DIAGRAM_X_AXIS_LABEL );
    horizontalAxisLabel.setFont( AXIS_LABEL_FONT );
    horizontalAxisLabel.setOffset( (WIDTH / 2) - (horizontalAxisLabel.getFullBoundsReference().width / 2), Y_ORIGIN_OFFSET + horizontalAxisLabel.getFullBoundsReference().height * 0.3 );
    addWorldChild( horizontalAxisLabel );
    var verticalAxisLabel = new PText( StatesOfMatterStrings.PHASE_DIAGRAM_Y_AXIS_LABEL );
    verticalAxisLabel.setFont( AXIS_LABEL_FONT );
    verticalAxisLabel.setOffset( X_ORIGIN_OFFSET - (verticalAxisLabel.getFullBoundsReference().height * 1.1), verticalAxisLabel.getFullBoundsReference().width * 1.6 );
    verticalAxisLabel.rotate( 3 * Math.PI / 2 );
    addWorldChild( verticalAxisLabel );
    // Create and add the marker that shows the current phase state.
    m_currentStateMarker = new PPath( new Ellipse2D.Number( 0, 0, CURRENT_STATE_MARKER_DIAMETER, CURRENT_STATE_MARKER_DIAMETER ) );
    m_currentStateMarker.setPaint( CURRENT_STATE_MARKER_COLOR );
    m_currentStateMarker.setStrokePaint( CURRENT_STATE_MARKER_COLOR );
    addWorldChild( m_currentStateMarker );
    // Add the button that will allow the user to close (actually hide) the diagram.
    m_closeButton = new JButton( new ImageIcon( PhetCommonResources.getInstance().getImage( PhetCommonResources.IMAGE_CLOSE_BUTTON ) ) );
    m_closeButton.addActionListener( new ActionListener().withAnonymousClassBody( {
      actionPerformed: function( e ) {
        notifyCloseRequestReceived();
      }
    } ) );
    m_closePSwing = new PSwing( m_closeButton );
    addWorldChild( m_closePSwing );
    // Draw the initial phase diagram.
    drawPhaseDiagram();
    // Set the initial position of the current phase state marker.
    setStateMarkerPos( 0, 0 );
  }

  return inherit( PhetPCanvas, PhaseDiagram, {
    addListener: function( listener ) {
      if ( !_listeners.contains( listener ) ) {
        _listeners.add( listener );
      }
    },

    //private
    drawPhaseDiagram: function() {
      // Place the triple point marker.
      m_triplePoint.setOffset( DEFAULT_TRIPLE_POINT.getX() - POINT_MARKER_DIAMETER / 2, DEFAULT_TRIPLE_POINT.getY() - POINT_MARKER_DIAMETER / 2 );
      // Add the curve that separates the solid and gaseous regions.
      var solidGasCurve = new QuadCurve2D.Number( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET, X_ORIGIN_OFFSET + (X_USABLE_RANGE * 0.2), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.02), DEFAULT_TRIPLE_POINT.getX(), DEFAULT_TRIPLE_POINT.getY() );
      m_solidGasLine.setPathTo( solidGasCurve );
      // Add the line that separates solid and liquid.
      var solidLiquidLine = new Line2D.Number( DEFAULT_TRIPLE_POINT.getX(), DEFAULT_TRIPLE_POINT.getY(), m_topOfSolidLiquidLine.getX(), m_topOfSolidLiquidLine.getY() );
      m_solidLiquidLine.setPathTo( solidLiquidLine );
      // Update the shape of the background for the area that represents the solid phase.
      var solidBackground = new GeneralPath( solidGasCurve );
      solidBackground.lineTo( m_topOfSolidLiquidLine.getX(), m_topOfSolidLiquidLine.getY() );
      solidBackground.lineTo( X_ORIGIN_OFFSET, (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) );
      solidBackground.lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET );
      solidBackground.closePath();
      m_solidAreaBackground.setPathTo( solidBackground );
      // Place the critical point marker.
      m_criticalPoint.setOffset( DEFAULT_CRITICAL_POINT.getX() - POINT_MARKER_DIAMETER / 2, DEFAULT_CRITICAL_POINT.getY() - POINT_MARKER_DIAMETER / 2 );
      // Add the curve that separates liquid and gas.
      var controlCurveXPos = DEFAULT_TRIPLE_POINT.getX() + ((DEFAULT_CRITICAL_POINT.getX() - DEFAULT_TRIPLE_POINT.getX()) / 2);
      var controlCurveYPos = DEFAULT_TRIPLE_POINT.getY();
      var liquidGasCurve = new QuadCurve2D.Number( DEFAULT_TRIPLE_POINT.getX(), DEFAULT_TRIPLE_POINT.getY(), controlCurveXPos, controlCurveYPos, DEFAULT_CRITICAL_POINT.getX(), DEFAULT_CRITICAL_POINT.getY() );
      m_liquidGasLine.setPathTo( liquidGasCurve );
      // liquid phase.  It is expected that the solid shape overlays this one.
      var liquidBackground = new GeneralPath( liquidGasCurve );
      liquidBackground.lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) );
      liquidBackground.lineTo( (m_topOfSolidLiquidLine.getX()), (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) );
      liquidBackground.lineTo( (DEFAULT_TRIPLE_POINT.getX()), (DEFAULT_TRIPLE_POINT.getY()) );
      liquidBackground.append( liquidGasCurve, true );
      liquidBackground.closePath();
      m_liquidAreaBackground.setPathTo( liquidBackground );
      // liquid phase.  It is expected that the liquid shape overlays this one.
      var gasBackground = new GeneralPath();
      gasBackground.moveTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET );
      gasBackground.lineTo( (DEFAULT_TRIPLE_POINT.getX()), (DEFAULT_TRIPLE_POINT.getY()) );
      gasBackground.lineTo( (DEFAULT_CRITICAL_POINT.getX()), (DEFAULT_CRITICAL_POINT.getY()) );
      gasBackground.lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET) );
      gasBackground.lineTo( X_ORIGIN_OFFSET, Y_ORIGIN_OFFSET );
      gasBackground.closePath();
      m_gasAreaBackground.setPathTo( gasBackground );
      // liquid phase.  It is expected that the liquid shape overlays this one.
      var superCriticalBackground = new GeneralPath();
      superCriticalBackground.moveTo( (DEFAULT_CRITICAL_POINT.getX()), (DEFAULT_CRITICAL_POINT.getY()) );
      superCriticalBackground.lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET) );
      superCriticalBackground.lineTo( (X_ORIGIN_OFFSET + X_USABLE_RANGE), (Y_ORIGIN_OFFSET - Y_USABLE_RANGE) );
      superCriticalBackground.lineTo( (DEFAULT_CRITICAL_POINT.getX()), (DEFAULT_CRITICAL_POINT.getY()) );
      superCriticalBackground.closePath();
      m_superCriticalAreaBackground.setPathTo( superCriticalBackground );
      // hopefully will work better for translated strings.
      m_solidLabel.setOffset( DEFAULT_SOLID_LABEL_LOCATION.getX() - m_solidLabel.getFullBoundsReference().width / 2, DEFAULT_SOLID_LABEL_LOCATION.getY() - m_solidLabel.getFullBoundsReference().height / 2 );
      m_liquidLabel.setOffset( DEFAULT_LIQUID_LABEL_LOCATION.getX() - m_liquidLabel.getFullBoundsReference().width / 2, DEFAULT_LIQUID_LABEL_LOCATION.getY() - m_liquidLabel.getFullBoundsReference().height / 2 );
      m_gasLabel.setOffset( DEFAULT_GAS_LABEL_LOCATION.getX() - m_gasLabel.getFullBoundsReference().width / 2, DEFAULT_GAS_LABEL_LOCATION.getY() - m_gasLabel.getFullBoundsReference().height / 2 );
      m_triplePointLabel.setOffset( DEFAULT_TRIPLE_POINT.getX() - m_triplePointLabel.getFullBoundsReference().width * 1.2, DEFAULT_TRIPLE_POINT.getY() - m_triplePointLabel.getFullBoundsReference().height * 0.9 );
      m_criticalPointLabel.setOffset( DEFAULT_CRITICAL_POINT.getX() + 4, DEFAULT_CRITICAL_POINT.getY() - m_criticalPointLabel.getFullBoundsReference().height / 2 );
      // Scale and position the close button.
      m_closePSwing.setScale( 1 );
      m_closePSwing.setScale( HEIGHT * CLOSE_BUTTON_PROPORTION / m_closePSwing.getFullBoundsReference().height );
      m_closePSwing.setOffset( WIDTH - m_closePSwing.getFullBoundsReference().width, 0 );
    },
    /**
     * Set the normalized position for this marker.
     *
     * @param normalizedTemperature - Temperature (X position) value between 0 and 1 (inclusive).
     * @param normalizedPressure    - Pressure (Y position) value between 0 and 1 (inclusive).
     */
    setStateMarkerPos: function( normalizedTemperature, normalizedPressure ) {
      if ( (normalizedTemperature < 0) || (normalizedTemperature > 1.0) || (normalizedPressure < 0) || (normalizedPressure > 1.0) ) {
        // Parameter out of range - throw exception.
        throw new IllegalArgumentException( "Value out of range, temperature = " + normalizedTemperature + ", pressure = " + normalizedPressure );
      }
      m_currentStateMarkerPos.setLocation( normalizedTemperature, normalizedPressure );
      var markerXPos = normalizedTemperature * X_USABLE_RANGE + X_ORIGIN_OFFSET - (CURRENT_STATE_MARKER_DIAMETER / 2);
      var markerYPos = -normalizedPressure * Y_USABLE_RANGE + Y_ORIGIN_OFFSET - (CURRENT_STATE_MARKER_DIAMETER / 2);
      // marker from being partially off of the diagram.
      if ( markerXPos + CURRENT_STATE_MARKER_DIAMETER > (X_USABLE_RANGE + X_ORIGIN_OFFSET) ) {
        markerXPos = X_USABLE_RANGE + X_ORIGIN_OFFSET - CURRENT_STATE_MARKER_DIAMETER;
      }
      if ( markerYPos < Y_ORIGIN_OFFSET - Y_USABLE_RANGE ) {
        markerYPos = Y_ORIGIN_OFFSET - Y_USABLE_RANGE;
      }
      m_currentStateMarker.setOffset( markerXPos, markerYPos );
    },
    /**
     * Set the visibility of the state marker.
     *
     * @param isVisible
     */
    setStateMarkerVisible: function( isVisible ) {
      m_currentStateMarker.setVisible( isVisible );
    },
    /**
     * Set the phase diagram to be shaped such that it looks like water, which
     * is to say that the solid-liquid line leans to the left rather than to
     * the right, as it does for most substances.  Note that this is a very
     * non-general approach - it would be more general to allow the various
     * points in the graph (e.g. triple point, critical point) to be
     * positioned anywhere, but currently it isn't worth the extra effort to
     * do so.  Feel free if it is ever needed.
     *
     * @param depictingWater
     */
    setDepictingWater: function( depictingWater ) {
      if ( depictingWater ) {
        m_topOfSolidLiquidLine.setLocation( TOP_OF_SOLID_LIQUID_LINE_FOR_WATER );
      }
      else {
        m_topOfSolidLiquidLine.setLocation( DEFAULT_TOP_OF_SOLID_LIQUID_LINE );
      }
      drawPhaseDiagram();
    },
    /**
     * Create a paint that is a good transition between the color in the gaseous
     * region and the color in the liquid region.
     */

    //private
    getSuperCriticalRegionPaint: function() {
      if ( PhetUtilities.getOperatingSystem() == PhetUtilities.OS_MACINTOSH ) {
        // color that is between the color of the two other regions.
        var red, green, blue;
        red = (BACKGROUND_COLOR_FOR_GAS.getRed() + BACKGROUND_COLOR_FOR_LIQUID.getRed()) / 2;
        green = (BACKGROUND_COLOR_FOR_GAS.getGreen() + BACKGROUND_COLOR_FOR_LIQUID.getGreen()) / 2;
        blue = (BACKGROUND_COLOR_FOR_GAS.getBlue() + BACKGROUND_COLOR_FOR_LIQUID.getBlue()) / 2;
        return (new Color( red, green, blue ));
      }
      else {
        var top = new Vector2( X_ORIGIN_OFFSET + (0.8 * X_USABLE_RANGE), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.9) );
        var bottom = new Vector2( X_ORIGIN_OFFSET + (0.8 * X_USABLE_RANGE), Y_ORIGIN_OFFSET - (Y_USABLE_RANGE * 0.1) );
        return new GradientPaint( bottom, BACKGROUND_COLOR_FOR_GAS, top, BACKGROUND_COLOR_FOR_LIQUID );
      }
    },
    /**
     * Notify listeners about a request to close this diagram.
     */

    //private
    notifyCloseRequestReceived: function() {
      for ( var listener in _listeners ) {
        (listener).closeRequestReceived();
      }
    }
  } );
} );

