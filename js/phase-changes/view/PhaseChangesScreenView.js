// Copyright 2014-2022, University of Colorado Boulder

/**
 * view for the Phase Changes screen
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Aaron Davis
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BicyclePumpNode from '../../../../scenery-phet/js/BicyclePumpNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import HeaterCoolerNode from '../../../../scenery-phet/js/HeaterCoolerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { Node, RichText } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import MultipleParticleModel from '../../common/model/MultipleParticleModel.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMQueryParameters from '../../common/SOMQueryParameters.js';
import SubstanceType from '../../common/SubstanceType.js';
import ParticleContainerNode from '../../common/view/ParticleContainerNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import InteractionPotentialAccordionBox from './InteractionPotentialAccordionBox.js';
import PhaseChangesMoleculesControlPanel from './PhaseChangesMoleculesControlPanel.js';
import PhaseDiagramAccordionBox from './PhaseDiagramAccordionBox.js';

// strings
const returnLidString = StatesOfMatterStrings.returnLid;

// constants
const PANEL_WIDTH = 170; // empirically determined to be wide enough for all contents using English strings with some margin
const INTER_PANEL_SPACING = 8;

// constants used when mapping the model pressure and temperature to the phase diagram.
const TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM = 0.375;
const CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM = 0.8;

// Used for calculating moving averages needed to mellow out the graph behavior.  Value empirically determined.
const MAX_NUM_HISTORY_SAMPLES = 100;

// constants used in the layout process
const CONTROL_PANEL_X_INSET = 15;

class PhaseChangesScreenView extends ScreenView {

  /**
   * @param {PhaseChangesModel} model - model of the simulation
   * @param {boolean} isPotentialGraphEnabled
   * @param {Tandem} tandem
   */
  constructor( model, isPotentialGraphEnabled, tandem ) {

    super( merge( { tandem: tandem }, SOMConstants.SCREEN_VIEW_OPTIONS ) );

    // @private
    this.multipleParticleModel = model;
    this.modelTemperatureHistory = createObservableArray( { allowDuplicates: true } );

    // Create the model-view transform. The multipliers for the 2nd parameter can be used to adjust where the point
    // (0, 0) in the model, which is the lower left corner of the particle container, appears in the view.The final
    // parameter is the scale, and can be changed to make the view more zoomed in or out.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( this.layoutBounds.width * 0.325, this.layoutBounds.height * 0.75 ),
      SOMConstants.VIEW_CONTAINER_WIDTH / MultipleParticleModel.PARTICLE_CONTAINER_WIDTH
    );

    // figure out where in the view the particles will be when the container is not exploded
    const nominalParticleAreaViewBounds = new Bounds2(
      modelViewTransform.modelToViewX( 0 ),
      modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT ),
      modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( MultipleParticleModel.PARTICLE_CONTAINER_WIDTH ),
      modelViewTransform.modelToViewY( 0 )
    );

    // create the particle container - it takes care of positioning itself
    this.particleContainerNode = new ParticleContainerNode( model, modelViewTransform, {
      volumeControlEnabled: true,
      pressureGaugeEnabled: true,
      thermometerXOffsetFromCenter: modelViewTransform.modelToViewDeltaX(
        -MultipleParticleModel.PARTICLE_CONTAINER_WIDTH * 0.15
      ),
      tandem: tandem.createTandem( 'particleContainerNode' )
    } );

    // add the particle container
    this.addChild( this.particleContainerNode );

    // add heater/cooler node
    const heaterCoolerNode = new HeaterCoolerNode( model.heatingCoolingAmountProperty, {
      scale: 0.79,
      centerX: nominalParticleAreaViewBounds.centerX,
      top: nominalParticleAreaViewBounds.maxY + 30, // offset from container bottom empirically determined
      tandem: tandem.createTandem( 'heaterCoolerNode' ),
      frontOptions: {
        snapToZero: !SOMQueryParameters.stickyBurners
      }
    } );
    this.addChild( heaterCoolerNode );

    // control when the heater/cooler node is enabled for input
    Multilink.multilink(
      [ model.isPlayingProperty, model.isExplodedProperty ],
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

    // add reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.modelTemperatureHistory.clear();
        model.reset();
        this.particleContainerNode.reset();

        // Reset phase diagram state in SOM basic version.
        model.phaseDiagramExpandedProperty.value = isPotentialGraphEnabled;
        this.pumpNode.reset();
      },
      radius: SOMConstants.RESET_ALL_BUTTON_RADIUS,
      right: this.layoutBounds.maxX - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_SIDE,
      bottom: this.layoutBounds.maxY - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_BOTTOM,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // add play pause button and step button
    this.addChild( new TimeControlNode( model.isPlayingProperty, {
      playPauseStepButtonOptions: {
        playPauseButtonOptions: {
          radius: SOMConstants.PLAY_PAUSE_BUTTON_RADIUS
        },
        stepForwardButtonOptions: {
          radius: SOMConstants.STEP_BUTTON_RADIUS,
          listener: () => {
            model.stepInTime( SOMConstants.NOMINAL_TIME_STEP );
          }
        },
        playPauseStepXSpacing: 10
      },

      // position empirically determined
      right: heaterCoolerNode.left - 50,
      centerY: heaterCoolerNode.centerY,

      tandem: tandem.createTandem( 'timeControlNode' )
    } ) );

    // Pump is located at the bottom left of the screen.
    const pumpPosition = new Vector2( 106, 466 );

    // Hose attaches to the bottom left side of the container.
    const hoseAttachmentPoint = new Vector2( nominalParticleAreaViewBounds.left, nominalParticleAreaViewBounds.bottom - 70 );

    // Create a derived property that will be used to control the enabled state of the bicycle pump node.
    const bicyclePumpEnabledProperty = new DerivedProperty(
      [
        model.isPlayingProperty,
        model.isExplodedProperty,
        model.lidAboveInjectionPointProperty,
        model.maxNumberOfMoleculesProperty,
        model.targetNumberOfMoleculesProperty
      ],
      ( isPlaying, isExploded, lidAboveInjectionPoint, maxNumberOfMoleculesProperty, targetNumberOfMolecules ) => {
        return isPlaying &&
               !isExploded &&
               lidAboveInjectionPoint &&
               targetNumberOfMolecules < maxNumberOfMoleculesProperty;
      }
    );

    // Create a range property that can be provided to the bicycle pump.
    const numberOfMoleculesRangeProperty = new Property( new Range( 0, model.maxNumberOfMoleculesProperty.value ) );
    model.maxNumberOfMoleculesProperty.lazyLink( maxNumberOfMolecules => {
      numberOfMoleculesRangeProperty.set( new Range( 0, maxNumberOfMolecules ) );
    } );

    // add bicycle pump node
    this.pumpNode = new BicyclePumpNode(
      model.targetNumberOfMoleculesProperty,
      numberOfMoleculesRangeProperty,
      {
        nodeEnabledProperty: bicyclePumpEnabledProperty,
        injectionEnabledProperty: model.isInjectionAllowedProperty,
        translation: pumpPosition,
        hoseAttachmentOffset: hoseAttachmentPoint.minus( pumpPosition ),
        hoseCurviness: 1.5,
        handleTouchAreaXDilation: 100,
        handleTouchAreaYDilation: 100,
        dragListenerOptions: {
          numberOfParticlesPerPumpAction: 3
        },
        tandem: tandem.createTandem( 'pumpNode' )
      }
    );
    this.addChild( this.pumpNode );

    // add return lid button
    this.returnLidButton = new TextPushButton( returnLidString, {
      font: new PhetFont( 14 ),
      baseColor: 'yellow',
      maxWidth: 100,
      listener: () => { model.returnLid(); },
      visible: false,
      xMargin: 10,
      centerX: nominalParticleAreaViewBounds.minX - 150,
      centerY: nominalParticleAreaViewBounds.minY,

      // phet-io
      tandem: tandem.createTandem( 'returnLidButton' ),
      phetioReadOnly: true,
      visiblePropertyOptions: { phetioReadOnly: true },
      enabledPropertyOptions: { phetioReadOnly: true }
    } );
    this.addChild( this.returnLidButton );
    model.isExplodedProperty.linkAttribute( this.returnLidButton, 'visible' );

    // add interaction potential diagram
    let interactionPotentialAccordionBox = null;
    if ( isPotentialGraphEnabled ) {
      interactionPotentialAccordionBox = new InteractionPotentialAccordionBox(
        SOMConstants.MAX_SIGMA,
        SOMConstants.MIN_EPSILON,
        model,
        {
          maxWidth: PANEL_WIDTH,
          minWidth: PANEL_WIDTH,
          right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
          tandem: tandem.createTandem( 'interactionPotentialAccordionBox' )
        }
      );
      this.addChild( interactionPotentialAccordionBox );
    }

    // add the atom/molecule selection control panel
    const moleculesControlPanel = new PhaseChangesMoleculesControlPanel(
      model,
      {
        showAdjustableAttraction: isPotentialGraphEnabled,
        right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
        top: 5,
        maxWidth: PANEL_WIDTH,
        minWidth: PANEL_WIDTH,
        tandem: tandem.createTandem( 'moleculesControlPanel' )
      }
    );
    this.addChild( moleculesControlPanel );

    // Add a container node that will hold the phase diagram accordion box.  This is done so that the overall visibility
    // of the diagram box can be controlled using phet-io independently of the dynamic hide/show behavior implemented
    // below.  See https://github.com/phetsims/states-of-matter/issues/332.
    const phaseDiagramContainer = new Node( { tandem: tandem.createTandem( 'phaseDiagramContainer' ) } );
    this.addChild( phaseDiagramContainer );

    // add phase diagram - in SOM basic version by default phase diagram should be closed.
    model.phaseDiagramExpandedProperty.value = isPotentialGraphEnabled;
    this.phaseDiagramAccordionBox = new PhaseDiagramAccordionBox( model.phaseDiagramExpandedProperty, {
      minWidth: PANEL_WIDTH,
      maxWidth: PANEL_WIDTH,
      right: moleculesControlPanel.right,
      top: moleculesControlPanel.top + INTER_PANEL_SPACING,
      tandem: phaseDiagramContainer.tandem.createTandem( 'phaseDiagramAccordionBox' )
    } );
    phaseDiagramContainer.addChild( this.phaseDiagramAccordionBox );

    // @private - variables used to map temperature on to the phase diagram
    this.triplePointTemperatureInModelUnits = 0;
    this.criticalPointTemperatureInModelUnits = 0;
    this.slopeInFirstRegion = 0;
    this.slopeInSecondRegion = 0;
    this.offsetInSecondRegion = 0;

    // monitor the substance and update the mappings to triple and critical points when changes occur
    model.substanceProperty.link( substance => {

      if ( substance === SubstanceType.NEON ||
           substance === SubstanceType.ARGON ||
           substance === SubstanceType.ADJUSTABLE_ATOM ) {
        this.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        this.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
      }
      else if ( substance === SubstanceType.DIATOMIC_OXYGEN ) {
        this.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE;
        this.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_DIATOMIC_MODEL_TEMPERATURE;
      }
      else if ( substance === SubstanceType.WATER ) {
        this.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_WATER_MODEL_TEMPERATURE;
        this.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_WATER_MODEL_TEMPERATURE;
      }
      this.slopeInFirstRegion = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM / this.triplePointTemperatureInModelUnits;
      this.slopeInSecondRegion = ( CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM - TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM ) /
                                 ( this.criticalPointTemperatureInModelUnits - this.triplePointTemperatureInModelUnits );
      this.offsetInSecondRegion = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM -
                                  ( this.slopeInSecondRegion * this.triplePointTemperatureInModelUnits );
    } );

    // handle explosions of the container
    model.isExplodedProperty.link( () => {
      this.modelTemperatureHistory.clear();
      this.updatePhaseDiagram();
    } );

    // Hook up a function that updates several view attributes when the substance changes.
    model.substanceProperty.link( substance => {
      this.modelTemperatureHistory.clear();
      this.updatePhaseDiagram();
      this.phaseDiagramAccordionBox.setDepictingWater( substance === SubstanceType.WATER );
      if ( isPotentialGraphEnabled ) {
        if ( substance === SubstanceType.ADJUSTABLE_ATOM ||
             substance === SubstanceType.DIATOMIC_OXYGEN ||
             substance === SubstanceType.WATER ) {
          interactionPotentialAccordionBox.setMolecular( true );
        }
        else {
          interactionPotentialAccordionBox.setMolecular( false );
        }
      }

      // don't show the phase diagram for adjustable attraction, since we need the space for other things
      this.phaseDiagramAccordionBox.visible = substance !== SubstanceType.ADJUSTABLE_ATOM;
    } );

    // Update layout based on the visibility and bounds of the various control panels and accordion boxes.
    Multilink.multilink(
      [ this.phaseDiagramAccordionBox.visibleProperty, moleculesControlPanel.boundsProperty ],
      ( phaseDiagramVisible, moleculeControlPanelBounds ) => {
        if ( isPotentialGraphEnabled ) {
          interactionPotentialAccordionBox.top = moleculeControlPanelBounds.bottom + INTER_PANEL_SPACING;
          this.phaseDiagramAccordionBox.top = interactionPotentialAccordionBox.bottom + INTER_PANEL_SPACING;
        }
        else {
          this.phaseDiagramAccordionBox.top = moleculeControlPanelBounds.bottom + INTER_PANEL_SPACING;
        }
      }
    );

    // Happy Easter
    const egg = new RichText( 'Goodbye boiling water -<br>you will be mist!', {
      fill: 'yellow',
      font: new PhetFont( 14 ),
      align: 'left',
      left: this.returnLidButton.left,
      top: this.returnLidButton.bottom + 20
    } );
    this.addChild( egg );

    let eggShown = false;
    model.isPlayingProperty.link( isPlaying => {
      egg.visible = !isPlaying && model.isExplodedProperty.get() &&
                    model.substanceProperty.get() === SubstanceType.WATER && !eggShown;
      if ( egg.visible ) {
        eggShown = true;
      }
    } );

    // Monitor the model for changes of the container size and adjust the view accordingly.
    model.containerHeightProperty.link( () => {
      this.updatePhaseDiagram();
    } );

    model.temperatureSetPointProperty.link( () => {
      this.modelTemperatureHistory.clear();
      this.updatePhaseDiagram();
    } );

    model.scaledAtoms.lengthProperty.link( () => {
      this.updatePhaseDiagram();
    } );
  }

  // @public
  step( dt ) {
    this.particleContainerNode.step( dt );
  }

  /**
   * Update the position of the marker on the phase diagram based on the temperature and pressure values within the
   * model.
   * @private
   */
  updatePhaseDiagram() {

    // If the container has exploded, don't bother showing the dot.
    if ( this.multipleParticleModel.isExplodedProperty.get() || this.multipleParticleModel.scaledAtoms.length === 0 ) {
      this.phaseDiagramAccordionBox.setStateMarkerVisible( false );
    }
    else {
      this.phaseDiagramAccordionBox.setStateMarkerVisible( true );
      const movingAverageTemperature = this.updateMovingAverageTemperature(
        this.multipleParticleModel.temperatureSetPointProperty.get()
      );
      const modelPressure = this.multipleParticleModel.getModelPressure();
      const mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( movingAverageTemperature );
      const mappedPressure = this.mapModelTempAndPressureToPhaseDiagramPressure( modelPressure, movingAverageTemperature );
      this.phaseDiagramAccordionBox.setStateMarkerPos( mappedTemperature, mappedPressure );
    }
  }

  /**
   * Update and returns the moving average taking into account the new temperature value.
   * @param {number} newTemperatureValue
   * @returns {number}
   * @private
   */
  updateMovingAverageTemperature( newTemperatureValue ) {
    if ( this.modelTemperatureHistory.length === MAX_NUM_HISTORY_SAMPLES ) {
      this.modelTemperatureHistory.shift();
    }
    this.modelTemperatureHistory.push( newTemperatureValue );
    let totalOfAllTemperatures = 0;
    for ( let i = 0; i < this.modelTemperatureHistory.length; i++ ) {
      totalOfAllTemperatures += this.modelTemperatureHistory.get( i );
    }
    return totalOfAllTemperatures / this.modelTemperatureHistory.length;
  }

  /**
   * Map the model temperature to phase diagram temperature based on the phase chart shape.
   * @param {number} modelTemperature
   * @returns {number}
   * @private
   */
  mapModelTemperatureToPhaseDiagramTemperature( modelTemperature ) {

    let mappedTemperature;
    if ( modelTemperature < this.triplePointTemperatureInModelUnits ) {
      mappedTemperature = this.slopeInFirstRegion * modelTemperature;
    }
    else {
      mappedTemperature = modelTemperature * this.slopeInSecondRegion + this.offsetInSecondRegion;
    }

    return Math.min( mappedTemperature, 1 );
  }

  /**
   * Map the model temperature and pressure to a normalized pressure value suitable for use in setting the marker
   * position on the phase chart.
   * @param {number} modelPressure
   * @param {number} modelTemperature
   * @returns {number}
   * @private
   */
  mapModelTempAndPressureToPhaseDiagramPressure( modelPressure, modelTemperature ) {

    // This method is a total tweak fest.  All values and equations are made to map to the phase diagram, and are NOT
    // based on any real-world equations that define phases of matter.
    const cutOverTemperature = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM - 0.025;
    const mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( modelTemperature );
    let mappedPressure;
    if ( mappedTemperature <= cutOverTemperature ) {
      mappedPressure = Math.pow( mappedTemperature, 1.6 );
    }
    else {
      mappedPressure = Math.pow( mappedTemperature - cutOverTemperature, 1.75 ) + 0.192;
    }
    return Math.min( mappedPressure, 1 );
  }
}

statesOfMatter.register( 'PhaseChangesScreenView', PhaseChangesScreenView );
export default PhaseChangesScreenView;