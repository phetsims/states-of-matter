// Copyright 2002-2011, University of Colorado
/**
 * This is the canvas that represents the play area for the "Solid, Liquid,
 * Gas" tab of this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var AffineTransform = require( 'java.awt.geom.AffineTransform' );
  var Rectangle = require( 'KITE/Rectangle' );
  var Resettable = require( 'edu.colorado.phet.common.phetcommon.model.Resettable' );
  var Property = require( 'AXON/Property' );
  var Property = require( 'AXON/Property' );
  var VoidFunction1 = require( 'edu.colorado.phet.common.phetcommon.util.function.VoidFunction1' );
  var PhetPCanvas = require( 'edu.colorado.phet.common.piccolophet.PhetPCanvas' );
  var ResetAllButtonNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ResetAllButtonNode' );
  var FloatingClockControlNode = require( 'edu.colorado.phet.common.piccolophet.nodes.mediabuttons.FloatingClockControlNode' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterGlobalState = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterGlobalState' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );
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
  var CANVAS_WIDTH = 23000;

  //private
  var CANVAS_HEIGHT = CANVAS_WIDTH * (3.0
  d / 4.0
  d
  )
  ;
// Translation factors, used to set origin of canvas area.
// 0 to 1, 0 is left and 1 is right.

  //private
  var WIDTH_TRANSLATION_FACTOR = 0.3;
// 0 to 1, 0 is up and 1 is down.

  //private
  var HEIGHT_TRANSLATION_FACTOR = 0.72;
// Sizes, in terms of overall canvas size, of the nodes on the canvas.

  //private
  var BURNER_NODE_HEIGHT = CANVAS_WIDTH * 0.15;

  function SolidLiquidGasCanvas( multipleParticleModel ) {
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
    this.m_clockRunning = new BooleanProperty( true );
    m_model = multipleParticleModel;
    // Create the Model-View transform that we will be using.
    var m_mvt = new ModelViewTransform( 1.0, 1.0, 0.0, 0.0, false, true );
    // the lower left corner of the particle container.
    setWorldTransformStrategy( new RenderingSizeStrategy( this, new PDimension( CANVAS_WIDTH, CANVAS_HEIGHT ) ).withAnonymousClassBody( {
      getPreprocessedTransform: function() {
        return AffineTransform.getTranslateInstance( getWidth() * WIDTH_TRANSLATION_FACTOR, getHeight() * HEIGHT_TRANSLATION_FACTOR );
      }
    } ) );
    // Set ourself up as a listener to the model.
    m_model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      temperatureChanged: function() {
        updateThermometerTemperature();
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
    // Create and add the particle container.
    m_particleContainer = new ParticleContainerNode( m_model, m_mvt, false, false );
    addWorldChild( m_particleContainer );
    // Add a thermometer for displaying temperature.
    var containerRect = m_model.getParticleContainerRect();
    m_thermometerNode = new CompositeThermometerNode( containerRect.getX() + containerRect.getWidth() * 0.18, containerRect.getY() + containerRect.getHeight() * 0.30, StatesOfMatterConstants.MAX_DISPLAYED_TEMPERATURE, StatesOfMatterGlobalState.temperatureUnitsProperty );
    m_thermometerNode.setOffset( containerRect.getX() + containerRect.getWidth() * 0.23, containerRect.getY() - containerRect.getHeight() * 1.2 );
    addWorldChild( m_thermometerNode );
    // particle container.
    var stoveNode = new StoveNode( m_model );
    stoveNode.setScale( BURNER_NODE_HEIGHT / stoveNode.getFullBoundsReference().height );
    stoveNode.setOffset( m_particleContainer.getFullBoundsReference().getCenterX() - stoveNode.getFullBoundsReference().width / 2, m_particleContainer.getFullBoundsReference().getMaxY() + 600 );
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
  }

  return inherit( PhetPCanvas, SolidLiquidGasCanvas, {
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
    }
  } );
} );

