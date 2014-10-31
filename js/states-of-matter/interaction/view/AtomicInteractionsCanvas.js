// Copyright 2002-2011, University of Colorado
/**
 * This is the canvas that represents the play area for the "Interaction
 * Potential" tab of this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BasicStroke = require( 'java.awt.BasicStroke' );
  var Color = require( 'SCENERY/util/Color' );
  var Font = require( 'SCENERY/util/Font' );
  var Rectangle = require( 'java.awt.Rectangle' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var AffineTransform = require( 'java.awt.geom.AffineTransform' );
  var Line2D = require( 'java.awt.geom.Line2D' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var VoidFunction1 = require( 'edu.colorado.phet.common.phetcommon.util.function.VoidFunction1' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var PhetPCanvas = require( 'edu.colorado.phet.common.piccolophet.PhetPCanvas' );
  var DefaultWiggleMe = require( 'edu.colorado.phet.common.piccolophet.help.DefaultWiggleMe' );
  var MotionHelpBalloon = require( 'edu.colorado.phet.common.piccolophet.help.MotionHelpBalloon' );
  var HTMLImageButtonNode = require( 'edu.colorado.phet.common.piccolophet.nodes.HTMLImageButtonNode' );
  var PhetPPath = require( 'edu.colorado.phet.common.piccolophet.nodes.PhetPPath' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterGlobalState = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterGlobalState' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var DualAtomModel = require( 'STATES_OF_MATTER/states-of-matter/model/DualAtomModel' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/StatesOfMatterAtom' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/states-of-matter/module/InteractionPotentialDiagramNode' );
  var GrabbableParticleNode = require( 'STATES_OF_MATTER/states-of-matter/view/GrabbableParticleNode' );
  var ModelViewTransform = require( 'STATES_OF_MATTER/states-of-matter/view/ModelViewTransform' );
  var ParticleForceNode = require( 'STATES_OF_MATTER/states-of-matter/view/ParticleForceNode' );
  var PushpinNode = require( 'STATES_OF_MATTER/states-of-matter/view/PushpinNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PBasicInputEventHandler = require( 'edu.umd.cs.piccolo.event.PBasicInputEventHandler' );
  var PInputEvent = require( 'edu.umd.cs.piccolo.event.PInputEvent' );
  var PDimension = require( 'edu.umd.cs.piccolo.util.PDimension' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// Canvas size in pico meters, since this is a reasonable scale at which
// to display molecules.  Assumes a 4:3 aspect ratio.

  //private
  var CANVAS_WIDTH = 2000;

  //private
  var CANVAS_HEIGHT = CANVAS_WIDTH * (3.0
  d / 4.0
  d
  )
  ;
// Translation factors, used to set origin of canvas area.
// 0 puts the vertical origin all the way left, 1

  //private
  var WIDTH_TRANSLATION_FACTOR = 0.3;
// is all the way to the right.
// 0 puts the horizontal origin at the top of the 

  //private
  var HEIGHT_TRANSLATION_FACTOR = 0.78;
// window, 1 puts it at the bottom.
// Constant used to control size of button.

  //private
  var BUTTON_HEIGHT = CANVAS_WIDTH * 0.06;
// Constant used to control size of wiggle me.

  //private
  var WIGGLE_ME_HEIGHT = CANVAS_HEIGHT * 0.06;
// Constant used to control size of push pin.

  //private
  var PUSH_PIN_WIDTH = CANVAS_WIDTH * 0.10;
// The following constant controls whether the wiggle me appears.  This
// was requested in the original specification, but after being reviewed
// on 9/4/2008, it was requested that it be removed.  Then, after
// interviews conducted in late 2009, it was decide that it should be
// added back.  The constant is being kept in case this decision is
// reversed (again) at some point in the future.

  //private
  var ENABLE_WIGGLE_ME = true;
// Constant to turn on/off a set of vertical lines that can be used to
// check the alignment between the graph and the atoms.

  //private
  var SHOW_ALIGNMENT_LINES = false;

  function AtomicInteractionsCanvas( dualParticleModel ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_model;

    //private
    this.m_mvt;

    //private
    this.m_fixedParticle;

    //private
    this.m_movableParticle;

    //private
    this.m_fixedParticleNode;

    //private
    this.m_movableParticleNode;

    //private
    this.m_interactionPotentialDiagram;

    //private
    this.m_atomListener;

    //private
    this.m_showAttractiveForces;

    //private
    this.m_showRepulsiveForces;

    //private
    this.m_showTotalForces;

    //private
    this.m_retrieveAtomButtonNode;

    //private
    this.m_wiggleMe;

    //private
    this.m_wiggleMeShown;

    //private
    this.m_pushPinNode;

    //private
    this.m_fixedParticleLayer;

    //private
    this.m_movableParticleLayer;
    m_model = dualParticleModel;
    m_showAttractiveForces = false;
    m_showRepulsiveForces = false;
    m_showTotalForces = false;
    m_wiggleMeShown = false;
    m_movableParticle = m_model.getMovableAtomRef();
    m_fixedParticle = m_model.getFixedAtomRef();
    // y = 0) is in a reasonable place.
    setWorldTransformStrategy( new RenderingSizeStrategy( this, new PDimension( CANVAS_WIDTH, CANVAS_HEIGHT ) ).withAnonymousClassBody( {
      getPreprocessedTransform: function() {
        return AffineTransform.getTranslateInstance( getWidth() * WIDTH_TRANSLATION_FACTOR, getHeight() * HEIGHT_TRANSLATION_FACTOR );
      }
    } ) );
    // Create the Model-View transform that we will be using.
    m_mvt = new ModelViewTransform( 1.0, 1.0, 0.0, 0.0, false, true );
    // Set the background color.  This may change based on teacher options.
    StatesOfMatterGlobalState.whiteBackground.addObserver( new VoidFunction1().withAnonymousClassBody( {
      apply: function( whiteBackground ) {
        if ( whiteBackground ) {
          // White background.
          setBackground( Color.WHITE );
        }
        else {
          // Default background.
          setBackground( StatesOfMatterConstants.CANVAS_BACKGROUND );
        }
      }
    } ) );
    // Register for notifications of important events from the model.
    m_model.addListener( new DualAtomModel.Adapter().withAnonymousClassBody( {
      fixedAtomAdded: function( particle ) {
        handleFixedParticleAdded( particle );
      },
      fixedAtomRemoved: function( particle ) {
        handleFixedParticleRemoved( particle );
      },
      movableAtomAdded: function( particle ) {
        handleMovableParticleAdded( particle );
      },
      movableAtomRemoved: function( particle ) {
        handleMovableParticleRemoved( particle );
      },
      movableAtomDiameterChanged: function() {
        updateMinimumXForMovableAtom();
      },
      fixedAtomDiameterChanged: function() {
        updateMinimumXForMovableAtom();
      }
    } ) );
    // Create the listener for monitoring particle motion.
    m_atomListener = new StatesOfMatterAtom.Adapter().withAnonymousClassBody( {
      positionChanged: function() {
        handlePositionChanged();
      },
      radiusChanged: function() {
        handleParticleRadiusChanged();
      }
    } );
    // calculation.
    m_interactionPotentialDiagram = new InteractiveInteractionPotentialDiagram( m_model.getSigma(), m_model.getEpsilon(), true, m_model );
    var desiredWidth = m_interactionPotentialDiagram.getXAxisRange() / m_interactionPotentialDiagram.getXAxisGraphProportion();
    var diagramScaleFactor = desiredWidth / m_interactionPotentialDiagram.getFullBoundsReference().width;
    m_interactionPotentialDiagram.scale( diagramScaleFactor );
    // Position the diagram so that the x origin lines up with the fixed particle.
    m_interactionPotentialDiagram.setOffset( -m_interactionPotentialDiagram.getFullBoundsReference().width * m_interactionPotentialDiagram.getXAxisOffsetProportion(), -m_interactionPotentialDiagram.getFullBoundsReference().height * 1.3 );
    addWorldChild( m_interactionPotentialDiagram );
    // Add the button for retrieving the atom to the canvas. 
    m_retrieveAtomButtonNode = new HTMLImageButtonNode( StatesOfMatterStrings.RETRIEVE_ATOM, new PhetFont( Font.BOLD, 16 ), new Color( 0xffcc66 ) );
    m_retrieveAtomButtonNode.scale( BUTTON_HEIGHT / m_retrieveAtomButtonNode.getFullBoundsReference().height );
    m_retrieveAtomButtonNode.setVisible( false );
    addWorldChild( m_retrieveAtomButtonNode );
    m_retrieveAtomButtonNode.setOffset( m_interactionPotentialDiagram.getFullBoundsReference().getMaxX() - m_retrieveAtomButtonNode.getFullBoundsReference().width, // Almost fully below the largest atom.
        StatesOfMatterConstants.MAX_SIGMA / 3 * 1.1 );
    // Register to receive button pushes.
    m_retrieveAtomButtonNode.addActionListener( new ActionListener().withAnonymousClassBody( {
      actionPerformed: function( event ) {
        // Move the rogue particle back to its initial position.
        m_model.resetMovableAtomPos();
      }
    } ) );
    // canvas when the particles appear.
    m_pushPinNode = new PushpinNode();
    m_pushPinNode.scale( PUSH_PIN_WIDTH / m_pushPinNode.getFullBoundsReference().width );
    // appear to be on top.
    m_movableParticleLayer = new Node();
    addWorldChild( m_movableParticleLayer );
    m_fixedParticleLayer = new Node();
    addWorldChild( m_fixedParticleLayer );
    // Create the nodes that will represent the particles in the view.
    if ( m_movableParticle != null ) {
      handleMovableParticleAdded( m_movableParticle );
    }
    if ( m_fixedParticle != null ) {
      handleFixedParticleAdded( m_fixedParticle );
    }
    if ( SHOW_ALIGNMENT_LINES ) {
      var fixedAtomVerticalCenterMarker = new PhetPPath( new Line2D.Number( 0, 0, 0, 1000 ), new BasicStroke( 7 ), Color.PINK );
      fixedAtomVerticalCenterMarker.setOffset( 0, -1000 );
      addWorldChild( fixedAtomVerticalCenterMarker );
      var movableAtomVerticalCenterMarker = new PhetPPath( new Line2D.Number( 0, 0, 0, 1000 ), new BasicStroke( 7 ), Color.ORANGE );
      movableAtomVerticalCenterMarker.setOffset( m_model.getMovableAtomRef().getX(), -1000 );
      addWorldChild( movableAtomVerticalCenterMarker );
      var rightSideOfChartMarker = new PhetPPath( new Line2D.Number( 0, 0, 0, 1000 ), new BasicStroke( 7 ), Color.GREEN );
      rightSideOfChartMarker.setOffset( 1100, -1000 );
      addWorldChild( rightSideOfChartMarker );
    }
  }

  return inherit( PhetPCanvas, AtomicInteractionsCanvas, {
//----------------------------------------------------------------------------
// Public and Protected Methods
//----------------------------------------------------------------------------
    /**
     * Turn on/off the displaying of the force arrows that represent the
     * attractive force.
     */
    setShowAttractiveForces: function( showForces ) {
      m_movableParticleNode.setShowAttractiveForces( showForces );
      m_fixedParticleNode.setShowAttractiveForces( showForces );
      m_showAttractiveForces = showForces;
    },
    /**
     * Turn on/off the displaying of the force arrows that represent the
     * repulsive force.
     */
    setShowRepulsiveForces: function( showForces ) {
      m_movableParticleNode.setShowRepulsiveForces( showForces );
      m_fixedParticleNode.setShowRepulsiveForces( showForces );
      m_showRepulsiveForces = showForces;
    },
    /**
     * Turn on/off the displaying of the force arrows that represent the
     * total force, i.e. attractive plus repulsive.
     */
    setShowTotalForces: function( showForces ) {
      m_movableParticleNode.setShowTotalForces( showForces );
      m_fixedParticleNode.setShowTotalForces( showForces );
      m_showTotalForces = showForces;
    },
    updateLayout: function() {
      if ( getWorldSize().getWidth() <= 0 || getWorldSize().getHeight() <= 0 ) {
        // The canvas hasn't been sized yet, so don't try to lay it out.
        return;
      }
      if ( (!m_wiggleMeShown) && (ENABLE_WIGGLE_ME) ) {
        // The wiggle me has not yet been shown, so show it.
        m_wiggleMe = new DefaultWiggleMe( this, StatesOfMatterStrings.WIGGLE_ME_CAPTION );
        m_wiggleMe.setArrowTailPosition( MotionHelpBalloon.LEFT_CENTER );
        m_wiggleMe.setTextColor( Color.YELLOW );
        m_wiggleMe.setArrowFillPaint( Color.YELLOW );
        m_wiggleMe.setArrowStrokePaint( Color.YELLOW );
        // Fully transparent.
        m_wiggleMe.setBalloonFillPaint( new Color( 0, 0, 0, 0 ) );
        // Fully transparent.
        m_wiggleMe.setBalloonStrokePaint( new Color( 0, 0, 0, 0 ) );
        var wiggleMeScale = WIGGLE_ME_HEIGHT / m_wiggleMe.getFullBoundsReference().height;
        m_wiggleMe.scale( wiggleMeScale );
        addWorldChild( m_wiggleMe );
        // Animate from off the screen to the position of the movable atom.
        var viewportBounds = getBounds();
        var wiggleMeInitialXPos = new Vector2( viewportBounds.getMaxX(), 0 );
        getPhetRootNode().screenToWorld( wiggleMeInitialXPos );
        wiggleMeInitialXPos.setLocation( wiggleMeInitialXPos.getX(), 0 );
        m_wiggleMe.setOffset( wiggleMeInitialXPos.getX(), m_model.getMovableAtomRef().getY() );
        m_wiggleMe.animateToPositionScaleRotation( m_model.getMovableAtomRef().getX() + m_model.getMovableAtomRef().getRadius(), m_model.getMovableAtomRef().getY(), wiggleMeScale, 0, 2000 );
        // Clicking anywhere on the canvas makes the wiggle me go away.
        addInputEventListener( new PBasicInputEventHandler().withAnonymousClassBody( {
          mousePressed: function( event ) {
            clearWiggleMe();
            removeInputEventListener( this );
          }
        } ) );
        // up showing it again.
        m_wiggleMeShown = true;
      }
    },
