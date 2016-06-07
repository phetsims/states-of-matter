// Copyright 2014-2015, University of Colorado Boulder


/**
 * This is the main class for the model portion of the "States of Matter"
 * simulation.  It maintains a set of data that represents a normalized model
 * in which all atoms are assumed to have a diameter of 1, since this allows
 * for very quick calculations, and also a set of data for particles that have
 * the actual diameter of the particles being simulated (e.g. Argon).
 * Throughout the comments and in the variable naming, I've tried to use the
 * terminology of "normalized data set" (or sometimes simply "normalized
 * set") for the former and "model data set" for the latter.  When the
 * simulation is running, the normalized data set is updated first, since that
 * is where the hardcore calculations are performed, and then the model data
 * set is synchronized with the normalized data.  It is the model data set that
 * is monitored by the view components that actually display the molecule
 * positions to the user.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Vector2 = require( 'DOT/Vector2' );
  var Util = require( 'DOT/Util' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var InteractionStrengthTable = require( 'STATES_OF_MATTER/common/model/InteractionStrengthTable' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/common/model/MoleculeForceAndMotionDataSet' );
  var MonatomicVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/MonatomicVerletAlgorithm' );
  var MonatomicPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/MonatomicPhaseStateChanger' );
  var MonatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/MonatomicAtomPositionUpdater' );
  var DiatomicVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/DiatomicVerletAlgorithm' );
  var DiatomicPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/DiatomicPhaseStateChanger' );
  var DiatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/DiatomicAtomPositionUpdater' );
  var WaterVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/WaterVerletAlgorithm' );
  var WaterPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/WaterPhaseStateChanger' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );
  var IsokineticThermostat = require( 'STATES_OF_MATTER/common/model/engine/kinetic/IsokineticThermostat' );
  var AndersenThermostat = require( 'STATES_OF_MATTER/common/model/engine/kinetic/AndersenThermostat' );
  var PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants that control various aspects of the model behavior.
  var DEFAULT_MOLECULE = StatesOfMatterConstants.NEON;
  var INITIAL_TEMPERATURE = StatesOfMatterConstants.SOLID_TEMPERATURE;
  var MAX_TEMPERATURE = 50.0;
  var MIN_TEMPERATURE = 0.0001;
  var INITIAL_GRAVITATIONAL_ACCEL = 0.045;
  var MAX_TEMPERATURE_CHANGE_PER_ADJUSTMENT = 0.025;
  var TICKS_PER_TEMP_ADJUSTMENT = 10;
  var MIN_INJECTED_MOLECULE_VELOCITY = 0.5;
  var MAX_INJECTED_MOLECULE_VELOCITY = 2.0;
  var MAX_INJECTED_MOLECULE_ANGLE = Math.PI * 0.8;
  var VERLET_CALCULATIONS_PER_CLOCK_TICK = 5;
  var INJECTION_POINT_HORIZ_PROPORTION = 0.05;
  var INJECTION_POINT_VERT_PROPORTION = 0.25;

  // Possible thermostat settings.
  var ISOKINETIC_THERMOSTAT = 1;
  var ANDERSEN_THERMOSTAT = 2;
  var ADAPTIVE_THERMOSTAT = 3;

  // Parameters to control rates of change of the container size.
  var MAX_PER_TICK_CONTAINER_CHANGE = 3000;
  var MAX_PER_TICK_CONTAINER_EXPANSION_EXPLODED = 600;

  // Countdown value used when recalculating temperature when the container size is changing.
  var CONTAINER_SIZE_CHANGE_RESET_COUNT = 25;

  // Range for deciding if the temperature is near the current set point.
  // The units are internal model units.
  var TEMPERATURE_CLOSENESS_RANGE = 0.15;

  // Constant for deciding if a particle should be considered near to the
  // edges of the container.
  var PARTICLE_EDGE_PROXIMITY_RANGE = 2.5;

  // Values used for converting from model temperature to the temperature for a given particle.
  var TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE = 0.26;   // Empirically determined.
  var CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE = 0.8;  // Empirically determined.
  var NEON_TRIPLE_POINT_IN_KELVIN = 23;   // Tweaked a little from actual value for better temperature mapping.
  var NEON_CRITICAL_POINT_IN_KELVIN = 44;
  var ARGON_TRIPLE_POINT_IN_KELVIN = 75;  // Tweaked a little from actual value for better temperature mapping.
  var ARGON_CRITICAL_POINT_IN_KELVIN = 151;
  var O2_TRIPLE_POINT_IN_KELVIN = 54;
  var O2_CRITICAL_POINT_IN_KELVIN = 155;
  var WATER_TRIPLE_POINT_IN_KELVIN = 273;
  var WATER_CRITICAL_POINT_IN_KELVIN = 647;

  // The following values are used for temperature conversion for the
  // adjustable molecule.  These are somewhat arbitrary, since in the real
  // world the values would change if epsilon were changed.  They have been
  // chosen to be similar to argon, because the default epsilon value is
  // half of the allowable range, and this value ends up being similar to
  // argon.
  var ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN = 75;
  var ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN = 140;

  // Min a max values for adjustable epsilon.  Originally there was a wider
  // allowable range, but the simulation did not work so well, so the range
  // below was arrived at empirically and seems to work reasonably well.
  var MIN_ADJUSTABLE_EPSILON = StatesOfMatterConstants.MIN_ADJUSTABLE_EPSILON;
  var MAX_ADJUSTABLE_EPSILON = StatesOfMatterConstants.EPSILON_FOR_WATER * 1.7;

  /**
   * @constructor
   */
  function MultipleParticleModel() {

    var multipleParticleModel = this;

    // Strategy patterns that are applied to the data set in order to create
    // the overall behavior of the simulation.
    this.atomPositionUpdater = null;
    this.moleculeForceAndMotionCalculator = null;
    this.phaseStateChanger = null;
    this.isoKineticThermostat = null;
    this.andersenThermostat = null;

    // Attributes of the container and simulation as a whole.
    this.minAllowableContainerHeight = null;
    this.particles = new ObservableArray();
    this.copyOfParticles = new ObservableArray();

    // Data set containing the atom and molecule position, motion, and force information.
    this.moleculeDataSet = null;

    this.particleDiameter = 1;
    this.normalizedContainerWidth = StatesOfMatterConstants.PARTICLE_CONTAINER_WIDTH / this.particleDiameter;
    this.gravitationalAcceleration = null;
    this.tempAdjustTickCounter = null;
    this.currentMolecule = null;
    this.thermostatType = ADAPTIVE_THERMOSTAT;
    this.heightChangeCounter = DEFAULT_MOLECULE;
    this.minModelTemperature = null;

    // everything that had a listener in the java version becomes a property
    PropertySet.call( this, {
        particleContainerHeight: StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT,
        targetContainerHeight: StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT,
        isExploded: false, // notifyContainerExplodedStateChanged
        expanded: true,// phase diagram
        interactionExpanded: true,// interaction diagram
        temperatureSetPoint: INITIAL_TEMPERATURE, // notifyTemperatureChanged
        pressure: 0, // notifyPressureChanged
        moleculeType: StatesOfMatterConstants.NEON, // notifyMoleculeTypeChanged,
        interactionStrength: MAX_ADJUSTABLE_EPSILON, // notifyInteractionStrengthChanged
        isPlaying: true,
        speed: 'normal',
        heatingCoolingAmount: 0
      }
    );

    this.normalizedContainerHeight = this.particleContainerHeight / this.particleDiameter;

    // Do just enough initialization to allow the view and control
    // portions of the simulation to be properly created.  The rest of the
    // initialization will occur when the model is reset.
    this.initializeModelParameters();
    this.setMoleculeType( DEFAULT_MOLECULE );

    this.moleculeTypeProperty.link( function( moleculeId ) {
      multipleParticleModel.setMoleculeType( moleculeId );
    } );
  }

  statesOfMatter.register( 'MultipleParticleModel', MultipleParticleModel );

  return inherit( PropertySet, MultipleParticleModel, {

    /**
     * @public
     * @param {number} newTemperature
     */
    setTemperature: function( newTemperature ) {

      if ( newTemperature > MAX_TEMPERATURE ) {
        this.temperatureSetPoint = MAX_TEMPERATURE;
      }
      else if ( newTemperature < MIN_TEMPERATURE ) {
        this.temperatureSetPoint = MIN_TEMPERATURE;
      }
      else {
        this.temperatureSetPoint = newTemperature;
      }

      if ( this.isoKineticThermostat !== null ) {
        this.isoKineticThermostat.targetTemperature = newTemperature;
      }

      if ( this.andersenThermostat !== null ) {
        this.andersenThermostat.targetTemperature = newTemperature;
      }
    },

    /**
     * Get the current temperature in degrees Kelvin.
     * @public
     * @returns {number}
     */
    getTemperatureInKelvin: function() {
      return this.convertInternalTemperatureToKelvin();
    },

    /**
     * Get the pressure value which is being calculated by the model and is
     * not adjusted to represent any "real" units (such as atmospheres).
     * @public
     * @return {number}
     */
    getModelPressure: function() {
      return this.moleculeForceAndMotionCalculator.pressure;
    },

    /**
     * Set the molecule type to be simulated.
     * @private
     * @param {number} moleculeID
     */
    setMoleculeType: function( moleculeID ) {

      // Verify that this is a supported value.
      if ( ( moleculeID !== StatesOfMatterConstants.DIATOMIC_OXYGEN ) &&
           ( moleculeID !== StatesOfMatterConstants.NEON ) &&
           ( moleculeID !== StatesOfMatterConstants.ARGON ) &&
           ( moleculeID !== StatesOfMatterConstants.WATER ) &&
           ( moleculeID !== StatesOfMatterConstants.USER_DEFINED_MOLECULE ) ) {

        throw new Error( 'ERROR: Unsupported molecule type.' );
      }

      // Retain the current phase so that we can set the particles back to
      // this phase once they have been created and initialized.
      var phase = this.mapTemperatureToPhase();

      // Remove existing particles and reset the global model parameters.
      this.removeAllParticles();
      this.initializeModelParameters();

      // Set the new molecule type.
      this.currentMolecule = moleculeID;

      // Set the model parameters that are dependent upon the molecule type.
      switch( this.currentMolecule ) {
        case StatesOfMatterConstants.DIATOMIC_OXYGEN:
          this.particleDiameter = OxygenAtom.RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / O2_TRIPLE_POINT_IN_KELVIN;
          break;
        case StatesOfMatterConstants.NEON:
          this.particleDiameter = NeonAtom.RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / NEON_TRIPLE_POINT_IN_KELVIN;
          break;
        case StatesOfMatterConstants.ARGON:
          this.particleDiameter = ArgonAtom.RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / ARGON_TRIPLE_POINT_IN_KELVIN;
          break;
        case StatesOfMatterConstants.WATER:

          // Use a radius value that is artificially large, because the
          // educators have requested that water look "spaced out" so that
          // users can see the crystal structure better, and so that the
          // solid form will look larger (since water expands when frozen).
          this.particleDiameter = OxygenAtom.RADIUS * 2.9;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / WATER_TRIPLE_POINT_IN_KELVIN;
          break;
        case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
          this.particleDiameter = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
          this.minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE /
                                     ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
          break;
        default:
          throw new Error( 'Invalid current molecule' ); // Should never happen, so it should be debugged if it does.
      }

      // Reset the container size. This must be done after the diameter is
      // initialized because the normalized size is dependent upon the
      // particle diameter.
      this.resetContainerSize();

      // Initiate a reset in order to get the particles into predetermined
      // locations and energy levels.
      this.initializeParticles( phase );
    },

    /**
     *  @private
     */
    updatePressure: function() {
      this.pressure = this.getPressureInAtmospheres();
    },

    /**
     * Sets the target height of the container.  The target height is set
     * rather than the actual height because the model limits the rate at
     * which the height can changed.  The model will gradually move towards
     * the target height.
     * @public
     * @param {number} desiredContainerHeight
     */
    setTargetParticleContainerHeight: function( desiredContainerHeight ) {
      this.targetContainerHeight = Util.clamp( desiredContainerHeight, this.minAllowableContainerHeight,
        StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT );
    },

    /**
     * Get the sigma value, which is one of the two parameters that describes the Lennard-Jones potential.
     * @public
     * @returns {number}
     */
    getSigma: function() {
      var sigma;
      switch( this.currentMolecule ) {
        case StatesOfMatterConstants.NEON:
          sigma = NeonAtom.RADIUS * 2;
          break;
        case StatesOfMatterConstants.ARGON:
          sigma = ArgonAtom.RADIUS * 2;
          break;
        case StatesOfMatterConstants.DIATOMIC_OXYGEN:
          sigma = StatesOfMatterConstants.SIGMA_FOR_DIATOMIC_OXYGEN;
          break;
        case StatesOfMatterConstants.MONATOMIC_OXYGEN:
          sigma = OxygenAtom.RADIUS * 2;
          break;
        case StatesOfMatterConstants.WATER:
          sigma = StatesOfMatterConstants.SIGMA_FOR_WATER;
          break;
        case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
          sigma = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
          break;
        default:
          console.error( 'Error: Unrecognized molecule type when setting sigma value.' );
          sigma = 0;
      }

      return sigma;
    },

    /**
     * Get the epsilon value, which is one of the two parameters that describes the Lennard-Jones potential.
     * @public
     * @returns {number}
     */
    getEpsilon: function() {
      var epsilon;
      switch( this.currentMolecule ) {
        case StatesOfMatterConstants.NEON:
          epsilon = InteractionStrengthTable.getInteractionPotential( AtomType.NEON, AtomType.NEON );
          break;
        case StatesOfMatterConstants.ARGON:
          epsilon = InteractionStrengthTable.getInteractionPotential( AtomType.ARGON, AtomType.ARGON );
          break;
        case StatesOfMatterConstants.DIATOMIC_OXYGEN:
          epsilon = StatesOfMatterConstants.EPSILON_FOR_DIATOMIC_OXYGEN;
          break;
        case StatesOfMatterConstants.MONATOMIC_OXYGEN:
          epsilon = InteractionStrengthTable.getInteractionPotential( AtomType.OXYGEN, AtomType.OXYGEN );
          break;
        case StatesOfMatterConstants.WATER:
          epsilon = StatesOfMatterConstants.EPSILON_FOR_WATER;
          break;
        case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
          epsilon = this.convertScaledEpsilonToEpsilon( this.moleculeForceAndMotionCalculator.getScaledEpsilon() );
          break;
        default:
          console.log( 'Error: Unrecognized molecule type when getting epsilon value.' );
          epsilon = 0;
      }

      return epsilon;
    },

    /**
     * @public
     * @override
     */
    reset: function() {
      this.initializeModelParameters();
      this.setMoleculeType( DEFAULT_MOLECULE );
      PropertySet.prototype.reset.call( this );
      this.trigger( 'reset' );
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
     * @public
     * @param {number} normalizedHeatingCoolingAmount Normalized amount of heating or cooling
     *                 that the system is undergoing, ranging from -1 to +1.
     */
    setHeatingCoolingAmount: function( normalizedHeatingCoolingAmount ) {
      assert && assert( ( normalizedHeatingCoolingAmount <= 1.0 ) && ( normalizedHeatingCoolingAmount >= -1.0 ) );
      this.heatingCoolingAmount = normalizedHeatingCoolingAmount * MAX_TEMPERATURE_CHANGE_PER_ADJUSTMENT;
    },

    /**
     * @public
     * Inject a new molecule of the current type into the model. This uses
     * the current temperature to assign an initial velocity.
     */
    injectMolecule: function() {

      var injectionPointX = StatesOfMatterConstants.CONTAINER_BOUNDS.width / this.particleDiameter *
                            INJECTION_POINT_HORIZ_PROPORTION;
      var injectionPointY = StatesOfMatterConstants.CONTAINER_BOUNDS.height / this.particleDiameter *
                            INJECTION_POINT_VERT_PROPORTION;

      // Make sure that it is okay to inject a new molecule.
      if ( ( this.moleculeDataSet.getNumberOfRemainingSlots() > 1 ) &&
           ( this.normalizedContainerHeight > injectionPointY * 1.05 ) &&
           ( !this.isExploded ) ) {

        var angle = ( Math.random() - 0.5 ) * MAX_INJECTED_MOLECULE_ANGLE;
        var velocity = MIN_INJECTED_MOLECULE_VELOCITY + ( Math.random() *
                                                          ( MAX_INJECTED_MOLECULE_VELOCITY -
                                                            MIN_INJECTED_MOLECULE_VELOCITY ) );
        var xVel = Math.cos( angle ) * velocity;
        var yVel = Math.sin( angle ) * velocity;
        var atomsPerMolecule = this.moleculeDataSet.atomsPerMolecule;
        var moleculeCenterOfMassPosition = new Vector2( injectionPointX, injectionPointY );
        var moleculeVelocity = new Vector2( xVel, yVel );
        var moleculeRotationRate = ( Math.random() - 0.5 ) * ( Math.PI / 2 );
        var atomPositions = [];
        var atomPositionInVector = new Vector2();
        for ( var i = 0; i < atomsPerMolecule; i++ ) {
          atomPositions[ i ] = atomPositionInVector;
        }

        // Add the newly created molecule to the data set.
        this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity,
          moleculeRotationRate );

        // Position the atoms that comprise the molecules.
        this.atomPositionUpdater.updateAtomPositions( this.moleculeDataSet );

        if ( atomsPerMolecule === 1 ) {

          // Add particle to model set.
          var particle;
          switch( this.currentMolecule ) {
            case StatesOfMatterConstants.ARGON:
              particle = new ArgonAtom( 0, 0 );
              break;
            case StatesOfMatterConstants.NEON:
              particle = new NeonAtom( 0, 0 );
              break;
            case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
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

          assert && assert( this.currentMolecule === StatesOfMatterConstants.DIATOMIC_OXYGEN );

          // Add particles to model set.
          this.particles.add( new OxygenAtom( 0, 0 ) );
          this.particles.add( new OxygenAtom( 0, 0 ) );
        }
        else if ( atomsPerMolecule === 3 ) {

          assert && assert( this.currentMolecule === StatesOfMatterConstants.WATER );

          // Add atoms to model set.
          this.particles.add( new OxygenAtom( 0, 0 ) );
          this.particles.add( new HydrogenAtom( 0, 0, false ) );
          this.particles.add( new HydrogenAtom( 0, 0, false ) );
        }

        if ( this.particles.length === 1 ) {
          // Adding the first particle is considered a temperature
          // change, because (in this sim anyway), no particles means a
          // temperature of zero.
          this.temperatureSetPointProperty.notifyObserversStatic();
        }

        this.syncParticlePositions();
      }

      // Recalculate the minimum allowable container size, since it depends on the number of particles.
      this.calculateMinAllowableContainerHeight();
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
     * @private
     * Calculate the minimum allowable container height based on the current
     * number of particles.
     */
    calculateMinAllowableContainerHeight: function() {
      this.minAllowableContainerHeight = ( this.moleculeDataSet.getNumberOfMolecules() /
                                           this.normalizedContainerWidth ) * this.particleDiameter;
    },

    /**
     * Initialize the particles by calling the appropriate initialization
     * routine, which will set their positions, velocities, etc.
     * @public
     * @param {number} phase - phase of atoms
     */
    initializeParticles: function( phase ) {

      // Initialize the particles.
      switch( this.currentMolecule ) {
        case StatesOfMatterConstants.DIATOMIC_OXYGEN:
          this.initializeDiatomic( this.currentMolecule, phase );
          break;
        case StatesOfMatterConstants.NEON:
          this.initializeMonatomic( this.currentMolecule, phase );
          break;
        case StatesOfMatterConstants.ARGON:
          this.initializeMonatomic( this.currentMolecule, phase );
          break;
        case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
          this.initializeMonatomic( this.currentMolecule, phase );
          break;
        case StatesOfMatterConstants.WATER:
          this.initializeTriatomic( this.currentMolecule, phase );
          break;
        default:
          console.error( 'ERROR: Unrecognized particle type, using default.' );
          break;
      }
      // This is needed in case we were switching from another molecule
      // that was under pressure.
      this.updatePressure();
      this.calculateMinAllowableContainerHeight();
    },

    /**
     * @private
     */
    initializeModelParameters: function() {

      // Initialize the system parameters
      this.gravitationalAcceleration = INITIAL_GRAVITATIONAL_ACCEL;
      this.heatingCoolingAmount = 0;
      this.tempAdjustTickCounter = 0;
      this.temperatureSetPoint = INITIAL_TEMPERATURE;
      this.isExploded = false;
    },

    /**
     * @private
     * Reset both the normalized and non-normalized sizes of the container.
     * Note that the particle diameter must be valid before this will work properly.
     */
    resetContainerSize: function() {
      // Set the initial size of the container.
      this.particleContainerHeight = StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT;
      this.targetContainerHeight = StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT;
      this.normalizedContainerWidth = StatesOfMatterConstants.PARTICLE_CONTAINER_WIDTH / this.particleDiameter;
      this.normalizedContainerHeight = this.particleContainerHeight / this.particleDiameter;
    },

    /**
     * @public
     * Step the model.
     */
    stepInternal: function( dt ) {

      if ( !this.isExploded ) {
        // Adjust the particle container height if needed.
        if ( this.targetContainerHeight !== this.particleContainerHeight ) {
          this.heightChangeCounter = CONTAINER_SIZE_CHANGE_RESET_COUNT;
          var heightChange = this.targetContainerHeight - this.particleContainerHeight;
          if ( heightChange > 0 ) {
            // The container is growing.
            if ( this.particleContainerHeight + heightChange <=
                 StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT ) {
              this.particleContainerHeight += Math.min( heightChange, MAX_PER_TICK_CONTAINER_CHANGE * dt );
            }
            else {
              this.particleContainerHeight = StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT;
            }
          }
          else {
            // The container is shrinking.
            if ( this.particleContainerHeight - heightChange >= this.minAllowableContainerHeight ) {
              this.particleContainerHeight += Math.max( heightChange, - MAX_PER_TICK_CONTAINER_CHANGE * dt ) ;
            }
            else {
              this.particleContainerHeight = this.minAllowableContainerHeight;
            }
          }
          this.normalizedContainerHeight = this.particleContainerHeight / this.particleDiameter;
        }
        else {
          if ( this.heightChangeCounter > 0 ) {
            this.heightChangeCounter--;
          }
        }
      }
      else {
        // The lid is blowing off the container, so increase the container size until the lid should be well off
        // the screen.
        if ( this.particleContainerHeight < StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT * 3 ) {
          this.particleContainerHeight += MAX_PER_TICK_CONTAINER_EXPANSION_EXPLODED;
        }
      }

      // Record the pressure to see if it changes.
      var pressureBeforeAlgorithm = this.getModelPressure();

      var normDt = Math.min( 0.02, dt ); // normalize the dt as model cannot handle lonf dt's

      // Execute the Verlet algorithm.  The algorithm may be run several times for each time step.
      for ( var i = 0; i < VERLET_CALCULATIONS_PER_CLOCK_TICK; i++ ) {
        // is the container is exploded reduce the speed of particles
        if( this.isExploded ){
          normDt = Math.max( 0.016, normDt );
        }
        this.moleculeForceAndMotionCalculator.updateForcesAndMotion( normDt );

      }
      this.runThermostat();

      // Sync up the positions of the normalized particles (the molecule data
      // set) with the particles being monitored by the view (the model data set).
      this.syncParticlePositions();

      // If the pressure changed
      if ( this.getModelPressure() !== pressureBeforeAlgorithm ) {
        this.updatePressure();
      }

      // Adjust the temperature if needed.
      this.tempAdjustTickCounter++;
      if ( ( this.tempAdjustTickCounter > TICKS_PER_TEMP_ADJUSTMENT ) && this.heatingCoolingAmount !== 0 ) {
        this.tempAdjustTickCounter = 0;
        var newTemperature = this.temperatureSetPoint + this.heatingCoolingAmount;
        if ( newTemperature >= MAX_TEMPERATURE ) {
          newTemperature = MAX_TEMPERATURE;
        }
        else if ( ( newTemperature <= StatesOfMatterConstants.SOLID_TEMPERATURE * 0.9 ) &&
                  ( this.heatingCoolingAmount < 0 ) ) {
          // The temperature goes down more slowly as we begin to
          // approach absolute zero.
          newTemperature = this.temperatureSetPoint * 0.95;  // Multiplier determined empirically.
        }
        else if ( newTemperature <= this.minModelTemperature ) {
          newTemperature = this.minModelTemperature;
        }
        this.temperatureSetPoint = newTemperature;
        this.isoKineticThermostat.targetTemperature = this.temperatureSetPoint;
        this.andersenThermostat.targetTemperature = this.temperatureSetPoint;
      }
    },

    step: function( dt ) {
      if ( this.isPlaying ) {
        this.stepInternal( dt );
      }
    },

    /**
     * Run the appropriate thermostat based on the settings and the state of
     * the simulation.
     */
    runThermostat: function() {

      if ( this.isExploded ) {
        // Don't bother to run any thermostat if the lid is blown off -
        // just let those little particles run free!
        return;
      }

      var calculatedTemperature = this.moleculeForceAndMotionCalculator.temperature;
      var temperatureIsChanging = false;

      if ( ( this.heatingCoolingAmount !== 0 ) ||
           ( this.temperatureSetPoint + TEMPERATURE_CLOSENESS_RANGE < calculatedTemperature ) ||
           ( this.temperatureSetPoint - TEMPERATURE_CLOSENESS_RANGE > calculatedTemperature ) ) {
        temperatureIsChanging = true;
      }

      if ( this.heightChangeCounter !== 0 && this.particlesNearTop() ) {

        // The height of the container is currently changing and there
        // are particles close enough to the top that they may be
        // interacting with it.  Since this can end up adding or removing
        // kinetic energy (i.e. heat) from the system, no thermostat is
        // run in this case.  Instead, the temperature is determined by
        // looking at the kinetic energy of the molecules and that value
        // is used to set the system temperature set point.
        this.setTemperature( this.moleculeDataSet.calculateTemperatureFromKineticEnergy() );
      }
      else if ( ( this.thermostatType === ISOKINETIC_THERMOSTAT ) ||
                ( this.thermostatType === ADAPTIVE_THERMOSTAT && ( temperatureIsChanging || this.temperatureSetPoint >
                                                                                            StatesOfMatterConstants.LIQUID_TEMPERATURE ) ) ) {
        // Use the isokinetic thermostat.
        this.isoKineticThermostat.adjustTemperature();
      }
      else if ( ( this.thermostatType === ANDERSEN_THERMOSTAT ) ||
                ( this.thermostatType === ADAPTIVE_THERMOSTAT && !temperatureIsChanging ) ) {
        // The temperature isn't changing and it is below a certain
        // threshold, so use the Andersen thermostat.  This is done for
        // purely visual reasons - it looks better than the isokinetic in
        // these circumstances.
        this.andersenThermostat.adjustTemperature();
      }

      // Note that there will be some circumstances in which no thermostat
      // is run.  This is intentional.
    },

    /**
     * Initialize the various model components to handle a simulation in which
     * all the molecules are single atoms.
     * @private
     * @param {number} moleculeID
     * @param {number} phase
     */
    initializeDiatomic: function( moleculeID, phase ) {

      // Verify that a valid molecule ID was provided.
      assert && assert( (moleculeID === StatesOfMatterConstants.DIATOMIC_OXYGEN) );

      // Determine the number of atoms/molecules to create.  This will be a cube
      // (really a square, since it's 2D, but you get the idea) that takes
      // up a fixed amount of the bottom of the container, so the number of
      // molecules that can fit depends on the size of the individual atom.
      var numberOfAtoms = Math.pow( Math.round( StatesOfMatterConstants.CONTAINER_BOUNDS.width /
                                                ((OxygenAtom.RADIUS * 2.1) * 3) ), 2 );
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
        this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0 );

        // Add atoms to model set.
        this.particles.push( new OxygenAtom( 0, 0 ) );
        this.particles.push( new OxygenAtom( 0, 0 ) );
      }

      // Initialize the particle positions according the to requested phase.
      this.setPhase( phase );
    },

    /**
     * Initialize the various model components to handle a simulation in which
     * each molecule consists of three atoms, e.g. water.
     * @private
     * @param {number} moleculeID
     * @param {number} phase
     */
    initializeTriatomic: function( moleculeID, phase ) {

      // Only water is supported so far.
      assert && assert( (moleculeID === StatesOfMatterConstants.WATER) );

      // Determine the number of atoms/molecules to create.  This will be a cube
      // (really a square, since it's 2D, but you get the idea) that takes
      // up a fixed amount of the bottom of the container, so the number of
      // molecules that can fit depends on the size of the individual atom.
      var waterMoleculeDiameter = OxygenAtom.RADIUS * 2.1;
      var moleculesAcrossBottom = Math.round( StatesOfMatterConstants.CONTAINER_BOUNDS.width /
                                              (waterMoleculeDiameter * 1.2) );
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
        this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0 );

        // Add atoms to model set.
        this.particles.add( new OxygenAtom( 0, 0 ) );
        this.particles.add( new HydrogenAtom( 0, 0, false ) );

        // For the sake of making water actually crystallize, we have a
        // proportion of the hydrogen atoms be of a different type.  There
        // is more on this in the algorithm implementation for water.
        var atom = ( i % 2 === 0 ) ? new HydrogenAtom( 0, 0, false ) : new HydrogenAtom( 0, 0, true );
        this.particles.add( atom );
      }
      // Initialize the particle positions according the to requested phase.
      this.setPhase( phase );
    },

    /***
     * @public
     * @returns {number}
     */
    getNormalizedContainerWidth: function() {
      return this.normalizedContainerWidth;
    },

    /**
     * @public
     * @returns {MoleculeForceAndMotionDataSet}
     */
    getMoleculeDataSetRef: function() {
      return this.moleculeDataSet;
    },

    /**
     * @public
     * @returns {Array}
     */
    getMoleculeCenterOfMassPositions: function() {
      return this.moleculeCenterOfMassPositions;
    },

    /**
     * @public
     * @returns {number}
     */
    getNormalizedContainerHeight: function() {
      return this.normalizedContainerHeight;
    },

    /**
     * @public
     * @returns {number}
     */
    getTemperatureSetPoint: function() {
      return this.temperatureSetPoint;
    },

    /**
     * @public
     * @returns {number}
     */
    getGravitationalAcceleration: function() {
      return this.gravitationalAcceleration;
    },

    /**
     * @public
     * @returns {number}
     */
    getMoleculeType: function() {
      return this.currentMolecule;
    },

    /**
     * @public
     * @param {number} epsilon
     */
    setEpsilon: function( epsilon ) {
      if ( this.currentMolecule === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        if ( epsilon < MIN_ADJUSTABLE_EPSILON ) {
          epsilon = MIN_ADJUSTABLE_EPSILON;
        }
        else if ( epsilon > MAX_ADJUSTABLE_EPSILON ) {
          epsilon = MAX_ADJUSTABLE_EPSILON;
        }
        this.moleculeForceAndMotionCalculator.setScaledEpsilon( this.convertEpsilonToScaledEpsilon( epsilon ) );

      }
      else {
        // used, so print and error message and ignore the request.
        console.error( 'Error: Epsilon cannot be set when non-configurable molecule is in use.' );
      }
    },

    /**
     * Initialize the various model components to handle a simulation in which
     * all the molecules are single atoms.
     * @private
     * @param {number} moleculeID
     * @param {number} phase
     */
    initializeMonatomic: function( moleculeID, phase ) {

      // Verify that a valid molecule ID was provided.
      assert && assert( moleculeID === StatesOfMatterConstants.USER_DEFINED_MOLECULE ||
                        moleculeID === StatesOfMatterConstants.NEON ||
                        moleculeID === StatesOfMatterConstants.ARGON );

      // Determine the number of atoms/molecules to create.  This will be a cube
      // (really a square, since it's 2D, but you get the idea) that takes
      // up a fixed amount of the bottom of the container, so the number of
      // molecules that can fit depends on the size of the individual.
      var particleDiameter;
      if ( moleculeID === StatesOfMatterConstants.NEON ) {
        particleDiameter = NeonAtom.RADIUS * 2;
      }
      else if ( moleculeID === StatesOfMatterConstants.ARGON ) {
        particleDiameter = ArgonAtom.RADIUS * 2;
      }
      else if ( moleculeID === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        particleDiameter = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
      }
      else {
        // Force it to neon.
        moleculeID = StatesOfMatterConstants.NEON;
        particleDiameter = NeonAtom.RADIUS * 2;
      }

      // Initialize the number of atoms assuming that the solid form, when
      // made into a square, will consume about 1/3 the width of the container.
      var numberOfAtoms = Math.pow( Math.round( StatesOfMatterConstants.CONTAINER_BOUNDS.width /
                                                ( ( particleDiameter * 1.05 ) * 3 ) ), 2 );

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
        this.moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0 );

        // Add particle to model set.
        var atom;
        if ( moleculeID === StatesOfMatterConstants.NEON ) {
          atom = new NeonAtom( 0, 0 );
        }
        else if ( moleculeID === StatesOfMatterConstants.ARGON ) {
          atom = new ArgonAtom( 0, 0 );
        }
        else if ( moleculeID === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
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
     * @private
     * Set the positions of the non-normalized particles based on the positions
     * of the normalized ones.
     */
    syncParticlePositions: function() {
      assert && assert( this.moleculeDataSet.numberOfAtoms === this.particles.length,
        'Inconsistent number of normalized versus non-normalized particles' );
      var positionMultiplier = this.particleDiameter;
      var atomPositions = this.moleculeDataSet.atomPositions;

      this.particles.forEach( function( particle, index ) {
        particle.setPosition( atomPositions[ index ].x * positionMultiplier, atomPositions[ index ].y * positionMultiplier );
      } );
    },

    /**
     * Take the internal temperature value and convert it to Kelvin.  This
     * is dependent on the type of molecule selected.  The values and ranges
     * used in this method were derived from information provided by Paul
     * Beale.
     */
    convertInternalTemperatureToKelvin: function() {

      if ( this.particles.length === 0 ) {
        // Temperature is reported as 0 if there are no particles.
        return 0;
      }

      var temperatureInKelvin;
      var triplePoint = 0;
      var criticalPoint = 0;

      switch( this.currentMolecule ) {

        case StatesOfMatterConstants.NEON:
          triplePoint = NEON_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = NEON_CRITICAL_POINT_IN_KELVIN;
          break;

        case StatesOfMatterConstants.ARGON:
          triplePoint = ARGON_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = ARGON_CRITICAL_POINT_IN_KELVIN;
          break;

        case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
          triplePoint = ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN;
          break;

        case StatesOfMatterConstants.WATER:
          triplePoint = WATER_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = WATER_CRITICAL_POINT_IN_KELVIN;
          break;

        case StatesOfMatterConstants.DIATOMIC_OXYGEN:
          triplePoint = O2_TRIPLE_POINT_IN_KELVIN;
          criticalPoint = O2_CRITICAL_POINT_IN_KELVIN;
          break;

        default:
          break;
      }

      if ( this.temperatureSetPoint <= this.minModelTemperature ) {
        // We treat anything below the minimum temperature as absolute zero.
        temperatureInKelvin = 0;
      }
      else if ( this.temperatureSetPoint < TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE ) {
        temperatureInKelvin = this.temperatureSetPoint * triplePoint / TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;

        if ( temperatureInKelvin < 0.5 ) {
          // Don't return zero - or anything that would round to it - as
          // a value until we actually reach the minimum internal temperature.
          temperatureInKelvin = 0.5;
        }
      }
      else if ( this.temperatureSetPoint < CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE ) {
        var slope = ( criticalPoint - triplePoint ) /
                    ( CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE - TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE );
        var offset = triplePoint - ( slope * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE );
        temperatureInKelvin = this.temperatureSetPoint * slope + offset;
      }
      else {
        temperatureInKelvin = this.temperatureSetPoint * criticalPoint / CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
      }
      return temperatureInKelvin;
    },

    /**
     * @public
     * Take the internal pressure value and convert it to atmospheres.  This
     * is dependent on the type of molecule selected.  The values and ranges
     * used in this method were derived from information provided by Paul
     * Beale.
     * @returns {number}
     */
    getPressureInAtmospheres: function() {

      var pressureInAtmospheres;

      switch( this.currentMolecule ) {

        case StatesOfMatterConstants.NEON:
          pressureInAtmospheres = 200 * this.getModelPressure();
          break;

        case StatesOfMatterConstants.ARGON:
          pressureInAtmospheres = 125 * this.getModelPressure();
          break;

        case StatesOfMatterConstants.WATER:
          pressureInAtmospheres = 200 * this.getModelPressure();
          break;

        case StatesOfMatterConstants.DIATOMIC_OXYGEN:
          pressureInAtmospheres = 125 * this.getModelPressure();
          break;

        case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
          // TODO: Not sure what to do here, need to figure it out.
          // Using the value for Argon at the moment.
          pressureInAtmospheres = 125 * this.getModelPressure();
          break;

        default:
          pressureInAtmospheres = 0;
          break;
      }
      //this.updatePressure();
      return pressureInAtmospheres;
    },

    /**
     * Determine whether there are particles close to the top of the
     * container.  This can be important for determining whether movement
     * of the top is causing temperature changes.
     * @public
     * @return {boolean} true if particles are close, false if not
     */
    particlesNearTop: function() {
      var moleculesPositions = this.moleculeDataSet.moleculeCenterOfMassPositions;
      var threshold = this.normalizedContainerHeight - PARTICLE_EDGE_PROXIMITY_RANGE;
      var particlesNearTop = false;

      for ( var i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++ ) {
        if ( moleculesPositions[ i ].y > threshold ) {
          particlesNearTop = true;
          break;
        }
      }

      return particlesNearTop;
    },

    /**
     * Return a phase value based on the current temperature.
     * @private
     * @return{number}
     */
    mapTemperatureToPhase: function() {
      var phase;
      if ( this.temperatureSetPoint < StatesOfMatterConstants.SOLID_TEMPERATURE +
                                      ( ( StatesOfMatterConstants.LIQUID_TEMPERATURE -
                                          StatesOfMatterConstants.SOLID_TEMPERATURE ) / 2 ) ) {
        phase = PhaseStateEnum.SOLID;
      }
      else if ( this.temperatureSetPoint < StatesOfMatterConstants.LIQUID_TEMPERATURE +
                                           ( ( StatesOfMatterConstants.GAS_TEMPERATURE -
                                               StatesOfMatterConstants.LIQUID_TEMPERATURE ) / 2 ) ) {
        phase = PhaseStateEnum.LIQUID;
      }
      else {
        phase = PhaseStateEnum.GAS;
      }

      return phase;
    },

    /**
     * Convert a value for epsilon that is in the real range of values into a
     * scaled value that is suitable for use with the motion and force
     * calculators.
     * @private
     * @param {number} epsilon
     */
    convertEpsilonToScaledEpsilon: function( epsilon ) {
      // The following conversion of the target value for epsilon
      // to a scaled value for the motion calculator object was
      // determined empirically such that the resulting behavior
      // roughly matched that of the existing monatomic molecules.
      return epsilon / ( StatesOfMatterConstants.MAX_EPSILON / 2 );
    },

    /**
     * @private
     * @param {number} scaledEpsilon
     * @returns {number}
     */
    convertScaledEpsilonToEpsilon: function( scaledEpsilon ) {
      return scaledEpsilon * StatesOfMatterConstants.MAX_EPSILON / 2;
    },

    /**
     * @public
     * @returns {boolean}
     */
    getContainerExploded: function() {
      return this.isExploded;
    },

    /**
     * This method is used for an external entity to notify the model that it
     * should explode.
     *  @private
     * @param {boolean} isExploded
     */
    setContainerExploded: function( isExploded ) {
      if ( this.isExploded !== isExploded ) {
        this.isExploded = isExploded;
        //notifyContainerExplodedStateChanged(m_isExploded);
        if ( !this.isExploded ) {
          this.resetContainerSize();
        }
      }
    },

    /**
     * @public
     * Return the lid to the container.  It only makes sense to call this after
     * the container has exploded, otherwise it has no effect.
     */
    returnLid: function() {
      if ( !this.isExploded ) {
        console.log( ' - Warning: Ignoring attempt to return lid when container hadn\'t exploded.' );
        return;
      }

      // Remove any particles that are outside of the container.  We work
      // with the normalized particles for this.
      var particlesOutsideOfContainerCount = 0;
      var firstOutsideMoleculeIndex;
      do {
        for ( firstOutsideMoleculeIndex = 0; firstOutsideMoleculeIndex < this.moleculeDataSet.getNumberOfMolecules();
              firstOutsideMoleculeIndex++ ) {
          var pos = this.moleculeDataSet.getMoleculeCenterOfMassPositions()[ firstOutsideMoleculeIndex ];
          if ( pos.x < 0 || pos.x > this.normalizedContainerWidth || pos.y < 0 ||
               pos.y > StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT / this.particleDiameter ) {
            // This particle is outside of the container.
            break;
          }
        }
        if ( firstOutsideMoleculeIndex < this.moleculeDataSet.getNumberOfMolecules() ) {
          // Remove the particle that was found.
          this.moleculeDataSet.removeMolecule( firstOutsideMoleculeIndex );
          particlesOutsideOfContainerCount++;
        }
      } while ( firstOutsideMoleculeIndex !== this.moleculeDataSet.getNumberOfMolecules() );

      // Remove enough of the non-normalized particles so that we have the
      // same number as the normalized.  They don't have to be the same
      // particles since the normalized and non-normalized particles are
      // explicitly synced up elsewhere.
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

      // Set the phase to be gas, since otherwise the extremely high
      // kinetic energy of the particles causes an unreasonably high
      // temperature for the particles that remain in the container. Doing
      // this generally cools them down into a more manageable state.
      if ( particlesOutsideOfContainerCount > 0 ) {
        this.phaseStateChanger.setPhase( PhaseStateEnum.GAS );
      }
    },

    /**
     * @public
     * @returns {number}
     */
    getParticleContainerHeight: function() {
      return this.particleContainerHeight;
    },

    MAX_ADJUSTABLE_EPSILON: MAX_ADJUSTABLE_EPSILON
  } );
} );