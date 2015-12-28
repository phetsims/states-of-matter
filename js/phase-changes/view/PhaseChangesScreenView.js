// Copyright 2014-2015, University of Colorado Boulder

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
  var HeaterCoolerNode = require( 'SCENERY_PHET/HeaterCoolerNode' );
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

  //strings
  var returnLidString = require( 'string!STATES_OF_MATTER/returnLid' );

  // constants
  var INSET = 10;

  // constants used when mapping the model pressure and temperature to the phase diagram.
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

  // constants used in the layout process
  var PARTICLE_CANVAS_LAYER_BOUND_LIMIT = 1000;
  var PARTICLE_LAYER_X_OFFSET = 148;
  var PARTICLE_LAYER_Y_OFFSET = 680;
  var PARTICLE_CONTAINER_X_OFFSET = 60;
  var LAY_BOUNDS_RIGHT_OFFSET = 15;
  var LAY_BOUNDS_Y_OFFSET = 10;
  var STEP_BUTTON_X_OFFSET = 50;
  var STEP_BUTTON_Y_OFFSET = 20;
  var BICYCLE_PUMP_NODE_X_OFFSET = 100;
  var RETURN_LID_BUTTON_Y_OFFSET = 100;

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {boolean} isInteractionDiagramEnabled
   * @param {Property<boolean>} projectorModeProperty - true to use the projector color scheme, false to use regular color scheme
   * @constructor
   */
  function PhaseChangesScreenView( multipleParticleModel, isInteractionDiagramEnabled, projectorModeProperty ) {
    var phaseChangesScreenView = this;

    ScreenView.call( this, StatesOfMatterConstants.SCREEN_VIEW_OPTIONS );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );

    // add heater/cooler node
    var heaterCoolerNode = new HeaterCoolerNode( {
      scale: 0.8,
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - INSET
    } );
    heaterCoolerNode.heatCoolLevelProperty.link( function( heat ) {
      multipleParticleModel.setHeatingCoolingAmount( heat );
    } );


    this.multipleParticleModel = multipleParticleModel;
    this.modelTemperatureHistory = new ObservableArray();

    // add particle container node
    var particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, true, true, {
      centerX: heaterCoolerNode.centerX - PARTICLE_CONTAINER_X_OFFSET,
      bottom: heaterCoolerNode.top - INSET
    } );

    // add particle container back node  before  particle Canvas layer
    this.addChild( particleContainerNode.openNode );

    // add particle canvas layer for particle rendering
    this.particlesLayer = new ParticleCanvasNode( multipleParticleModel.particles, modelViewTransform, projectorModeProperty, {
      centerX: heaterCoolerNode.centerX - PARTICLE_LAYER_X_OFFSET,
      bottom:  heaterCoolerNode.top + PARTICLE_LAYER_Y_OFFSET,
      canvasBounds: new Bounds2( -PARTICLE_CANVAS_LAYER_BOUND_LIMIT, -PARTICLE_CANVAS_LAYER_BOUND_LIMIT,
        PARTICLE_CANVAS_LAYER_BOUND_LIMIT, PARTICLE_CANVAS_LAYER_BOUND_LIMIT )
    } );
    this.addChild( this.particlesLayer );
    this.addChild( particleContainerNode );

    // adjust the container back node position
    var containerOpenNodeXOffset = 50.4;
    var containerOpenNodeYOffset = particleContainerNode.fingerNode.fingerImageNode.height - 10;
    particleContainerNode.openNode.centerX = particleContainerNode.centerX + containerOpenNodeXOffset;
    particleContainerNode.openNode.centerY = particleContainerNode.top + containerOpenNodeYOffset;
    this.addChild( heaterCoolerNode );

    // add compositeThermometer node
    var compositeThermometerNode = new CompositeThermometerNode( multipleParticleModel, modelViewTransform, {
      font: new PhetFont( 20 ),
      fill: 'white',
      right: heaterCoolerNode.left + 3 * INSET
    } );
    this.addChild( compositeThermometerNode );

    // add phase diagram - in SOM basic version by default phase diagram should be closed.
    multipleParticleModel.expandedProperty.value = isInteractionDiagramEnabled;
    this.phaseDiagram = new PhaseDiagram( multipleParticleModel.expandedProperty );

    // add phase change control panel
    var phaseChangesMoleculesControlPanel = new PhaseChangesMoleculesControlPanel( multipleParticleModel, isInteractionDiagramEnabled, {
      right: this.layoutBounds.right - LAY_BOUNDS_RIGHT_OFFSET,
      top: this.layoutBounds.top + LAY_BOUNDS_Y_OFFSET / 2,
      minWidth: this.phaseDiagram.width
    } );
    this.addChild( phaseChangesMoleculesControlPanel );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        phaseChangesScreenView.modelTemperatureHistory.clear();
        multipleParticleModel.reset();
        compositeThermometerNode.setRotation( 0 );
        particleContainerNode.reset();
        //Reset  phase diagram state in SOM basic version
        multipleParticleModel.expandedProperty.value = isInteractionDiagramEnabled;
      },
      bottom: this.layoutBounds.bottom - LAY_BOUNDS_Y_OFFSET / 2,
      right: this.layoutBounds.right - LAY_BOUNDS_RIGHT_OFFSET,
      radius: 18
    } );

    // add play pause button and step button
    var stepButton = new StepButton(
      function() {
        multipleParticleModel.stepInternal( 0.016 );
      },
      multipleParticleModel.isPlayingProperty,
      {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        right: heaterCoolerNode.left - STEP_BUTTON_X_OFFSET,
        bottom: heaterCoolerNode.bottom - STEP_BUTTON_Y_OFFSET
      }
    );
    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( multipleParticleModel.isPlayingProperty, {
      radius: 18, stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - INSET
    } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    // add bicycle pump node
    this.addChild( new BicyclePumpNode( 200, 250, multipleParticleModel, {
      bottom: heaterCoolerNode.bottom,
      right: particleContainerNode.left + BICYCLE_PUMP_NODE_X_OFFSET
    } ) );

    // add return lid button
    this.returnLidButton = new TextPushButton( returnLidString, {
      font: new PhetFont( 14 ),
      baseColor: 'yellow',
      listener: function() {
        multipleParticleModel.returnLid();
        particleContainerNode.reset();
      },
      visible: false,
      xMargin: 10,
      right: particleContainerNode.left - 2 * LAY_BOUNDS_RIGHT_OFFSET,
      top: particleContainerNode.centerY + RETURN_LID_BUTTON_Y_OFFSET
    } );
    this.addChild( this.returnLidButton );
    multipleParticleModel.isExplodedProperty.linkAttribute( this.returnLidButton, 'visible' );

    // add interaction potential diagram
    if ( isInteractionDiagramEnabled ) {
      var epsilonControlInteractionPotentialDiagram = new EpsilonControlInteractionPotentialDiagram(
        StatesOfMatterConstants.MAX_SIGMA, StatesOfMatterConstants.MIN_EPSILON, false,
        multipleParticleModel, projectorModeProperty, {
          right: this.layoutBounds.right - LAY_BOUNDS_RIGHT_OFFSET,
          top: phaseChangesMoleculesControlPanel.bottom
        } );
      this.addChild( epsilonControlInteractionPotentialDiagram );
    }
    multipleParticleModel.moleculeTypeProperty.link( function( moleculeId ) {
      phaseChangesScreenView.modelTemperatureHistory.clear();
      phaseChangesScreenView.updatePhaseDiagram();
      phaseChangesScreenView.phaseDiagram.setDepictingWater( moleculeId === StatesOfMatterConstants.WATER );
      if ( isInteractionDiagramEnabled ) {
        if ( moleculeId === StatesOfMatterConstants.USER_DEFINED_MOLECULE ||
             moleculeId === StatesOfMatterConstants.DIATOMIC_OXYGEN ||
             moleculeId === StatesOfMatterConstants.WATER ) {
          epsilonControlInteractionPotentialDiagram.setMolecular( true );
        }
        else {
          epsilonControlInteractionPotentialDiagram.setMolecular( false );
        }
      }
      // enable/disable phase diagram on molecule type change
      if ( moleculeId === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        if ( phaseChangesScreenView.hasChild( phaseChangesScreenView.phaseDiagram ) ) {
          phaseChangesScreenView.removeChild( phaseChangesScreenView.phaseDiagram );
        }
        multipleParticleModel.interactionStrengthProperty.value = StatesOfMatterConstants.MAX_EPSILON;
        if ( isInteractionDiagramEnabled ) {
          epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + INSET * 0.3;
        }
      }
      else {
        if ( !phaseChangesScreenView.hasChild( phaseChangesScreenView.phaseDiagram ) ) {
          phaseChangesScreenView.addChild( phaseChangesScreenView.phaseDiagram );
          phaseChangesScreenView.phaseDiagram.right = phaseChangesScreenView.layoutBounds.right - LAY_BOUNDS_RIGHT_OFFSET;
          if ( isInteractionDiagramEnabled ) {
            epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + INSET * 0.3;
            phaseChangesScreenView.phaseDiagram.top = epsilonControlInteractionPotentialDiagram.bottom + INSET * 0.3;
          }
          else {
            phaseChangesScreenView.phaseDiagram.top = phaseChangesMoleculesControlPanel.bottom + INSET * 0.3;
          }
        }
      }
      if ( multipleParticleModel.getContainerExploded() ) {
        particleContainerNode.reset();
      }
    } );
    multipleParticleModel.particleContainerHeightProperty.link( function() {
      compositeThermometerNode.updatePositionAndOrientation();
    } );

    multipleParticleModel.temperatureSetPointProperty.link( function() {
      phaseChangesScreenView.modelTemperatureHistory.clear();
      phaseChangesScreenView.updatePhaseDiagram();
    } );
  }

  return inherit( ScreenView, PhaseChangesScreenView, {

    step: function() {
      this.particlesLayer.step();
    },

    /**
     * @private
     * Update the position of the marker on the phase diagram based on the
     * temperature and pressure values within the model.
     */
    updatePhaseDiagram: function() {

      // If the container has exploded, don't bother showing the dot.
      if ( this.multipleParticleModel.getContainerExploded() ) {
        this.phaseDiagram.setStateMarkerVisible( false );
      }
      else {
        this.phaseDiagram.setStateMarkerVisible( true );
        var movingAverageTemperature = this.updateMovingAverageTemperature( this.multipleParticleModel.getTemperatureSetPoint() );
        var modelPressure = this.multipleParticleModel.getModelPressure();
        var mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( movingAverageTemperature );
        var mappedPressure = this.mapModelTempAndPressureToPhaseDiagramPressure( modelPressure,
          movingAverageTemperature );
        this.phaseDiagram.setStateMarkerPos( mappedTemperature, mappedPressure );

      }
    },

    /**
     * Update and returns the moving average taking into account the new temperature value
     * @private
     * @param {number} newTemperatureValue
     * @returns {number}
     */
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

    /**
     * Map the model temperature to phase diagram temperature based on the phase chart shape.
     * @private
     * @param {number} modelTemperature
     * @returns {number}
     */
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


    /**
     * Map the model temperature and pressure to a normalized pressure value
     * suitable for use in setting the marker position on the phase chart.
     * @private
     * @param {number} modelPressure
     * @param {number} modelTemperature
     * @returns {number}
     */
    mapModelTempAndPressureToPhaseDiagramPressure: function( modelPressure, modelTemperature ) {
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