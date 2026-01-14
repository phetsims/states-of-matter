// Copyright 2015-2025, University of Colorado Boulder

/**
 * Main view for the "Atomic Interactions" sim and for the "Interactions" screen in the States of Matter simulation.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMColors from '../../common/view/SOMColors.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import DualAtomModel from '../model/DualAtomModel.js';
import ForceDisplayMode from '../model/ForceDisplayMode.js';
import MotionAtom from '../model/MotionAtom.js';
import AtomicInteractionsControlPanel from './AtomicInteractionsControlPanel.js';
import ForcesAccordionBox from './ForcesAccordionBox.js';
import GrabbableParticleNode from './GrabbableParticleNode.js';
import HandNode from './HandNode.js';
import InteractivePotentialGraph from './InteractivePotentialGraph.js';
import ParticleForceNode from './ParticleForceNode.js';
import PushPinNode from './PushPinNode.js';

const returnAtomString = StatesOfMatterStrings.returnAtom;

// Constant used to control size of push pin, empirically determined.
const PUSH_PIN_WIDTH = 20;
const INSET = 15;
const MAX_TEXT_WIDTH = 80;
const PANEL_WIDTH = 209; // empirically determined to work well for English and most other translations

class AtomicInteractionsScreenView extends ScreenView {

  // vars needed to do the job
  private readonly dualAtomModel: DualAtomModel;
  private readonly movableParticle: MotionAtom;
  private readonly fixedParticle: MotionAtom;
  private showAttractiveForces: boolean;
  private showRepulsiveForces: boolean;
  private showTotalForces: boolean;

  // set up the model-view transform
  private readonly modelViewTransform: ModelViewTransform2;

  // interactive potential diagram
  private readonly interactivePotentialGraph: InteractivePotentialGraph;

  // button for returning the atom to the screen
  private readonly returnAtomButton: TextPushButton;

  public readonly fixedParticleLayer: Node;
  public readonly movableParticleLayer: Node;
  public readonly handNode: HandNode;
  public readonly fixedParticleNode: ParticleForceNode;
  public readonly movableParticleNode: GrabbableParticleNode;
  public readonly pushPinNode: PushPinNode;

  /**
   * @param dualAtomModel - of the simulation
   * @param enableHeterogeneousAtoms
   * @param tandem
   */
  public constructor( dualAtomModel: DualAtomModel, enableHeterogeneousAtoms: boolean, tandem: Tandem ) {

    // due to some odd behavior, we need to turn on preventFit for this screen, see
    // https://github.com/phetsims/states-of-matter/issues/176
    const screenViewOptions = merge( { preventFit: true, tandem: tandem }, SOMConstants.SCREEN_VIEW_OPTIONS );

    super( screenViewOptions );

    this.dualAtomModel = dualAtomModel;
    this.movableParticle = dualAtomModel.movableAtom;
    this.fixedParticle = dualAtomModel.fixedAtom;
    this.showAttractiveForces = false;
    this.showRepulsiveForces = false;
    this.showTotalForces = false;

    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      new Vector2( 0, 0 ),
      new Vector2( 145, 360 ),
      0.25
    );

    // initialize local variables
    const tickTextColor = enableHeterogeneousAtoms ? 'black' : SOMColors.controlPanelTextProperty;
    const textColor = enableHeterogeneousAtoms ? 'black' : SOMColors.controlPanelTextProperty;
    const panelFill = enableHeterogeneousAtoms ? '#D1D2FF' : SOMColors.controlPanelBackgroundProperty;
    const panelStroke = enableHeterogeneousAtoms ? '#D1D2FF' : SOMColors.controlPanelStrokeProperty;
    const panelTextFill = enableHeterogeneousAtoms ? 'black' : SOMColors.controlPanelTextProperty;
    const forceControlPanelButtonAlign = enableHeterogeneousAtoms ? 'right' : 'left';
    const atomsControlPanel = new AtomicInteractionsControlPanel( dualAtomModel, enableHeterogeneousAtoms, {
      right: this.layoutBounds.maxX - INSET,
      top: this.layoutBounds.minY + INSET,
      // @ts-expect-error
      tickTextColor: tickTextColor,
      textColor: textColor,
      // @ts-expect-error
      fill: panelFill,
      // @ts-expect-error
      stroke: panelStroke,
      // @ts-expect-error
      panelTextFill: panelTextFill,
      maxWidth: PANEL_WIDTH,
      minWidth: PANEL_WIDTH,
      tandem: tandem.createTandem( 'atomsControlPanel' )
    } );

    // Set the x-offset of the graph so that the left axis will be directly above the center of the fixed atom, which
    // should in turn make the position marker directly above the movable atom.  These values were empirically
    // determined are are different based on whether the zoom buttons are present on the graph.
    const graphXOffset = enableHeterogeneousAtoms ? -43 : -31;

    this.interactivePotentialGraph = new InteractivePotentialGraph( dualAtomModel, {
      // @ts-expect-error
      zoomable: enableHeterogeneousAtoms,
      left: this.modelViewTransform.modelToViewX( 0 ) + graphXOffset,
      top: atomsControlPanel.top + 5, // additional offset empirically determined to look good
      tandem: tandem.createTandem( 'interactivePotentialGraph' )
    } );
    this.addChild( this.interactivePotentialGraph );

    this.returnAtomButton = new TextPushButton( returnAtomString, {
      font: new PhetFont( 17 ),
      baseColor: '#61BEE3',
      maxWidth: MAX_TEXT_WIDTH,
      listener: () => {
        dualAtomModel.resetMovableAtomPos();
      },
      left: this.layoutBounds.minX + 6 * INSET,
      bottom: this.layoutBounds.bottom - 2 * INSET,
      tandem: tandem.createTandem( 'returnAtomButton' ),
      visible: false,
      phetioReadOnly: true,
      visiblePropertyOptions: { phetioReadOnly: true },
      phetioInputEnabledPropertyInstrumented: true,
      enabledPropertyOptions: { phetioReadOnly: true }
    } );
    this.addChild( this.returnAtomButton );

    // create and add the Reset All Button in the bottom right
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        dualAtomModel.reset();
        this.interactivePotentialGraph.reset();
      },
      radius: SOMConstants.RESET_ALL_BUTTON_RADIUS,
      right: this.layoutBounds.maxX - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_SIDE,
      bottom: this.layoutBounds.maxY - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_BOTTOM,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // add force control
    const forcesAccordionBox = new ForcesAccordionBox(

      // @ts-expect-error
      dualAtomModel.forcesDisplayModeProperty,
      dualAtomModel.forcesExpandedProperty,
      {
        tickTextColor: tickTextColor,
        textColor: textColor,
        fill: panelFill,
        stroke: panelStroke,
        textFill: panelTextFill,
        buttonAlign: forceControlPanelButtonAlign,
        showTitleWhenExpanded: !enableHeterogeneousAtoms,
        minWidth: PANEL_WIDTH,
        maxWidth: PANEL_WIDTH,
        tandem: tandem.createTandem( 'forcesAccordionBox' )
      }
    );

    // the control panels will overlap the reset all button if fully opened, so they must be a bit to the left
    atomsControlPanel.right = resetAllButton.left - 20; // offset empirically determined

    // add control for play/pause/step
    const timeControlNode = new TimeControlNode( dualAtomModel.isPlayingProperty, {
      timeSpeedProperty: dualAtomModel.timeSpeedProperty,

      playPauseStepButtonOptions: {

        playPauseButtonOptions: {
          radius: SOMConstants.PLAY_PAUSE_BUTTON_RADIUS
        },
        stepForwardButtonOptions: {
          radius: SOMConstants.STEP_BUTTON_RADIUS,
          listener: () => {
            dualAtomModel.stepInternal( SOMConstants.NOMINAL_TIME_STEP * DualAtomModel.NORMAL_MOTION_TIME_MULTIPLIER );
          }
        },
        playPauseStepXSpacing: 10
      },

      speedRadioButtonGroupOptions: {
        labelOptions: {
          fill: SOMColors.controlPanelTextProperty,
          font: new PhetFont( 14 ),
          maxWidth: MAX_TEXT_WIDTH
        }
      },

      // position empirically determined
      centerX: this.layoutBounds.centerX + 20,
      bottom: this.layoutBounds.bottom - 14,

      tandem: tandem.createTandem( 'timeControlNode' )
    } );
    this.addChild( timeControlNode );

    // Create the nodes that will act as layers for the fixed and movable particles. This is done so that the movable
    // particle can always appear to be on top.
    this.fixedParticleLayer = new Node();
    this.addChild( this.fixedParticleLayer );
    this.movableParticleLayer = new Node();
    this.addChild( this.movableParticleLayer );

    // Create a reusable node that looks like a cartoon hand and is used to indicate to the user that an atom can be
    // moved.  This will be dynamically added and removed from the scene graph.
    this.handNode = new HandNode(
      this.dualAtomModel,
      // @ts-expect-error
      this.dualAtomModel.movableAtom,
      this.modelViewTransform,
      0,
      {
        tandem: tandem.createTandem( 'handNode' ),
        visiblePropertyOptions: { phetioReadOnly: true }
      }
    );

    // add the representation of the fixed particle
    this.fixedParticleNode = new ParticleForceNode(
      dualAtomModel.fixedAtom,
      this.modelViewTransform,
      true,
      tandem.createTandem( 'fixedParticleNode' )
    );
    this.fixedParticleNode.setShowAttractiveForces( this.showAttractiveForces );
    this.fixedParticleNode.setShowRepulsiveForces( this.showRepulsiveForces );
    this.fixedParticleNode.setShowTotalForces( this.showTotalForces );
    this.fixedParticleLayer.addChild( this.fixedParticleNode );

    // add the representation of the movable particle
    this.movableParticleNode = new GrabbableParticleNode(
      this.dualAtomModel,
      dualAtomModel.movableAtom,
      this.modelViewTransform,
      true,
      0,
      tandem.createTandem( 'movableParticleNode' )
    );
    this.movableParticleNode.setShowAttractiveForces( this.showAttractiveForces );
    this.movableParticleNode.setShowRepulsiveForces( this.showRepulsiveForces );
    this.movableParticleNode.setShowTotalForces( this.showTotalForces );
    this.movableParticleLayer.addChild( this.movableParticleNode );
    this.movableParticleLayer.addChild( this.handNode );

    // associate the hand node with the movable atom
    // @ts-expect-error
    this.handNode.setParticle( dualAtomModel.movableAtom );

    // Create and add the push pin node that will be used to convey the idea that the fixed atom is pinned to the canvas.
    this.pushPinNode = new PushPinNode();
    this.pushPinNode.scale( PUSH_PIN_WIDTH / this.pushPinNode.width );
    this.addChild( this.pushPinNode );

    // Add the control panels to the screen after the atoms so that the atoms with go behind them.
    this.addChild( atomsControlPanel );
    this.addChild( forcesAccordionBox );

    // update various aspects of the appearance when the selected atom pair changes
    dualAtomModel.atomPairProperty.link( () => {
      forcesAccordionBox.top = atomsControlPanel.bottom + INSET / 2;
      forcesAccordionBox.left = atomsControlPanel.left;
      this.updatePositionMarkerOnGraph();
      this.updateMinimumXForMovableAtom();
      this.updatePushPinPosition();
      this.updateHandPosition();
    } );

    // update the push pin position if the adjustable atom diameter changes
    dualAtomModel.adjustableAtomDiameterProperty.link( () => {
      this.updatePushPinPosition();
    } );

    // update the visibility of the force arrows when the settings change
    dualAtomModel.forcesDisplayModeProperty.link( forces => {
      this.setShowAttractiveForces( forces === ForceDisplayMode.COMPONENTS );
      this.setShowRepulsiveForces( forces === ForceDisplayMode.COMPONENTS );
      this.setShowTotalForces( forces === ForceDisplayMode.TOTAL );
      if ( !this.showAttractiveForces && !this.showTotalForces && forces !== ForceDisplayMode.HIDDEN ) {

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        throw new Error( `invalid forces: ${forces}` );
      }
    } );

    // monitor the atom diameter and trigger updates when changes occur
    dualAtomModel.adjustableAtomDiameterProperty.link( () => {
      this.updateMinimumXForMovableAtom();
      this.updateHandPosition();
    } );
  }

  /**
   * Called by the animation loop.
   */
  public override step(): void {
    this.handlePositionChanged();

    // TODO: Should it call super.step()? See https://github.com/phetsims/states-of-matter/issues/376
  }

  /**
   * Turn on/off the displaying of the force arrows that represent the attractive force.
   * @param showForces
   */
  public setShowAttractiveForces( showForces: boolean ): void {
    this.movableParticleNode.setShowAttractiveForces( showForces );
    this.fixedParticleNode.setShowAttractiveForces( showForces );
    this.showAttractiveForces = showForces;
  }

  /**
   * Turn on/off the displaying of the force arrows that represent the repulsive force.
   * @param showForces
   */
  public setShowRepulsiveForces( showForces: boolean ): void {
    this.movableParticleNode.setShowRepulsiveForces( showForces );
    this.fixedParticleNode.setShowRepulsiveForces( showForces );
    this.showRepulsiveForces = showForces;
  }

  /**
   * Turn on/off the displaying of the force arrows that represent the total force, i.e. attractive plus repulsive.
   * @param showForces
   */
  public setShowTotalForces( showForces: boolean ): void {
    this.movableParticleNode.setShowTotalForces( showForces );
    this.fixedParticleNode.setShowTotalForces( showForces );
    this.showTotalForces = showForces;
  }

  private handlePositionChanged(): void {

    this.updatePositionMarkerOnGraph();
    this.updateForceVectors();
    this.updateHandPosition();

    const simDimensions = phet.joist.sim.dimensionProperty.value;
    const width = simDimensions.width;
    const height = simDimensions.height;

    const scale = Math.min( width / this.layoutBounds.width, height / this.layoutBounds.height );
    let atomWindowPosition = scale * ( this.modelViewTransform.modelToViewX( this.dualAtomModel.movableAtom.getX() ) );

    // account for the view centering
    if ( scale === height / this.layoutBounds.height ) {
      atomWindowPosition += ( width - this.layoutBounds.width * scale ) / 2 - 50;
    }
    if ( atomWindowPosition > width ) {
      if ( !this.returnAtomButton.isVisible() ) {
        // The particle is off the canvas and the button is not yet shown, so show it.
        this.returnAtomButton.setVisible( true );
      }
    }
    else if ( this.returnAtomButton.isVisible() ) {
      // The particle is on the canvas but the button is visible (which it shouldn't be), so hide it.
      this.returnAtomButton.setVisible( false );
    }
  }

  /**
   * Update the position marker on the Lennard-Jones potential diagram. This will indicate the amount of potential
   * being experienced between the two atoms in the model.
   */
  private updatePositionMarkerOnGraph(): void {
    const distance = this.fixedParticle.positionProperty.value.distance( this.movableParticle.positionProperty.value );
    this.interactivePotentialGraph.setMarkerPosition( distance );
  }

  private updatePushPinPosition(): void {
    const pinnedAtomPosition = this.dualAtomModel.fixedAtom.positionProperty.value;
    const pinnedAtomRadius = this.dualAtomModel.fixedAtom.radiusProperty.value;
    const mvt = this.modelViewTransform;
    this.pushPinNode.right = mvt.modelToViewX( pinnedAtomPosition.x - pinnedAtomRadius * 0.5 );
    this.pushPinNode.bottom = mvt.modelToViewY( pinnedAtomPosition.y - pinnedAtomRadius * 0.5 );
  }

  private updateHandPosition(): void {
    this.handNode.left = this.modelViewTransform.modelToViewX( this.movableParticle.positionProperty.value.x );
  }

  /**
   * Update the minimum X value allowed for the movable atom.  This prevents too much overlap between the atoms.
   */
  public updateMinimumXForMovableAtom(): void {

    // Use a minimum X value that is just a bit less than the sigma value, since the repulsive potential goes up
    // rapidly with smaller values.
    const minXInModel = this.dualAtomModel.getSigma() * 0.9;
    this.interactivePotentialGraph.setMinXForAtom( minXInModel );
    const minXInView = this.modelViewTransform.modelToViewX( minXInModel );
    this.movableParticleNode.setMinX( minXInView );
    this.handNode.setMinX( minXInView );
  }

  private updateForceVectors(): void {
    if ( ( this.fixedParticle !== null ) && ( this.movableParticle !== null ) ) {
      this.fixedParticleNode.setForces( this.dualAtomModel.attractiveForce, -this.dualAtomModel.repulsiveForce );
      this.movableParticleNode.setForces( -this.dualAtomModel.attractiveForce, this.dualAtomModel.repulsiveForce );
    }
  }
}

statesOfMatter.register( 'AtomicInteractionsScreenView', AtomicInteractionsScreenView );

export default AtomicInteractionsScreenView;