//----------------------------------------------------------------------------
// Private Methods
//----------------------------------------------------------------------------

    //private
    handleFixedParticleAdded: function( particle ) {
      m_fixedParticle = particle;
      m_fixedParticleNode = new ParticleForceNode( particle, m_mvt, true, true );
      m_fixedParticleNode.setShowAttractiveForces( m_showAttractiveForces );
      m_fixedParticleNode.setShowRepulsiveForces( m_showRepulsiveForces );
      m_fixedParticleNode.setShowTotalForces( m_showTotalForces );
      m_fixedParticleLayer.addChild( m_fixedParticleNode );
      particle.addListener( m_atomListener );
      updatePositionMarkerOnDiagram();
      // change if a different image is used.
      addWorldChild( m_pushPinNode );
      m_pushPinNode.setOffset( m_fixedParticle.getRadius() * 0.25, m_fixedParticle.getRadius() * 0.1 );
    },

    //private
    handleFixedParticleRemoved: function( particle ) {
      // Get rid of the node for this guy.
      if ( m_fixedParticleNode != null ) {
        // Remove the particle node.
        m_fixedParticleLayer.removeChild( m_fixedParticleNode );
        // Remove the pin holding the node.
        removeWorldChild( m_pushPinNode );
      }
      else {
        System.err.println( "Error: Problem encountered removing node from canvas." );
      }
      particle.removeListener( m_atomListener );
      updatePositionMarkerOnDiagram();
      m_fixedParticleNode = null;
    },

    //private
    handleMovableParticleAdded: function( particle ) {
      m_movableParticle = particle;
      m_movableParticleNode = new GrabbableParticleNode( m_model, particle, m_mvt, true, true, 0, Number.POSITIVE_INFINITY );
      m_movableParticleNode.setShowAttractiveForces( m_showAttractiveForces );
      m_movableParticleNode.setShowRepulsiveForces( m_showRepulsiveForces );
      m_movableParticleNode.setShowTotalForces( m_showTotalForces );
      m_movableParticleLayer.addChild( m_movableParticleNode );
      // of the fixed particle.
      updateMinimumXForMovableAtom();
      // Add ourself as a listener.
      particle.addListener( m_atomListener );
      // Update the position marker to represent the new particle's position.
      updatePositionMarkerOnDiagram();
    },

    //private
    handleMovableParticleRemoved: function( particle ) {
      // Get rid of the node for this guy.
      if ( m_movableParticleNode != null ) {
        // Remove the particle node.
        m_movableParticleLayer.removeChild( m_movableParticleNode );
      }
      else {
        System.err.println( "Error: Problem encountered removing node from canvas." );
      }
      particle.removeListener( m_atomListener );
      updatePositionMarkerOnDiagram();
      m_movableParticleNode = null;
    },
    /**
     * Handle a notification of a change in the radius of a particle.
     * IMPORTANT NOTE: This is part of a workaround for a problem with
     * rendering the spherical nodes.  To make a long story short, there were
     * problems with resizing the nodes if they were being drawn with a
     * gradient, so this (and other) code was added to effectively turn off
     * the gradient while the particle was being resized and turn it back
     * on when it started moving again.
     */

    //private
    handleParticleRadiusChanged: function() {
      // are being used and if motion is paused.
      if ( m_model.getMotionPaused() ) {
        if ( m_fixedParticleNode.getGradientEnabled() ) {
          m_fixedParticleNode.setGradientEnabled( false );
        }
        if ( m_movableParticleNode.getGradientEnabled() ) {
          m_movableParticleNode.setGradientEnabled( false );
        }
      }
    },

    //private
    handlePositionChanged: function() {
      if ( !m_model.getMotionPaused() ) {
        if ( !m_fixedParticleNode.getGradientEnabled() ) {
          // back on.
          m_fixedParticleNode.setGradientEnabled( true );
        }
        if ( !m_movableParticleNode.getGradientEnabled() ) {
          // back on.
          m_movableParticleNode.setGradientEnabled( true );
        }
      }
      updatePositionMarkerOnDiagram();
      updateForceVectors();
      if ( (getWorldSize().getWidth() > 0) && (m_model.getMovableAtomRef().getX() > (1 - WIDTH_TRANSLATION_FACTOR) * getWorldSize().getWidth()) ) {
        if ( !m_retrieveAtomButtonNode.isVisible() ) {
          // yet shown, so show it.
          m_retrieveAtomButtonNode.setVisible( true );
        }
      }
      else if ( m_retrieveAtomButtonNode.isVisible() ) {
        // (which it shouldn't be), so hide it.
        m_retrieveAtomButtonNode.setVisible( false );
      }
    },
    /**
     * Update the position marker on the Lennard-Jones potential diagram.
     * This will indicate the amount of potential being experienced between
     * the two atoms in the model.
     */

    //private
    updatePositionMarkerOnDiagram: function() {
      if ( (m_fixedParticle != null) && (m_movableParticle != null) ) {
        var distance = m_fixedParticle.getPositionReference().distance( m_movableParticle.getPositionReference() );
        if ( distance > 0 ) {
          m_interactionPotentialDiagram.setMarkerEnabled( true );
          m_interactionPotentialDiagram.setMarkerPosition( distance );
        }
        else {
          m_interactionPotentialDiagram.setMarkerEnabled( false );
        }
      }
      else {
        m_interactionPotentialDiagram.setMarkerEnabled( false );
      }
    },
    /**
     * Update the minimum X value allowed for the movable atom.  This prevents
     * too much overlap between the atoms.
     */

    //private
    updateMinimumXForMovableAtom: function() {
      if ( m_movableParticle != null && m_fixedParticle != null ) {
        //    		m_movableParticleNode.setMinX( ( m_fixedParticle.getRadius() + m_movableParticle.getRadius() ) * 0.35 );
        m_movableParticleNode.setMinX( m_model.getSigma() * 0.9 );
      }
    },

    //private
    updateForceVectors: function() {
      if ( (m_fixedParticle != null) && (m_movableParticle != null) ) {
        m_fixedParticleNode.setForces( m_model.getAttractiveForce(), -m_model.getRepulsiveForce() );
        m_movableParticleNode.setForces( -m_model.getAttractiveForce(), m_model.getRepulsiveForce() );
      }
    },

    //private
    clearWiggleMe: function() {
      if ( m_wiggleMe != null ) {
        m_wiggleMe.setEnabled( false );
        removeWorldChild( m_wiggleMe );
        m_wiggleMe = null;
      }
    }
  } );
} );

