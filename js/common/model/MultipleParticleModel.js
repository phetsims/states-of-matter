// Copyright 2014-2023, University of Colorado Boulder

/**
 * This is the main class for the model portion of the first two screens of the "States of Matter" simulation.  Its
 * primary purpose is to simulate a set of molecules that are interacting with one another based on the attraction and
 * repulsion that is described by the Lennard-Jones potential equation.
 *
 * Each instance of this class maintains a set of data that represents a normalized model in which all atoms that
 * comprise each molecule - and often it is just one atom per molecule - are assumed to have a diameter of 1, since this
 * allows for very quick calculations, and also a set of data for atoms that have the actual diameter of the atoms being
 * simulated (e.g. Argon). Throughout the comments and in the variable naming the terms "normalized data set" (or
 * sometimes simply "normalized set") and "model data set" are used for this date, respectively.  When the simulation is
 * running, the normalized data set is updated first, since that is where the hardcore calculations are performed, and
 * then the model data set is synchronized with the normalized data.  It is the model data set that is monitored by the
 * view components that actually display the molecule positions to the user.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import PhaseStateEnum from '../PhaseStateEnum.js';
import SOMConstants from '../SOMConstants.js';
import SubstanceType from '../SubstanceType.js';
import AtomType from './AtomType.js';
import DiatomicAtomPositionUpdater from './engine/DiatomicAtomPositionUpdater.js';
import DiatomicPhaseStateChanger from './engine/DiatomicPhaseStateChanger.js';
import DiatomicVerletAlgorithm from './engine/DiatomicVerletAlgorithm.js';
import AndersenThermostat from './engine/kinetic/AndersenThermostat.js';
import IsokineticThermostat from './engine/kinetic/IsokineticThermostat.js';
import MonatomicAtomPositionUpdater from './engine/MonatomicAtomPositionUpdater.js';
import MonatomicPhaseStateChanger from './engine/MonatomicPhaseStateChanger.js';
import MonatomicVerletAlgorithm from './engine/MonatomicVerletAlgorithm.js';
import WaterAtomPositionUpdater from './engine/WaterAtomPositionUpdater.js';
import WaterPhaseStateChanger from './engine/WaterPhaseStateChanger.js';
import WaterVerletAlgorithm from './engine/WaterVerletAlgorithm.js';
import MoleculeForceAndMotionDataSet from './MoleculeForceAndMotionDataSet.js';
import MovingAverage from './MovingAverage.js';
import HydrogenAtom from './particle/HydrogenAtom.js';
import ScaledAtom from './particle/ScaledAtom.js';

//---------------------------------------------------------------------------------------------------------------------
// constants
//---------------------------------------------------------------------------------------------------------------------

// general constants
const CONTAINER_WIDTH = 10000; // in picometers
const CONTAINER_INITIAL_HEIGHT = 10000;  // in picometers
const DEFAULT_SUBSTANCE = SubstanceType.NEON;
const MAX_TEMPERATURE = 50.0;
const MIN_TEMPERATURE = 0.00001;
const NOMINAL_GRAVITATIONAL_ACCEL = -0.045;
const TEMPERATURE_CHANGE_RATE = 0.07; // empirically determined to make temperate change at a reasonable rate
const INJECTED_MOLECULE_SPEED = 2.0; // in normalized model units per second, empirically determined to look reasonable
const INJECTED_MOLECULE_ANGLE_SPREAD = Math.PI * 0.25; // in radians, empirically determined to look reasonable
const INJECTION_POINT_HORIZ_PROPORTION = 0.00;
const INJECTION_POINT_VERT_PROPORTION = 0.25;

// constants related to how time steps are handled
const PARTICLE_SPEED_UP_FACTOR = 4; // empirically determined to make the particles move at a speed that looks reasonable
const MAX_PARTICLE_MOTION_TIME_STEP = 0.025; // max time step that model can handle, empirically determined

// constants that define the normalized temperatures used for the various states
const SOLID_TEMPERATURE = SOMConstants.SOLID_TEMPERATURE;
const LIQUID_TEMPERATURE = SOMConstants.LIQUID_TEMPERATURE;
const GAS_TEMPERATURE = SOMConstants.GAS_TEMPERATURE;
const INITIAL_TEMPERATURE = SOLID_TEMPERATURE;
const APPROACHING_ABSOLUTE_ZERO_TEMPERATURE = SOLID_TEMPERATURE * 0.85;

// parameters to control rates of change of the container size
const MAX_CONTAINER_EXPAND_RATE = 1500; // in model units per second
const POST_EXPLOSION_CONTAINER_EXPANSION_RATE = 9000; // in model units per second

// Range for deciding if the temperature is near the current set point. The units are internal model units.
const TEMPERATURE_CLOSENESS_RANGE = 0.15;

// Values used for converting from model temperature to the temperature for a given substance.
const NEON_TRIPLE_POINT_IN_KELVIN = SOMConstants.NEON_TRIPLE_POINT_IN_KELVIN;
const NEON_CRITICAL_POINT_IN_KELVIN = SOMConstants.NEON_CRITICAL_POINT_IN_KELVIN;
const ARGON_TRIPLE_POINT_IN_KELVIN = SOMConstants.ARGON_TRIPLE_POINT_IN_KELVIN;
const ARGON_CRITICAL_POINT_IN_KELVIN = SOMConstants.ARGON_CRITICAL_POINT_IN_KELVIN;
const O2_TRIPLE_POINT_IN_KELVIN = SOMConstants.O2_TRIPLE_POINT_IN_KELVIN;
const O2_CRITICAL_POINT_IN_KELVIN = SOMConstants.O2_CRITICAL_POINT_IN_KELVIN;
const WATER_TRIPLE_POINT_IN_KELVIN = SOMConstants.WATER_TRIPLE_POINT_IN_KELVIN;
const WATER_CRITICAL_POINT_IN_KELVIN = SOMConstants.WATER_CRITICAL_POINT_IN_KELVIN;

// The following values are used for temperature conversion for the adjustable molecule.  These are somewhat
// arbitrary, since in the real world the values would change if epsilon were changed.  They have been chosen to be
// similar to argon, because the default epsilon value is half of the allowable range, and this value ends up being
// similar to argon.
const ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN = 75;
const ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN = 140;

// Time value used to prevent molecule injections from being too close together so that they don't overlap after
// injection and cause high initial velocities.
const MOLECULE_INJECTION_HOLDOFF_TIME = 0.25; // seconds, empirically determined
const MAX_MOLECULES_QUEUED_FOR_INJECTION = 3;

class MultipleParticleModel extends PhetioObject {

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( tandem, options ) {

    options = merge( {
      validSubstances: SubstanceType.VALUES
    }, options );

    super( {
      tandem: tandem,
      phetioType: MultipleParticleModel.MultipleParticleModelIO
    } );

    //-----------------------------------------------------------------------------------------------------------------
    // observable model properties
    //-----------------------------------------------------------------------------------------------------------------

    // @public (read-write)
    this.substanceProperty = new EnumerationDeprecatedProperty( SubstanceType, DEFAULT_SUBSTANCE, {
      validValues: options.validSubstances,
      tandem: tandem.createTandem( 'substanceProperty' ),
      phetioState: false
    } );

    // @public (read-only)
    this.containerHeightProperty = new NumberProperty( CONTAINER_INITIAL_HEIGHT, {
      tandem: tandem.createTandem( 'containerHeightProperty' ),
      phetioState: false,
      phetioReadOnly: true,
      phetioDocumentation: 'The height of the particle container, in picometers.',
      units: 'pm'
    } );

    // @public (read-only)
    this.isExplodedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isExplodedProperty' ),
      phetioState: false,
      phetioReadOnly: true
    } );

    // @public (read-write)
    this.temperatureSetPointProperty = new NumberProperty( INITIAL_TEMPERATURE, {
      tandem: tandem.createTandem( 'temperatureSetPointProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'In internal model units, solid = 0.15, liquid = 0.34, gas = 1.'
    } );

    // @public (read-only)
    this.pressureProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'pressureProperty' ),
      phetioReadOnly: true,
      units: 'atm'
    } );

    // @public (read-write)
    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' )
    } );

    // @public (read-write)
    this.heatingCoolingAmountProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'heatingCoolingAmountProperty' ),
      phetioState: false,
      range: new Range( -1, 1 )
    } );

    // @public (read-write) - the number of molecules that should be in the simulation.  This is used primarily for
    // injecting new molecules, and when this number is increased, internal model state is adjusted to match.
    this.targetNumberOfMoleculesProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'targetNumberOfMoleculesProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'This value represents the number of particles being simulated, not the number of particles in the container.'
    } );

    // @public (read-only)
    this.maxNumberOfMoleculesProperty = new NumberProperty( SOMConstants.MAX_NUM_ATOMS );

    // @private {NumberProperty}
    this.numMoleculesQueuedForInjectionProperty = new NumberProperty( 0 );

    // @public (read-only) - indicates whether injection of additional molecules is allowed
    this.isInjectionAllowedProperty = new DerivedProperty(
      [
        this.isPlayingProperty,
        this.numMoleculesQueuedForInjectionProperty,
        this.isExplodedProperty,
        this.maxNumberOfMoleculesProperty,
        this.targetNumberOfMoleculesProperty
      ],
      ( isPlaying, numberOfMoleculesQueuedForInjection, isExploded, maxNumberOfMoleculesProperty, targetNumberOfMolecules ) => {
        return isPlaying &&
               numberOfMoleculesQueuedForInjection < MAX_MOLECULES_QUEUED_FOR_INJECTION &&
               !isExploded &&
               targetNumberOfMolecules < maxNumberOfMoleculesProperty;
      }
    );

    // @public (listen-only) - fires when a reset occurs
    this.resetEmitter = new Emitter();

    //-----------------------------------------------------------------------------------------------------------------
    // other model attributes
    //-----------------------------------------------------------------------------------------------------------------

    // @public (read-only) {ObservableArrayDef.<ScaledAtom>} - array of scaled (i.e. non-normalized) atoms
    this.scaledAtoms = createObservableArray();

    // @public {MoleculeForceAndMotionDataSet} - data set containing information about the position, motion, and force
    // for the normalized atoms
    this.moleculeDataSet = null;

    // @public (read-only) {number} - various non-property attributes
    this.normalizedContainerWidth = CONTAINER_WIDTH / this.particleDiameter;
    this.gravitationalAcceleration = NOMINAL_GRAVITATIONAL_ACCEL;

    // @public (read-only) {number} - normalized version of the container height, changes as the lid position changes
    this.normalizedContainerHeight = this.containerHeightProperty.get() / this.particleDiameter;

    // @public (read-only) {number} - normalized version of the TOTAL container height regardless of the lid position
    this.normalizedTotalContainerHeight = this.containerHeightProperty.get / this.particleDiameter;

    // @protected - normalized velocity at which lid is moving in y direction
    this.normalizedLidVelocityY = 0;

    // @protected (read-only) {Vector2} - the location where new molecules are injected, in normalized coordinates
    this.injectionPoint = Vector2.ZERO.copy();

    // @private, various internal model variables
    this.particleDiameter = 1;
    this.minModelTemperature = null;
    this.residualTime = 0;
    this.moleculeInjectionHoldoffTimer = 0;
    this.heightChangeThisStep = 0;
    this.moleculeInjectedThisStep = false;

    // @private, strategy patterns that are applied to the data set
    this.atomPositionUpdater = null;
    this.phaseStateChanger = null;
    this.isoKineticThermostat = null;
    this.andersenThermostat = null;

    // @protected
    this.moleculeForceAndMotionCalculator = null;

    // @private - moving average calculator that tracks the average difference between the calculated and target temperatures
    this.averageTemperatureDifference = new MovingAverage( 10 );

    //-----------------------------------------------------------------------------------------------------------------
    // other initialization
    //-----------------------------------------------------------------------------------------------------------------

    // listen for changes to the substance being simulated and update the internals as needed
    this.substanceProperty.link( substance => {
      this.handleSubstanceChanged( substance );
    } );

    // listen for changes to the non-normalized container size and update the normalized dimensions
    this.containerHeightProperty.link( this.updateNormalizedContainerDimensions.bind( this ) );

    // listen for new molecules being added (generally from the pump)
    this.targetNumberOfMoleculesProperty.lazyLink( targetNumberOfMolecules => {

      assert && assert(
        targetNumberOfMolecules <= this.maxNumberOfMoleculesProperty.value,
        'target number of molecules set above max allowed'
      );

      const currentNumberOfMolecules = Math.floor(
        this.moleculeDataSet.numberOfAtoms / this.moleculeDataSet.atomsPerMolecule
      );

      const numberOfMoleculesToAdd = targetNumberOfMolecules -
                                     ( currentNumberOfMolecules + this.numMoleculesQueuedForInjectionProperty.value );

      for ( let i = 0; i < numberOfMoleculesToAdd; i++ ) {
        this.queueMoleculeForInjection();
      }
    } );

    // @public (read-only) - the model temperature in Kelvin, derived from the temperature set point in model units
    this.temperatureInKelvinProperty = new DerivedProperty(
      [ this.temperatureSetPointProperty, this.substanceProperty, this.targetNumberOfMoleculesProperty ],
      () => this.getTemperatureInKelvin(),
      {
        units: 'K',
        phetioValueType: NullableIO( NumberIO ),
        tandem: tandem.createTandem( 'temperatureInKelvinProperty' ),
        phetReadOnly: true
      }
    );
  }

  /**
   * @param {number} newTemperature
   * @public
   */
  setTemperature( newTemperature ) {

    if ( newTemperature > MAX_TEMPERATURE ) {
      this.temperatureSetPointProperty.set( MAX_TEMPERATURE );
    }
    else if ( newTemperature < MIN_TEMPERATURE ) {
      this.temperatureSetPointProperty.set( MIN_TEMPERATURE );
    }
    else {
      this.temperatureSetPointProperty.set( newTemperature );
    }

    if ( this.isoKineticThermostat !== null ) {
      this.isoKineticThermostat.targetTemperature = newTemperature;
    }

    if ( this.andersenThermostat !== null ) {
      this.andersenThermostat.targetTemperature = newTemperature;
    }
  }

  /**
   * Get the current temperature in degrees Kelvin.  The calculations done are dependent on the type of molecule
   * selected.  The values and ranges used in this method were derived from information provided by Paul Beale, dept
   * of Physics, University of Colorado Boulder.  If no atoms are in the container, this returns null.
   * @returns {number|null}
   * @private
   */
  getTemperatureInKelvin() {

    if ( this.scaledAtoms.length === 0 ) {

      // temperature is reported as null if there are no atoms since the temperature is meaningless in that case
      return null;
    }

    let temperatureInKelvin;
    let triplePointInKelvin = 0;
    let criticalPointInKelvin = 0;
    let triplePointInModelUnits = 0;
    let criticalPointInModelUnits = 0;

    switch( this.substanceProperty.get() ) {

      case SubstanceType.NEON:
        triplePointInKelvin = NEON_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = NEON_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
        break;

      case SubstanceType.ARGON:
        triplePointInKelvin = ARGON_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = ARGON_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
        break;

      case SubstanceType.ADJUSTABLE_ATOM:
        triplePointInKelvin = ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
        break;

      case SubstanceType.WATER:
        triplePointInKelvin = WATER_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = WATER_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_WATER_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_WATER_MODEL_TEMPERATURE;
        break;

      case SubstanceType.DIATOMIC_OXYGEN:
        triplePointInKelvin = O2_TRIPLE_POINT_IN_KELVIN;
        criticalPointInKelvin = O2_CRITICAL_POINT_IN_KELVIN;
        triplePointInModelUnits = SOMConstants.TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE;
        criticalPointInModelUnits = SOMConstants.CRITICAL_POINT_DIATOMIC_MODEL_TEMPERATURE;
        break;

      default:
        throw new Error( 'unsupported substance' ); // should never happen, debug if it does
    }

    if ( this.temperatureSetPointProperty.get() <= this.minModelTemperature ) {

      // we treat anything below the minimum temperature as absolute zero
      temperatureInKelvin = 0;
    }
    else if ( this.temperatureSetPointProperty.get() < triplePointInModelUnits ) {
      temperatureInKelvin = this.temperatureSetPointProperty.get() * triplePointInKelvin / triplePointInModelUnits;

      if ( temperatureInKelvin < 0.5 ) {

        // Don't return zero - or anything that would round to it - as a value until we actually reach the minimum
        // internal temperature.
        temperatureInKelvin = 0.5;
      }
    }
    else if ( this.temperatureSetPointProperty.get() < criticalPointInModelUnits ) {
      const slope = ( criticalPointInKelvin - triplePointInKelvin ) /
                    ( criticalPointInModelUnits - triplePointInModelUnits );
      const offset = triplePointInKelvin - ( slope * triplePointInModelUnits );
      temperatureInKelvin = this.temperatureSetPointProperty.get() * slope + offset;
    }
    else {
      temperatureInKelvin = this.temperatureSetPointProperty.get() * criticalPointInKelvin /
                            criticalPointInModelUnits;
    }
    return temperatureInKelvin;
  }

  /**
   * Get the pressure value which is being calculated by the model and is not adjusted to represent any "real" units
   * (such as atmospheres).
   * @returns {number}
   * @public
   */
  getModelPressure() {
    return this.moleculeForceAndMotionCalculator.pressureProperty.get();
  }

  /**
   * handler that sets up the various portions of the model to support the newly selected substance
   * @param {SubstanceType} substance
   * @protected
   */
  handleSubstanceChanged( substance ) {

    assert && assert(
      substance === SubstanceType.DIATOMIC_OXYGEN ||
      substance === SubstanceType.NEON ||
      substance === SubstanceType.ARGON ||
      substance === SubstanceType.WATER ||
      substance === SubstanceType.ADJUSTABLE_ATOM,
      'unsupported substance'
    );

    // Retain the current phase so that we can set the atoms back to this phase once they have been created and
    // initialized.
    const phase = this.mapTemperatureToPhase();

    // remove all atoms
    this.removeAllAtoms();

    // Reinitialize the model parameters.
    this.initializeModelParameters();

    // Set the model parameters that are dependent upon the substance being simulated.
    switch( substance ) {

      case SubstanceType.DIATOMIC_OXYGEN:
        this.particleDiameter = SOMConstants.OXYGEN_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE /
                                   O2_TRIPLE_POINT_IN_KELVIN;
        break;

      case SubstanceType.NEON:
        this.particleDiameter = SOMConstants.NEON_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE /
                                   NEON_TRIPLE_POINT_IN_KELVIN;
        break;

      case SubstanceType.ARGON:
        this.particleDiameter = SOMConstants.ARGON_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE /
                                   ARGON_TRIPLE_POINT_IN_KELVIN;
        break;

      case SubstanceType.WATER:

        // Use a radius value that is artificially large, because the educators have requested that water look
        // "spaced out" so that users can see the crystal structure better, and so that the solid form will look
        // larger (since water expands when frozen).
        this.particleDiameter = SOMConstants.OXYGEN_RADIUS * 2.9;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_WATER_MODEL_TEMPERATURE /
                                   WATER_TRIPLE_POINT_IN_KELVIN;
        break;

      case SubstanceType.ADJUSTABLE_ATOM:
        this.particleDiameter = SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS * 2;
        this.minModelTemperature = 0.5 * SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE /
                                   ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
        break;

      default:
        throw new Error( 'unsupported substance' ); // should never happen, debug if it does
    }

    // Reset the container height.
    this.containerHeightProperty.reset();

    // Make sure the normalized container dimensions are correct for the substance and the current non-normalize size.
    this.updateNormalizedContainerDimensions();

    // Adjust the injection point based on the new particle diameter.  These are using the normalized coordinate values.
    this.injectionPoint.setXY(
      CONTAINER_WIDTH / this.particleDiameter * INJECTION_POINT_HORIZ_PROPORTION,
      CONTAINER_INITIAL_HEIGHT / this.particleDiameter * INJECTION_POINT_VERT_PROPORTION
    );

    // Add the atoms and set their initial positions.
    this.initializeAtoms( phase );

    // Reset the moving average of temperature differences.
    this.averageTemperatureDifference.reset();

    // Set the number of molecules and range for the current substance.
    const atomsPerMolecule = this.moleculeDataSet.atomsPerMolecule;
    this.targetNumberOfMoleculesProperty.set( Math.floor( this.moleculeDataSet.numberOfAtoms / atomsPerMolecule ) );
    this.maxNumberOfMoleculesProperty.set( Math.floor( SOMConstants.MAX_NUM_ATOMS / atomsPerMolecule ) );
  }

  /**
   *  @private
   */
  updatePressure() {
    this.pressureProperty.set( this.getPressureInAtmospheres() );
  }

  /**
   * @public
   */
  reset() {

    const substanceAtStartOfReset = this.substanceProperty.get();

    // reset observable properties
    this.containerHeightProperty.reset();
    this.isExplodedProperty.reset();
    this.temperatureSetPointProperty.reset();
    this.pressureProperty.reset();
    this.substanceProperty.reset();
    this.isPlayingProperty.reset();
    this.heatingCoolingAmountProperty.reset();

    // reset thermostats
    this.isoKineticThermostat.clearAccumulatedBias();
    this.andersenThermostat.clearAccumulatedBias();

    // if the substance wasn't changed during reset, so some additional work is necessary
    if ( substanceAtStartOfReset === this.substanceProperty.get() ) {
      this.removeAllAtoms();
      this.containerHeightProperty.reset();
      this.initializeAtoms( PhaseStateEnum.SOLID );
    }

    // other reset
    this.gravitationalAcceleration = NOMINAL_GRAVITATIONAL_ACCEL;
    this.resetEmitter.emit();
  }

  /**
   * Set the phase of the molecules in the simulation.
   * @param {number} phaseSate
   * @public
   */
  setPhase( phaseSate ) {
    assert && assert(
      phaseSate === PhaseStateEnum.SOLID || phaseSate === PhaseStateEnum.LIQUID || phaseSate === PhaseStateEnum.GAS,
      'invalid phase state specified'
    );
    this.phaseStateChanger.setPhase( phaseSate );
    this.syncAtomPositions();
  }

  /**
   * Sets the amount of heating or cooling that the system is undergoing.
   * @param {number} normalizedHeatingCoolingAmount - Normalized amount of heating or cooling that the system is
   * undergoing, ranging from -1 to +1.
   * @public
   */
  setHeatingCoolingAmount( normalizedHeatingCoolingAmount ) {
    assert && assert( ( normalizedHeatingCoolingAmount <= 1.0 ) && ( normalizedHeatingCoolingAmount >= -1.0 ) );
    this.heatingCoolingAmountProperty.set( normalizedHeatingCoolingAmount );
  }

  /**
   * Inject a new molecule of the current type.  This method actually queues it for injection, actual injection
   * occurs during model steps.  Be aware that this silently ignores the injection request if the model is not in a
   * state to support injection.
   * @private
   */
  queueMoleculeForInjection() {
    this.numMoleculesQueuedForInjectionProperty.set( this.numMoleculesQueuedForInjectionProperty.value + 1 );
  }

  /**
   * Inject a new molecule of the current type into the model. This uses the current temperature to assign an initial
   * velocity.
   * @private
   */
  injectMolecule() {

    assert && assert(
      this.numMoleculesQueuedForInjectionProperty.value > 0,
      'this method should not be called when nothing is queued for injection'
    );

    assert && assert(
      this.moleculeDataSet.getNumberOfRemainingSlots() > 0,
      'injection attempted when there is no room in the data set'
    );

    // Choose an injection angle with some amount of randomness.
    const injectionAngle = ( dotRandom.nextDouble() - 0.5 ) * INJECTED_MOLECULE_ANGLE_SPREAD;

    // Set the molecule's velocity.
    const xVel = Math.cos( injectionAngle ) * INJECTED_MOLECULE_SPEED;
    const yVel = Math.sin( injectionAngle ) * INJECTED_MOLECULE_SPEED;

    // Set the rotational velocity to a random value within a range (will be ignored for single atom cases).
    const moleculeRotationRate = ( dotRandom.nextDouble() - 0.5 ) * ( Math.PI / 4 );

    // Set the position(s) of the atom(s).
    const atomsPerMolecule = this.moleculeDataSet.atomsPerMolecule;
    const moleculeCenterOfMassPosition = this.injectionPoint.copy();
    const moleculeVelocity = new Vector2( xVel, yVel );
    const atomPositions = [];
    for ( let i = 0; i < atomsPerMolecule; i++ ) {
      atomPositions[ i ] = Vector2.ZERO;
    }

    // Add the newly created molecule to the data set.
    this.moleculeDataSet.addMolecule(
      atomPositions,
      moleculeCenterOfMassPosition,
      moleculeVelocity,
      moleculeRotationRate,
      true
    );

    if ( atomsPerMolecule > 1 ) {

      // randomize the rotational angle of multi-atom molecules
      this.moleculeDataSet.moleculeRotationAngles[ this.moleculeDataSet.getNumberOfMolecules() - 1 ] =
        dotRandom.nextDouble() * 2 * Math.PI;
    }

    // Position the atoms that comprise the molecules.
    this.atomPositionUpdater.updateAtomPositions( this.moleculeDataSet );

    // add the non-normalized atoms
    this.addAtomsForCurrentSubstance( 1 );

    this.syncAtomPositions();

    this.moleculeInjectedThisStep = true;

    this.numMoleculesQueuedForInjectionProperty.set( this.numMoleculesQueuedForInjectionProperty.value - 1 );
  }

  /**
   * add non-normalized atoms for the specified number of molecules of the current substance
   * @param {number} numMolecules
   * @private
   */
  addAtomsForCurrentSubstance( numMolecules ) {

    _.times( numMolecules, () => {

      switch( this.substanceProperty.value ) {

        case SubstanceType.ARGON:
          this.scaledAtoms.push( new ScaledAtom( AtomType.ARGON, 0, 0 ) );
          break;

        case SubstanceType.NEON:
          this.scaledAtoms.push( new ScaledAtom( AtomType.NEON, 0, 0 ) );
          break;

        case SubstanceType.ADJUSTABLE_ATOM:
          this.scaledAtoms.push( new ScaledAtom( AtomType.ADJUSTABLE, 0, 0 ) );
          break;

        case SubstanceType.DIATOMIC_OXYGEN:
          this.scaledAtoms.push( new ScaledAtom( AtomType.OXYGEN, 0, 0 ) );
          this.scaledAtoms.push( new ScaledAtom( AtomType.OXYGEN, 0, 0 ) );
          break;

        case SubstanceType.WATER:
          this.scaledAtoms.push( new ScaledAtom( AtomType.OXYGEN, 0, 0 ) );
          this.scaledAtoms.push( new HydrogenAtom( 0, 0, true ) );
          this.scaledAtoms.push( new HydrogenAtom( 0, 0, dotRandom.nextDouble() > 0.5 ) );
          break;

        default:
          this.scaledAtoms.push( new ScaledAtom( AtomType.NEON, 0, 0 ) );
          break;
      }
    } );
  }

  /**
   *  @private
   */
  removeAllAtoms() {

    // Get rid of any existing atoms from the model set.
    this.scaledAtoms.clear();

    // Get rid of the normalized atoms too.
    this.moleculeDataSet = null;
  }

  /**
   * Initialize the normalized and non-normalized data sets by calling the appropriate initialization routine, which
   * will set positions, velocities, etc.
   * @param {number} phase - phase of atoms
   * @public
   */
  initializeAtoms( phase ) {

    // Initialize the atoms.
    switch( this.substanceProperty.get() ) {
      case SubstanceType.DIATOMIC_OXYGEN:
        this.initializeDiatomic( this.substanceProperty.get(), phase );
        break;
      case SubstanceType.NEON:
        this.initializeMonatomic( this.substanceProperty.get(), phase );
        break;
      case SubstanceType.ARGON:
        this.initializeMonatomic( this.substanceProperty.get(), phase );
        break;
      case SubstanceType.ADJUSTABLE_ATOM:
        this.initializeMonatomic( this.substanceProperty.get(), phase );
        break;
      case SubstanceType.WATER:
        this.initializeTriatomic( this.substanceProperty.get(), phase );
        break;
      default:
        throw new Error( 'unsupported substance' ); // should never happen, debug if it does
    }

    // This is needed in case we were switching from another molecule that was under pressure.
    this.updatePressure();
  }

  /**
   * @private
   */
  initializeModelParameters() {

    // Initialize the system parameters.
    this.gravitationalAcceleration = NOMINAL_GRAVITATIONAL_ACCEL;
    this.heatingCoolingAmountProperty.reset();
    this.temperatureSetPointProperty.reset();
    this.isExplodedProperty.reset();
  }

  /**
   * Reduce the upward motion of the molecules.  This is generally done to reduce some behavior that is sometimes seen
   * where the molecules float rapidly upwards after being heated.
   * @param {number} dt
   * @private
   */
  dampUpwardMotion( dt ) {

    for ( let i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++ ) {
      if ( this.moleculeDataSet.moleculeVelocities[ i ].y > 0 ) {
        this.moleculeDataSet.moleculeVelocities[ i ].y *= 1 - ( dt * 0.9 );
      }
    }
  }

  /**
   * Update the normalized full-size container dimensions based on the current particle diameter.
   * @private
   */
  updateNormalizedContainerDimensions() {
    this.normalizedContainerWidth = CONTAINER_WIDTH / this.particleDiameter;

    // The non-normalized height will keep increasing after the container explodes, so we need to limit it here.
    const nonNormalizedContainerHeight = Math.min( this.containerHeightProperty.value, CONTAINER_INITIAL_HEIGHT );
    this.normalizedContainerHeight = nonNormalizedContainerHeight / this.particleDiameter;
    this.normalizedTotalContainerHeight = nonNormalizedContainerHeight / this.particleDiameter;
  }

  /**
   * Step the model.
   * @param {number} dt - delta time, in seconds
   * @public
   */
  stepInTime( dt ) {

    this.moleculeInjectedThisStep = false;

    // update the size of the container, which can be affected by exploding or other external factors
    this.updateContainerSize( dt );

    // Record the pressure to see if it changes.
    const pressureBeforeAlgorithm = this.getModelPressure();

    // Calculate the amount of time to advance the particle engine.  This is based purely on aesthetics - we looked at
    // the particle motion and tweaked the multiplier until we felt that it looked good.
    const particleMotionAdvancementTime = dt * PARTICLE_SPEED_UP_FACTOR;

    // Determine the number of model steps and the size of the time step.
    let numParticleEngineSteps = 1;
    let particleMotionTimeStep;
    if ( particleMotionAdvancementTime > MAX_PARTICLE_MOTION_TIME_STEP ) {
      particleMotionTimeStep = MAX_PARTICLE_MOTION_TIME_STEP;
      numParticleEngineSteps = Math.floor( particleMotionAdvancementTime / MAX_PARTICLE_MOTION_TIME_STEP );
      this.residualTime = particleMotionAdvancementTime - ( numParticleEngineSteps * particleMotionTimeStep );
    }
    else {
      particleMotionTimeStep = particleMotionAdvancementTime;
    }

    if ( this.residualTime > particleMotionTimeStep ) {
      numParticleEngineSteps++;
      this.residualTime -= particleMotionTimeStep;
    }

    // Inject a new molecule if there is one ready and it isn't too soon after a previous injection.  This is done
    // before execution of the Verlet algorithm so that its velocity will be taken into account when the temperature
    // is calculated.
    if ( this.numMoleculesQueuedForInjectionProperty.value > 0 && this.moleculeInjectionHoldoffTimer === 0 ) {
      this.injectMolecule();
      this.moleculeInjectionHoldoffTimer = MOLECULE_INJECTION_HOLDOFF_TIME;
    }
    else if ( this.moleculeInjectionHoldoffTimer > 0 ) {
      this.moleculeInjectionHoldoffTimer = Math.max( this.moleculeInjectionHoldoffTimer - dt, 0 );
    }

    // Execute the Verlet algorithm, a.k.a. the "particle engine", in order to determine the new atom positions.
    for ( let i = 0; i < numParticleEngineSteps; i++ ) {
      this.moleculeForceAndMotionCalculator.updateForcesAndMotion( particleMotionTimeStep );
    }

    // Sync up the positions of the normalized molecules (the molecule data set) with the atoms being monitored by the
    // view (the model data set).
    this.syncAtomPositions();

    // run the thermostat to keep particle energies from getting out of hand
    this.runThermostat();

    // If the pressure changed, update it.
    if ( this.getModelPressure() !== pressureBeforeAlgorithm ) {
      this.updatePressure();
    }

    // Adjust the temperature set point if needed.
    const currentTemperature = this.temperatureSetPointProperty.get(); // convenience variable
    if ( this.heatingCoolingAmountProperty.get() !== 0 ) {

      let newTemperature;

      if ( currentTemperature < APPROACHING_ABSOLUTE_ZERO_TEMPERATURE &&
           this.heatingCoolingAmountProperty.get() < 0 ) {

        // The temperature adjusts more slowly as we begin to approach absolute zero so that all the molecules have
        // time to reach the bottom of the container.  This is not linear - the rate of change slows as we get closer,
        // to zero degrees Kelvin, which is somewhat real world-ish.
        const adjustmentFactor = Math.pow(
          currentTemperature / APPROACHING_ABSOLUTE_ZERO_TEMPERATURE,
          1.35 // exponent chosen empirically to be as small as possible and still get all molecules to bottom before absolute zero
        );

        newTemperature = currentTemperature +
                         this.heatingCoolingAmountProperty.get() * TEMPERATURE_CHANGE_RATE * dt * adjustmentFactor;
      }
      else {
        const temperatureChange = this.heatingCoolingAmountProperty.get() * TEMPERATURE_CHANGE_RATE * dt;
        newTemperature = Math.min( currentTemperature + temperatureChange, MAX_TEMPERATURE );
      }

      // Prevent the substance from floating up too rapidly when heated.
      if ( currentTemperature < LIQUID_TEMPERATURE && this.heatingCoolingAmountProperty.get() > 0 ) {

        // This is necessary to prevent the substance from floating up when heated from absolute zero.
        this.dampUpwardMotion( dt );
      }

      // Jump to the minimum model temperature if the substance has reached absolute zero.
      if ( this.heatingCoolingAmountProperty.get() <= 0 &&
           this.getTemperatureInKelvin() === 0 &&
           newTemperature > MIN_TEMPERATURE ) {

        // Absolute zero has been reached for this substance.  Set the temperature to the minimum allowed value to
        // minimize motion in the molecules.
        newTemperature = MIN_TEMPERATURE;
      }

      // record the new set point
      this.temperatureSetPointProperty.set( newTemperature );
      this.isoKineticThermostat.targetTemperature = newTemperature;
      this.andersenThermostat.targetTemperature = newTemperature;
    }
  }

  /**
   * @param {number} dt - time in seconds
   * @protected
   */
  updateContainerSize( dt ) {

    if ( this.isExplodedProperty.value ) {

      // The lid is blowing off the container - increase the container size until the lid is well off the screen.
      this.heightChangeThisStep = POST_EXPLOSION_CONTAINER_EXPANSION_RATE * dt;
      if ( this.containerHeightProperty.get() < CONTAINER_INITIAL_HEIGHT * 3 ) {
        this.containerHeightProperty.set(
          this.containerHeightProperty.get() + POST_EXPLOSION_CONTAINER_EXPANSION_RATE * dt
        );
      }
    }
    else {

      // no changes to the height in this step
      this.heightChangeThisStep = 0;
      this.normalizedLidVelocityY = 0;
    }
  }

  /**
   * main step function, called by the PhET framework
   * @param {number} dt
   * @public
   */
  step( dt ) {
    if ( this.isPlayingProperty.get() ) {
      this.stepInTime( dt );
    }
  }

  /**
   * Run the appropriate thermostat based on the settings and the state of the simulation.  This serves to either
   * maintain the particle motions in a range that corresponds to a steady temperature or to increase or decrease the
   * particle motion if the user is heating or cooling the substance.
   * @private
   */
  runThermostat() {

    if ( this.isExplodedProperty.get() ) {

      // Don't bother to run any thermostat if the lid is blown off - just let those little molecules run free!
      return;
    }

    const calculatedTemperature = this.moleculeForceAndMotionCalculator.calculatedTemperature;
    const temperatureSetPoint = this.temperatureSetPointProperty.get();
    let temperatureAdjustmentNeeded = false;
    let thermostatRunThisStep = null;

    if ( this.heatingCoolingAmountProperty.get() > 0 && calculatedTemperature < temperatureSetPoint ||
         this.heatingCoolingAmountProperty.get() < 0 && calculatedTemperature > temperatureSetPoint ||
         Math.abs( calculatedTemperature - temperatureSetPoint ) > TEMPERATURE_CLOSENESS_RANGE ) {
      temperatureAdjustmentNeeded = true;
    }

    if ( this.moleculeInjectedThisStep ) {

      // A molecule was injected this step.  By design, only one can be injected in a single step, so we use the
      // attributes of the most recently added molecule to figure out how much the temperature set point should be
      // adjusted. No thermostat is run on this step - it will kick in on the next step.
      const numMolecules = this.moleculeDataSet.getNumberOfMolecules();
      const injectedParticleTemperature = ( 2 / 3 ) * this.moleculeDataSet.getMoleculeKineticEnergy( numMolecules - 1 );
      const newTemperature = temperatureSetPoint * ( numMolecules - 1 ) / numMolecules +
                             injectedParticleTemperature / numMolecules;
      this.setTemperature( newTemperature );
    }
    else if ( this.moleculeForceAndMotionCalculator.lidChangedParticleVelocity ) {

      // The velocity of one or more molecules was changed through interaction with the lid.  Since this can change
      // the total kinetic energy of the molecules in the system, no thermostat is run.  Instead, the temperature is
      // determined by looking at the kinetic energy of the molecules, and that value is used to determine the new
      // system temperature set point.  However, sometimes the calculation can return some unexpected results,
      // probably due to some of the energy being tied up in potential rather than kinetic energy, so there are some
      // constraints here. See https://github.com/phetsims/states-of-matter/issues/169 for more information.
      if ( this.heightChangeThisStep > 0 && calculatedTemperature < temperatureSetPoint ||
           this.heightChangeThisStep < 0 && calculatedTemperature > temperatureSetPoint ) {

        // Set the target temperature to the calculated value adjusted by the average error that has been recorded.
        // This adjustment is necessary because otherwise big, or strange, temperature changes can occur.
        this.setTemperature( calculatedTemperature + this.averageTemperatureDifference.average );
      }

      // Clear the flag for the next time through.
      this.moleculeForceAndMotionCalculator.lidChangedParticleVelocity = false;
    }
    else if ( temperatureAdjustmentNeeded ||
              temperatureSetPoint > LIQUID_TEMPERATURE ||
              temperatureSetPoint < SOLID_TEMPERATURE / 5 ) {

      // If this is the first run of this thermostat in a while, clear its accumulated biases
      if ( this.thermostatRunPreviousStep !== this.isoKineticThermostat ) {
        this.isoKineticThermostat.clearAccumulatedBias();
      }

      // Use the isokinetic thermostat.
      this.isoKineticThermostat.adjustTemperature( calculatedTemperature );
      thermostatRunThisStep = this.isoKineticThermostat;
    }
    else if ( !temperatureAdjustmentNeeded ) {

      // If this is the first run of this thermostat in a while, clear its accumulated biases
      if ( this.thermostatRunPreviousStep !== this.andersenThermostat ) {
        this.andersenThermostat.clearAccumulatedBias();
      }

      // The temperature isn't changing and it is within a certain range where the Andersen thermostat works better.
      // This is done for purely visual reasons - it looks better than the isokinetic in these circumstances.
      this.andersenThermostat.adjustTemperature();
      thermostatRunThisStep = this.andersenThermostat;
    }

    // Note that there will be some circumstances in which no thermostat is run.  This is intentional.

    // @private - keep track of which thermostat was run since this is used in some cases to reset thermostat state
    this.thermostatRunPreviousStep = thermostatRunThisStep;

    // Update the average difference between the set point and the calculated temperature, but only if nothing has
    // happened that may have affected the calculated value or the set point.
    if ( !temperatureAdjustmentNeeded && !this.moleculeInjectedThisStep && !this.lidChangedParticleVelocity ) {
      this.averageTemperatureDifference.addValue( temperatureSetPoint - calculatedTemperature );
    }
  }

  /**
   * Initialize the various model components to handle a simulation in which all the molecules are single atoms.
   * @param {number} substance
   * @param {number} phase
   * @private
   */
  initializeDiatomic( substance, phase ) {

    // Verify that a valid molecule ID was provided.
    assert && assert( ( substance === SubstanceType.DIATOMIC_OXYGEN ) );

    // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
    // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
    // can fit depends on the size of the individual atom.
    let numberOfAtoms = Math.pow( Utils.roundSymmetric( CONTAINER_WIDTH / ( ( SOMConstants.OXYGEN_RADIUS * 2.1 ) * 3 ) ), 2 );
    if ( numberOfAtoms % 2 !== 0 ) {
      numberOfAtoms--;
    }

    // Create the normalized data set for the one-atom-per-molecule case.
    this.moleculeDataSet = new MoleculeForceAndMotionDataSet( 2 );

    // Create the strategies that will work on this data set.
    this.phaseStateChanger = new DiatomicPhaseStateChanger( this );
    this.atomPositionUpdater = DiatomicAtomPositionUpdater;
    this.moleculeForceAndMotionCalculator = new DiatomicVerletAlgorithm( this );
    this.isoKineticThermostat = new IsokineticThermostat( this.moleculeDataSet, this.minModelTemperature );
    this.andersenThermostat = new AndersenThermostat( this.moleculeDataSet, this.minModelTemperature );

    const numberOfMolecules = numberOfAtoms / 2;
    const atomPositionInVector = new Vector2( 0, 0 );
    const atomPositions = [];
    atomPositions[ 0 ] = atomPositionInVector;
    atomPositions[ 1 ] = atomPositionInVector;

    // Create the individual atoms and add them to the data set.
    for ( let i = 0; i < numberOfMolecules; i++ ) {

      // Create the molecule.
      const moleculeCenterOfMassPosition = new Vector2( 0, 0 );
      const moleculeVelocity = new Vector2( 0, 0 );

      // Add the atom to the data set.
      this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true );

      // Add atoms to model set.
      this.scaledAtoms.push( new ScaledAtom( AtomType.OXYGEN, 0, 0 ) );
      this.scaledAtoms.push( new ScaledAtom( AtomType.OXYGEN, 0, 0 ) );
    }

    this.targetNumberOfMoleculesProperty.set( this.moleculeDataSet.numberOfMolecules );

    // Initialize the atom positions according the to requested phase.
    this.setPhase( phase );
  }

  /**
   * Initialize the various model components to handle a simulation in which each molecule consists of three atoms,
   * e.g. water.
   * @param {number} substance
   * @param {number} phase
   * @private
   */
  initializeTriatomic( substance, phase ) {

    // Only water is supported so far.
    assert && assert( ( substance === SubstanceType.WATER ) );

    // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
    // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
    // can fit depends on the size of the individual atom.
    const waterMoleculeDiameter = SOMConstants.OXYGEN_RADIUS * 2.1;
    const moleculesAcrossBottom = Utils.roundSymmetric( CONTAINER_WIDTH / ( waterMoleculeDiameter * 1.2 ) );
    const numberOfMolecules = Math.pow( moleculesAcrossBottom / 3, 2 );

    // Create the normalized data set for the one-atom-per-molecule case.
    this.moleculeDataSet = new MoleculeForceAndMotionDataSet( 3 );

    // Create the strategies that will work on this data set.
    this.phaseStateChanger = new WaterPhaseStateChanger( this );
    this.atomPositionUpdater = WaterAtomPositionUpdater;
    this.moleculeForceAndMotionCalculator = new WaterVerletAlgorithm( this );
    this.isoKineticThermostat = new IsokineticThermostat( this.moleculeDataSet, this.minModelTemperature );
    this.andersenThermostat = new AndersenThermostat( this.moleculeDataSet, this.minModelTemperature );

    // Create the individual atoms and add them to the data set.
    const atomPositionInVector = new Vector2( 0, 0 );
    const atomPositions = [];
    atomPositions[ 0 ] = atomPositionInVector;
    atomPositions[ 1 ] = atomPositionInVector;
    atomPositions[ 2 ] = atomPositionInVector;
    for ( let i = 0; i < numberOfMolecules; i++ ) {

      // Create the molecule.
      const moleculeCenterOfMassPosition = new Vector2( 0, 0 );
      const moleculeVelocity = new Vector2( 0, 0 );

      // Add the atom to the data set.
      this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true );

      // Add atoms to model set.
      this.scaledAtoms.push( new ScaledAtom( AtomType.OXYGEN, 0, 0 ) );
      this.scaledAtoms.push( new HydrogenAtom( 0, 0, true ) );

      // In order to look more varied, some of the hydrogen atoms are set up to render behind the oxygen atom and
      // some to render in front of it.
      this.scaledAtoms.push( new HydrogenAtom( 0, 0, ( i % 2 === 0 ) ) );
    }

    this.targetNumberOfMoleculesProperty.set( this.moleculeDataSet.numberOfMolecules );

    // Initialize the atom positions according the to requested phase.
    this.setPhase( phase );
  }

  /**
   * Initialize the various model components to handle a simulation in which all the molecules are single atoms.
   * @param {SubstanceType} substance
   * @param {number} phase
   * @private
   */
  initializeMonatomic( substance, phase ) {

    // Verify that a valid molecule ID was provided.
    assert && assert( substance === SubstanceType.ADJUSTABLE_ATOM ||
                      substance === SubstanceType.NEON ||
                      substance === SubstanceType.ARGON );

    // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
    // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
    // can fit depends on the size of the individual.
    let particleDiameter;
    if ( substance === SubstanceType.NEON ) {
      particleDiameter = SOMConstants.NEON_RADIUS * 2;
    }
    else if ( substance === SubstanceType.ARGON ) {
      particleDiameter = SOMConstants.ARGON_RADIUS * 2;
    }
    else if ( substance === SubstanceType.ADJUSTABLE_ATOM ) {
      particleDiameter = SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS * 2;
    }
    else {

      // Force it to neon.
      substance = SubstanceType.NEON;
      particleDiameter = SOMConstants.NEON_RADIUS * 2;
    }

    // Initialize the number of atoms assuming that the solid form, when made into a square, will consume about 1/3
    // the width of the container.
    const numberOfAtoms = Math.pow( Utils.roundSymmetric( CONTAINER_WIDTH / ( ( particleDiameter * 1.05 ) * 3 ) ), 2 );

    // Create the normalized data set for the one-atom-per-molecule case.
    this.moleculeDataSet = new MoleculeForceAndMotionDataSet( 1 );

    // Create the strategies that will work on this data set.
    this.phaseStateChanger = new MonatomicPhaseStateChanger( this );
    this.atomPositionUpdater = MonatomicAtomPositionUpdater;
    this.moleculeForceAndMotionCalculator = new MonatomicVerletAlgorithm( this );
    this.isoKineticThermostat = new IsokineticThermostat( this.moleculeDataSet, this.minModelTemperature );
    this.andersenThermostat = new AndersenThermostat( this.moleculeDataSet, this.minModelTemperature );

    // Create the individual atoms and add them to the data set.
    const atomPositions = [];
    atomPositions.push( new Vector2( 0, 0 ) );
    for ( let i = 0; i < numberOfAtoms; i++ ) {

      // Create the atom.
      const moleculeCenterOfMassPosition = new Vector2( 0, 0 );
      const moleculeVelocity = new Vector2( 0, 0 );
      // Add the atom to the data set.
      this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true );

      // Add atom to model set.
      let atom;
      if ( substance === SubstanceType.NEON ) {
        atom = new ScaledAtom( AtomType.NEON, 0, 0 );
      }
      else if ( substance === SubstanceType.ARGON ) {
        atom = new ScaledAtom( AtomType.ARGON, 0, 0 );
      }
      else if ( substance === SubstanceType.ADJUSTABLE_ATOM ) {
        atom = new ScaledAtom( AtomType.ADJUSTABLE, 0, 0 );
      }
      else {
        atom = new ScaledAtom( AtomType.NEON, 0, 0 );
      }
      this.scaledAtoms.push( atom );
    }

    this.targetNumberOfMoleculesProperty.set( this.moleculeDataSet.numberOfMolecules );

    // Initialize the atom positions according the to requested phase.
    this.setPhase( phase );
  }

  /**
   * Set the positions of the non-normalized molecules based on the positions of the normalized ones.
   * @private
   */
  syncAtomPositions() {

    assert && assert( this.moleculeDataSet.numberOfAtoms === this.scaledAtoms.length,
      `Inconsistent number of normalized versus non-normalized atoms, ${
        this.moleculeDataSet.numberOfAtoms}, ${this.scaledAtoms.length}`
    );
    const positionMultiplier = this.particleDiameter;
    const atomPositions = this.moleculeDataSet.atomPositions;

    // use a C-style loop for optimal performance
    for ( let i = 0; i < this.scaledAtoms.length; i++ ) {
      this.scaledAtoms.get( i ).setPosition(
        atomPositions[ i ].x * positionMultiplier,
        atomPositions[ i ].y * positionMultiplier
      );
    }
  }

  /**
   * Take the internal pressure value and convert it to atmospheres.  In the original Java version of this sim the
   * conversion multiplier was dependent upon the type of molecule in order to be somewhat realistic.  However, this
   * was problematic, since it would cause the container to explode at different pressure readings.  A single
   * multiplier is now used, which is perhaps less realistic, but works better in practice.  Please see
   * https://github.com/phetsims/states-of-matter/issues/124 for more information.
   * @returns {number}
   * @public
   */
  getPressureInAtmospheres() {
    return 5 * this.getModelPressure(); // multiplier empirically determined
  }

  /**
   * Return a phase value based on the current temperature.
   * @return{number}
   * @private
   */
  mapTemperatureToPhase() {
    let phase;
    if ( this.temperatureSetPointProperty.get() < SOLID_TEMPERATURE + ( ( LIQUID_TEMPERATURE - SOLID_TEMPERATURE ) / 2 ) ) {
      phase = PhaseStateEnum.SOLID;
    }
    else if ( this.temperatureSetPointProperty.get() < LIQUID_TEMPERATURE + ( ( GAS_TEMPERATURE - LIQUID_TEMPERATURE ) / 2 ) ) {
      phase = PhaseStateEnum.LIQUID;
    }
    else {
      phase = PhaseStateEnum.GAS;
    }

    return phase;
  }

  /**
   * This method is used for an external entity to notify the model that it should explode.
   * @param {boolean} isExploded
   * @public
   */
  setContainerExploded( isExploded ) {
    if ( this.isExplodedProperty.get() !== isExploded ) {
      this.isExplodedProperty.set( isExploded );
      if ( !isExploded ) {
        this.containerHeightProperty.reset();
      }
    }
  }

  /**
   * Return the lid to the container.  It only makes sense to call this after the container has exploded, otherwise it
   * has no effect.
   * @public
   */
  returnLid() {

    // state checking
    assert && assert( this.isExplodedProperty.get(), 'attempt to return lid when container hadn\'t exploded' );
    if ( !this.isExplodedProperty.get() ) {

      // ignore request if container hasn't exploded
      return;
    }

    // Remove any molecules that are outside of the container.  We work with the normalized molecules/atoms for this.
    let numMoleculesOutsideContainer = 0;
    let firstOutsideMoleculeIndex;
    do {
      for ( firstOutsideMoleculeIndex = 0; firstOutsideMoleculeIndex < this.moleculeDataSet.getNumberOfMolecules();
            firstOutsideMoleculeIndex++ ) {
        const pos = this.moleculeDataSet.getMoleculeCenterOfMassPositions()[ firstOutsideMoleculeIndex ];
        if ( pos.x < 0 ||
             pos.x > this.normalizedContainerWidth ||
             pos.y < 0 ||
             pos.y > CONTAINER_INITIAL_HEIGHT / this.particleDiameter ) {

          // This molecule is outside of the container.
          break;
        }
      }
      if ( firstOutsideMoleculeIndex < this.moleculeDataSet.getNumberOfMolecules() ) {

        // Remove the molecule that was found.
        this.moleculeDataSet.removeMolecule( firstOutsideMoleculeIndex );
        numMoleculesOutsideContainer++;
      }
    } while ( firstOutsideMoleculeIndex !== this.moleculeDataSet.getNumberOfMolecules() );

    // Remove enough of the non-normalized molecules so that we have the same number as the normalized.  They don't
    // have to be the same atoms since the normalized and non-normalized atoms are explicitly synced up during each
    // model step.
    for ( let i = 0; i < numMoleculesOutsideContainer * this.moleculeDataSet.getAtomsPerMolecule(); i++ ) {
      this.scaledAtoms.pop();
    }

    // Set the container to be unexploded.
    this.setContainerExploded( false );

    // Set the phase to be gas, since otherwise the extremely high kinetic energy of the molecules causes an
    // unreasonably high temperature for the molecules that remain in the container. Doing this generally cools them
    // down into a more manageable state.
    if ( numMoleculesOutsideContainer > 0 && this.moleculeForceAndMotionCalculator.calculatedTemperature > GAS_TEMPERATURE ) {
      this.phaseStateChanger.setPhase( PhaseStateEnum.GAS );
    }

    // Sync up the property that tracks the number of molecules - mostly for the purposes of injecting new molecules -
    // with the new value.
    this.targetNumberOfMoleculesProperty.set( this.moleculeDataSet.numberOfMolecules );
  }

  /**
   * serialize this instance for phet-io
   * @returns {Object}
   * @public - for phet-io support only
   */
  toStateObject() {
    return {
      _substance: EnumerationIO( SubstanceType ).toStateObject( this.substanceProperty.value ),
      _isExploded: this.isExplodedProperty.value,
      _containerHeight: this.containerHeightProperty.value,
      _gravitationalAcceleration: this.gravitationalAcceleration,
      _normalizedLidVelocityY: this.normalizedLidVelocityY,
      _heatingCoolingAmount: this.heatingCoolingAmountProperty.value,
      _moleculeDataSet: MoleculeForceAndMotionDataSet.MoleculeForceAndMotionDataSetIO.toStateObject( this.moleculeDataSet ),
      _isoKineticThermostatState: this.isoKineticThermostat.toStateObject(),
      _andersenThermostatState: this.andersenThermostat.toStateObject(),
      _moleculeForcesAndMotionCalculatorPressure: this.moleculeForceAndMotionCalculator.pressureProperty.value
    };
  }

  /**
   * Set the state of this instance for phet-io
   * @param {Object} stateObject
   * @public
   * @override
   */
  applyState( stateObject ) {
    required( stateObject );

    // Setting the substance initializes a bunch of model parameters, so this is done first, then other items that may
    // have been affected are set.
    this.substanceProperty.set( EnumerationIO( SubstanceType ).fromStateObject( stateObject._substance ) );

    // Set properties that may have been updated by setting the substance.
    this.isExplodedProperty.set( stateObject._isExploded );
    this.containerHeightProperty.set( stateObject._containerHeight );
    this.heatingCoolingAmountProperty.set( stateObject._heatingCoolingAmount );
    this.gravitationalAcceleration = stateObject._gravitationalAcceleration;
    this.normalizedLidVelocityY = stateObject._normalizedLidVelocityY;
    this.isoKineticThermostat.setState( stateObject._isoKineticThermostatState );
    this.andersenThermostat.setState( stateObject._andersenThermostatState );

    // Set the molecule data set.  This includes all the positions, velocities, etc. for the particles.
    this.moleculeDataSet.setState( stateObject._moleculeDataSet );

    // Preset the pressure in the accumulator that tracks it so that it doesn't have to start from zero.
    this.moleculeForceAndMotionCalculator.presetPressure( stateObject._moleculeForcesAndMotionCalculatorPressure );

    // Make sure that we have the right number of scaled (i.e. non-normalized) atoms.
    const numberOfNormalizedMolecules = this.moleculeDataSet.numberOfMolecules;
    const numberOfNonNormalizedMolecules = this.scaledAtoms.length / this.moleculeDataSet.atomsPerMolecule;
    if ( numberOfNormalizedMolecules > numberOfNonNormalizedMolecules ) {
      this.addAtomsForCurrentSubstance( numberOfNormalizedMolecules - numberOfNonNormalizedMolecules );
    }
    else if ( numberOfNonNormalizedMolecules > numberOfNormalizedMolecules ) {
      _.times(
        ( numberOfNonNormalizedMolecules - numberOfNormalizedMolecules ) * this.moleculeDataSet.atomsPerMolecule,
        () => {this.scaledAtoms.pop();}
      );
    }

    // Clear the injection counter - all atoms and molecules should be accounted for at this point.
    this.numMoleculesQueuedForInjectionProperty.reset();

    // Synchronize the positions of the scaled atoms to the normalized data set.
    this.syncAtomPositions();
  }
}

