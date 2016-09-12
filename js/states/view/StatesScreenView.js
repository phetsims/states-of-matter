// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the states screen
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CompositeThermometerNode = require( 'STATES_OF_MATTER/common/view/CompositeThermometerNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HeaterCoolerNode = require( 'SCENERY_PHET/HeaterCoolerNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var ParticleImageCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleImageCanvasNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StatesMoleculesControlPanel = require( 'STATES_OF_MATTER/states/view/StatesMoleculesControlPanel' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var StatesOfMatterQueryParameters = require( 'STATES_OF_MATTER/common/StatesOfMatterQueryParameters' );
  var StatesPhaseControlNode = require( 'STATES_OF_MATTER/states/view/StatesPhaseControlNode' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var INSET = 10;
  var HEATER_COOLER_X_OFFSET = 10;
  var STEP_BUTTON_X_OFFSET = 50;
  var STEP_BUTTON_Y_OFFSET = 20;
  var COMPOSITE_THERMOMETER_NODE_LEFT_OFFSET = 90;
  var LAYOUT_BOUNDS_RIGHT_OFFSET = 15;
  var LAYOUT_BOUNDS_Y_OFFSET = 10;
  var PARTICLES_LAYER_X_OFFSET = 148;
  var PARTICLES_LAYER_Y_OFFSET = 680;
  var PARTICLE_CANVAS_LAYER_BOUND_LIMIT = 1000;

  /**
   *
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @constructor
   */
  function StatesScreenView( multipleParticleModel ) {

    var self = this;
    ScreenView.call( this, StatesOfMatterConstants.SCREEN_VIEW_OPTIONS );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );

    // add heater/cooler Node
    var heaterCoolerNode = new HeaterCoolerNode( {
      scale: 0.8,
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - INSET
    } );
    heaterCoolerNode.heatCoolLevelProperty.link( function( heat ) {
      multipleParticleModel.setHeatingCoolingAmount( heat );
    } );

    // add particle container
    this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, false, false,
      {
        centerX: heaterCoolerNode.centerX - HEATER_COOLER_X_OFFSET,
        bottom: heaterCoolerNode.top - INSET
      } );

    // add particle Canvas layer
    this.particlesLayer = new ParticleImageCanvasNode(
      multipleParticleModel.particles,
      modelViewTransform,
      {
        centerX: heaterCoolerNode.centerX - PARTICLES_LAYER_X_OFFSET,
        bottom:  heaterCoolerNode.top + PARTICLES_LAYER_Y_OFFSET,
        canvasBounds: new Bounds2( -PARTICLE_CANVAS_LAYER_BOUND_LIMIT, -PARTICLE_CANVAS_LAYER_BOUND_LIMIT,
          PARTICLE_CANVAS_LAYER_BOUND_LIMIT, PARTICLE_CANVAS_LAYER_BOUND_LIMIT )
      } );
    this.addChild( this.particlesLayer );
    this.addChild( this.particleContainerNode );

    this.addChild( heaterCoolerNode );

    // add compositeThermometer Node
    this.compositeThermometerNode = new CompositeThermometerNode( multipleParticleModel, modelViewTransform, {
      font: new PhetFont( 20 ),
      fill: 'white',
      right: this.particleContainerNode.left + COMPOSITE_THERMOMETER_NODE_LEFT_OFFSET
    } );
    this.addChild( this.compositeThermometerNode );

    // add Molecule ControlPanel
    var solidLiquidGasMoleculesControlPanel = new StatesMoleculesControlPanel( multipleParticleModel.moleculeTypeProperty, {
      right: this.layoutBounds.right - LAYOUT_BOUNDS_RIGHT_OFFSET,
      top: this.layoutBounds.top + LAYOUT_BOUNDS_Y_OFFSET
    } );
    this.addChild( solidLiquidGasMoleculesControlPanel );

    // add phases control node
    var solidLiquidGasPhaseControlNode = new StatesPhaseControlNode( multipleParticleModel, {
      right: solidLiquidGasMoleculesControlPanel.right,
      top: solidLiquidGasMoleculesControlPanel.bottom + LAYOUT_BOUNDS_Y_OFFSET
    } );
    this.addChild( solidLiquidGasPhaseControlNode );

    // add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          multipleParticleModel.reset();
          self.particleContainerNode.reset();
          self.compositeThermometerNode.reset();
        },
        right: this.layoutBounds.right - LAYOUT_BOUNDS_RIGHT_OFFSET,
        bottom: this.layoutBounds.bottom - 5,
        radius: StatesOfMatterConstants.RESET_ALL_BUTTON_RADIUS,
        touchAreaDilation: 4
      } );

    // add play pause button and step button
    var stepButton = new StepForwardButton( {
      playingProperty: multipleParticleModel.isPlayingProperty,
      listener: function() { multipleParticleModel.stepInternal( 0.016 ); },
      radius: 12,
      stroke: 'black',
      fill: '#005566',
      right: heaterCoolerNode.left - STEP_BUTTON_X_OFFSET,
      bottom: heaterCoolerNode.bottom - STEP_BUTTON_Y_OFFSET,
      touchAreaDilation: 4
    } );

    this.addChild( stepButton );
    multipleParticleModel.moleculeTypeProperty.link( function() {
      multipleParticleModel.temperatureSetPointProperty._notifyObservers();
    } );

    var playPauseButton = new PlayPauseButton( multipleParticleModel.isPlayingProperty, {
      radius: 18,
      stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - INSET,
      touchAreaDilation: 4
    } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    this.particleContainerHeightPropertyChanged = false;
    multipleParticleModel.particleContainerHeightProperty.link( function() {
      self.particleContainerHeightPropertyChanged = true;
      //compositeThermometerNode.updatePositionAndOrientation();
    } );

    // center the heater cooler node with respect to particle container node
    heaterCoolerNode.centerX = heaterCoolerNode.centerX - HEATER_COOLER_X_OFFSET;

    // if the appropriate query param is set, show some information used in debugging time step adjustments
    // TODO: Consider removing this once performance issues are worked out.
    if ( StatesOfMatterQueryParameters.DEBUG_TIME_STEP ){
      var keepingUpReadout = new Text( '', {
        font: new PhetFont( 20 ),
        fill: 'red',
        top: 40,
        left: 20
      } );
      this.addChild( keepingUpReadout );
      multipleParticleModel.keepingUpProperty.link( function( keepingUp ){
        keepingUpReadout.text = keepingUp.toString();
      } );
      var averageDtReadout = new Text( '', {
        font: new PhetFont( 20 ),
        fill: 'red',
        top: keepingUpReadout.bottom + 5,
        left: keepingUpReadout.left
      } );
      this.addChild( averageDtReadout );
      multipleParticleModel.averageDtProperty.link( function( averageDt ){
        averageDtReadout.text = averageDt.toFixed( 3 );
      } );
      var maxAdvanceTimePerStep = new Text( '', {
        font: new PhetFont( 20 ),
        fill: 'red',
        top: averageDtReadout.bottom + 5,
        left: averageDtReadout.left
      } );
      this.addChild( maxAdvanceTimePerStep );
      multipleParticleModel.maxParticleMoveTimePerStepProperty.link( function( maxAdvance ){
        maxAdvanceTimePerStep.text = maxAdvance.toFixed( 3 );
      } );
    }
  }

  statesOfMatter.register( 'StatesScreenView', StatesScreenView );

  return inherit( ScreenView, StatesScreenView, {
    step: function() {
      this.compositeThermometerNode.step();
      this.particlesLayer.step();
      if ( this.particleContainerHeightPropertyChanged ){
        this.compositeThermometerNode.updatePositionAndOrientation();
        this.particleContainerNode.handleContainerSizeChanged();
        this.particleContainerHeightPropertyChanged = false;
      }
    }
  } );
} );
