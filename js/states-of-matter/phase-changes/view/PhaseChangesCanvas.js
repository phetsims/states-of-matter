// Copyright 2002-2011, University of Colorado
/**
 * Canvas where the visual objects for the phase changes tab are placed.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var AffineTransform = require( 'java.awt.geom.AffineTransform' );
  var Rectangle = require( 'KITE/Rectangle' );
  var Random = require( 'java.util.Random' );
  var Resettable = require( 'edu.colorado.phet.common.phetcommon.model.Resettable' );
  var ClockAdapter = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter' );
  var ClockEvent = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockEvent' );
  var Property = require( 'AXON/Property' );
  var Property = require( 'AXON/Property' );
  var VoidFunction1 = require( 'edu.colorado.phet.common.phetcommon.util.function.VoidFunction1' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var PhetPCanvas = require( 'edu.colorado.phet.common.piccolophet.PhetPCanvas' );
  var ResetAllButtonNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ResetAllButtonNode' );
  var TextButtonNode = require( 'edu.colorado.phet.common.piccolophet.nodes.TextButtonNode' );
  var FloatingClockControlNode = require( 'edu.colorado.phet.common.piccolophet.nodes.mediabuttons.FloatingClockControlNode' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterGlobalState = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterGlobalState' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );
  var BicyclePumpNode = require( 'STATES_OF_MATTER/states-of-matter/view/BicyclePumpNode' );
  var ModelViewTransform = require( 'STATES_OF_MATTER/states-of-matter/view/ModelViewTransform' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/states-of-matter/view/ParticleContainerNode' );
  var StoveNode = require( 'STATES_OF_MATTER/states-of-matter/view/StoveNode' );
  var CompositeThermometerNode = require( 'STATES_OF_MATTER/states-of-matter/view/instruments/CompositeThermometerNode' );
  var PDimension = require( 'edu.umd.cs.piccolo.util.PDimension' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// Canvas size in pico meters, since this is a reasonable scale at which
// to display molecules.  Assumes a 4:3 aspect ratio.

  //private
  var CANVAS_WIDTH = 24000;

  //private
  var CANVAS_HEIGHT = CANVAS_WIDTH * (3.0
  d / 4.0
  d
  )
  ;
// Translation factors, used to set origin of canvas area.
// 0 puts the vertical origin all the way left, 1 is all the way to the right.

  //private
  var WIDTH_TRANSLATION_FACTOR = 0.29;
// 0 puts the horizontal origin at the top of the window, 1 puts it at the bottom.

  //private
  var HEIGHT_TRANSLATION_FACTOR = 0.73;
// Sizes, in terms of overall canvas size, of the nodes on the canvas.

  //private
  var BURNER_NODE_HEIGHT = CANVAS_WIDTH * 0.15;

  //private
  var PUMP_HEIGHT = CANVAS_HEIGHT / 2;

  //private
  var PUMP_WIDTH = CANVAS_WIDTH / 4;

  function PhaseChangesCanvas( multipleParticleModel ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_model;

    //private
    this.m_particleContainer;

    //private
    this.m_thermometerNode;

    //private
    this.m_rand;

    //private
    this.m_rotationRate = 0;

    //private
    this.m_clockRunning = new BooleanProperty( false );
    m_model = multipleParticleModel;
    m_rand = new Random();
    // Create the Model-View transform that we will be using.
    var mvt = new ModelViewTransform( 1.0, 1.0, 0.0, 0.0, false, true );
    // the lower left corner of the particle container.
    setWorldTransformStrategy( new RenderingSizeStrategy( this, new PDimension( CANVAS_WIDTH, CANVAS_HEIGHT ) ).withAnonymousClassBody( {
      getPreprocessedTransform: function() {
        return AffineTransform.getTranslateInstance( getWidth() * WIDTH_TRANSLATION_FACTOR, getHeight() * HEIGHT_TRANSLATION_FACTOR );
      }
    } ) );
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
    // Set ourself up as a listener to the model.
    m_model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      temperatureChanged: function() {
        updateThermometerTemperature();
      },
      containerSizeChanged: function() {
        updateThermometerPosition();
      },
      containerExplodedStateChanged: function( containerExploded ) {
        if ( containerExploded ) {
          // Set a random rotation rate.
          m_rotationRate = -(Math.PI / 100 + (m_rand.nextDouble() * Math.PI / 50));
        }
        else {
          m_rotationRate = 0;
        }
      }
    } ) );
    // Create the particle container.
    m_particleContainer = new ParticleContainerNode( m_model, mvt, true, true );
    // all be positioned relative to it.
    var containerRect = m_model.getParticleContainerRect();
    // Add the pump.
    var pump = new BicyclePumpNode( PUMP_WIDTH, PUMP_HEIGHT, m_model );
    pump.setOffset( containerRect.getX() + containerRect.getWidth(), containerRect.getY() - pump.getFullBoundsReference().height - containerRect.getHeight() * 0.2 );
    addWorldChild( pump );
    // on top of it.
    addWorldChild( m_particleContainer );
    // Add a thermometer for displaying temperature.
    m_thermometerNode = new CompositeThermometerNode( containerRect.getWidth() * 0.20, containerRect.getHeight() * 0.32, StatesOfMatterConstants.MAX_DISPLAYED_TEMPERATURE, StatesOfMatterGlobalState.temperatureUnitsProperty );
    addWorldChild( m_thermometerNode );
    updateThermometerTemperature();
    updateThermometerPosition();
    // particle container.
    var stoveNode = new StoveNode( m_model );
    stoveNode.setScale( BURNER_NODE_HEIGHT / stoveNode.getFullBoundsReference().height );
    stoveNode.setOffset( containerRect.getCenterX() - stoveNode.getFullBoundsReference().width / 2, m_particleContainer.getFullBoundsReference().getMaxY() + 600 );
    addWorldChild( stoveNode );
    // Add a "Reset All" button.
    var resetAllButton = new ResetAllButtonNode( new Resettable[]
    { multipleParticleModel, this }
  ,
    this, 18, Color.BLACK, new Color( 255, 153, 0 )
  ).
    withAnonymousClassBody( {
      initializer: function() {
        setConfirmationEnabled( false );
        // Scale to reasonable size.  Scale factor was empirically determined.
        scale( 30 );
      }
    } );
    addWorldChild( resetAllButton );
    // Add a floating clock control.
    m_clockRunning.addObserver( new VoidFunction1().withAnonymousClassBody( {
      apply: function( isRunning ) {
        multipleParticleModel.getClock().setRunning( isRunning );
      }
    } ) );
    var floatingClockControlNode = new FloatingClockControlNode( m_clockRunning, null, multipleParticleModel.getClock(), null, new Property( Color.white ) ).withAnonymousClassBody( {
      initializer: function() {
        // Scale to reasonable size.  Scale factor was empirically determined.
        scale( 30 );
      }
    } );
    addWorldChild( floatingClockControlNode );
    // Lay out the reset button and floating clock control.
    {
      // Recall that (0,0) is the lower left corner of the particle container, which is why this works.
      var centerXOffset = -Math.max( resetAllButton.getFullBoundsReference().width, floatingClockControlNode.getFullBoundsReference().width ) / 2;
      resetAllButton.setOffset( centerXOffset - resetAllButton.getFullBoundsReference().width / 2, stoveNode.getFullBoundsReference().getMaxY() - resetAllButton.getFullBoundsReference().height );
      floatingClockControlNode.setOffset( resetAllButton.getFullBoundsReference().getCenterX() - floatingClockControlNode.getFullBoundsReference().width / 2, resetAllButton.getFullBoundsReference().getMinY() - floatingClockControlNode.getFullBoundsReference().height - 200 );
    }
    // been blown off.
    var returnLidButton = new TextButtonNode( StatesOfMatterStrings.RETURN_LID, new PhetFont( 18 ), Color.YELLOW ).withAnonymousClassBody( {
      initializer: function() {
        // empirically determined, adjust as needed for optimal look.
        scale( 30 );
        setOffset( -getFullBoundsReference().getWidth() - 500, -8000 );
        // Tell the model to return the lid when this button is pressed.
        addActionListener( new ActionListener().withAnonymousClassBody( {
          actionPerformed: function( e ) {
            multipleParticleModel.returnLid();
          }
        } ) );
      }
    } );
    addWorldChild( returnLidButton );
    returnLidButton.setVisible( multipleParticleModel.getContainerExploded() );
    // visible when the container has exploded.
    multipleParticleModel.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      containerExplodedStateChanged: function( containerExploded ) {
        returnLidButton.setVisible( containerExploded );
      }
    } ) );
    // clock gets started.
    multipleParticleModel.getClock().addClockListener( new ClockAdapter().withAnonymousClassBody( {
      clockStarted: function( clockEvent ) {
        m_clockRunning.set( true );
      }
    } ) );
  }

  return inherit( PhetPCanvas, PhaseChangesCanvas, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    reset: function() {
      // In case clock was paused prior to reset.
      m_clockRunning.set( true );
      m_particleContainer.reset();
    },
//----------------------------------------------------------------------------
// Private Methods
//----------------------------------------------------------------------------
    /**
     * Update the value displayed in the thermometer.
     */

    //private
    updateThermometerTemperature: function() {
      m_thermometerNode.setTemperatureInDegreesKelvin( m_model.getTemperatureInKelvin() );
    },
    /**
     * Update the position of the thermometer so that it stays on the lid.
     */

    //private
    updateThermometerPosition: function() {
      var containerRect = m_model.getParticleContainerRect();
      if ( !m_model.getContainerExploded() ) {
        if ( m_thermometerNode.getRotation() != 0 ) {
          m_thermometerNode.setRotation( 0 );
        }
      }
      else {
        // The container is exploding, so spin the thermometer.
        m_thermometerNode.rotateInPlace( m_rotationRate );
      }
      m_thermometerNode.setOffset( containerRect.getX() + containerRect.getWidth() * 0.24, containerRect.getY() - containerRect.getHeight() - (m_thermometerNode.getFullBoundsReference().height * 0.5) );
    }
  } );
} );

