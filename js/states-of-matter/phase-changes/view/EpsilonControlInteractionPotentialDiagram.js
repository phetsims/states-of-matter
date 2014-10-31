// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class extends the Interaction Potential diagram to allow the user to
 * adjust the interaction strength parameter (i.e. epsilon).
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BasicStroke = require( 'java.awt.BasicStroke' );
  var Color = require( 'SCENERY/util/Color' );
  var Cursor = require( 'java.awt.Cursor' );
  var Stroke = require( 'java.awt.Stroke' );
  var Line2D = require( 'java.awt.geom.Line2D' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var CursorHandler = require( 'edu.colorado.phet.common.piccolophet.event.CursorHandler' );
  var ResizeArrowNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ResizeArrowNode' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/states-of-matter/module/InteractionPotentialDiagramNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PBasicInputEventHandler = require( 'edu.umd.cs.piccolo.event.PBasicInputEventHandler' );
  var PInputEvent = require( 'edu.umd.cs.piccolo.event.PInputEvent' );
  var PPath = require( 'edu.umd.cs.piccolo.nodes.PPath' );
  var PDimension = require( 'edu.umd.cs.piccolo.util.PDimension' );

//-----------------------------------------------------------------------------
// Class Data
//-----------------------------------------------------------------------------
// Size of handles as function of node width.

  //private
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.12;
// Position of handle as function of node width.

  //private
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;

  //private
  var RESIZE_HANDLE_NORMAL_COLOR = Color.GREEN;

  //private
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = Color.YELLOW;

  //private
  var EPSILON_LINE_WIDTH = 1
  f;

  //private
  var EPSILON_LINE_STROKE = new BasicStroke( EPSILON_LINE_WIDTH );

  //private
  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;

  /**
   * Constructor.
   *
   * @param sigma
   * @param epsilon
   * @param wide    - True if the widescreen version of the graph is needed, false if not.
   */
  function EpsilonControlInteractionPotentialDiagram( sigma, epsilon, wide, model ) {
    //-----------------------------------------------------------------------------
    // Instance Data
    //-----------------------------------------------------------------------------

    //private
    this.m_model;

    //private
    this.m_epsilonResizeHandle;

    //private
    this.m_epsilonLine;

    //private
    this.m_interactionEnabled;
    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, true );
    this.m_model = model;
    model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      interactionStrengthChanged: function() {
        setLjPotentialParameters( m_model.getSigma(), m_model.getEpsilon() );
      },
      moleculeTypeChanged: function() {
        updateInteractivityState();
        drawPotentialCurve();
      }
    } ) );
    // changing the value of epsilon.
    var epsilonChangeHandler = new PBasicInputEventHandler().withAnonymousClassBody( {
      mouseDragged: function( event ) {
        var draggedNode = event.getPickedNode();
        var d = event.getDeltaRelativeTo( draggedNode );
        draggedNode.localToParent( d );
        var scaleFactor = StatesOfMatterConstants.MAX_EPSILON / (getGraphHeight() / 2);
        m_model.setEpsilon( m_model.getEpsilon() + d.getHeight() * scaleFactor );
      }
    } );
    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * m_width * 2.2;
    m_epsilonLine = new PPath( new Line2D.Number( -epsilonLineLength / 3, 0, epsilonLineLength / 2, 0 ) );
    m_epsilonLine.setStroke( EPSILON_LINE_STROKE );
    m_epsilonLine.setStrokePaint( EPSILON_LINE_COLOR );
    m_epsilonLine.addInputEventListener( new CursorHandler( Cursor.N_RESIZE_CURSOR ) );
    m_epsilonLine.addInputEventListener( epsilonChangeHandler );
    m_ljPotentialGraph.addChild( m_epsilonLine );
    // the epsilon parameter.
    m_epsilonResizeHandle = new ResizeArrowNode( RESIZE_HANDLE_SIZE_PROPORTION * m_width, Math.PI / 2, RESIZE_HANDLE_NORMAL_COLOR, RESIZE_HANDLE_HIGHLIGHTED_COLOR );
    m_ljPotentialGraph.addChild( m_epsilonResizeHandle );
    m_epsilonResizeHandle.addInputEventListener( epsilonChangeHandler );
    // Update interactivity state.
    updateInteractivityState();
  }

  return inherit( InteractionPotentialDiagramNode, EpsilonControlInteractionPotentialDiagram, {
//-----------------------------------------------------------------------------
// Accessor Methods
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// Other Public/Protected Methods
//-----------------------------------------------------------------------------
    /**
     * This is an override of the method in the base class that draws the
     * curve on the graph, and this override draws the controls that allow
     * the user to interact with the graph.
     */
    drawPotentialCurve: function() {
      // The bulk of the drawing is done by the base class.
      super.drawPotentialCurve();
      // Now position the control handles.
      if ( m_epsilonResizeHandle != null ) {
        var graphMin = getGraphMin();
        m_epsilonResizeHandle.setOffset( graphMin.getX() + (m_width * EPSILON_HANDLE_OFFSET_PROPORTION), graphMin.getY() );
        m_epsilonResizeHandle.setVisible( m_interactionEnabled );
        m_epsilonResizeHandle.setPickable( m_interactionEnabled );
        m_epsilonResizeHandle.setChildrenPickable( m_interactionEnabled );
        m_epsilonLine.setOffset( graphMin.getX(), graphMin.getY() + EPSILON_LINE_WIDTH );
        m_epsilonLine.setVisible( m_interactionEnabled );
        m_epsilonLine.setPickable( m_interactionEnabled );
      }
    },
//-----------------------------------------------------------------------------
// Private Methods
//-----------------------------------------------------------------------------

    //private
    updateInteractivityState: function() {
      m_interactionEnabled = m_model.getMoleculeType() == StatesOfMatterConstants.USER_DEFINED_MOLECULE;
    }
  } );
} );

