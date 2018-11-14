// Copyright 2014-2017, University of Colorado Boulder

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
  var Dimension2 = require( 'DOT/Dimension2' );
  var HeaterCoolerNode = require( 'SCENERY_PHET/HeaterCoolerNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var SOMPlayPauseStepControl = require( 'STATES_OF_MATTER/common/view/SOMPlayPauseStepControl' );
  var StatesMoleculesControlPanel = require( 'STATES_OF_MATTER/states/view/StatesMoleculesControlPanel' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesPhaseControlNode = require( 'STATES_OF_MATTER/states/view/StatesPhaseControlNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var CONTROL_PANEL_X_INSET = 15;
  var CONTROL_PANEL_Y_INSET = 10;
  var CONTROL_PANEL_WIDTH = 175; // empirically determined by looks

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @constructor
   */
  function StatesScreenView( multipleParticleModel ) {

    var self = this;
    ScreenView.call( this, SOMConstants.SCREEN_VIEW_OPTIONS );

    // Create the model-view transform. The multipliers for the 2nd parameter can be used to adjust where the point
    // (0, 0) in the model, which is the lower left corner of the particle container, appears in the view.The final
    // parameter is the scale, and can be changed to make the view more zoomed in or out.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( this.layoutBounds.width * 0.325, this.layoutBounds.height * 0.75 ),
      SOMConstants.VIEW_CONTAINER_WIDTH / MultipleParticleModel.PARTICLE_CONTAINER_WIDTH
    );

    // Figure out where in the view the interior of the particle container will be.
    var particleContainerViewBounds = new Bounds2(
      modelViewTransform.modelToViewX( 0 ),
      modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( multipleParticleModel.getInitialParticleContainerHeight() ),
      modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( multipleParticleModel.getParticleContainerWidth() ),
      modelViewTransform.modelToViewY( 0 )
    );

    // @private particle container
    this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, false, false );
    this.addChild( this.particleContainerNode );

    // @private add heater/cooler node
    var heaterCoolerNode = new HeaterCoolerNode( {
      scale: 0.89,
      centerX: particleContainerViewBounds.centerX,
      top: particleContainerViewBounds.bottom + 30 // distance from bottom of particle area empirically determined
    } );
    this.addChild( heaterCoolerNode );

    // hook up the heater/cooler node to the model
    heaterCoolerNode.heatCoolAmountProperty.link( function( heat ) {
      multipleParticleModel.setHeatingCoolingAmount( heat );
    } );

    // the thermometer node should be at the top left of the container
    var thermometerInitialCenterPosition = new Vector2(
      particleContainerViewBounds.minX + particleContainerViewBounds.width * 0.2,
      modelViewTransform.modelToViewY( multipleParticleModel.particleContainerHeightProperty.value )
    );

    // @private thermometer node
    this.compositeThermometerNode = new CompositeThermometerNode( multipleParticleModel, modelViewTransform, {
      font: new PhetFont( 20 ),
      fill: 'white',
      center: thermometerInitialCenterPosition
    } );
    this.addChild( this.compositeThermometerNode );

    // selection panel for the atoms/molecules
    var atomsAndMoleculesSelectionPanel = new StatesMoleculesControlPanel( multipleParticleModel.substanceProperty, {
      right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
      top: this.layoutBounds.top + CONTROL_PANEL_Y_INSET,
      minWidth: CONTROL_PANEL_WIDTH,
      maxWidth: CONTROL_PANEL_WIDTH
    } );
    this.addChild( atomsAndMoleculesSelectionPanel );

    // phases control node
    var solidLiquidGasPhaseControlNode = new StatesPhaseControlNode( multipleParticleModel, {
      right: atomsAndMoleculesSelectionPanel.right,
      top: atomsAndMoleculesSelectionPanel.bottom + CONTROL_PANEL_Y_INSET,
      buttonWidth: CONTROL_PANEL_WIDTH
    } );
    this.addChild( solidLiquidGasPhaseControlNode );

    var resetAllButton = new ResetAllButton( {
      listener: function() {
        multipleParticleModel.reset();
        self.compositeThermometerNode.reset();
      },
      radius: SOMConstants.RESET_ALL_BUTTON_RADIUS,
      touchAreaDilation: SOMConstants.RESET_ALL_BUTTON_TOUCH_AREA_DILATION,
      right: this.layoutBounds.maxX - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_SIDE,
      bottom: this.layoutBounds.maxY - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_BOTTOM
    } );
    this.addChild( resetAllButton );

    this.addChild( new SOMPlayPauseStepControl(
      multipleParticleModel.isPlayingProperty,
      multipleParticleModel.stepInternal.bind( multipleParticleModel ),
      { right: heaterCoolerNode.left - 50, centerY: heaterCoolerNode.centerY }
    ) );

    // @private
    this.particleContainerHeightPropertyChanged = false;
    multipleParticleModel.particleContainerHeightProperty.link( function( containerHeight, previousContainerHeight ) {

      // set or reset any rotation of the thermometer
      if ( multipleParticleModel.isExplodedProperty.get() ) {

        var containerHeightChange = previousContainerHeight - containerHeight;
        self.compositeThermometerNode.rotateAround(
          self.compositeThermometerNode.center,
          containerHeightChange * 0.0001 * Math.PI
        );
        self.compositeThermometerNode.centerY = modelViewTransform.modelToViewY( containerHeight );
      }
      else if ( !self.compositeThermometerNode.center.equals( thermometerInitialCenterPosition ) ||
                self.compositeThermometerNode.getRotation() !== 0 ) {

        // restore the thermometer's initial position, since it can be moved due to an explosion
        self.compositeThermometerNode.setRotation( 0 );
        self.compositeThermometerNode.center = thermometerInitialCenterPosition;
      }

      self.particleContainerHeightPropertyChanged = true;
    } );
  }

  statesOfMatter.register( 'StatesScreenView', StatesScreenView );

  return inherit( ScreenView, StatesScreenView, {

    /**
     * @public
     */
    step: function() {
      this.particleContainerNode.step();
    }
  } );
} );
