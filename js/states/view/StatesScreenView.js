// Copyright 2014-2020, University of Colorado Boulder

/**
 * View for the states screen
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import inherit from '../../../../phet-core/js/inherit.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import HeaterCoolerNode from '../../../../scenery-phet/js/HeaterCoolerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import MultipleParticleModel from '../../common/model/MultipleParticleModel.js';
import SOMConstants from '../../common/SOMConstants.js';
import CompositeThermometerNode from '../../common/view/CompositeThermometerNode.js';
import ParticleContainerNode from '../../common/view/ParticleContainerNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesMoleculesControlPanel from './StatesMoleculesControlPanel.js';
import StatesPhaseControlNode from './StatesPhaseControlNode.js';

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
    modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( multipleParticleModel.getInitialContainerHeight() ),
    modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( multipleParticleModel.getContainerWidth() ),
    modelViewTransform.modelToViewY( 0 )
  );

  // @private particle container
  this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, false, false, tandem );
  this.addChild( this.particleContainerNode );

  // @private add heater/cooler node
  const heaterCoolerNode = new HeaterCoolerNode( multipleParticleModel.heatingCoolingAmountProperty, {
    scale: 0.79,
    centerX: particleContainerViewBounds.centerX,
    top: particleContainerViewBounds.bottom + 30, // distance from bottom of particle area empirically determined
    tandem: tandem.createTandem( 'heaterCoolerNode' )
  } );
  this.addChild( heaterCoolerNode );

  // the thermometer node should be at the top left of the container
  const thermometerInitialCenterPosition = new Vector2(
    particleContainerViewBounds.minX + particleContainerViewBounds.width * 0.2,
    modelViewTransform.modelToViewY( multipleParticleModel.containerHeightProperty.value )
  );

  // @private thermometer node
  this.compositeThermometerNode = new CompositeThermometerNode( multipleParticleModel, modelViewTransform, {
    font: new PhetFont( 20 ),
    fill: 'white',
    center: thermometerInitialCenterPosition,
    tandem: tandem.createTandem( 'compositeThermometerNode' )
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
    bottom: this.layoutBounds.maxY - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_BOTTOM,
    tandem: tandem.createTandem( 'resetAllButton' )
  } );
  this.addChild( resetAllButton );

  // add the play/pause/step control
  this.addChild( new TimeControlNode( multipleParticleModel.isPlayingProperty, {
    playPauseStepButtonOptions: {
      playPauseButtonOptions: {
        radius: SOMConstants.PLAY_PAUSE_BUTTON_RADIUS
      },
      stepForwardButtonOptions: {
        radius: SOMConstants.STEP_BUTTON_RADIUS,
        listener: () => {
          multipleParticleModel.stepInternal( SOMConstants.NOMINAL_TIME_STEP );
        }
      },
      playPauseStepXSpacing: 10
    },

    // position empirically determined
    right: heaterCoolerNode.left - 50,
    centerY: heaterCoolerNode.centerY,

    tandem: tandem.createTandem( 'timeControlNode' )
  } ) );

  // @private
  this.particleContainerHeightPropertyChanged = false;
  multipleParticleModel.containerHeightProperty.link( function( containerHeight, previousContainerHeight ) {

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

export default inherit( ScreenView, StatesScreenView, {

  /**
   * @public
   */
  step: function() {
    this.particleContainerNode.step();
  }
} );