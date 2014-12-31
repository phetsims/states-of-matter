// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * View for the phase changes screen
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var CompositeThermometerNode = require( 'STATES_OF_MATTER/common/view/CompositeThermometerNode' );
  var StoveNode = require( 'STATES_OF_MATTER/common/view/StoveNode' );
  var PhaseChangesMoleculesControlPanel = require( 'STATES_OF_MATTER/phase-changes/view/PhaseChangesMoleculesControlPanel' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var BicyclePumpNode = require( 'STATES_OF_MATTER/common/view/BicyclePumpNode' );
  var PhaseDiagram = require( 'STATES_OF_MATTER/phase-changes/view/PhaseDiagram' );
  var EpsilonControlInteractionPotentialDiagram = require( 'STATES_OF_MATTER/phase-changes/view/EpsilonControlInteractionPotentialDiagram' );
  var ParticleCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleCanvasNode' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  // constants
  var inset = 10;
  // Constants used when mapping the model pressure and temperature to the phase diagram.
  var TRIPLE_POINT_TEMPERATURE_IN_MODEL = StatesOfMatterConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
  var TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM = 0.375;

  var CRITICAL_POINT_TEMPERATURE_IN_MODEL = StatesOfMatterConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
  var CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM = 0.8;
  var SLOPE_IN_1ST_REGION = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM / TRIPLE_POINT_TEMPERATURE_IN_MODEL;
  var SLOPE_IN_2ND_REGION = ( CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM - TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM ) /
                            ( CRITICAL_POINT_TEMPERATURE_IN_MODEL - TRIPLE_POINT_TEMPERATURE_IN_MODEL );
  var OFFSET_IN_2ND_REGION = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM -
                             ( SLOPE_IN_2ND_REGION * TRIPLE_POINT_TEMPERATURE_IN_MODEL );
  // Used for calculating moving averages needed to mellow out the graph
  // behavior.  Value empirically determined.
  var MAX_NUM_HISTORY_SAMPLES = 100;
  var PRESSURE_FACTOR = 35;

  /**
   * @param {MultipleParticleModel} model of the sim
   * @constructor
   */
  function PhaseChangesScreenView( model, isInteractionDiagramEnabled ) {
    var phaseChangesScreenView = this;

    ScreenView.call( this, StatesOfMatterConstants.SCREEN_VIEW_OPTIONS );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );

    // add stove node
    var stoveNode = new StoveNode( model, { scale: 0.8,
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - inset
    } );

    this.model = model;
    this.modelTemperatureHistory = new ObservableArray();

    // add particle container node
    var particleContainerNode = new ParticleContainerNode( model, modelViewTransform,
      {
        centerX: stoveNode.centerX - 60,
        bottom: stoveNode.top - inset
      }, true, true );

    // add particle canvas layer for particle rendering
    this.particlesLayer = new ParticleCanvasNode( model.particles, modelViewTransform, {
      centerX: stoveNode.centerX - 140,
      bottom: stoveNode.top + 720,
      canvasBounds: new Bounds2( -1000, -1000, 1000, 1000 )
    } );
    this.addChild( this.particlesLayer );
    this.addChild( particleContainerNode );
    this.addChild( stoveNode );

    // add compositeThermometer node
    var compositeThermometerNode = new CompositeThermometerNode( model, {
      font: new PhetFont( 20 ),
      fill: 'white',
      right: stoveNode.left + 4 * inset
    } );
    this.addChild( compositeThermometerNode );

    // add phase diagram
    this.phaseDiagram = new PhaseDiagram( model.expandedProperty );

    //add phase change control panel
    var phaseChangesMoleculesControlPanel = new PhaseChangesMoleculesControlPanel( model,
      { right: this.layoutBounds.right + 5,
        top: this.layoutBounds.top + 10
      } );
    this.addChild( phaseChangesMoleculesControlPanel );

    // Add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          phaseChangesScreenView.modelTemperatureHistory.clear();
          model.reset();
          compositeThermometerNode.setRotation( 0 );
          particleContainerNode.reset();
        },
        bottom: this.layoutBounds.bottom - 5,
        right: this.layoutBounds.right + 5,
        radius: 18
      } );

    // add play pause button and step button
    var stepButton = new StepButton(
      function() {
        model.stepInternal( 0.016 );
      },
      model.isPlayingProperty,
      {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        right: stoveNode.left - 50,
        bottom: stoveNode.bottom - 20

      }
    );

    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( model.isPlayingProperty,
      { radius: 18, stroke: 'black',
        fill: '#005566',
        y: stepButton.centerY,
        right: stepButton.left - inset
      } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    // add bicycle pump node
    this.addChild( new BicyclePumpNode( 200, 250, model, {
      bottom: stoveNode.top + 90,
      right: particleContainerNode.left + 100
    } ) );

    this.returnLidButton = new TextPushButton( 'return Lid', {
      font: new PhetFont( 14 ),
      baseColor: 'yellow',
      listener: function() {
        model.returnLid();
        particleContainerNode.reset();


      },
      xMargin: 10,
      right: particleContainerNode.left - 10,
      top: particleContainerNode.centerY + 100
    } );
    this.addChild( this.returnLidButton );

    model.isExplodedProperty.link( function( isExploded ) {
      particleContainerNode.updatePressureGauge();
      phaseChangesScreenView.returnLidButton.visible = isExploded;
      particleContainerNode.containerLid.setRotation( 0 );
      particleContainerNode.pressureMeter.setY( particleContainerNode.containerLid.y - 20 );
    } );
    if ( isInteractionDiagramEnabled ) {
      var epsilonControlInteractionPotentialDiagram = new EpsilonControlInteractionPotentialDiagram(
        StatesOfMatterConstants.MAX_SIGMA, StatesOfMatterConstants.MIN_EPSILON, false, model, {
          right: this.layoutBounds.right + 5,
          top: phaseChangesMoleculesControlPanel.bottom + 5
        } );
      this.addChild( epsilonControlInteractionPotentialDiagram );
    }

    model.moleculeTypeProperty.link( function( moleculeId ) {
      phaseChangesScreenView.modelTemperatureHistory.clear();
      phaseChangesScreenView.updatePhaseDiagram();
      phaseChangesScreenView.phaseDiagram.setDepictingWater( moleculeId === StatesOfMatterConstants.WATER );
      if ( moleculeId === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        if ( phaseChangesScreenView.isChild( phaseChangesScreenView.phaseDiagram ) ) {
          phaseChangesScreenView.removeChild( phaseChangesScreenView.phaseDiagram );
        }
        model.interactionStrengthProperty.value = StatesOfMatterConstants.MAX_EPSILON;
        if ( isInteractionDiagramEnabled ) {
          epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + 5;
        }
      }
      else {
        if ( !phaseChangesScreenView.isChild( phaseChangesScreenView.phaseDiagram ) ) {
          phaseChangesScreenView.addChild( phaseChangesScreenView.phaseDiagram );
          phaseChangesScreenView.phaseDiagram.right = phaseChangesScreenView.layoutBounds.right + 5;

          if ( isInteractionDiagramEnabled ) {
            epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + 5;
            phaseChangesScreenView.phaseDiagram.top = epsilonControlInteractionPotentialDiagram.bottom + 5;
          }
          else {
            phaseChangesScreenView.phaseDiagram.top = phaseChangesMoleculesControlPanel.bottom + 5;
          }
        }
      }
      if ( model.getContainerExploded() ) {
        particleContainerNode.reset();
      }
    } );
    model.particleContainerHeightProperty.link( function() {
      var rotationRate = 0;
      var containerRect = model.getParticleContainerRect();
      if ( !model.getContainerExploded() ) {
        rotationRate = 0;
        compositeThermometerNode.setRotation( rotationRate );

        compositeThermometerNode.setTranslation( compositeThermometerNode.x,
            particleContainerNode.y + compositeThermometerNode.height / 3 +
            Math.abs( modelViewTransform.modelToViewDeltaY( StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                                            containerRect.getHeight() ) )
        );
      }
      else {
        rotationRate = -( Math.PI / 100 + ( Math.random() * Math.PI / 50 ) );
        compositeThermometerNode.rotate( rotationRate );

        compositeThermometerNode.setTranslation(
          compositeThermometerNode.x,
          ( particleContainerNode.y -
            modelViewTransform.modelToViewDeltaY( StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                                  containerRect.getHeight() ) )
        );
      }
    } );

    model.temperatureSetPointProperty.link( function() {
      phaseChangesScreenView.modelTemperatureHistory.clear();
      phaseChangesScreenView.updatePhaseDiagram();
    } );
  }

  return inherit( ScreenView, PhaseChangesScreenView, {
    step: function() {
      this.particlesLayer.step();
    },
    /**
     * Update the position of the marker on the phase diagram based on the
     * temperature and pressure values within the model.
     */
    updatePhaseDiagram: function() {

      // If the container has exploded, don't bother showing the dot.
      if ( this.model.getContainerExploded() ) {
        this.phaseDiagram.setStateMarkerVisible( false );
      }
      else {
        this.phaseDiagram.setStateMarkerVisible( true );
        var movingAverageTemperature = this.updateMovingAverageTemperature( this.model.getTemperatureSetPoint() );
        var modelPressure = this.model.getModelPressure();
        var mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( movingAverageTemperature );
        var mappedPressure = this.mapModelTempAndPressureToPhaseDiagramPressureAlternative1( modelPressure,
          movingAverageTemperature );
        this.phaseDiagram.setStateMarkerPos( mappedTemperature, mappedPressure );

      }
    },

    updateMovingAverageTemperature: function( newTemperatureValue ) {
      if ( this.modelTemperatureHistory.length === MAX_NUM_HISTORY_SAMPLES ) {
        this.modelTemperatureHistory.shift();
      }
      this.modelTemperatureHistory.push( newTemperatureValue );
      var totalOfAllTemperatures = 0;
      for ( var i = 0; i < this.modelTemperatureHistory.length; i++ ) {
        totalOfAllTemperatures += this.modelTemperatureHistory.get( i );
      }
      return totalOfAllTemperatures / this.modelTemperatureHistory.length;
    },

    mapModelTemperatureToPhaseDiagramTemperature: function( modelTemperature ) {

      var mappedTemperature;

      if ( modelTemperature < TRIPLE_POINT_TEMPERATURE_IN_MODEL ) {
        mappedTemperature = SLOPE_IN_1ST_REGION * modelTemperature;
      }
      else {
        mappedTemperature = modelTemperature * SLOPE_IN_2ND_REGION + OFFSET_IN_2ND_REGION;
      }

      return Math.min( mappedTemperature, 1 );
    },


    mapModelTempAndPressureToPhaseDiagramPressure: function( modelPressure, modelTemperature ) {
      var mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( modelTemperature );
      var mappedPressure;

      if ( modelTemperature < TRIPLE_POINT_TEMPERATURE_IN_MODEL ) {
        mappedPressure = 1.4 * ( Math.pow( mappedTemperature, 2 ) ) + PRESSURE_FACTOR * Math.pow( modelPressure, 2 );
      }
      else if ( modelTemperature < CRITICAL_POINT_TEMPERATURE_IN_MODEL ) {
        mappedPressure = 0.19 + 1.2 * ( Math.pow( mappedTemperature - TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM, 2 ) ) +
                         PRESSURE_FACTOR * Math.pow( modelPressure, 2 );
      }
      else {
        mappedPressure = 0.43 + ( 0.43 / 0.81 ) * ( mappedTemperature - 0.81 ) +
                         PRESSURE_FACTOR * Math.pow( modelPressure, 2 );
      }
      return Math.min( mappedPressure, 1 );
    },

    // TODO: This was added by jblanco on 3/23/2012 as part of effort to
    // improve phase diagram behavior, see #3287. If kept, it needs to be
    // cleaned up, including deletion of the previous version of this method.

    // Map the model temperature and pressure to a normalized pressure value
    // suitable for use in setting the marker position on the phase chart.
    mapModelTempAndPressureToPhaseDiagramPressureAlternative1: function( modelPressure, modelTemperature ) {
      // This method is a total tweak fest.  All values and equations are
      // made to map to the phase diagram, and are NOT based on any real-
      // world equations that define phases of matter.
      var cutOverTemperature = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM - 0.025;
      var mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( modelTemperature );
      var mappedPressure;
      if ( mappedTemperature < cutOverTemperature ) {
        mappedPressure = Math.pow( mappedTemperature, 1.5 );
      }
      else {
        mappedPressure = Math.pow( mappedTemperature - cutOverTemperature, 1.8 ) + 0.2;
      }
      return Math.min( mappedPressure, 1 );
    }

  } );
} );

