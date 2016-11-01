// Copyright 2014-2015, University of Colorado Boulder


/**
 * This is the main class for the model portion of the "States of Matter" simulation.  It maintains a set of data that
 * represents a normalized model in which all atoms are assumed to have a diameter of 1, since this allows for very
 * quick calculations, and also a set of data for particles that have the actual diameter of the particles being
 * simulated (e.g. Argon). Throughout the comments and in the variable naming, I've tried to use the terminology of
 * "normalized data set" (or sometimes simply "normalized set") for the former and "model data set" for the latter.
 * When the simulation is running, the normalized data set is updated first, since that is where the hardcore
 * calculations are performed, and then the model data set is synchronized with the normalized data.  It is the model
 * data set that is monitored by the view components that actually display the molecule positions to the user.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AndersenThermostat = require( 'STATES_OF_MATTER/common/model/engine/kinetic/AndersenThermostat' );
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var DiatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/DiatomicAtomPositionUpdater' );
  var DiatomicPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/DiatomicPhaseStateChanger' );
  var DiatomicVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/DiatomicVerletAlgorithm' );
  var Emitter = require( 'AXON/Emitter' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InteractionStrengthTable = require( 'STATES_OF_MATTER/common/model/InteractionStrengthTable' );
  var IsokineticThermostat = require( 'STATES_OF_MATTER/common/model/engine/kinetic/IsokineticThermostat' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/common/model/MoleculeForceAndMotionDataSet' );
  var MonatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/MonatomicAtomPositionUpdater' );
  var MonatomicPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/MonatomicPhaseStateChanger' );
  var MonatomicVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/MonatomicVerletAlgorithm' );
  var MovingAverage = require( 'STATES_OF_MATTER/common/model/MovingAverage' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  var Property = require( 'AXON/Property' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var StatesOfMatterQueryParameters = require( 'STATES_OF_MATTER/common/StatesOfMatterQueryParameters' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var WaterVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/WaterVerletAlgorithm' );
  var WaterPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/WaterPhaseStateChanger' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

  // constants (general)
  var PARTICLE_CONTAINER_WIDTH = 10000; // essentially arbitrary
  var PARTICLE_CONTAINER_INITIAL_HEIGHT = 10000;  // essentially arbitrary
  var DEFAULT_SUBSTANCE = SubstanceType.NEON;
  var MAX_TEMPERATURE = 50.0;
  var MIN_TEMPERATURE = 0.0001;
  var INITIAL_GRAVITATIONAL_ACCEL = -0.045;
  var TEMPERATURE_CHANGE_RATE_FACTOR = 0.07; // empirically determined to make temperate change at a good rate
  var INJECTED_MOLECULE_VELOCITY = 2.0; // in normalized model units per second, empirically determined to look reasonable
  var INJECTED_MOLECULE_ANGLE_SPREAD = Math.PI * 0.25; // in radians, empirically determined to look reasonable
  var INJECTION_POINT_HORIZ_PROPORTION = 0.00;
  var INJECTION_POINT_VERT_PROPORTION = 0.25;
  var MIN_ALLOWABLE_CONTAINER_HEIGHT = 1500; // empirically determined, almost all the way to the bottom

  // constants related to how time steps are handled
  var NOMINAL_FRAME_RATE = 60; // in frames per second
  var NOMINAL_TIME_STEP = 1 / NOMINAL_FRAME_RATE;
  var PARTICLE_SPEED_UP_FACTOR = 4; // empirically determined to make the particles move at a speed that looks reasonable
  var MAX_PARTICLE_MOTION_TIME_STEP = 0.025; // max time step that model can handle, empirically determined
  var TIME_STEP_MOVING_AVERAGE_LENGTH = 20; // number of samples in the moving average of time steps

  // constants that define the normalized temperatures used for the various states
  var SOLID_TEMPERATURE = StatesOfMatterConstants.SOLID_TEMPERATURE;
  var LIQUID_TEMPERATURE = StatesOfMatterConstants.LIQUID_TEMPERATURE;
  var GAS_TEMPERATURE = StatesOfMatterConstants.GAS_TEMPERATURE;
  var INITIAL_TEMPERATURE = SOLID_TEMPERATURE;

  // possible thermostat settings
  var ISOKINETIC_THERMOSTAT = 1;
  var ANDERSEN_THERMOSTAT = 2;
  var ADAPTIVE_THERMOSTAT = 3;

  // parameters to control rates of change of the container size
  var MAX_CONTAINER_SHRINK_RATE = 1250; // in model units per second
  var MAX_CONTAINER_EXPAND_RATE = 1500; // in model units per second
  var POST_EXPLOSION_CONTAINER_EXPANSION_RATE = 9000; // in model units per second

  // countdown value used when recalculating temperature when the container size is changing
  var CONTAINER_SIZE_CHANGE_COUNTDOWN_RESET = 0.5; // in seconds, empirically determined

  // Range for deciding if the temperature is near the current set point. The units are internal model units.
  var TEMPERATURE_CLOSENESS_RANGE = 0.15;

  // Values used for converting from model temperature to the temperature for a given particle.
  var TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE = 0.26;   // Empirically determined.
  var CRITICAL_POINT_INTERNAL_MODEL_TEMPERATURE = 0.8;  // Empirically determined.
  var NEON_TRIPLE_POINT_IN_KELVIN = 23;   // Tweaked a little from actual value for better temperature mapping.
  var NEON_CRITICAL_POINT_IN_KELVIN = 44;
  var ARGON_TRIPLE_POINT_IN_KELVIN = 75;  // Tweaked a little from actual value for better temperature mapping.
  var ARGON_CRITICAL_POINT_IN_KELVIN = 151;
  var O2_TRIPLE_POINT_IN_KELVIN = 54;
  var O2_CRITICAL_POINT_IN_KELVIN = 155;
  var WATER_TRIPLE_POINT_IN_KELVIN = 273;
  var WATER_CRITICAL_POINT_IN_KELVIN = 647;

  // The following values are used for temperature conversion for the adjustable molecule.  These are somewhat
  // arbitrary, since in the real world the values would change if epsilon were changed.  They have been chosen to be
  // similar to argon, because the default epsilon value is half of the allowable range, and this value ends up being
  // similar to argon.
  var ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN = 75;
  var ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN = 140;

  // Min a max values for adjustable epsilon.  Originally there was a wider allowable range, but the simulation did not
  // work so well, so the range below was arrived at empirically and seems to work reasonably well.
  var MIN_ADJUSTABLE_EPSILON = StatesOfMatterConstants.MIN_ADJUSTABLE_EPSILON;
  var MAX_ADJUSTABLE_EPSILON = StatesOfMatterConstants.EPSILON_FOR_WATER * 1.7;

  // Time value used to prevent molecule injections from being too close together so that they don't overlap after
  // injection and cause high initial velocities.
  var MOLECULE_INJECTION_HOLDOFF_TIME = 0.25; // seconds, empirically determined
  var MAX_MOLECULES_QUEUED_FOR_INJECTION = 3;

  /**
   * @constructor
   */
  function MultipleParticleModel() {

    var self = this;

    //-----------------------------------------------------------------------------------------------------------------
    // observable model properties, all @public
    //-----------------------------------------------------------------------------------------------------------------

    this.particleContainerHeightProperty = new Property( PARTICLE_CONTAINER_INITIAL_HEIGHT ); // read only
    this.targetContainerHeightProperty = new Property( PARTICLE_CONTAINER_INITIAL_HEIGHT ); // read-write
    this.isExplodedProperty = new Property( false ); // read only
    this.phaseDiagramExpandedProperty = new Property( true ); // read-write
    this.interactionExpandedProperty = new Property( true ); // read-write
    this.temperatureSetPointProperty = new Property( INITIAL_TEMPERATURE ); // read-write
    this.pressureProperty = new Property( 0 ); // read only
    this.substanceProperty = new Property( SubstanceType.NEON ); // read-write
    this.interactionStrengthProperty = new Property( MAX_ADJUSTABLE_EPSILON ); // read-wrte
    this.isPlayingProperty = new Property( true ); // read-write
    this.simSpeedProperty = new Property( 'normal' ); // read-write
    this.heatingCoolingAmountProperty = new Property( 0 ); // read-write
    this.keepingUpProperty = new Property( true ); // tracks whether targeted min frame rate is being maintained
    this.averageDtProperty = new Property( NOMINAL_TIME_STEP ); // read only
    this.maxParticleMoveTimePerStepProperty = new Property( Number.POSITIVE_INFINITY ); // read only
    this.resetEmitter = new Emitter(); // listen only

    //-----------------------------------------------------------------------------------------------------------------
    // other model attributes
    //-----------------------------------------------------------------------------------------------------------------

    // arrays containing references to the individual particles
    this.particles = new ObservableArray(); // @public, read-only
    this.copyOfParticles = new ObservableArray(); // @private

    // @public, data set containing information about the position, motion, and force for each particle
    this.moleculeDataSet = null;

    // @public, various non-property attributes
    this.normalizedContainerWidth = PARTICLE_CONTAINER_WIDTH / this.particleDiameter;
    this.gravitationalAcceleration = null;

    // @private, various internal model variables
    this.particleDiameter = 1;
    this.thermostatType = ADAPTIVE_THERMOSTAT;
    this.heightChangeCountdownTime = 0;
    this.minModelTemperature = null;
    this.residualTime = 0;
    this.numMoleculesAwaitingInjection = 0;
    this.moleculeInjectionHoldoffTimer = 0;
    this.injectionPointX = 0;
    this.injectionPointY = 0;
    this.heightChangeThisStep = 0;

    // @public, read-only, normalized version of the container height, changes as the lid position changes
    this.normalizedContainerHeight = this.particleContainerHeightProperty.get() / this.particleDiameter;

    // @public, read-only, normalized version of the TOTAL container height regardless of the lid position, set once at init
    this.normalizedTotalContainerHeight = this.particleContainerHeightProperty.get / this.particleDiameter;

    // @public, normalized velocity at which lid is moving in y direction
    this.normalizedLidVelocityY = 0;

    // @private, strategy patterns that are applied to the data set
    this.atomPositionUpdater = null;
    this.moleculeForceAndMotionCalculator = null;
    this.phaseStateChanger = null;
    this.isoKineticThermostat = null;
    this.andersenThermostat = null;

    // TODO: For working on performance issues, consider removing before publication
    this.timeStepMovingAverage = new MovingAverage(
      TIME_STEP_MOVING_AVERAGE_LENGTH,
      { initialValue: NOMINAL_TIME_STEP }
    );

    //-----------------------------------------------------------------------------------------------------------------
    // other initialization
    //-----------------------------------------------------------------------------------------------------------------

    // Do just enough initialization to allow the view and control portions of the simulation to be properly created.
    // The rest of the initialization will occur when the model is reset.
    this.initializeModelParameters();
    this.setSubstance( DEFAULT_SUBSTANCE );

    this.substanceProperty.link( function( substanceId ) {
      self.setSubstance( substanceId );
    } );
  }

  statesOfMatter.register( 'MultipleParticleModel', MultipleParticleModel );

  return inherit( Object, MultipleParticleModel, {

    /**
     * @param {number} newTemperature
     * @public
     */
    setTemperature: function( newTemperature ) {

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
    },

    /**
     * Get the current temperature in degrees Kelvin.  The calculations done are dependent on the type of molecule
     * selected.  The values and ranges used in this method were derived from information provided by Paul Beale, dept
     * of Physics, University of Colorado Boulder.  If no particles are in the container, this returns null.
     * @returns {number|null}
     * @public
     */
    getTemperatureInKelvin: function() {

      if ( this.particles.length === 0 ) {
        // Temperature is reported as 0 if there are no particles.
        return null;
      }

      var temperatureInKelvin;
      var triplePoint = 0;
      var criticalPoint = 0;

      switch( this.substanceProperty.get() ) {

        case SubstanceType.NEON:
          triplePoint = NEON_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = NEON_CRITICAL_POINT_IN_KELVIN;
          break;

        case SubstanceType.ARGON:
          triplePoint = ARGON_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = ARGON_CRITICAL_POINT_IN_KELVIN;
          break;

        case SubstanceType.USER_DEFINED_MOLECULE:
          triplePoint = ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN;
          break;

        case SubstanceType.WATER:
          triplePoint = WATER_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = WATER_CRITICAL_POINT_IN_KELVIN;
          break;

        case SubstanceType.DIATOMIC_OXYGEN:
          triplePoint = O2_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = O2_CRITICAL_POINT_IN_KELVIN;
          break;

        default:
          throw( new Error( 'unsupported substance' ) ); // should never happen, debug if it does
      }

      if ( this.temperatureSetPointProperty.get() <= this.minModelTemperature ) {
        // We treat anything below the minimum temperature as absolute zero.
        temperatureInKelvin = 0;
      }
      else if ( this.temperatureSetPointProperty.get() < TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE ) {
        temperatureInKelvin = this.temperatureSetPointProperty.get() * triplePoint / TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE;

        if ( temperatureInKelvin < 0.5 ) {
          // Don't return zero - or anything that would round to it - as
          // a value until we actually reach the minimum internal temperature.
          temperatureInKelvin = 0.5;
        }
      }
      else if ( this.temperatureSetPointProperty.get() < CRITICAL_POINT_INTERNAL_MODEL_TEMPERATURE ) {
        var slope = ( criticalPoint - triplePoint ) /
                    ( CRITICAL_POINT_INTERNAL_MODEL_TEMPERATURE - TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE );
        var offset = triplePoint - ( slope * TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE );
        temperatureInKelvin = this.temperatureSetPointProperty.get() * slope + offset;
      }
      else {
        temperatureInKelvin = this.temperatureSetPointProperty.get() * criticalPoint /
                              CRITICAL_POINT_INTERNAL_MODEL_TEMPERATURE;
      }
      return temperatureInKelvin;
    },

    /**
     * Get the pressure value which is being calculated by the model and is not adjusted to represent any "real" units
     * (such as atmospheres).
     * @return {number}
     * @public
     */
    getModelPressure: function() {
      return this.moleculeForceAndMotionCalculator.pressureProperty.get();
    },

    /**
     * Set the substance to be simulated.
     * @param {number} substance
     * @private
     */
    setSubstance: function( substance ) {

      assert && assert(
        substance === SubstanceType.DIATOMIC_OXYGEN ||
        substance === SubstanceType.NEON ||
        substance === SubstanceType.ARGON ||
        substance === SubstanceType.WATER ||
        substance === SubstanceType.USER_DEFINED_MOLECULE,
        'unsupported substance'
      );

      // Retain the current phase so that we can set the particles back to this phase once they have been created and
      // initialized.
      var phase = this.mapTemperatureToPhase();

      // Remove existing particles and reset the global model parameters.
      this.removeAllParticles();
      this.initializeModelParameters();

      // Set the new substance.
      this.substanceProperty.set( substance );

      // Set the model parameters that are dependent upon the substance being simulated.
      switch( substance ) {

        case SubstanceType.DIATOMIC_OXYGEN:
          this.particleDiameter = OxygenAtom.RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE / O2_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.NEON:
          this.particleDiameter = NeonAtom.RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE / NEON_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.ARGON:
          this.particleDiameter = ArgonAtom.RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE / ARGON_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.WATER:

          // Use a radius value that is artificially large, because the educators have requested that water look
          // "spaced out" so that users can see the crystal structure better, and so that the solid form will look
          // larger (since water expands when frozen).
          this.particleDiameter = OxygenAtom.RADIUS * 2.9;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE / WATER_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.USER_DEFINED_MOLECULE:
          this.particleDiameter = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE /
                                     ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
          break;

        default:
          throw( new Error( 'unsupported substance' ) ); // should never happen, debug if it does
      }

      // Reset the container size. This must be done after the diameter is initialized because the normalized size is
      // dependent upon the particle diameter.
      this.resetContainerSize();

      // Adjust the injection point based on the new particle diameter.
      this.injectionPointX = PARTICLE_CONTAINER_WIDTH / this.particleDiameter * INJECTION_POINT_HORIZ_PROPORTION;
      this.injectionPointY = PARTICLE_CONTAINER_INITIAL_HEIGHT / this.particleDiameter * INJECTION_POINT_VERT_PROPORTION;

      // Add the particles and set their initial positions.
      this.initializeParticles( phase );

      // Reset any time step limits that had kicked in for the previous substance.
      this.maxParticleMoveTimePerStepProperty.reset();

      // Start over on averaging the incoming time steps.
      this.timeStepMovingAverage.reset();
      this.keepingUpProperty.set( true );
    },

    /**
     *  @private
     */
    updatePressure: function() {
      this.pressureProperty.set( this.getPressureInAtmospheres() );
    },

    /**
     * Sets the target height of the container.  The target height is set rather than the actual height because the
     * model limits the rate at which the height can changed.  The model will gradually move towards the target height.
     * @param {number} desiredContainerHeight
     * @public
     */
    setTargetParticleContainerHeight: function( desiredContainerHeight ) {
      this.targetContainerHeightProperty.set( Util.clamp(
        desiredContainerHeight,
        MIN_ALLOWABLE_CONTAINER_HEIGHT,
        PARTICLE_CONTAINER_INITIAL_HEIGHT
      ) );
    },

    /**
     * Get the sigma value, which is one of the two parameters that describes the Lennard-Jones potential.
     * @returns {number}
     * @public
     */
    getSigma: function() {
      var sigma;
      switch( this.substanceProperty.get() ) {
        case SubstanceType.NEON:
          sigma = NeonAtom.RADIUS * 2;
          break;
        case SubstanceType.ARGON:
          sigma = ArgonAtom.RADIUS * 2;
          break;
        case SubstanceType.DIATOMIC_OXYGEN:
          sigma = StatesOfMatterConstants.SIGMA_FOR_DIATOMIC_OXYGEN;
          break;
        case SubstanceType.WATER:
          sigma = StatesOfMatterConstants.SIGMA_FOR_WATER;
          break;
        case SubstanceType.USER_DEFINED_MOLECULE:
          sigma = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
          break;
        default:
          throw( new Error( 'unsupported substance' ) ); // should never happen, debug if it does
      }

      return sigma;
    },

    /**
     * Get the epsilon value, which is one of the two parameters that describes the Lennard-Jones potential.
     * @returns {number}
     * @public
     */
    getEpsilon: function() {
      var epsilon;
      switch( this.substanceProperty.get() ) {
        case SubstanceType.NEON:
          epsilon = InteractionStrengthTable.getInteractionPotential( AtomType.NEON, AtomType.NEON );
          break;
        case SubstanceType.ARGON:
          epsilon = InteractionStrengthTable.getInteractionPotential( AtomType.ARGON, AtomType.ARGON );
          break;
        case SubstanceType.DIATOMIC_OXYGEN:
          epsilon = StatesOfMatterConstants.EPSILON_FOR_DIATOMIC_OXYGEN;
          break;
        case SubstanceType.WATER:
          epsilon = StatesOfMatterConstants.EPSILON_FOR_WATER;
          break;
        case SubstanceType.USER_DEFINED_MOLECULE:
          epsilon = this.convertScaledEpsilonToEpsilon( this.moleculeForceAndMotionCalculator.getScaledEpsilon() );
          break;
        default:
          throw( new Error( 'unsupported substance' ) ); // should never happen, debug if it does
      }

      return epsilon;
    },

    /**
     * get the internal model temperature that corresponds to one degree Kelvin
     */
    getTwoDegreesKelvinInInternalTemperature: function() {

      var triplePointInKelvin;

      switch( this.substanceProperty.get() ) {

        case SubstanceType.NEON:
          triplePointInKelvin = NEON_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.ARGON:
          triplePointInKelvin = ARGON_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.USER_DEFINED_MOLECULE:
          triplePointInKelvin = ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.WATER:
          triplePointInKelvin = WATER_TRIPLE_POINT_IN_KELVIN;
          break;

        case SubstanceType.DIATOMIC_OXYGEN:
          triplePointInKelvin = O2_TRIPLE_POINT_IN_KELVIN;
          break;

        default:
          throw( new Error( 'unsupported substance' ) ); // should never happen, debug if it does
      }

      var mapKelvinToInternal = new LinearFunction(
        0,
        triplePointInKelvin,
        this.minModelTemperature,
        TRIPLE_POINT_INTERNAL_MODEL_TEMPERATURE
      );

      return mapKelvinToInternal( 2 );

    },

    /**
     * @override
     * @public
     */
    reset: function() {

      // reset observable properties
      this.particleContainerHeightProperty.reset();
      this.targetContainerHeightProperty.reset();
      this.isExplodedProperty.reset();
      this.phaseDiagramExpandedProperty.reset();
      this.interactionExpandedProperty.reset();
      this.temperatureSetPointProperty.reset();
      this.pressureProperty.reset();
      this.substanceProperty.reset();
      this.interactionStrengthProperty.reset();
      this.isPlayingProperty.reset();
      this.simSpeedProperty.reset();
      this.heatingCoolingAmountProperty.reset();
      this.keepingUpProperty.reset();
      this.averageDtProperty.reset();
      this.maxParticleMoveTimePerStepProperty.reset();

      // other reset
      this.initializeModelParameters();
      this.setSubstance( DEFAULT_SUBSTANCE );
      this.timeStepMovingAverage.reset();
      this.resetEmitter.emit();
    },

    /**
     * Set the phase of the particles in the simulation.
     * @param {number} phaseSate
     * @public
     */
    setPhase: function( phaseSate ) {
      assert && assert( phaseSate === PhaseStateEnum.SOLID || phaseSate === PhaseStateEnum.LIQUID || phaseSate === PhaseStateEnum.GAS,
        'invalid phase state specified' );
      this.phaseStateChanger.setPhase( phaseSate );
      this.syncParticlePositions();
    },

    /**
     * Sets the amount of heating or cooling that the system is undergoing.
     * @param {number} normalizedHeatingCoolingAmount - Normalized amount of heating or cooling that the system is
     * undergoing, ranging from -1 to +1.
     * @public
     */
    setHeatingCoolingAmount: function( normalizedHeatingCoolingAmount ) {
      assert && assert( ( normalizedHeatingCoolingAmount <= 1.0 ) && ( normalizedHeatingCoolingAmount >= -1.0 ) );
      this.heatingCoolingAmountProperty.set( normalizedHeatingCoolingAmount );
    },

    /**
     * Inject a new molecule of the current type.  This method actually queues it for intejction, actualy injection
     * occurs during model steps.
     * @public
     */
    injectMolecule: function() {

      // only allow particle injection if the model is in a state that supports is
      this.numMoleculesAwaitingInjection = Math.min(
        this.numMoleculesAwaitingInjection + 1,
        MAX_MOLECULES_QUEUED_FOR_INJECTION
      );
    },

    /**
     * Inject a new molecule of the current type into the model. This uses the current temperature to assign an initial
     * velocity.
     * @private
     */
    injectMoleculeInternal: function() {

      // Check if conditions are right for injection of molecules and, if not, don't do it.
      if ( !this.isPlayingProperty.get() ||
           this.moleculeDataSet.getNumberOfRemainingSlots() <= 0 ||
           this.normalizedContainerHeight < this.injectionPointY * 1.05 ||
           this.isExplodedProperty.get() ) {

        this.numMoleculesAwaitingInjection = 0;
        return;
      }

      // If the container is empty, its temperature will be be reported as zero Kelvin, so injecting particles will
      // cause there to be a defined temperature.  Set that temperature to a reasonable value.
      if ( this.particles.length === 0 ) {
        this.temperatureSetPointProperty.set( CRITICAL_POINT_INTERNAL_MODEL_TEMPERATURE );
        this.isoKineticThermostat.targetTemperature = this.temperatureSetPointProperty.get();
        this.andersenThermostat.targetTemperature = this.temperatureSetPointProperty.get();
      }

      // Introduce a little bit of randomness into the injection angle.
      var angle = ( phet.joist.random.nextDouble() - 0.5 ) * INJECTED_MOLECULE_ANGLE_SPREAD;
      var xVel = Math.cos( angle ) * INJECTED_MOLECULE_VELOCITY;
      var yVel = Math.sin( angle ) * INJECTED_MOLECULE_VELOCITY;

      var atomsPerMolecule = this.moleculeDataSet.atomsPerMolecule;
      var moleculeCenterOfMassPosition = new Vector2( this.injectionPointX, this.injectionPointY );
      var moleculeVelocity = new Vector2( xVel, yVel );
      var moleculeRotationRate = ( phet.joist.random.nextDouble() - 0.5 ) * ( Math.PI / 2 );
      var atomPositions = [];
      for ( var i = 0; i < atomsPerMolecule; i++ ) {
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
          phet.joist.random.nextDouble() * 2 * Math.PI;
      }

      // Position the atoms that comprise the molecules.
      this.atomPositionUpdater.updateAtomPositions( this.moleculeDataSet );

      if ( atomsPerMolecule === 1 ) {

        // Add particle to model set.
        var particle;
        switch( this.substanceProperty.get() ) {
          case SubstanceType.ARGON:
            particle = new ArgonAtom( 0, 0 );
            break;
          case SubstanceType.NEON:
            particle = new NeonAtom( 0, 0 );
            break;
          case SubstanceType.USER_DEFINED_MOLECULE:
            particle = new ConfigurableStatesOfMatterAtom( 0, 0 );
            break;
          default:
            // Use the default.
            particle = new NeonAtom( 0, 0 );
            break;
        }
        this.particles.add( particle );
      }
      else if ( atomsPerMolecule === 2 ) {

        assert && assert( this.substanceProperty.get() === SubstanceType.DIATOMIC_OXYGEN );

        // Add particles to model set.
        this.particles.add( new OxygenAtom( 0, 0 ) );
        this.particles.add( new OxygenAtom( 0, 0 ) );
      }
      else if ( atomsPerMolecule === 3 ) {

        assert && assert( this.substanceProperty.get() === SubstanceType.WATER );

        // Add atoms to model set.
        this.particles.add( new OxygenAtom( 0, 0 ) );
        this.particles.add( new HydrogenAtom( 0, 0, true ) );
        this.particles.add( new HydrogenAtom( 0, 0, phet.joist.random.nextDouble() > 0.5 ) );
      }

      // If the particles are at absolute zero and additional particles are added, this bumps up the temperature,
      // since if there is any motion absolute zero is not correct.  This is handled as a special case rather than
      // treating the addition of particles more generally, see https://github.com/phetsims/states-of-matter/issues/129
      // for more detail.
      if ( this.getTemperatureInKelvin() === 0 || this.getTemperatureInKelvin() === null ) {
        this.temperatureSetPointProperty.set( this.getTwoDegreesKelvinInInternalTemperature() );
        this.isoKineticThermostat.targetTemperature = this.temperatureSetPointProperty.get();
        this.andersenThermostat.targetTemperature = this.temperatureSetPointProperty.get();
      }

      this.syncParticlePositions();
    },

    /**
     *  @private
     */
    removeAllParticles: function() {

      // Get rid of any existing particles from the model set.
      this.particles.clear();

      // Get rid of the normalized particles.
      this.moleculeDataSet = null;
    },

    /**
     * Initialize the particles by calling the appropriate initialization routine, which will set their positions,
     * velocities, etc.
     * @param {number} phase - phase of atoms
     * @public
     */
    initializeParticles: function( phase ) {

      // Initialize the particles.
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
        case SubstanceType.USER_DEFINED_MOLECULE:
          this.initializeMonatomic( this.substanceProperty.get(), phase );
          break;
        case SubstanceType.WATER:
          this.initializeTriatomic( this.substanceProperty.get(), phase );
          break;
        default:
          throw( new Error( 'unsupported substance' ) ); // should never happen, debug if it does
      }

      // This is needed in case we were switching from another molecule that was under pressure.
      this.updatePressure();
    },

    /**
     * @private
     */
    initializeModelParameters: function() {

      // Initialize the system parameters.
      this.gravitationalAcceleration = INITIAL_GRAVITATIONAL_ACCEL;
      this.heatingCoolingAmountProperty.reset();
      this.temperatureSetPointProperty.reset();
      this.isExplodedProperty.reset();
    },

    /**
     * Reset both the normalized and non-normalized sizes of the container. Note that the particle diameter must be
     * valid before this will work properly.
     * @private
     */
    resetContainerSize: function() {

      // Set the initial size of the container.
      this.particleContainerHeightProperty.reset();
      this.targetContainerHeightProperty.reset();
      this.normalizedContainerWidth = PARTICLE_CONTAINER_WIDTH / this.particleDiameter;
      this.normalizedContainerHeight = this.particleContainerHeightProperty.get() / this.particleDiameter;
      this.normalizedTotalContainerHeight = this.particleContainerHeightProperty.get() / this.particleDiameter;
    },

    /**
     * Step the model.
     * @public
     */
    stepInternal: function( dt ) {

      this.timeStepMovingAverage.addValue( dt );
      this.averageDt = this.timeStepMovingAverage.average;

      if ( !this.isExplodedProperty.get() ) {

        // Adjust the particle container height if needed.
        if ( this.targetContainerHeightProperty.get() !== this.particleContainerHeightProperty.get() ) {
          this.heightChangeCountdownTime = CONTAINER_SIZE_CHANGE_COUNTDOWN_RESET;
          this.heightChangeThisStep = this.targetContainerHeightProperty.get() - this.particleContainerHeightProperty.get();
          if ( this.heightChangeThisStep > 0 ) {

            // the container is expanding, limit the change to the max allowed rate
            this.heightChangeThisStep = Math.min( this.heightChangeThisStep, MAX_CONTAINER_EXPAND_RATE * dt );

            this.particleContainerHeightProperty.set( Math.min(
              this.particleContainerHeightProperty.get() + this.heightChangeThisStep,
              PARTICLE_CONTAINER_INITIAL_HEIGHT
            ) );
          }
          else {

            // the container is shrinking, limit the change to the max allowed rate
            this.heightChangeThisStep = Math.max( this.heightChangeThisStep, -MAX_CONTAINER_SHRINK_RATE * dt );

            this.particleContainerHeightProperty.set( Math.max(
              this.particleContainerHeightProperty.get() + this.heightChangeThisStep,
              MIN_ALLOWABLE_CONTAINER_HEIGHT
            ) );
          }
          this.normalizedContainerHeight = this.particleContainerHeightProperty.get() / this.particleDiameter;
          this.normalizedLidVelocityY = ( this.heightChangeThisStep / this.particleDiameter ) / dt;
        }
        else {
          this.heightChangeThisStep = 0;
          if ( this.heightChangeCountdownTime > 0 ) {
            this.heightChangeCountdownTime = Math.max( this.heightChangeCountdownTime - dt, 0 );
          }
          this.normalizedLidVelocityY = 0;
        }
      }
      else {

        // The lid is blowing off the container, so increase the container size until the lid should be well off the screen.
        if ( this.particleContainerHeightProperty.get() < PARTICLE_CONTAINER_INITIAL_HEIGHT * 3 ) {
          this.particleContainerHeightProperty.set(
            this.particleContainerHeightProperty.get() + POST_EXPLOSION_CONTAINER_EXPANSION_RATE * dt
          );
        }
      }

      // Record the pressure to see if it changes.
      var pressureBeforeAlgorithm = this.getModelPressure();

      // Calculate the amount of time to advance the particle engine.  This is based purely on aesthetics - we looked at
      // the particle motion and tweaked the multiplier until we felt that it looked good.
      var particleMotionAdvancementTime = Math.min(
        dt * PARTICLE_SPEED_UP_FACTOR,
        this.maxParticleMoveTimePerStepProperty.get()
      );

      // Determine the number of model steps and the size of the time step
      var particleMotionTimeStep;
      var numParticleEngineSteps = 1;
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

      // Execute the Verlet algorithm, a.k.a. the "particle engine", in order to determine the new particle positions.
      for ( var i = 0; i < numParticleEngineSteps; i++ ) {

        // if the container is exploded reduce the speed of particles
        // TODO: Is this really needed?  If so, comment should explain why.
        if ( this.isExplodedProperty.get() ) {
          particleMotionTimeStep = particleMotionTimeStep * 0.9;
        }
        this.moleculeForceAndMotionCalculator.updateForcesAndMotion( particleMotionTimeStep );
      }

      // Sync up the positions of the normalized particles (the molecule data set) with the particles being monitored by
      // the view (the model data set).
      this.syncParticlePositions();

      // run the thermostat to keep particle energies from getting out of hand
      this.runThermostat();

      // If the pressure changed, update it.
      if ( this.getModelPressure() !== pressureBeforeAlgorithm ) {
        this.updatePressure();
      }

      // Adjust the temperature if needed.
      if ( this.heatingCoolingAmountProperty.get() !== 0 ) {
        var temperatureChange = this.heatingCoolingAmountProperty.get() * TEMPERATURE_CHANGE_RATE_FACTOR * dt;
        var newTemperature;
        if ( this.temperatureSetPointProperty.get() < SOLID_TEMPERATURE * 0.75 &&
             this.heatingCoolingAmountProperty.get() < 0 ) {

          // The temperature adjusts more slowly as we begin to approach absolute zero, multiplier empirically determined.
          newTemperature = this.temperatureSetPointProperty.get() +
                           this.heatingCoolingAmountProperty.get() * TEMPERATURE_CHANGE_RATE_FACTOR * dt * 0.1;
        }
        else {
          newTemperature = Math.min( this.temperatureSetPointProperty.get() + temperatureChange, MAX_TEMPERATURE );
        }

        // limit bottom end of temperature range
        if ( newTemperature <= this.minModelTemperature ) {
          newTemperature = this.minModelTemperature;
        }

        // record the new set point
        this.temperatureSetPointProperty.set( newTemperature );
        this.isoKineticThermostat.targetTemperature = this.temperatureSetPointProperty.get();
        this.andersenThermostat.targetTemperature = this.temperatureSetPointProperty.get();
      }

      // Inject new particles if some are ready and waiting.
      if ( this.numMoleculesAwaitingInjection > 0 && this.moleculeInjectionHoldoffTimer === 0 ) {
        this.injectMoleculeInternal();
        this.numMoleculesAwaitingInjection--;
        this.moleculeInjectionHoldoffTimer = MOLECULE_INJECTION_HOLDOFF_TIME;
      }
      else if ( this.moleculeInjectionHoldoffTimer > 0 ) {
        this.moleculeInjectionHoldoffTimer = Math.max( this.moleculeInjectionHoldoffTimer - dt, 0 );
      }
    },

    /**
     * main step function
     * @param {number} dt
     * @public
     */
    step: function( dt ) {

      // TODO: Consider removing this at some point if things are working well.
      if ( StatesOfMatterQueryParameters.debugTimeStep ) {
        if ( this.dialogShownLastTime ) {
          this.accumulatedDt = 0;
          this.largestDt = 0;
          this.smallestDt = Number.POSITIVE_INFINITY;
          this.dialogShownLastTime = false;
          this.numDts = 0;
          return;
        }
        if ( !this.largestDt || this.largestDt < dt ) {
          this.largestDt = dt;
        }
        if ( !this.smallestDt || this.smallestDt > dt ) {
          this.smallestDt = dt;
        }
        if ( !this.accumulatedDt ) {
          this.accumulatedDt = 0;
        }
        this.accumulatedDt += dt;
        if ( !this.numDts ) {
          this.numDts = 0;
        }
        this.numDts++;
        if ( this.accumulatedDt > 10 ) {
          alert( 'largest dt = ' + this.largestDt + '\n' +
                 'smallest dt = ' + this.smallestDt + '\n' +
                 'average dt = ' + ( this.accumulatedDt / this.numDts ) + '\n'
          );
          this.dialogShownLastTime = true;
        }
      }

      // If the time step is excessively large, ignore it - it probably means that the user was on another tab or that
      // the browser was hidden, and they just came back to the sim.
      if ( dt > 0.5 ) {
        return;
      }

      if ( this.isPlayingProperty.get() ) {
        this.stepInternal( dt );
      }
    },

    /**
     * Run the appropriate thermostat based on the settings and the state of the simulation.
     */
    runThermostat: function() {

      if ( this.isExplodedProperty.get() ) {
        // Don't bother to run any thermostat if the lid is blown off - just let those little particles run free!
        return;
      }

      var calculatedTemperature = this.moleculeForceAndMotionCalculator.temperature;
      var temperatureIsChanging = false;

      if ( ( this.heatingCoolingAmountProperty.get() !== 0 ) ||
           ( Math.abs( calculatedTemperature - this.temperatureSetPointProperty.get() ) > TEMPERATURE_CLOSENESS_RANGE ) ) {
        temperatureIsChanging = true;
      }

      if ( this.moleculeForceAndMotionCalculator.lidChangedParticleVelocity ) {

        // The velocity of one or more particles was changed through interaction with the lid.  Since this can change
        // the kinetic energy of the particles in the system, no thermostat is run.  Instead, the temperature is
        // determined by looking at the kinetic energy of the molecules and that value is used to determine the system
        // temperature set point.  However, sometimes the calculation can return some unexpected results, probably due
        // to some of the energy being tied up in potential rather than kinetic energy, so there are some constraints
        // here.  See https://github.com/phetsims/states-of-matter/issues/169 for more information.
        if ( this.heightChangeThisStep === 0 ||
             this.heightChangeThisStep > 0 && calculatedTemperature < this.temperatureSetPointProperty.get() ||
             this.heightChangeThisStep < 0 && calculatedTemperature > this.temperatureSetPointProperty.get() ) {
          this.setTemperature( calculatedTemperature );
        }

        // Clear the flag for the next time through.
        this.moleculeForceAndMotionCalculator.lidChangedParticleVelocity = false;
      }
      else if ( ( this.thermostatType === ISOKINETIC_THERMOSTAT ) ||
                ( this.thermostatType === ADAPTIVE_THERMOSTAT &&
                  ( temperatureIsChanging ||
                    this.temperatureSetPointProperty.get() > LIQUID_TEMPERATURE ) ) ) {
        // Use the isokinetic thermostat.
        this.isoKineticThermostat.adjustTemperature();
      }
      else if ( ( this.thermostatType === ANDERSEN_THERMOSTAT ) ||
                ( this.thermostatType === ADAPTIVE_THERMOSTAT && !temperatureIsChanging ) ) {
        // The temperature isn't changing and it is below a certain threshold, so use the Andersen thermostat.  This is
        // done for purely visual reasons - it looks better than the isokinetic in these circumstances.
        this.andersenThermostat.adjustTemperature();
      }

      // Note that there will be some circumstances in which no thermostat
      // is run.  This is intentional.
    },

    /**
     * Initialize the various model components to handle a simulation in which all the molecules are single atoms.
     * @param {number} substance
     * @param {number} phase
     * @private
     */
    initializeDiatomic: function( substance, phase ) {

      // Verify that a valid molecule ID was provided.
      assert && assert( (substance === SubstanceType.DIATOMIC_OXYGEN) );

      // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
      // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
      // can fit depends on the size of the individual atom.
      var numberOfAtoms = Math.pow( Math.round( PARTICLE_CONTAINER_WIDTH / ( ( OxygenAtom.RADIUS * 2.1 ) * 3 ) ), 2 );
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

      var numberOfMolecules = numberOfAtoms / 2;
      var atomPositionInVector = new Vector2();
      var atomPositions = [];
      atomPositions[ 0 ] = atomPositionInVector;
      atomPositions[ 1 ] = atomPositionInVector;

      // Create the individual atoms and add them to the data set.
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Create the molecule.
        var moleculeCenterOfMassPosition = new Vector2();
        var moleculeVelocity = new Vector2();

        // Add the atom to the data set.
        this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true );

        // Add atoms to model set.
        this.particles.push( new OxygenAtom( 0, 0 ) );
        this.particles.push( new OxygenAtom( 0, 0 ) );
      }

      // Initialize the particle positions according the to requested phase.
      this.setPhase( phase );
    },

    /**
     * Initialize the various model components to handle a simulation in which each molecule consists of three atoms,
     * e.g. water.
     * @param {number} substance
     * @param {number} phase
     * @private
     */
    initializeTriatomic: function( substance, phase ) {

      // Only water is supported so far.
      assert && assert( (substance === SubstanceType.WATER) );

      // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
      // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
      // can fit depends on the size of the individual atom.
      var waterMoleculeDiameter = OxygenAtom.RADIUS * 2.1;
      var moleculesAcrossBottom = Math.round( PARTICLE_CONTAINER_WIDTH / ( waterMoleculeDiameter * 1.2 ) );
      var numberOfMolecules = Math.pow( moleculesAcrossBottom / 3, 2 );

      // Create the normalized data set for the one-atom-per-molecule case.
      this.moleculeDataSet = new MoleculeForceAndMotionDataSet( 3 );

      // Create the strategies that will work on this data set.
      this.phaseStateChanger = new WaterPhaseStateChanger( this );
      this.atomPositionUpdater = WaterAtomPositionUpdater;
      this.moleculeForceAndMotionCalculator = new WaterVerletAlgorithm( this );
      this.isoKineticThermostat = new IsokineticThermostat( this.moleculeDataSet, this.minModelTemperature );
      this.andersenThermostat = new AndersenThermostat( this.moleculeDataSet, this.minModelTemperature );

      // Create the individual atoms and add them to the data set.
      var atomPositionInVector = new Vector2();
      var atomPositions = [];
      atomPositions[ 0 ] = atomPositionInVector;
      atomPositions[ 1 ] = atomPositionInVector;
      atomPositions[ 2 ] = atomPositionInVector;
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Create the molecule.
        var moleculeCenterOfMassPosition = new Vector2();
        var moleculeVelocity = new Vector2();

        // Add the atom to the data set.
        this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true );

        // Add atoms to model set.
        this.particles.add( new OxygenAtom( 0, 0 ) );
        this.particles.add( new HydrogenAtom( 0, 0, true ) );

        // In order to look more varied, some of the hydrogen atoms are set up to render behing the oxygen atom and
        // some to render in front of it.
        this.particles.add( new HydrogenAtom( 0, 0, ( i % 2 === 0 ) ) );
      }
      // Initialize the particle positions according the to requested phase.
      this.setPhase( phase );
    },

    /**
     * @param {number} epsilon
     * @public
     */
    setEpsilon: function( epsilon ) {
      if ( this.substanceProperty.get() === SubstanceType.USER_DEFINED_MOLECULE ) {
        if ( epsilon < MIN_ADJUSTABLE_EPSILON ) {
          epsilon = MIN_ADJUSTABLE_EPSILON;
        }
        else if ( epsilon > MAX_ADJUSTABLE_EPSILON ) {
          epsilon = MAX_ADJUSTABLE_EPSILON;
        }
        this.moleculeForceAndMotionCalculator.setScaledEpsilon( this.convertEpsilonToScaledEpsilon( epsilon ) );

      }
      else {
        assert && assert( false, 'Error: Epsilon cannot be set when non-configurable molecule is in use.' );
      }
    },

    /**
     * Initialize the various model components to handle a simulation in which all the molecules are single atoms.
     * @param {SubstanceType} substance
     * @param {number} phase
     * @private
     */
    initializeMonatomic: function( substance, phase ) {

      // Verify that a valid molecule ID was provided.
      assert && assert( substance === SubstanceType.USER_DEFINED_MOLECULE ||
                        substance === SubstanceType.NEON ||
                        substance === SubstanceType.ARGON );

      // Determine the number of atoms/molecules to create.  This will be a cube (really a square, since it's 2D, but
      // you get the idea) that takes up a fixed amount of the bottom of the container, so the number of molecules that
      // can fit depends on the size of the individual.
      var particleDiameter;
      if ( substance === SubstanceType.NEON ) {
        particleDiameter = NeonAtom.RADIUS * 2;
      }
      else if ( substance === SubstanceType.ARGON ) {
        particleDiameter = ArgonAtom.RADIUS * 2;
      }
      else if ( substance === SubstanceType.USER_DEFINED_MOLECULE ) {
        particleDiameter = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
      }
      else {
        // Force it to neon.
        substance = SubstanceType.NEON;
        particleDiameter = NeonAtom.RADIUS * 2;
      }

      // Initialize the number of atoms assuming that the solid form, when made into a square, will consume about 1/3
      // the width of the container.
      var numberOfAtoms = Math.pow( Math.round( PARTICLE_CONTAINER_WIDTH / ( ( particleDiameter * 1.05 ) * 3 ) ), 2 );

      // Create the normalized data set for the one-atom-per-molecule case.
      this.moleculeDataSet = new MoleculeForceAndMotionDataSet( 1 );

      // Create the strategies that will work on this data set.
      this.phaseStateChanger = new MonatomicPhaseStateChanger( this );
      this.atomPositionUpdater = MonatomicAtomPositionUpdater;
      this.moleculeForceAndMotionCalculator = new MonatomicVerletAlgorithm( this );
      this.isoKineticThermostat = new IsokineticThermostat( this.moleculeDataSet, this.minModelTemperature );
      this.andersenThermostat = new AndersenThermostat( this.moleculeDataSet, this.minModelTemperature );

      // Create the individual atoms and add them to the data set.
      var atomPositions = [];
      atomPositions.push( new Vector2() );
      for ( var i = 0; i < numberOfAtoms; i++ ) {

        // Create the atom.
        var moleculeCenterOfMassPosition = new Vector2();
        var moleculeVelocity = new Vector2();
        // Add the atom to the data set.
        this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0, true );

        // Add particle to model set.
        var atom;
        if ( substance === SubstanceType.NEON ) {
          atom = new NeonAtom( 0, 0 );
        }
        else if ( substance === SubstanceType.ARGON ) {
          atom = new ArgonAtom( 0, 0 );
        }
        else if ( substance === SubstanceType.USER_DEFINED_MOLECULE ) {
          atom = new ConfigurableStatesOfMatterAtom( 0, 0 );
        }
        else {
          atom = new NeonAtom( 0, 0 );
        }
        this.particles.push( atom );
      }

      // Initialize the particle positions according the to requested phase.
      this.setPhase( phase );
    },

    /**
     * Set the positions of the non-normalized particles based on the positions of the normalized ones.
     * @private
     */
    syncParticlePositions: function() {
      assert && assert( this.moleculeDataSet.numberOfAtoms === this.particles.length,
        'Inconsistent number of normalized versus non-normalized particles' );
      var positionMultiplier = this.particleDiameter;
      var atomPositions = this.moleculeDataSet.atomPositions;

      // use a C-style loop for optimal performance
      for ( var i = 0; i < this.particles.length; i++ ) {
        this.particles.get( i ).setPosition(
          atomPositions[ i ].x * positionMultiplier,
          atomPositions[ i ].y * positionMultiplier
        );
      }
    },

    /**
     * Take the internal pressure value and convert it to atmospheres.  In the original Java version of this sim the
     * conversion multiplier was dependent upon the type of molecule in order to be somewhat realistic.  However, this
     * was problematic, since it would cause the container to explode at different pressure readings.  A single
     * multiplier is now used, which is perhaps less realistic, but works better in practice.  Please see
     * https://github.com/phetsims/states-of-matter/issues/124 for more information.
     * @returns {number}
     * @public
     */
    getPressureInAtmospheres: function() {
      return 200 * this.getModelPressure(); // multiplier empirically determined
    },

    /**
     * Return a phase value based on the current temperature.
     * @return{number}
     * @private
     */
    mapTemperatureToPhase: function() {
      var phase;
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
    },

    /**
     * Convert a value for epsilon that is in the real range of values into a scaled value that is suitable for use with
     * the motion and force calculators.
     * @param {number} epsilon
     * @private
     */
    convertEpsilonToScaledEpsilon: function( epsilon ) {
      // The following conversion of the target value for epsilon to a scaled value for the motion calculator object was
      // determined empirically such that the resulting behavior roughly matched that of the existing monatomic
      // molecules.
      return epsilon / ( StatesOfMatterConstants.MAX_EPSILON / 2 );
    },

    /**
     * @param {number} scaledEpsilon
     * @returns {number}
     * @private
     */
    convertScaledEpsilonToEpsilon: function( scaledEpsilon ) {
      return scaledEpsilon * StatesOfMatterConstants.MAX_EPSILON / 2;
    },

    /**
     * This method is used for an external entity to notify the model that it should explode.
     * @param {boolean} isExploded
     * @public
     */
    setContainerExploded: function( isExploded ) {
      if ( this.isExplodedProperty.get() !== isExploded ) {
        this.isExplodedProperty.set( isExploded );
        if ( !isExploded ) {
          this.resetContainerSize();
        }
      }
    },

    /**
     * Return the lid to the container.  It only makes sense to call this after the container has exploded, otherwise it
     * has no effect.
     * @public
     */
    returnLid: function() {

      // state checking
      assert && assert( this.isExplodedProperty.get(), 'attempt to return lid when container hadn\'t exploded' );
      if ( !this.isExplodedProperty.get() ) {
        // ignore request if container hasn't exploded
        return;
      }

      // Remove any particles that are outside of the container.  We work with the normalized particles for this.
      var particlesOutsideOfContainerCount = 0;
      var firstOutsideParticleIndex;
      do {
        for ( firstOutsideParticleIndex = 0; firstOutsideParticleIndex < this.moleculeDataSet.getNumberOfMolecules();
              firstOutsideParticleIndex++ ) {
          var pos = this.moleculeDataSet.getMoleculeCenterOfMassPositions()[ firstOutsideParticleIndex ];
          if ( pos.x < 0 ||
               pos.x > this.normalizedContainerWidth ||
               pos.y < 0 ||
               pos.y > PARTICLE_CONTAINER_INITIAL_HEIGHT / this.particleDiameter ) {
            // This particle is outside of the container.
            break;
          }
        }
        if ( firstOutsideParticleIndex < this.moleculeDataSet.getNumberOfMolecules() ) {
          // Remove the particle that was found.
          this.moleculeDataSet.removeMolecule( firstOutsideParticleIndex );
          particlesOutsideOfContainerCount++;
        }
      } while ( firstOutsideParticleIndex !== this.moleculeDataSet.getNumberOfMolecules() );

      // Remove enough of the non-normalized particles so that we have the same number as the normalized.  They don't
      // have to be the same particles since the normalized and non-normalized particles are explicitly synced up
      // elsewhere.
      this.copyOfParticles.clear();
      for ( var k = 0; k < this.particles.length; k++ ) {
        this.copyOfParticles.push( this.particles.get( k ) );
      }

      for ( var i = 0; i < this.copyOfParticles.length - this.moleculeDataSet.getNumberOfAtoms(); i++ ) {
        var particle = this.copyOfParticles.get( i );
        this.particles.remove( particle );
      }

      // Set the container to be unexploded.
      this.setContainerExploded( false );

      // Set the phase to be gas, since otherwise the extremely high kinetic energy of the particles causes an
      // unreasonably high temperature for the particles that remain in the container. Doing this generally cools them
      // down into a more manageable state.
      if ( particlesOutsideOfContainerCount > 0 ) {
        this.phaseStateChanger.setPhase( PhaseStateEnum.GAS );
      }
    },

    getInitialParticleContainerHeight: function() {
      return PARTICLE_CONTAINER_INITIAL_HEIGHT;
    },

    getParticleContainerWidth: function() {
      return PARTICLE_CONTAINER_WIDTH;
    }

  }, {

    // static constants
    MAX_ADJUSTABLE_EPSILON: MAX_ADJUSTABLE_EPSILON,
    PARTICLE_CONTAINER_WIDTH: PARTICLE_CONTAINER_WIDTH,
    PARTICLE_CONTAINER_INITIAL_HEIGHT: PARTICLE_CONTAINER_INITIAL_HEIGHT,
    PARTICLE_CONTAINER_MIN_HEIGHT: MIN_ALLOWABLE_CONTAINER_HEIGHT
  } );
} );