// static constants
MultipleParticleModel.PARTICLE_CONTAINER_WIDTH = CONTAINER_WIDTH;
MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT = CONTAINER_INITIAL_HEIGHT;
MultipleParticleModel.MAX_CONTAINER_EXPAND_RATE = MAX_CONTAINER_EXPAND_RATE;

MultipleParticleModel.MultipleParticleModelIO = new IOType( 'MultipleParticleModelIO', {
  valueType: MultipleParticleModel,
  documentation: 'multiple particle model that simulates interactions that lead to phase-like behavior',
  toStateObject: multipleParticleModel => multipleParticleModel.toStateObject(),
  applyState: ( multipleParticleModel, state ) => multipleParticleModel.applyState( state ),
  stateSchema: {
    _substance: EnumerationIO( SubstanceType ),
    _isExploded: BooleanIO,
    _containerHeight: NumberIO,
    _gravitationalAcceleration: NumberIO,
    _normalizedLidVelocityY: NumberIO,
    _heatingCoolingAmount: NumberIO,
    _moleculeDataSet: MoleculeForceAndMotionDataSet.MoleculeForceAndMotionDataSetIO,
    _isoKineticThermostatState: IsokineticThermostat.IsoKineticThermostatIO,
    _andersenThermostatState: AndersenThermostat.AndersenThermostatIO,
    _moleculeForcesAndMotionCalculatorPressure: NumberIO
  }
} );

statesOfMatter.register( 'MultipleParticleModel', MultipleParticleModel );
export default MultipleParticleModel;