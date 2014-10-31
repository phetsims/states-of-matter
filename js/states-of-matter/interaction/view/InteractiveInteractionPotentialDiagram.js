// Copyright 2002-2011, University of Colorado
/**
 * This class extends the Interaction Potential diagram to allow the user to
 * change the curve through direct interaction with it.
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
  var AtomType = require( 'STATES_OF_MATTER/states-of-matter/model/AtomType' );
  var DualAtomModel = require( 'STATES_OF_MATTER/states-of-matter/model/DualAtomModel' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/StatesOfMatterAtom' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/states-of-matter/module/InteractionPotentialDiagramNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PBasicInputEventHandler = require( 'edu.umd.cs.piccolo.event.PBasicInputEventHandler' );
  var PDragEventHandler = require( 'edu.umd.cs.piccolo.event.PDragEventHandler' );
  var PInputEvent = require( 'edu.umd.cs.piccolo.event.PInputEvent' );
  var PPath = require( 'edu.umd.cs.piccolo.nodes.PPath' );
  var PDimension = require( 'edu.umd.cs.piccolo.util.PDimension' );

//-----------------------------------------------------------------------------
// Class Data
//-----------------------------------------------------------------------------
// Size of handles as function of node width.

  //private
  var RESIZE_HANDLE_SIZE_PROPORTION = 0.05;
// Position of handle as function of node width.

  //private
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;
// Position of handle as function of node width.

  //private
  var SIGMA_HANDLE_OFFSET_PROPORTION = 0.08;

  //private
  var RESIZE_HANDLE_NORMAL_COLOR = new Color( 51, 204, 51 );

  //private
  var RESIZE_HANDLE_HIGHLIGHTED_COLOR = new Color( 153, 255, 0 );

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
  function InteractiveInteractionPotentialDiagram( sigma, epsilon, wide, model ) {
    //-----------------------------------------------------------------------------
    // Instance Data
    //-----------------------------------------------------------------------------

    //private
    this.m_model;

    //private
    this.m_sigmaResizeHandle;

    //private
    this.m_epsilonResizeHandle;

    //private
    this.m_epsilonLine;

    //private
    this.m_interactionEnabled;
    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, false );
    this.m_model = model;
    model.addListener( new DualAtomModel.Adapter().withAnonymousClassBody( {
      interactionPotentialChanged: function() {
        setLjPotentialParameters( model.getSigma(), model.getEpsilon() );
      },
      fixedAtomAdded: function( particle ) {
        updateInteractivityState();
        drawPotentialCurve();
      },
      movableAtomAdded: function( particle ) {
        updateInteractivityState();
        drawPotentialCurve();
      }
    } ) );
    // changing the value of epsilon.
    var epsilonChangeHandler = new PBasicInputEventHandler().withAnonymousClassBody( {
      mousePressed: function( event ) {
        m_model.setMotionPaused( true );
      },
      mouseReleased: function( event ) {
        m_model.setMotionPaused( false );
      },
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
    m_epsilonLine = new PPath( new Line2D.Number( -epsilonLineLength / 3, 0, epsilonLineLength / 2.2, 0 ) );
    m_epsilonLine.setStroke( EPSILON_LINE_STROKE );
    m_epsilonLine.setStrokePaint( EPSILON_LINE_COLOR );
    m_epsilonLine.addInputEventListener( new CursorHandler( Cursor.N_RESIZE_CURSOR ) );
    m_epsilonLine.addInputEventListener( epsilonChangeHandler );
    m_ljPotentialGraph.addChild( m_epsilonLine );
    // parameters of the LJ potential.
    m_epsilonResizeHandle = new ResizeArrowNode( RESIZE_HANDLE_SIZE_PROPORTION * m_width, Math.PI / 2, RESIZE_HANDLE_NORMAL_COLOR, RESIZE_HANDLE_HIGHLIGHTED_COLOR );
    m_ljPotentialGraph.addChild( m_epsilonResizeHandle );
    m_epsilonResizeHandle.addInputEventListener( epsilonChangeHandler );
    m_sigmaResizeHandle = new ResizeArrowNode( RESIZE_HANDLE_SIZE_PROPORTION * m_width, 0, RESIZE_HANDLE_NORMAL_COLOR, RESIZE_HANDLE_HIGHLIGHTED_COLOR );
    m_ljPotentialGraph.addChild( m_sigmaResizeHandle );
    m_sigmaResizeHandle.addInputEventListener( new PBasicInputEventHandler().withAnonymousClassBody( {
      mousePressed: function( event ) {
        m_model.setMotionPaused( true );
      },
      mouseReleased: function( event ) {
        m_model.setMotionPaused( false );
      },
      mouseDragged: function( event ) {
        var draggedNode = event.getPickedNode();
        var d = event.getDeltaRelativeTo( draggedNode );
        draggedNode.localToParent( d );
        var scaleFactor = MAX_INTER_ATOM_DISTANCE / getGraphWidth();
        m_model.setAdjustableAtomSigma( m_model.getSigma() + d.getWidth() * scaleFactor );
      }
    } ) );
    // This node will need to be pickable so the user can grab it.
    m_positionMarker.setPickable( true );
    m_positionMarker.setChildrenPickable( true );
    m_positionMarker.addInputEventListener( new CursorHandler( Cursor.HAND_CURSOR ) );
    m_positionMarker.addInputEventListener( new PDragEventHandler().withAnonymousClassBody( {
      startDrag: function( event ) {
        super.startDrag( event );
        // Stop the particle from moving in the model.
        m_model.setMotionPaused( true );
      },
      drag: function( event ) {
        var draggedNode = event.getPickedNode();
        var d = event.getDeltaRelativeTo( draggedNode );
        draggedNode.localToParent( d );
        // Move the particle based on the amount of mouse movement.
        var atom = m_model.getMovableAtomRef();
        var scaleFactor = MAX_INTER_ATOM_DISTANCE / getGraphWidth();
        var newPosX = Math.max( atom.getX() + (d.width * scaleFactor), atom.getRadius() * 1.8 );
        atom.setPosition( newPosX, atom.getY() );
      },
      endDrag: function( event ) {
        super.endDrag( event );
        // even if the motion was paused by some other means.
        m_model.setMotionPaused( false );
      }
    } ) );
    // Redraw the potential curve.
    drawPotentialCurve();
    // Update interactivity state.
    updateInteractivityState();
  }

  return inherit( InteractionPotentialDiagramNode, InteractiveInteractionPotentialDiagram, {
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
      if ( m_sigmaResizeHandle != null ) {
        var zeroCrossingPoint = getZeroCrossingPoint();
        m_sigmaResizeHandle.setOffset( zeroCrossingPoint.getX(), (getGraphHeight() / 2) - SIGMA_HANDLE_OFFSET_PROPORTION * m_height );
        m_sigmaResizeHandle.setVisible( m_interactionEnabled );
        m_sigmaResizeHandle.setPickable( m_interactionEnabled );
        m_sigmaResizeHandle.setChildrenPickable( m_interactionEnabled );
      }
    },
//-----------------------------------------------------------------------------
// Private Methods
//-----------------------------------------------------------------------------

    //private
    updateInteractivityState: function() {
      m_interactionEnabled = m_model.getFixedAtomType() == AtomType.ADJUSTABLE;
    }
  } );
} );

