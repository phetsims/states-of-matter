// Copyright 2014-2020, University of Colorado Boulder

/**
 * view for the Phase Changes screen
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import inherit from '../../../../phet-core/js/inherit.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BicyclePumpNode from '../../../../scenery-phet/js/BicyclePumpNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import HeaterCoolerNode from '../../../../scenery-phet/js/HeaterCoolerNode.js';
import MultiLineText from '../../../../scenery-phet/js/MultiLineText.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import MultipleParticleModel from '../../common/model/MultipleParticleModel.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import CompositeThermometerNode from '../../common/view/CompositeThermometerNode.js';
import ParticleContainerNode from '../../common/view/ParticleContainerNode.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
import statesOfMatter from '../../statesOfMatter.js';
import EpsilonControlInteractionPotentialDiagram from './EpsilonControlInteractionPotentialDiagram.js';
import PhaseChangesMoleculesControlPanel from './PhaseChangesMoleculesControlPanel.js';
import PhaseDiagram from './PhaseDiagram.js';

const returnLidString = statesOfMatterStrings.returnLid;

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

/**
 * @param {PhaseChangesModel} model - model of the simulation
 * @param {boolean} isInteractionDiagramEnabled
 * @param {Tandem} tandem
 * @constructor
 */
function PhaseChangesScreenView( model, isInteractionDiagramEnabled, tandem ) {
  const self = this;

  ScreenView.call( this, SOMConstants.SCREEN_VIEW_OPTIONS );
  this.multipleParticleModel = model;
  this.modelTemperatureHistory = new ObservableArray( { allowDuplicates: true } );

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
    modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( model.getInitialContainerHeight() ),
    modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( model.getContainerWidth() ),
    modelViewTransform.modelToViewY( 0 )
  );

  // create the particle container - it takes care of positioning itself
  this.particleContainerNode = new ParticleContainerNode(
    model,
    modelViewTransform,
    true,
    true,
    tandem.createTandem( 'particleContainerNode' )
  );

  // add the particle container
  this.addChild( this.particleContainerNode );

  // add heater/cooler node
  const heaterCoolerNode = new HeaterCoolerNode( model.heatingCoolingAmountProperty, {
    scale: 0.79,
    centerX: nominalParticleAreaViewBounds.centerX,
    top: nominalParticleAreaViewBounds.maxY + 30, // offset from container bottom empirically determined
    tandem: tandem.createTandem( 'heaterCoolerNode' )
  } );
  this.addChild( heaterCoolerNode );

  // add the thermometer node
  this.compositeThermometerNode = new CompositeThermometerNode( model, {
    font: new PhetFont( 20 ),
    fill: 'white',
    tandem: tandem.createTandem( 'compositeThermometerNode' )
  } );
  this.addChild( this.compositeThermometerNode );

  // add reset all button
  const resetAllButton = new ResetAllButton( {
    listener: function() {
      self.modelTemperatureHistory.clear();
      self.compositeThermometerNode.reset();
      model.reset();
      // Reset phase diagram state in SOM basic version.
      model.phaseDiagramExpandedProperty.value = isInteractionDiagramEnabled;
      self.pumpNode.reset();
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
          model.stepInternal( SOMConstants.NOMINAL_TIME_STEP );
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

  // add bicycle pump node
  this.pumpNode = new BicyclePumpNode(
    model.numberOfMoleculesProperty,
    model.numberOfMoleculesRangeProperty, {
      enabledProperty: model.isPlayingProperty,
      translation: pumpPosition,
      hoseAttachmentOffset: hoseAttachmentPoint.minus( pumpPosition ),
      hoseCurviness: 1.5,
      handleTouchAreaXDilation: 100,
      handleTouchAreaYDilation: 100,
      dragListenerOptions: {
        numberOfParticlesPerPumpAction: 3
      },
      tandem: tandem.createTandem( 'pumpNode' )
    } );
  this.addChild( this.pumpNode );

  // add return lid button
  this.returnLidButton = new TextPushButton( returnLidString, {
    font: new PhetFont( 14 ),
    baseColor: 'yellow',
    maxWidth: 100,
    listener: function() {
      model.returnLid();
    },
    visible: false,
    xMargin: 10,
    centerX: nominalParticleAreaViewBounds.minX - 150,
    centerY: nominalParticleAreaViewBounds.minY,

    // phet-io
    tandem: tandem.createTandem( 'returnLidButton' ),
    phetioReadOnly: true,
    phetioComponentOptions: {
      opacityProperty: { phetioReadOnly: true },
      pickableProperty: { phetioReadOnly: true },
      visibleProperty: { phetioReadOnly: true }
    },
    enabledPropertyOptions: { phetioReadOnly: true }
  } );
  this.addChild( this.returnLidButton );
  model.isExplodedProperty.linkAttribute( this.returnLidButton, 'visible' );

  // add interaction potential diagram
  let epsilonControlInteractionPotentialDiagram = null;
  if ( isInteractionDiagramEnabled ) {
    epsilonControlInteractionPotentialDiagram = new EpsilonControlInteractionPotentialDiagram(
      SOMConstants.MAX_SIGMA,
      SOMConstants.MIN_EPSILON,
      false,
      model,
      {
        maxWidth: PANEL_WIDTH,
        minWidth: PANEL_WIDTH,
        right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
        tandem: tandem.createTandem( 'epsilonControlInteractionPotentialDiagram' )
      }
    );
    this.addChild( epsilonControlInteractionPotentialDiagram );
  }

  // add the atom/molecule selection control panel
  const moleculesControlPanel = new PhaseChangesMoleculesControlPanel(
    model,
    {
      showAdjustableAttraction: isInteractionDiagramEnabled,
      right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
      top: 5,
      maxWidth: PANEL_WIDTH,
      minWidth: PANEL_WIDTH,
      tandem: tandem.createTandem( 'moleculesControlPanel' )
    }
  );
  this.addChild( moleculesControlPanel );

  // add phase diagram - in SOM basic version by default phase diagram should be closed.
  model.phaseDiagramExpandedProperty.value = isInteractionDiagramEnabled;
  this.phaseDiagram = new PhaseDiagram( model.phaseDiagramExpandedProperty, {
    minWidth: PANEL_WIDTH,
    maxWidth: PANEL_WIDTH,
    right: moleculesControlPanel.right,
    top: moleculesControlPanel.top + INTER_PANEL_SPACING,
    tandem: tandem.createTandem( 'phaseDiagram' )
  } );
  this.addChild( this.phaseDiagram );

  // @private - variables used to map temperature on to the phase diagram
  this.triplePointTemperatureInModelUnits = 0;
  this.criticalPointTemperatureInModelUnits = 0;
  this.slopeInFirstRegion = 0;
  this.slopeInSecondRegion = 0;
  this.offsetInSecondRegion = 0;

  // monitor the substance and update the mappings to triple and critical points when changes occur
  model.substanceProperty.link( function( substance ) {

    if ( substance === SubstanceType.NEON ||
         substance === SubstanceType.ARGON ||
         substance === SubstanceType.ADJUSTABLE_ATOM ) {
      self.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
      self.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
    }
    else if ( substance === SubstanceType.DIATOMIC_OXYGEN ) {
      self.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE;
      self.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_DIATOMIC_MODEL_TEMPERATURE;
    }
    else if ( substance === SubstanceType.WATER ) {
      self.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_WATER_MODEL_TEMPERATURE;
      self.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_WATER_MODEL_TEMPERATURE;
    }
    self.slopeInFirstRegion = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM / self.triplePointTemperatureInModelUnits;
    self.slopeInSecondRegion = ( CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM - TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM ) /
                               ( self.criticalPointTemperatureInModelUnits - self.triplePointTemperatureInModelUnits );
    self.offsetInSecondRegion = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM -
                                ( self.slopeInSecondRegion * self.triplePointTemperatureInModelUnits );
  } );

  // handle explosions of the container
  model.isExplodedProperty.link( function( isExploded ) {
    self.modelTemperatureHistory.clear();
    if ( !isExploded ) {
      self.compositeThermometerNode.setRotation( 0 );
      self.compositeThermometerNode.centerX = nominalParticleAreaViewBounds.minX + nominalParticleAreaViewBounds.width * 0.35;
      self.compositeThermometerNode.centerY = modelViewTransform.modelToViewY(
        model.containerHeightProperty.get()
      );
    }
    self.updatePhaseDiagram();
  } );

  // Hook up a function that updates several view attributes when the substance changes.
  model.substanceProperty.link( function( substance ) {
    self.modelTemperatureHistory.clear();
    self.updatePhaseDiagram();
    self.phaseDiagram.setDepictingWater( substance === SubstanceType.WATER );
    if ( isInteractionDiagramEnabled ) {
      if ( substance === SubstanceType.ADJUSTABLE_ATOM ||
           substance === SubstanceType.DIATOMIC_OXYGEN ||
           substance === SubstanceType.WATER ) {
        epsilonControlInteractionPotentialDiagram.setMolecular( true );
      }
      else {
        epsilonControlInteractionPotentialDiagram.setMolecular( false );
      }
    }

    // don't show the phase diagram for adjustable attraction, since we need the space for other things
    if ( substance === SubstanceType.ADJUSTABLE_ATOM ) {
      self.phaseDiagram.visible = false;
      if ( isInteractionDiagramEnabled ) {
        epsilonControlInteractionPotentialDiagram.top = moleculesControlPanel.bottom + INTER_PANEL_SPACING;
      }
    }
    else {
      self.phaseDiagram.visible = true;
      if ( isInteractionDiagramEnabled ) {
        epsilonControlInteractionPotentialDiagram.top = moleculesControlPanel.bottom + INTER_PANEL_SPACING;
        self.phaseDiagram.top = epsilonControlInteractionPotentialDiagram.bottom + INTER_PANEL_SPACING;
      }
      else {
        self.phaseDiagram.top = moleculesControlPanel.bottom + INTER_PANEL_SPACING;
      }
    }
  } );

  // Happy Easter
  const egg = new MultiLineText( 'Goodbye boiling water -\nyou will be mist!', {
    fill: 'yellow',
    font: new PhetFont( 14 ),
    align: 'left',
    left: this.returnLidButton.left,
    top: this.returnLidButton.bottom + 20
  } );
  this.addChild( egg );

  let eggShown = false;
  model.isPlayingProperty.link( function( isPlaying ) {
    egg.visible = !isPlaying && model.isExplodedProperty.get() &&
                  model.substanceProperty.get() === SubstanceType.WATER && !eggShown;
    if ( egg.visible ) {
      eggShown = true;
    }
  } );

  // Monitor the model for changes of the container size and adjust the view accordingly.
  model.containerHeightProperty.link( function( containerHeight, previousContainerHeight ) {

    // move the thermometer with the lid
    self.compositeThermometerNode.centerX = nominalParticleAreaViewBounds.minX + nominalParticleAreaViewBounds.width * 0.35;
    self.compositeThermometerNode.centerY = modelViewTransform.modelToViewY( containerHeight );

    // if the container has exploded, rotate the thermometer as it moves up
    if ( model.isExplodedProperty.get() ) {
      const containerHeightChange = previousContainerHeight - containerHeight;
      self.compositeThermometerNode.rotateAround(
        self.compositeThermometerNode.center,
        containerHeightChange * 0.0001 * Math.PI );
    }

    // other updates
    self.updatePhaseDiagram();
  } );

  model.temperatureSetPointProperty.link( function() {
    self.modelTemperatureHistory.clear();
    self.updatePhaseDiagram();
  } );

  model.scaledAtoms.lengthProperty.link( function() {
    self.updatePhaseDiagram();
  } );
}

statesOfMatter.register( 'PhaseChangesScreenView', PhaseChangesScreenView );

export default inherit( ScreenView, PhaseChangesScreenView, {

  // @public
  step: function( dt ) {
    this.particleContainerNode.step( dt );
  },

  /**
   * Update the position of the marker on the phase diagram based on the temperature and pressure values within the
   * model.
   * @private
   */
  updatePhaseDiagram: function() {

    // If the container has exploded, don't bother showing the dot.
    if ( this.multipleParticleModel.isExplodedProperty.get() || this.multipleParticleModel.scaledAtoms.length === 0 ) {
      this.phaseDiagram.setStateMarkerVisible( false );
    }
    else {
      this.phaseDiagram.setStateMarkerVisible( true );
      const movingAverageTemperature = this.updateMovingAverageTemperature(
        this.multipleParticleModel.temperatureSetPointProperty.get()
      );
      const modelPressure = this.multipleParticleModel.getModelPressure();
      const mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature( movingAverageTemperature );
      const mappedPressure = this.mapModelTempAndPressureToPhaseDiagramPressure( modelPressure, movingAverageTemperature );
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
    let totalOfAllTemperatures = 0;
    for ( let i = 0; i < this.modelTemperatureHistory.length; i++ ) {
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

    let mappedTemperature;
    if ( modelTemperature < this.triplePointTemperatureInModelUnits ) {
      mappedTemperature = this.slopeInFirstRegion * modelTemperature;
    }
    else {
      mappedTemperature = modelTemperature * this.slopeInSecondRegion + this.offsetInSecondRegion;
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
} );