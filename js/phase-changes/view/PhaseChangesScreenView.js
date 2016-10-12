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
  var BicyclePumpNode = require( 'STATES_OF_MATTER/common/view/BicyclePumpNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var CompositeThermometerNode = require( 'STATES_OF_MATTER/common/view/CompositeThermometerNode' );
  var HeaterCoolerNode = require( 'SCENERY_PHET/HeaterCoolerNode' );
  var EpsilonControlInteractionPotentialDiagram = require( 'STATES_OF_MATTER/phase-changes/view/EpsilonControlInteractionPotentialDiagram' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var ParticleImageCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleImageCanvasNode' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var PhaseChangesMoleculesControlPanel = require( 'STATES_OF_MATTER/phase-changes/view/PhaseChangesMoleculesControlPanel' );
  var PhaseDiagram = require( 'STATES_OF_MATTER/phase-changes/view/PhaseDiagram' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var StatesOfMatterQueryParameters = require( 'STATES_OF_MATTER/common/StatesOfMatterQueryParameters' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var returnLidString = require( 'string!STATES_OF_MATTER/returnLid' );

  // constants
  var INSET = 10;
  var PANEL_WIDTH = 170; // empirically determined to be wide enough for all contents using English strings with some margin
  var INTER_PANEL_SPACING = 8;

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

  // Used for calculating moving averages needed to mellow out the graph behavior.  Value empirically determined.
  var MAX_NUM_HISTORY_SAMPLES = 100;

  // constants used in the layout process
  var PARTICLE_CANVAS_LAYER_BOUND_LIMIT = 1000;
  var PARTICLE_LAYER_X_OFFSET = 151;
  var PARTICLE_LAYER_Y_OFFSET = 680;
  var PARTICLE_CONTAINER_X_OFFSET = 60;
  var X_INSET = 15;
  var STEP_BUTTON_X_OFFSET = 50;
  var STEP_BUTTON_Y_OFFSET = 20;
  var BICYCLE_PUMP_NODE_X_OFFSET = 100;
  var RETURN_LID_BUTTON_Y_OFFSET = 100;

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {boolean} isInteractionDiagramEnabled
   * @constructor
   */
  function PhaseChangesScreenView( multipleParticleModel, isInteractionDiagramEnabled ) {
    var self = this;

    ScreenView.call( this, StatesOfMatterConstants.SCREEN_VIEW_OPTIONS );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ),
      mvtScale
    );

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
    this.modelTemperatureHistory = new ObservableArray( { allowDuplicates: true } );

    // create the particle container, portions of which are added separately to the scene graph
    this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, true, true, {
      centerX: heaterCoolerNode.centerX - PARTICLE_CONTAINER_X_OFFSET,
      bottom: heaterCoolerNode.top - INSET
    } );

    // add the opening at the top of the particle container, done at this point for correctly layering
    // TODO: This are tweaked to work out, should be fixed, see https://github.com/phetsims/states-of-matter/issues/162
    this.particleContainerNode.openingNode.centerX = heaterCoolerNode.centerX - 9;
    this.particleContainerNode.openingNode.centerY = 93;
    this.addChild( this.particleContainerNode.openingNode );

    // add particle canvas layer for particle rendering
    this.particlesLayer = new ParticleImageCanvasNode( multipleParticleModel.particles, modelViewTransform, {
      centerX: heaterCoolerNode.centerX - PARTICLE_LAYER_X_OFFSET,
      bottom: heaterCoolerNode.top + PARTICLE_LAYER_Y_OFFSET,
      canvasBounds: new Bounds2( -PARTICLE_CANVAS_LAYER_BOUND_LIMIT, -PARTICLE_CANVAS_LAYER_BOUND_LIMIT,
        PARTICLE_CANVAS_LAYER_BOUND_LIMIT, PARTICLE_CANVAS_LAYER_BOUND_LIMIT )
    } );
    this.addChild( this.particlesLayer );

    // add the main portion of the particle container
    this.addChild( this.particleContainerNode );

    // adjust the container back node position
    this.addChild( heaterCoolerNode );

    // add compositeThermometer node
    this.compositeThermometerNode = new CompositeThermometerNode( multipleParticleModel, modelViewTransform, {
      font: new PhetFont( 20 ),
      fill: 'white',
      right: heaterCoolerNode.left + 2 * INSET
    } );
    this.addChild( this.compositeThermometerNode );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        self.modelTemperatureHistory.clear();
        multipleParticleModel.reset();
        self.compositeThermometerNode.setRotation( 0 );
        self.particleContainerNode.reset();
        self.compositeThermometerNode.reset();
        //Reset  phase diagram state in SOM basic version
        multipleParticleModel.expandedProperty.value = isInteractionDiagramEnabled;
      },
      right: this.layoutBounds.right - X_INSET,
      bottom: this.layoutBounds.bottom - 5,
      radius: StatesOfMatterConstants.RESET_ALL_BUTTON_RADIUS,
      touchAreaDilation: 4
    } );

    // add play pause button and step button
    var stepButton = new StepForwardButton( {
      playingProperty: multipleParticleModel.isPlayingProperty,
      listener: function() { multipleParticleModel.stepInternal( 1 / 60 ); },
      radius: 12,
      stroke: 'black',
      fill: '#005566',
      right: heaterCoolerNode.left - STEP_BUTTON_X_OFFSET,
      bottom: heaterCoolerNode.bottom - STEP_BUTTON_Y_OFFSET,
      touchAreaDilation: 4
    } );
    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( multipleParticleModel.isPlayingProperty, {
      radius: 18, stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - INSET,
      touchAreaDilation: 4
    } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    // add bicycle pump node
    this.addChild( new BicyclePumpNode( 200, 250, multipleParticleModel, {
      bottom: heaterCoolerNode.bottom,
      right: self.particleContainerNode.left + BICYCLE_PUMP_NODE_X_OFFSET
    } ) );

    // add return lid button
    this.returnLidButton = new TextPushButton( returnLidString, {
      font: new PhetFont( 14 ),
      baseColor: 'yellow',
      maxWidth: 100,
      listener: function() {
        multipleParticleModel.returnLid();
        self.particleContainerNode.reset();
      },
      visible: false,
      xMargin: 10,
      right: self.particleContainerNode.left - 2 * X_INSET,
      top: self.particleContainerNode.centerY + RETURN_LID_BUTTON_Y_OFFSET
    } );
    this.addChild( this.returnLidButton );
    multipleParticleModel.isExplodedProperty.linkAttribute( this.returnLidButton, 'visible' );

    // add interaction potential diagram
    if ( isInteractionDiagramEnabled ) {
      var epsilonControlInteractionPotentialDiagram = new EpsilonControlInteractionPotentialDiagram(
        StatesOfMatterConstants.MAX_SIGMA,
        StatesOfMatterConstants.MIN_EPSILON,
        false,
        multipleParticleModel,
        {
          maxWidth: PANEL_WIDTH,
          minWidth: PANEL_WIDTH,
          right: this.layoutBounds.right - X_INSET
        }
      );
      this.addChild( epsilonControlInteractionPotentialDiagram );
    }

    // add the atom/molecule selection control panel
    var phaseChangesMoleculesControlPanel = new PhaseChangesMoleculesControlPanel(
      multipleParticleModel,
      isInteractionDiagramEnabled,
      {
        right: this.layoutBounds.right - X_INSET,
        top: 5,
        maxWidth: PANEL_WIDTH,
        minWidth: PANEL_WIDTH
      }
    );
    this.addChild( phaseChangesMoleculesControlPanel );

    // add phase diagram - in SOM basic version by default phase diagram should be closed.
    multipleParticleModel.expandedProperty.value = isInteractionDiagramEnabled;
    this.phaseDiagram = new PhaseDiagram( multipleParticleModel.expandedProperty, {
      minWidth: PANEL_WIDTH,
      maxWidth: PANEL_WIDTH,
      right: phaseChangesMoleculesControlPanel.right,
      top: phaseChangesMoleculesControlPanel.top + INTER_PANEL_SPACING
    } );
    this.addChild( this.phaseDiagram );

    multipleParticleModel.isExplodedProperty.link( function() {
      self.modelTemperatureHistory.clear();
      self.updatePhaseDiagram();
    } );

    multipleParticleModel.moleculeTypeProperty.link( function( moleculeId ) {
      self.modelTemperatureHistory.clear();
      self.updatePhaseDiagram();
      self.phaseDiagram.setDepictingWater( moleculeId === StatesOfMatterConstants.WATER );
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

      // don't show the phase diagram for adjustable attraction, since we need the space for other things
      if ( moleculeId === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        self.phaseDiagram.visible = false;
        if ( isInteractionDiagramEnabled ) {
          epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + INTER_PANEL_SPACING;
        }
      }
      else {
        self.phaseDiagram.visible = true;
        if ( isInteractionDiagramEnabled ) {
          epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + INTER_PANEL_SPACING;
          self.phaseDiagram.top = epsilonControlInteractionPotentialDiagram.bottom + INTER_PANEL_SPACING;
        }
        else {
          self.phaseDiagram.top = phaseChangesMoleculesControlPanel.bottom + INTER_PANEL_SPACING;
        }
      }
      if ( multipleParticleModel.getContainerExploded() ) {
        self.particleContainerNode.reset();
      }
    } );
    this.particleContainerHeightPropertyChanged = false;
    multipleParticleModel.particleContainerHeightProperty.link( function() {
      self.particleContainerHeightPropertyChanged = true;
      self.updatePhaseDiagram();
    } );

    multipleParticleModel.temperatureSetPointProperty.link( function() {
      self.modelTemperatureHistory.clear();
      self.updatePhaseDiagram();
      self.updatePhaseDiagram();
    } );

    multipleParticleModel.particles.lengthProperty.link( function() {
      self.updatePhaseDiagram();
    } );

    // center the heater cooler node with respect to particle container node
    heaterCoolerNode.centerX = heaterCoolerNode.centerX - 10; // empirically determined

    // if the appropriate query param is set, show some information used in debugging time step adjustments
    // TODO: Consider removing this once performance issues are worked out.
    if ( StatesOfMatterQueryParameters.DEBUG_TIME_STEP ) {
      var keepingUpReadout = new Text( '', {
        font: new PhetFont( 20 ),
        fill: 'red',
        top: 40,
        left: 20
      } );
      this.addChild( keepingUpReadout );
      multipleParticleModel.keepingUpProperty.link( function( keepingUp ) {
        keepingUpReadout.text = keepingUp.toString();
      } );
      var averageDtReadout = new Text( '', {
        font: new PhetFont( 20 ),
        fill: 'red',
        top: keepingUpReadout.bottom + 5,
        left: keepingUpReadout.left
      } );
      this.addChild( averageDtReadout );
      multipleParticleModel.averageDtProperty.link( function( averageDt ) {
        averageDtReadout.text = averageDt.toFixed( 3 );
      } );
      var maxAdvanceTimePerStep = new Text( '', {
        font: new PhetFont( 20 ),
        fill: 'red',
        top: averageDtReadout.bottom + 5,
        left: averageDtReadout.left
      } );
      this.addChild( maxAdvanceTimePerStep );
      multipleParticleModel.maxParticleMoveTimePerStepProperty.link( function( maxAdvance ) {
        maxAdvanceTimePerStep.text = maxAdvance.toFixed( 3 );
      } );
    }
  }

  statesOfMatter.register( 'PhaseChangesScreenView', PhaseChangesScreenView );

  return inherit( ScreenView, PhaseChangesScreenView, {

    // @public
    step: function( dt ) {
      this.particlesLayer.step();
      this.compositeThermometerNode.step();
      this.particleContainerNode.pressureMeter.step( dt );
      if ( this.particleContainerHeightPropertyChanged ) {
        this.compositeThermometerNode.updatePositionAndOrientation();
        this.particleContainerNode.handleContainerSizeChanged();
        this.particleContainerNode.fingerNode.handleContainerSizeChanged();
        this.particleContainerNode.fingerNode.updateArrowVisibility();
        this.particleContainerHeightPropertyChanged = false;
      }
    },

    /**
     * Update the position of the marker on the phase diagram based on the temperature and pressure values within the
     * model.
     * @private
     */
    updatePhaseDiagram: function() {

      // If the container has exploded, don't bother showing the dot.
      if ( this.multipleParticleModel.getContainerExploded() || this.multipleParticleModel.particles.length === 0 ) {
        this.phaseDiagram.setStateMarkerVisible( false );
      }
      else {
        this.phaseDiagram.setStateMarkerVisible( true );
        var movingAverageTemperature = this.updateMovingAverageTemperature( this.multipleParticleModel.getTemperatureSetPoint() );
        var modelPressure = this.multipleParticleModel.getModelPressure();
        var mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( movingAverageTemperature );
        var mappedPressure = this.mapModelTempAndPressureToPhaseDiagramPressure( modelPressure, movingAverageTemperature );
        this.phaseDiagram.setStateMarkerPos( mappedTemperature, mappedPressure );
      }
    },

    /**
     * Update and returns the moving average taking into account the new temperature value.
     * @param {number} newTemperatureValue
     * @returns {number}
     * @private
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
     * @param {number} modelTemperature
     * @returns {number}
     * @private
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
     * Map the model temperature and pressure to a normalized pressure value suitable for use in setting the marker
     * position on the phase chart.
     * @param {number} modelPressure
     * @param {number} modelTemperature
     * @returns {number}
     * @private
     */
    mapModelTempAndPressureToPhaseDiagramPressure: function( modelPressure, modelTemperature ) {
      // This method is a total tweak fest.  All values and equations are made to map to the phase diagram, and are NOT
      // based on any real-world equations that define phases of matter.
      var cutOverTemperature = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM - 0.025;
      var mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( modelTemperature );
      var mappedPressure;
      if ( mappedTemperature <= cutOverTemperature ) {
        mappedPressure = Math.pow( mappedTemperature, 1.6 );
      }
      else {
        mappedPressure = Math.pow( mappedTemperature - cutOverTemperature, 1.75 ) + 0.192;
      }
      return Math.min( mappedPressure, 1 );
    }
  } );
} );