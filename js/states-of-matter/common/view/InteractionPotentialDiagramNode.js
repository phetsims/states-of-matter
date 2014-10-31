// Copyright 2002-2011, University of Colorado
/**
 * This class displays an interaction potential diagram.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var Ellipse2D = require( 'java.awt.geom.Ellipse2D' );
  var GeneralPath = require( 'java.awt.geom.GeneralPath' );
  var Line2D = require( 'java.awt.geom.Line2D' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var Rectangle = require( 'KITE/Rectangle' );
  var ArrayList = require( 'java.util.ArrayList' );
  var swing = require( 'javax.swing' );//.*
  var PhetCommonResources = require( 'edu.colorado.phet.common.phetcommon.resources.PhetCommonResources' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var ArrowNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ArrowNode' );
  var DoubleArrowNode = require( 'edu.colorado.phet.common.piccolophet.nodes.DoubleArrowNode' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var LjPotentialCalculator = require( 'STATES_OF_MATTER/states-of-matter/model/LjPotentialCalculator' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PPath = require( 'edu.umd.cs.piccolo.nodes.PPath' );
  var PText = require( 'edu.umd.cs.piccolo.nodes.PText' );
  var PPaintContext = require( 'edu.umd.cs.piccolo.util.PPaintContext' );
  var PSwing = require( 'edu.umd.cs.piccolox.pswing.PSwing' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// Constants that control the range of data that is graphed.
// In picometers.
  var MAX_INTER_ATOM_DISTANCE = 1200;
// Constants that control the appearance of the diagram.

  //private
  var NARROW_VERSION_WIDTH = 200;

  //private
  var WIDE_VERSION_WIDTH = 300;

  //private
  var AXIS_LINE_WIDTH = 1
  f;

  //private
  var AXIS_LINE_STROKE = new BasicStroke( AXIS_LINE_WIDTH );

  //private
  var AXIS_LINE_COLOR = Color.BLACK;

  //private
  var AXES_ARROW_HEAD_WIDTH = 5 * AXIS_LINE_WIDTH;

  //private
  var AXES_ARROW_HEAD_HEIGHT = 8 * AXIS_LINE_WIDTH;

  //private
  var ARROW_LINE_WIDTH = 0.50;

  //private
  var PARAM_ARROW_HEAD_WIDTH = 8 * ARROW_LINE_WIDTH;

  //private
  var PARAM_ARROW_HEAD_HEIGHT = 8 * ARROW_LINE_WIDTH;

  //private
  var POTENTIAL_ENERGY_LINE_WIDTH = 1.5
  f;

  //private
  var POTENTIAL_ENERGY_LINE_STROKE = new BasicStroke( POTENTIAL_ENERGY_LINE_WIDTH );

  //private
  var POTENTIAL_ENERGY_LINE_COLOR = Color.red;

  //private
  var DEFAULT_BACKGROUND_COLOR = Color.WHITE;

  //private
  var POSITION_MARKER_COLOR = Color.CYAN;
// Size of pos marker wrt overall width.

  //private
  var POSITION_MARKER_DIAMETER_PROPORTION = 0.03;

  //private
  var POSITION_MARKER_STROKE_WIDTH = 0.75
  f;

  //private
  var POSITION_MARKER_STROKE = new BasicStroke( POSITION_MARKER_STROKE_WIDTH );

  //private
  var CENTER_AXIS_LINE_COLOR = Color.LIGHT_GRAY;
// Size of button as fraction of diagram height.

  //private
  var CLOSE_BUTTON_PROPORTION = 0.11;
// Constants that control the location and size of the graph.

  //private
  var VERT_AXIS_SIZE_PROPORTION = 0.85;
// Font for the labels used on the axes and within the graph.

  //private
  var AXIS_LABEL_FONT_SIZE = 14;

  //private
  var AXIS_LABEL_FONT = new PhetFont( AXIS_LABEL_FONT_SIZE );

  //private
  var GREEK_LETTER_FONT_SIZE = 16;

  //private
  var GREEK_LETTER_FONT = new PhetFont( GREEK_LETTER_FONT_SIZE );

  /**
   * Constructor.
   *
   * @param sigma   - Initial value of sigma, a.k.a. the atom diameter
   * @param epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param wide    - True if the widescreen version of the graph is needed,
   *                false if not.
   */
  function InteractionPotentialDiagramNode( sigma, epsilon, wide, closable ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    this.m_width;
    this.m_height;

    //private
    this.m_sigma;

    //private
    this.m_epsilon;

    //private
    this.m_graphXOrigin;

    //private
    this.m_graphYOrigin;

    //private
    this.m_graphWidth;

    //private
    this.m_graphHeight;

    //private
    this.m_background;

    //private
    this.m_potentialEnergyLine;

    //private
    this.m_epsilonArrow;

    //private
    this.m_epsilonLabel;

    //private
    this.m_sigmaLabel;

    //private
    this.m_sigmaArrow;

    //private
    this.m_verticalScalingFactor;

    //private
    this.m_graphMin;

    //private
    this.m_zeroCrossingPoint;

    //private
    this.m_markerDistance;

    //private
    this.m_horizontalAxisLabel;

    //private
    this.m_LjPotentialCalculator;

    //private
    this._listeners = [];
    // Variables for controlling the appearance, visibility, and location of
    // the position marker.
    this.m_markerLayer;
    this.m_positionMarker;

    //private
    this.m_positionMarkerEnabled;
    // Layer where the graph elements are added.
    this.m_ljPotentialGraph;
    m_sigma = sigma;
    m_epsilon = epsilon;
    m_positionMarkerEnabled = false;
    m_graphMin = new Vector2( 0, 0 );
    m_zeroCrossingPoint = new Vector2( 0, 0 );
    m_markerDistance = 0;
    m_LjPotentialCalculator = new LjPotentialCalculator( m_sigma, m_epsilon );
    // Set up for the normal or wide version of the graph.
    if ( wide ) {
      m_width = WIDE_VERSION_WIDTH;
      m_height = m_width * 0.6;
    }
    else {
      m_width = NARROW_VERSION_WIDTH;
      m_height = m_width * 0.8;
    }
    m_graphXOrigin = 0.10 * m_width;
    m_graphYOrigin = 0.85 * m_height;
    m_graphWidth = m_width - m_graphXOrigin - AXES_ARROW_HEAD_HEIGHT;
    if ( closable ) {
      m_graphHeight = m_height * (VERT_AXIS_SIZE_PROPORTION - CLOSE_BUTTON_PROPORTION);
    }
    else {
      m_graphHeight = m_height * VERT_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;
    }
    m_verticalScalingFactor = m_graphHeight / 2 / (StatesOfMatterConstants.MAX_EPSILON * StatesOfMatterConstants.K_BOLTZMANN);
    // Create the background that will sit behind everything.
    m_background = new PPath( new Rectangle.Number( 0, 0, m_width, m_height ) );
    m_background.setPaint( DEFAULT_BACKGROUND_COLOR );
    addChild( m_background );
    // Create and add the portion that depicts the Lennard-Jones potential curve.
    m_ljPotentialGraph = new PPath( new Rectangle.Number( 0, 0, m_graphWidth, m_graphHeight ) );
    m_ljPotentialGraph.setOffset( m_graphXOrigin, m_graphYOrigin - m_graphHeight );
    m_ljPotentialGraph.setPaint( Color.WHITE );
    m_ljPotentialGraph.setStrokePaint( Color.WHITE );
    addChild( m_ljPotentialGraph );
    // Create and add the center axis line for the graph.
    var centerAxis = new PPath( new Line2D.Number( new Vector2( 0, 0 ), new Vector2( m_graphWidth, 0 ) ) );
    centerAxis.setStroke( AXIS_LINE_STROKE );
    centerAxis.setStrokePaint( CENTER_AXIS_LINE_COLOR );
    m_ljPotentialGraph.addChild( centerAxis );
    centerAxis.setOffset( 0, m_graphHeight / 2 );
    // Create and add the potential energy line.
    m_potentialEnergyLine = new PPath().withAnonymousClassBody( {
      // Override the rendering hints so that the segmented line can be
      // drawn smoothly.
      paint: function( paintContext ) {
        var g2 = paintContext.getGraphics();
        var oldHints = g2.getRenderingHints();
        g2.setRenderingHint( RenderingHints.KEY_STROKE_CONTROL, RenderingHints.VALUE_STROKE_PURE );
        super.paint( paintContext );
        g2.setRenderingHints( oldHints );
      }
    } );
    m_potentialEnergyLine.setStroke( POTENTIAL_ENERGY_LINE_STROKE );
    m_potentialEnergyLine.setStrokePaint( POTENTIAL_ENERGY_LINE_COLOR );
    m_ljPotentialGraph.addChild( m_potentialEnergyLine );
    // Add the arrows and labels that will depict sigma and epsilon.
    m_epsilonArrow = new DoubleArrowNode( new Vector2( 0, 0 ), new Vector2( 0, m_graphHeight / 2 ), PARAM_ARROW_HEAD_HEIGHT, PARAM_ARROW_HEAD_WIDTH, ARROW_LINE_WIDTH );
    m_epsilonArrow.setPaint( Color.BLACK );
    m_ljPotentialGraph.addChild( m_epsilonArrow );
    m_epsilonLabel = new PText( "ε" );
    m_epsilonLabel.setFont( GREEK_LETTER_FONT );
    m_ljPotentialGraph.addChild( m_epsilonLabel );
    m_sigmaLabel = new PText( "σ" );
    m_sigmaLabel.setFont( GREEK_LETTER_FONT );
    m_ljPotentialGraph.addChild( m_sigmaLabel );
    m_sigmaArrow = new DoubleArrowNode( new Vector2( 0, 0 ), new Vector2( 0, 0 ), PARAM_ARROW_HEAD_HEIGHT, PARAM_ARROW_HEAD_WIDTH, ARROW_LINE_WIDTH );
    m_sigmaArrow.setPaint( Color.BLACK );
    m_ljPotentialGraph.addChild( m_sigmaArrow );
    // Add the position marker.
    m_markerLayer = new Node();
    m_markerLayer.setOffset( m_graphXOrigin, m_graphYOrigin - m_graphHeight );
    addChild( m_markerLayer );
    var markerPath = new GeneralPath();
    var markerDiameter = POSITION_MARKER_DIAMETER_PROPORTION * m_graphWidth;
    markerPath.append( new Ellipse2D.Number( 0, 0, markerDiameter, markerDiameter ), false );
    //        markerPath.lineTo( (float)markerDiameter / 2, (float)markerDiameter );
    m_positionMarker = new PPath( markerPath );
    m_positionMarker.setStroke( POSITION_MARKER_STROKE );
    m_positionMarker.setPaint( POSITION_MARKER_COLOR );
    m_positionMarker.setVisible( m_positionMarkerEnabled );
    m_markerLayer.addChild( m_positionMarker );
    if ( closable ) {
      // Add the button that will allow the user to close the diagram.
      var closeButton = new JButton( new ImageIcon( PhetCommonResources.getInstance().getImage( PhetCommonResources.IMAGE_CLOSE_BUTTON ) ) );
      closeButton.addActionListener( new ActionListener().withAnonymousClassBody( {
        actionPerformed: function( e ) {
          notifyCloseRequestReceived();
        }
      } ) );
      var closePSwing = new PSwing( closeButton );
      closePSwing.setScale( getFullBoundsReference().height * CLOSE_BUTTON_PROPORTION / closePSwing.getFullBoundsReference().height );
      closePSwing.setOffset( m_width - closePSwing.getFullBoundsReference().width, 0 );
      addChild( closePSwing );
    }
    // Create and add the horizontal axis line for the graph.
    var horizontalAxis = new ArrowNode( new Vector2( 0, 0 ), new Vector2( m_graphWidth + AXES_ARROW_HEAD_HEIGHT, 0 ), AXES_ARROW_HEAD_HEIGHT, AXES_ARROW_HEAD_WIDTH, AXIS_LINE_WIDTH );
    horizontalAxis.setStroke( AXIS_LINE_STROKE );
    horizontalAxis.setPaint( AXIS_LINE_COLOR );
    horizontalAxis.setStrokePaint( AXIS_LINE_COLOR );
    horizontalAxis.setOffset( m_graphXOrigin, m_graphYOrigin );
    addChild( horizontalAxis );
    m_horizontalAxisLabel = new PText( StatesOfMatterStrings.INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_ATOMS );
    m_horizontalAxisLabel.setFont( AXIS_LABEL_FONT );
    addChild( m_horizontalAxisLabel );
    setMolecular( false );
    // Create and add the vertical axis line for the graph.
    var verticalAxis = new ArrowNode( new Vector2( 0, 0 ), new Vector2( 0, -m_graphHeight - AXES_ARROW_HEAD_HEIGHT ), AXES_ARROW_HEAD_HEIGHT, AXES_ARROW_HEAD_WIDTH, AXIS_LINE_WIDTH );
    verticalAxis.setStroke( AXIS_LINE_STROKE );
    verticalAxis.setPaint( AXIS_LINE_COLOR );
    verticalAxis.setStrokePaint( AXIS_LINE_COLOR );
    verticalAxis.setOffset( m_graphXOrigin, m_graphYOrigin );
    addChild( verticalAxis );
    var verticalAxisLabel = new PText( StatesOfMatterStrings.INTERACTION_POTENTIAL_GRAPH_Y_AXIS_LABEL );
    verticalAxisLabel.setFont( AXIS_LABEL_FONT );
    verticalAxisLabel.setOffset( m_graphXOrigin / 2 - (verticalAxisLabel.getFullBoundsReference().height / 2), m_graphYOrigin - (m_graphHeight / 2) + (verticalAxisLabel.getFullBoundsReference().width / 2) );
    verticalAxisLabel.rotate( 3 * Math.PI / 2 );
    addChild( verticalAxisLabel );
    // Draw the curve upon the graph.
    drawPotentialCurve();
  }

  return inherit( Node, InteractionPotentialDiagramNode, {
    /**
     * Set the parameters that define the shape of the Lennard-Jones
     * potential curve.
     *
     * @param sigma
     * @param epsilon
     */
    setLjPotentialParameters: function( sigma, epsilon ) {
      // Update the parameters.
      console.log( "sigma = " + sigma );
      console.log( "epsilon = " + epsilon );
      m_sigma = sigma;
      m_epsilon = epsilon;
      // Update the Lennard-Jones force calculator.
      m_LjPotentialCalculator.setEpsilon( m_epsilon );
      m_LjPotentialCalculator.setSigma( m_sigma );
      // Redraw the graph to reflect the new parameters.
      drawPotentialCurve();
    },
    addListener: function( listener ) {
      if ( !_listeners.contains( listener ) ) {
        _listeners.add( listener );
      }
    },
    getGraphHeight: function() {
      return m_graphHeight;
    },
    getGraphWidth: function() {
      return m_graphWidth;
    },
    getZeroCrossingPoint: function() {
      return m_zeroCrossingPoint;
    },
    getGraphMin: function() {
      return m_graphMin;
    },
    setMarkerEnabled: function( enabled ) {
      m_positionMarkerEnabled = enabled;
    },
    /**
     * Set the position of the position marker.  Note that is is only possible
     * to set the x axis position, which is distance.  The y axis position is
     * always on the LJ potential curve.
     *
     * @param distance - distance from the center of the interacting molecules.
     */
    setMarkerPosition: function( distance ) {
      m_markerDistance = distance;
      var xPos = m_markerDistance * (m_graphWidth / MAX_INTER_ATOM_DISTANCE);
      var potential = calculateLennardJonesPotential( m_markerDistance );
      var yPos = ((m_graphHeight / 2) - (potential * m_verticalScalingFactor));
      if ( m_positionMarkerEnabled && (xPos > 0) && (xPos < m_graphWidth) && (yPos > 0) && (yPos < m_graphHeight) ) {
        m_positionMarker.setVisible( true );
        m_positionMarker.setOffset( xPos - m_positionMarker.getFullBoundsReference().width / 2, yPos - m_positionMarker.getFullBoundsReference().getHeight() / 2 );
      }
      else {
        m_positionMarker.setVisible( false );
      }
    },
    /**
     * Get the range of values over which the potential curve is graphed.  It
     * is assumed to go from 0 to the value returned by this function.
     */
    getXAxisRange: function() {
      return MAX_INTER_ATOM_DISTANCE;
    },
    /**
     * Returns a value between 0 and 1 representing the fraction of the
     * overall node that is actually used for graphing in the x direction.
     * This is generally used for determining how to scale the graph when
     * used in an environment where the scale must match the surroundings.
     */
    getXAxisGraphProportion: function() {
      return m_graphWidth / m_width;
    },
    /**
     * Returns a values between 0 and 1 representing the fraction of the
     * overall node that exists to the left of the X axis.  This is generally
     * used for alignment and positioning of this node on a canvas.
     */
    getXAxisOffsetProportion: function() {
      return 1 - (m_graphWidth + AXES_ARROW_HEAD_HEIGHT) / m_width;
    },
    /**
     * Set whether the graph is showing the potential between individual atoms
     * or multi-atom molecules.
     *
     * @param molecular - true if graph is portraying molecules, false for
     *                  individual atoms.
     */
    setMolecular: function( molecular ) {
      if ( molecular ) {
        m_horizontalAxisLabel.setText( StatesOfMatterStrings.INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_MOLECULES );
      }
      else {
        m_horizontalAxisLabel.setText( StatesOfMatterStrings.INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_ATOMS );
      }
      m_horizontalAxisLabel.setOffset( m_graphXOrigin + (m_graphWidth / 2) - (m_horizontalAxisLabel.getFullBoundsReference().width / 2), m_graphYOrigin + (m_horizontalAxisLabel.getFullBoundsReference().height * 0.3) );
    },
    setBackgroundColor: function( newColor ) {
      m_background.setPaint( newColor );
      m_background.setStrokePaint( newColor );
    },
    /**
     * Calculate the Lennard-Jones potential for the given distance.
     *
     * @param radius
     * @return
     */

    //private
    calculateLennardJonesPotential: function( radius ) {
      return (m_LjPotentialCalculator.calculateLjPotential( radius ));
    },
    /**
     * Draw the curve that reflects the Lennard-Jones potential based upon the
     * current values for sigma and epsilon.
     */
    drawPotentialCurve: function() {
      var potentialEnergyLineShape = new GeneralPath();
      potentialEnergyLineShape.moveTo( 0, 0 );
      m_graphMin.setLocation( 0, 0 );
      m_zeroCrossingPoint.setLocation( 0, 0 );
      var horizontalIndexMultiplier = MAX_INTER_ATOM_DISTANCE / m_graphWidth;
      for ( var i = 1; i < m_graphWidth; i++ ) {
        var potential = calculateLennardJonesPotential( i * horizontalIndexMultiplier );
        var yPos = ((m_graphHeight / 2) - (potential * m_verticalScalingFactor));
        if ( (yPos > 0) && (yPos < m_graphHeight) ) {
          potentialEnergyLineShape.lineTo( i, (yPos) );
          if ( yPos > m_graphMin.getY() ) {
            // PNode.
            m_graphMin.setLocation( i, yPos );
          }
          if ( (potential > 0) || (m_zeroCrossingPoint.getX() == 0) ) {
            // zero crossing point.
            m_zeroCrossingPoint.setLocation( i, m_graphHeight / 2 );
          }
        }
        else {
          // Move to a good location from which to start graphing.
          potentialEnergyLineShape.moveTo( i + 1, 0 );
        }
      }
      m_potentialEnergyLine.setPathTo( potentialEnergyLineShape );
      var epsilonArrowStartPt = new Vector2( m_graphMin.getX(), m_graphHeight / 2 );
      if ( epsilonArrowStartPt.distance( m_graphMin ) > m_epsilonArrow.getHeadHeight() * 2 ) {
        m_epsilonArrow.setVisible( true );
        try {
          m_epsilonArrow.setTipAndTailLocations( m_graphMin, epsilonArrowStartPt );
        }
        catch( /*RuntimeException*/ r ) {
          System.err.println( "Error: Caught exception while positioning epsilon arrow - " + r );
        }
      }
      else {
        // Don't show the arrow if there isn't enough space.
        m_epsilonArrow.setVisible( false );
      }
      m_epsilonLabel.setOffset( m_graphMin.getX() + m_epsilonLabel.getFullBoundsReference().width * 0.5, ((m_graphMin.getY() - (m_graphHeight / 2)) / 3) - (m_epsilonLabel.getFullBoundsReference().height / 2) + m_graphHeight / 2 );
      // Position the arrow that depicts sigma along with its label.
      m_sigmaLabel.setOffset( m_zeroCrossingPoint.getX() / 2 - m_sigmaLabel.getFullBoundsReference().width / 2, m_graphHeight / 2 );
      try {
        m_sigmaArrow.setTipAndTailLocations( new Vector2( 0, m_graphHeight / 2 ), m_zeroCrossingPoint );
      }
      catch( /*RuntimeException*/ r ) {
        System.err.println( "Error: Caught exception while positioning sigma arrow - " + r );
      }
      // Update the position of the marker in case the curve has moved.
      setMarkerPosition( m_markerDistance );
    },
    /**
     * Notify listeners about a request to close this diagram.
     */

    //private
    notifyCloseRequestReceived: function() {
      for ( var _listener in _listeners ) {
        (_listener).closeRequestReceived();
      }
    }
  } );
} );

