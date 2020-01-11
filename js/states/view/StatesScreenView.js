// Copyright 2014-2019, University of Colorado Boulder

/**
 * View for the states screen
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const CompositeThermometerNode = require( 'STATES_OF_MATTER/common/view/CompositeThermometerNode' );
  const HeaterCoolerNode = require( 'SCENERY_PHET/HeaterCoolerNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Range = require( 'DOT/Range' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const SOMPlayPauseStepControl = require( 'STATES_OF_MATTER/common/view/SOMPlayPauseStepControl' );
  const StatesMoleculesControlPanel = require( 'STATES_OF_MATTER/states/view/StatesMoleculesControlPanel' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const StatesPhaseControlNode = require( 'STATES_OF_MATTER/states/view/StatesPhaseControlNode' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const CONTROL_PANEL_X_INSET = 15;
  const CONTROL_PANEL_Y_INSET = 10;
  const CONTROL_PANEL_WIDTH = 175; // empirically determined by looks

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Tandem} tandem
   * @constructor
   */
  function StatesScreenView( multipleParticleModel, tandem ) {

    const self = this;
    ScreenView.call( this, SOMConstants.SCREEN_VIEW_OPTIONS );

    // Create the model-view transform. The multipliers for the 2nd parameter can be used to adjust where the point
    // (0, 0) in the model, which is the lower left corner of the particle container, appears in the view.The final
    // parameter is the scale, and can be changed to make the view more zoomed in or out.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( this.layoutBounds.width * 0.325, this.layoutBounds.height * 0.75 ),
      SOMConstants.VIEW_CONTAINER_WIDTH / MultipleParticleModel.PARTICLE_CONTAINER_WIDTH
    );

    // Figure out where in the view the interior of the particle container will be.
    const particleContainerViewBounds = new Bounds2(
      modelViewTransform.modelToViewX( 0 ),
      modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( multipleParticleModel.getInitialParticleContainerHeight() ),
      modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( multipleParticleModel.getParticleContainerWidth() ),
      modelViewTransform.modelToViewY( 0 )
    );

    // @private particle container
    this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, false, false, tandem );
    this.addChild( this.particleContainerNode );

    // @private add heater/cooler node
    const heaterCoolerNode = new HeaterCoolerNode( new NumberProperty( 0, {
      range: new Range( -1, 1 ) // +1 for max heating, -1 for max cooling
    } ), {
      scale: 0.79,
      centerX: particleContainerViewBounds.centerX,
      top: particleContainerViewBounds.bottom + 30 // distance from bottom of particle area empirically determined
    } );
    this.addChild( heaterCoolerNode );

    // hook up the heater/cooler node to the model
    heaterCoolerNode.heatCoolAmountProperty.link( function( heat ) {
      multipleParticleModel.setHeatingCoolingAmount( heat );
    } );

    // the thermometer node should be at the top left of the container
    const thermometerInitialCenterPosition = new Vector2(
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
    const atomsAndMoleculesSelectionPanel = new StatesMoleculesControlPanel( multipleParticleModel.substanceProperty, {
      right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
      top: this.layoutBounds.top + CONTROL_PANEL_Y_INSET,
      minWidth: CONTROL_PANEL_WIDTH,
      maxWidth: CONTROL_PANEL_WIDTH,
      tandem: tandem.createTandem( 'atomsAndMoleculesSelectionPanel' )
    } );
    this.addChild( atomsAndMoleculesSelectionPanel );

    // phases control node
    const solidLiquidGasPhaseControlNode = new StatesPhaseControlNode( multipleParticleModel, {
      right: atomsAndMoleculesSelectionPanel.right,
      top: atomsAndMoleculesSelectionPanel.bottom + CONTROL_PANEL_Y_INSET,
      buttonWidth: CONTROL_PANEL_WIDTH,
      tandem: tandem.createTandem( 'solidLiquidGasPhaseControlNode' )
    } );
    this.addChild( solidLiquidGasPhaseControlNode );

    const resetAllButton = new ResetAllButton( {
      listener: function() {
        multipleParticleModel.reset();
        self.compositeThermometerNode.reset();
      },
      radius: SOMConstants.RESET_ALL_BUTTON_RADIUS,
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

        const containerHeightChange = previousContainerHeight - containerHeight;
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
