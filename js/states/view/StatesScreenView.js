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
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  var HeaterCoolerNode = require( 'SCENERY_PHET/HeaterCoolerNode' );
  var CompositeThermometerNode = require( 'STATES_OF_MATTER/common/view/CompositeThermometerNode' );
  var StatesMoleculesControlPanel = require( 'STATES_OF_MATTER/states/view/StatesMoleculesControlPanel' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var StatesPhaseControlNode = require( 'STATES_OF_MATTER/states/view/StatesPhaseControlNode' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ParticleCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleCanvasNode' );

  // constants
  var inset = 10;
  var heaterCoolerXOffset = 10;
  var stepButtonXOffset = 50;
  var stepButtonYOffset = 20;
  var compositeThermometerNodeLeftOffset = 100;
  var compositeThermometerNodeYOffset = 50;
  var layoutBoundsRightOffset = 15;
  var layoutBoundsYOffset = 10;
  var particlesLayerXOffset = 148;
  var particlesLayerYOffset = 680;
  var particleCanvasLayerBoundLimit = 1000;

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
      bottom: this.layoutBounds.bottom - inset
    } );
    heaterCoolerNode.heatCoolLevelProperty.link( function( heat ) {
      multipleParticleModel.setHeatingCoolingAmount( heat );
    } );

    // add particle container
    this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, false, false,
      {
        centerX: heaterCoolerNode.centerX - heaterCoolerXOffset,
        bottom: heaterCoolerNode.top - inset
      } );

    // add particle container back before  particle Canvas layer
    this.addChild( this.particleContainerNode.openNode );

    // add particle Canvas layer
    this.particlesLayer = new ParticleCanvasNode(
      multipleParticleModel.particles,
      modelViewTransform,
      {
        centerX: heaterCoolerNode.centerX - particlesLayerXOffset,
        bottom:  heaterCoolerNode.top + particlesLayerYOffset,
        canvasBounds: new Bounds2( -particleCanvasLayerBoundLimit, -particleCanvasLayerBoundLimit,
          particleCanvasLayerBoundLimit, particleCanvasLayerBoundLimit )
      } );
    this.addChild( this.particlesLayer );
    this.addChild( this.particleContainerNode );

    // adjust the container back node position
    this.particleContainerNode.openNode.centerX = this.particleContainerNode.centerX;
    this.particleContainerNode.openNode.centerY = this.particleContainerNode.top + 25;
    this.addChild( heaterCoolerNode );

    // add compositeThermometer Node
    this.compositeThermometerNode = new CompositeThermometerNode( multipleParticleModel, modelViewTransform, {
      font: new PhetFont( 20 ),
      fill: 'white',
      right: this.particleContainerNode.left + compositeThermometerNodeLeftOffset,
      centerY: this.particleContainerNode.top + compositeThermometerNodeYOffset
    } );
    this.addChild( this.compositeThermometerNode );

    // add Molecule ControlPanel
    var solidLiquidGasMoleculesControlPanel = new StatesMoleculesControlPanel( multipleParticleModel.moleculeTypeProperty, {
      right: this.layoutBounds.right - layoutBoundsRightOffset,
      top: this.layoutBounds.top + layoutBoundsYOffset
    } );
    this.addChild( solidLiquidGasMoleculesControlPanel );

    // add phases control node
    var solidLiquidGasPhaseControlNode = new StatesPhaseControlNode( multipleParticleModel, {
      right: solidLiquidGasMoleculesControlPanel.right,
      top: solidLiquidGasMoleculesControlPanel.bottom + layoutBoundsYOffset
    } );
    this.addChild( solidLiquidGasPhaseControlNode );

    // add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          multipleParticleModel.reset();
          self.particleContainerNode.reset();
        },
        bottom: this.layoutBounds.bottom - layoutBoundsYOffset / 2,
        right: this.layoutBounds.right - layoutBoundsRightOffset,
        radius: 18
      } );

    // add play pause button and step button
    var stepButton = new StepForwardButton(
      function() {
        multipleParticleModel.stepInternal( 0.016 );
      },
      multipleParticleModel.isPlayingProperty,
      {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        right: heaterCoolerNode.left - stepButtonXOffset,
        bottom: heaterCoolerNode.bottom - stepButtonYOffset
      }
    );

    this.addChild( stepButton );
    multipleParticleModel.moleculeTypeProperty.link( function() {
      multipleParticleModel.temperatureSetPointProperty._notifyObservers();
    } );

    var playPauseButton = new PlayPauseButton( multipleParticleModel.isPlayingProperty, {
      radius: 18,
      stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - inset
    } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    this.particleContainerHeightPropertyChanged = false;
    multipleParticleModel.particleContainerHeightProperty.link( function() {
      self.particleContainerHeightPropertyChanged = true;
      //compositeThermometerNode.updatePositionAndOrientation();
    } );
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
