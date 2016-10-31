// Copyright 2014-2016, University of Colorado Boulder

/**
 * View for the states screen
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CompositeThermometerNode = require( 'STATES_OF_MATTER/common/view/CompositeThermometerNode' );
  var HeaterCoolerNode = require( 'SCENERY_PHET/HeaterCoolerNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
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
  var STEP_BUTTON_X_OFFSET = 50;
  var CONTROL_PANEL_X_INSET = 15;
  var CONTROL_PANEL_Y_INSET = 10;

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @constructor
   */
  function StatesScreenView( multipleParticleModel ) {

    var self = this;
    ScreenView.call( this, StatesOfMatterConstants.SCREEN_VIEW_OPTIONS );

    // Create the model-view transform. The multipliers for the 2nd parameter can be used to adjust where the point
    // (0, 0) in the model, which is the lower left corner of the particle container, appears in the view.The final
    // parameter is the scale, and can be changed to make the view more zoomed in or out.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( this.layoutBounds.width * 0.325, this.layoutBounds.height * 0.75 ),
      StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / MultipleParticleModel.PARTICLE_CONTAINER_WIDTH
    );

    // Figure out where in the view the interior of the particle container will be.
    var particleContainerViewBounds = new Bounds2(
      modelViewTransform.modelToViewX( 0 ),
      modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( multipleParticleModel.getInitialParticleContainerHeight() ),
      modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( multipleParticleModel.getParticleContainerWidth() ),
      modelViewTransform.modelToViewY( 0 )
    );

    // add particle container
    this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, false, false );
    this.addChild( this.particleContainerNode );

    // add heater/cooler node
    var heaterCoolerNode = new HeaterCoolerNode( {
      scale: 0.8,
      centerX: particleContainerViewBounds.centerX,
      top: particleContainerViewBounds.bottom + 30 // distance from bottom of particle area empirically determined
    } );
    this.addChild( heaterCoolerNode );

    // hook up the heater/cooler node to the model
    heaterCoolerNode.heatCoolLevelProperty.link( function( heat ) {
      multipleParticleModel.setHeatingCoolingAmount( heat );
    } );

    // add the thermometer node
    this.compositeThermometerNode = new CompositeThermometerNode( multipleParticleModel, modelViewTransform, {
      font: new PhetFont( 20 ),
      fill: 'white',
      centerX: particleContainerViewBounds.minX + particleContainerViewBounds.width * 0.2 // left top of container
    } );
    this.addChild( this.compositeThermometerNode );

    // add the selection panel for the molecules
    var atomsAndMoleculesSelectionPanel = new StatesMoleculesControlPanel( multipleParticleModel.moleculeTypeProperty, {
      right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
      top: this.layoutBounds.top + CONTROL_PANEL_Y_INSET
    } );
    this.addChild( atomsAndMoleculesSelectionPanel );

    // add phases control node
    var solidLiquidGasPhaseControlNode = new StatesPhaseControlNode( multipleParticleModel, {
      right: atomsAndMoleculesSelectionPanel.right,
      top: atomsAndMoleculesSelectionPanel.bottom + CONTROL_PANEL_Y_INSET
    } );
    this.addChild( solidLiquidGasPhaseControlNode );

    // add reset all button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        multipleParticleModel.reset();
        self.particleContainerNode.reset();
        self.compositeThermometerNode.reset();
      },
      right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
      bottom: this.layoutBounds.bottom - 5,
      radius: StatesOfMatterConstants.RESET_ALL_BUTTON_RADIUS,
      touchAreaDilation: 4
    } );
    this.addChild( resetAllButton );

    // add the play/pause and step buttons
    var stepButton = new StepForwardButton( {
      playingProperty: multipleParticleModel.isPlayingProperty,
      listener: function() { multipleParticleModel.stepInternal( 0.016 ); },
      radius: 12,
      stroke: 'black',
      fill: '#005566',
      right: heaterCoolerNode.left - STEP_BUTTON_X_OFFSET,
      centerY: heaterCoolerNode.centerY,
      touchAreaDilation: 4
    } );
    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( multipleParticleModel.isPlayingProperty, {
      radius: 18,
      stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - 10,
      touchAreaDilation: 4
    } );
    this.addChild( playPauseButton );

    this.particleContainerHeightPropertyChanged = false;
    multipleParticleModel.particleContainerHeightProperty.link( function( containerHeight, previousContainerHeight ) {

      // Set the thermometer's Y position to match that of the lid.
      self.compositeThermometerNode.centerY = modelViewTransform.modelToViewY( containerHeight );

      // If the container explodes, the thermometer moves up with it and rotates.
      if ( multipleParticleModel.isExplodedProperty.get() ) {

        var containerHeightChange = previousContainerHeight - containerHeight;
        self.compositeThermometerNode.rotateAround(
          self.compositeThermometerNode.center,
          containerHeightChange * 0.0001 * Math.PI );
      }

      self.particleContainerHeightPropertyChanged = true;
    } );

    // if the appropriate query param is set, show some information used in debugging time step adjustments
    // TODO: Consider removing this once performance issues are worked out.
    if ( StatesOfMatterQueryParameters.debugTimeStep ) {
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

  statesOfMatter.register( 'StatesScreenView', StatesScreenView );

  return inherit( ScreenView, StatesScreenView, {
    step: function() {
      this.particleContainerNode.step();
    }
  } );
} );
