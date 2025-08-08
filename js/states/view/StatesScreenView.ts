// Copyright 2014-2022, University of Colorado Boulder

/**
 * View for the states screen
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import HeaterCoolerNode from '../../../../scenery-phet/js/HeaterCoolerNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import MultipleParticleModel from '../../common/model/MultipleParticleModel.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMQueryParameters from '../../common/SOMQueryParameters.js';
import ParticleContainerNode from '../../common/view/ParticleContainerNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesMoleculesControlPanel from './StatesMoleculesControlPanel.js';
import StatesPhaseControlNode from './StatesPhaseControlNode.js';

// constants
const CONTROL_PANEL_X_INSET = 15;
const CONTROL_PANEL_Y_INSET = 10;
const CONTROL_PANEL_WIDTH = 175; // empirically determined by looks

class StatesScreenView extends ScreenView {

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Tandem} tandem
   */
  constructor( multipleParticleModel, tandem ) {

    super( merge( { tandem: tandem }, SOMConstants.SCREEN_VIEW_OPTIONS ) );

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
      modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT ),
      modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( MultipleParticleModel.PARTICLE_CONTAINER_WIDTH ),
      modelViewTransform.modelToViewY( 0 )
    );

    // @private particle container
    this.particleContainerNode = new ParticleContainerNode( multipleParticleModel, modelViewTransform, {
      thermometerXOffsetFromCenter: modelViewTransform.modelToViewDeltaX(
        -MultipleParticleModel.PARTICLE_CONTAINER_WIDTH * 0.3
      ),
      tandem: tandem.createTandem( 'particleContainerNode' )
    } );
    this.addChild( this.particleContainerNode );

    // @private - heater/cooler node
    const heaterCoolerNode = new HeaterCoolerNode( multipleParticleModel.heatingCoolingAmountProperty, {
      scale: 0.79,
      centerX: particleContainerViewBounds.centerX,
      top: particleContainerViewBounds.bottom + 30, // distance from bottom of particle area empirically determined
      tandem: tandem.createTandem( 'heaterCoolerNode' ),
      frontOptions: {
        snapToZero: !SOMQueryParameters.stickyBurners
      }
    } );
    this.addChild( heaterCoolerNode );

    // control when the heater/cooler node is enabled for input
    Multilink.multilink(
      [ multipleParticleModel.isPlayingProperty, multipleParticleModel.isExplodedProperty ],
      ( isPlaying, isExploded ) => {
        if ( !isPlaying || isExploded ) {
          heaterCoolerNode.interruptSubtreeInput(); // cancel interaction
          heaterCoolerNode.heatCoolAmountProperty.set( 0 ); // force to zero in case snapToZero is off
          heaterCoolerNode.slider.enabled = false;
        }
        else {
          heaterCoolerNode.slider.enabled = true;
        }
      }
    );

    // selection panel for the atoms/molecules
    const moleculesControlPanel = new StatesMoleculesControlPanel( multipleParticleModel.substanceProperty, {
      right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
      top: this.layoutBounds.top + CONTROL_PANEL_Y_INSET,
      minWidth: CONTROL_PANEL_WIDTH,
      maxWidth: CONTROL_PANEL_WIDTH,
      tandem: tandem.createTandem( 'moleculesControlPanel' )
    } );
    this.addChild( moleculesControlPanel );

    // phases control node
    const solidLiquidGasPhaseControlNode = new StatesPhaseControlNode( multipleParticleModel, {
      right: moleculesControlPanel.right,
      top: moleculesControlPanel.bottom + CONTROL_PANEL_Y_INSET,
      buttonWidth: CONTROL_PANEL_WIDTH,
      tandem: tandem.createTandem( 'solidLiquidGasPhaseControlNode' )
    } );
    this.addChild( solidLiquidGasPhaseControlNode );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        multipleParticleModel.reset();
        this.particleContainerNode.reset();
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
            multipleParticleModel.stepInTime( SOMConstants.NOMINAL_TIME_STEP );
          }
        },
        playPauseStepXSpacing: 10
      },

      // position empirically determined
      right: heaterCoolerNode.left - 50,
      centerY: heaterCoolerNode.centerY,

      tandem: tandem.createTandem( 'timeControlNode' )
    } ) );
  }

  /**
   * @public
   */
  step( dt ) {
    this.particleContainerNode.step( dt );
  }
}

statesOfMatter.register( 'StatesScreenView', StatesScreenView );
export default StatesScreenView;