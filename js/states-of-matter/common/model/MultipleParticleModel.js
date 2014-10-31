// Copyright 2002-2014, University of Colorado Boulder
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
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var Rectangle = require( 'KITE/Rectangle' );
  var ArrayList = require( 'java.util.ArrayList' );
  var List = require( 'java.util.List' );
  var Random = require( 'java.util.Random' );
  var MathUtil = require( 'edu.colorado.phet.common.phetcommon.math.MathUtil' );
  var Vector2 = require( 'DOT/Vector2' );
  var Resettable = require( 'edu.colorado.phet.common.phetcommon.model.Resettable' );
  var ClockAdapter = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter' );
  var ClockEvent = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockEvent' );
  var ConstantDtClock = require( 'edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var AtomPositionUpdater = require( 'STATES_OF_MATTER/states-of-matter/model/engine/AtomPositionUpdater' );
  var DiatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/states-of-matter/model/engine/DiatomicAtomPositionUpdater' );
  var DiatomicPhaseStateChanger = require( 'STATES_OF_MATTER/states-of-matter/model/engine/DiatomicPhaseStateChanger' );
  var DiatomicVerletAlgorithm = require( 'STATES_OF_MATTER/states-of-matter/model/engine/DiatomicVerletAlgorithm' );
  var MoleculeForceAndMotionCalculator = require( 'STATES_OF_MATTER/states-of-matter/model/engine/MoleculeForceAndMotionCalculator' );
  var MonatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/states-of-matter/model/engine/MonatomicAtomPositionUpdater' );
  var MonatomicPhaseStateChanger = require( 'STATES_OF_MATTER/states-of-matter/model/engine/MonatomicPhaseStateChanger' );
  var MonatomicVerletAlgorithm = require( 'STATES_OF_MATTER/states-of-matter/model/engine/MonatomicVerletAlgorithm' );
  var NullMoleculeForceAndMotionCalculator = require( 'STATES_OF_MATTER/states-of-matter/model/engine/NullMoleculeForceAndMotionCalculator' );
  var PhaseStateChanger = require( 'STATES_OF_MATTER/states-of-matter/model/engine/PhaseStateChanger' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/states-of-matter/model/engine/WaterAtomPositionUpdater' );
  var WaterPhaseStateChanger = require( 'STATES_OF_MATTER/states-of-matter/model/engine/WaterPhaseStateChanger' );
  var WaterVerletAlgorithm = require( 'STATES_OF_MATTER/states-of-matter/model/engine/WaterVerletAlgorithm' );
  var AndersenThermostat = require( 'STATES_OF_MATTER/states-of-matter/model/engine/kinetic/AndersenThermostat' );
  var IsokineticThermostat = require( 'STATES_OF_MATTER/states-of-matter/model/engine/kinetic/IsokineticThermostat' );
  var Thermostat = require( 'STATES_OF_MATTER/states-of-matter/model/engine/kinetic/Thermostat' );
  var ArgonAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/ArgonAtom' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/ConfigurableStatesOfMatterAtom' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/HydrogenAtom' );
  var HydrogenAtom2 = require( 'STATES_OF_MATTER/states-of-matter/model/particle/HydrogenAtom2' );
  var NeonAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/OxygenAtom' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/StatesOfMatterAtom' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// The internal model temperature values for the various states.
  var SOLID_TEMPERATURE = 0.15;
  var SLUSH_TEMPERATURE = 0.33;
  var LIQUID_TEMPERATURE = 0.34;
  var GAS_TEMPERATURE = 1.0;
// Constants that control various aspects of the model behavior.
  var DEFAULT_MOLECULE = StatesOfMatterConstants.NEON;
  var INITIAL_TEMPERATURE = SOLID_TEMPERATURE;
  var MAX_TEMPERATURE = 50.0;
  var MIN_TEMPERATURE = 0.0001;

  //private
  var INITIAL_GRAVITATIONAL_ACCEL = 0.045;
  var MAX_GRAVITATIONAL_ACCEL = 0.4;

  //private
  var MAX_TEMPERATURE_CHANGE_PER_ADJUSTMENT = 0.025;

  //private
  var TICKS_PER_TEMP_ADJUSTMENT = 10;

  //private
  var MIN_INJECTED_MOLECULE_VELOCITY = 0.5;

  //private
  var MAX_INJECTED_MOLECULE_VELOCITY = 2.0;

  //private
  var MAX_INJECTED_MOLECULE_ANGLE = Math.PI * 0.8;

  //private
  var VERLET_CALCULATIONS_PER_CLOCK_TICK = 8;
// Constants used for setting the phase directly.
  var PHASE_SOLID = 1;
  var PHASE_LIQUID = 2;
  var PHASE_GAS = 3;

  //private
  var INJECTION_POINT_HORIZ_PROPORTION = 0.95;

  //private
  var INJECTION_POINT_VERT_PROPORTION = 0.5;
// Possible thermostat settings.
  var NO_THERMOSTAT = 0;
  var ISOKINETIC_THERMOSTAT = 1;
  var ANDERSEN_THERMOSTAT = 2;
  var ADAPTIVE_THERMOSTAT = 3;
// Parameters to control rates of change of the container size.

  //private
  var MAX_PER_TICK_CONTAINER_SHRINKAGE = 50;

  //private
  var MAX_PER_TICK_CONTAINER_EXPANSION = 200;
// Countdown value used when recalculating temperature when the
// container size is changing.

  //private
  var CONTAINER_SIZE_CHANGE_RESET_COUNT = 25;
// Range for deciding if the temperature is near the current set point.
// The units are internal model units.

  //private
  var TEMPERATURE_CLOSENESS_RANGE = 0.15;
// Constant for deciding if a particle should be considered near to the
// edges of the container.

  //private
  var PARTICLE_EDGE_PROXIMITY_RANGE = 2.5;
// Values used for converting from model temperature to the temperature
// for a given particle.
// Empirically determined.
  var TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE = 0.26;
// Empirically determined.
  var CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE = 0.8;
// Tweaked a little from actual value for better temperature mapping.

  //private
  var NEON_TRIPLE_POINT_IN_KELVIN = 23;

  //private
  var NEON_CRITICAL_POINT_IN_KELVIN = 44;
// Tweaked a little from actual value for better temperature mapping.

  //private
  var ARGON_TRIPLE_POINT_IN_KELVIN = 75;

  //private
  var ARGON_CRITICAL_POINT_IN_KELVIN = 151;

  //private
  var O2_TRIPLE_POINT_IN_KELVIN = 54;

  //private
  var O2_CRITICAL_POINT_IN_KELVIN = 155;

  //private
  var WATER_TRIPLE_POINT_IN_KELVIN = 273;

  //private
  var WATER_CRITICAL_POINT_IN_KELVIN = 647;
// The following values are used for temperature conversion for the
// adjustable molecule.  These are somewhat arbitrary, since in the real
// world the values would change if epsilon were changed.  They have been
// chosen to be similar to argon, because the default epsilon value is
// half of the allowable range, and this value ends up being similar to
// argon.

  //private
  var ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN = 75;

  //private
  var ADJUSTABLE_ATOM_CRITICAL_POINT_IN_KELVIN = 140;
// Min a max values for adjustable epsilon.  Originally there was a wider
// allowable range, but the simulation did not work so well, so the range
// below was arrived at empirically and seems to work reasonably well.
  var MIN_ADJUSTABLE_EPSILON = 1.5 * NeonAtom.EPSILON;
  var MAX_ADJUSTABLE_EPSILON = StatesOfMatterConstants.EPSILON_FOR_WATER;

  // static interface: Listener
  var Listener =
  /**
   * Listener interface for obtaining model events.
   */
    define( function( require ) {

      return inherit( Object, Listener, {
        /**
         * Inform listeners that the model has been reset.
         */
        resetOccurred: function() {},
        /**
         * Inform listeners that a new particle has been added to the model.
         */
        particleAdded: function( particle ) {},
        /**
         * Inform listeners that the temperature of the system has changed.
         */
        temperatureChanged: function() {},
        /**
         * Inform listeners that the pressure of the system has changed.
         */
        pressureChanged: function() {},
        /**
         * Inform listeners that the size of the container has changed.
         */
        containerSizeChanged: function() {},
        /**
         * Inform listeners that the type of molecule being simulated has
         * changed.
         */
        moleculeTypeChanged: function() {},
        /**
         * Inform listeners that the container has exploded.
         *
         * @param containerExploded
         */
        containerExplodedStateChanged: function( containerExploded ) {},
        /**
         * Inform listeners that the interaction potential has changed.
         */
        interactionStrengthChanged: function() {}
      } );
    } );
  ;
  // static class: Adapter
  var Adapter =
    define( function( require ) {

      return inherit( Object, Adapter, {
        resetOccurred: function() {
        },
        particleAdded: function( particle ) {
        },
        temperatureChanged: function() {
        },
        pressureChanged: function() {
        },
        containerSizeChanged: function() {
        },
        moleculeTypeChanged: function() {
        },
        containerExplodedStateChanged: function( containerExploded ) {
        },
        interactionStrengthChanged: function() {
        }
      } );
    } );
  ;
  function MultipleParticleModel( clock ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    // Strategy patterns that are applied to the data set in order to create
    // the overall behavior of the simulation.

    //private
    this.m_atomPositionUpdater;

    //private
    this.m_moleculeForceAndMotionCalculator = new NullMoleculeForceAndMotionCalculator();

    //private
    this.m_phaseStateChanger;

    //private
    this.m_isoKineticThermostat;

    //private
    this.m_andersenThermostat;
    // Attributes of the container and simulation as a whole.

    //private
    this.m_particleContainerHeight;

    //private
    this.m_targetContainerHeight;

    //private
    this.m_minAllowableContainerHeight;

    //private
    this.m_particles = [];

    //private
    this.m_isExploded = false;
    this.m_clock;

    //private
    this.m_listeners = [];
    // Data set containing the atom and molecule position, motion, and force information.

    //private
    this.m_moleculeDataSet;

    //private
    this.m_normalizedContainerWidth;

    //private
    this.m_normalizedContainerHeight;

    //private
    this.m_rand = new Random();

    //private
    this.m_temperatureSetPoint;

    //private
    this.m_gravitationalAcceleration;

    //private
    this.m_heatingCoolingAmount;

    //private
    this.m_tempAdjustTickCounter;

    //private
    this.m_currentMolecule;

    //private
    this.m_particleDiameter;

    //private
    this.m_thermostatType;

    //private
    this.m_heightChangeCounter;

    //private
    this.m_minModelTemperature;
    m_clock = clock;
    m_heightChangeCounter = 0;
    setThermostatType( ADAPTIVE_THERMOSTAT );
    // Register as a clock listener.
    clock.addClockListener( new ClockAdapter().withAnonymousClassBody( {
      clockTicked: function( clockEvent ) {
        step();
      },
      simulationTimeReset: function( clockEvent ) {
        reset();
      }
    } ) );
    // initialization will occur when the model is reset.
    m_particleDiameter = 1;
    resetContainerSize();
    m_currentMolecule = DEFAULT_MOLECULE;
  }

  return inherit( Object, MultipleParticleModel, {
//----------------------------------------------------------------------------
// Accessor Methods
//----------------------------------------------------------------------------
      getClock: function() {
        return m_clock;
      },
      getNumMolecules: function() {
        return m_particles.size() / m_moleculeDataSet.getAtomsPerMolecule();
      },
      /**
       * Get a rectangle that represents the current size and position of the
       * the particle container.
       */
      getParticleContainerRect: function() {
        return new Rectangle.Number( 0, 0, StatesOfMatterConstants.PARTICLE_CONTAINER_WIDTH, m_particleContainerHeight );
      },
      setTemperature: function( newTemperature ) {
        if ( newTemperature > MAX_TEMPERATURE ) {
          m_temperatureSetPoint = MAX_TEMPERATURE;
        }
        else if ( newTemperature < MIN_TEMPERATURE ) {
          m_temperatureSetPoint = MIN_TEMPERATURE;
        }
        else {
          m_temperatureSetPoint = newTemperature;
        }
        if ( m_isoKineticThermostat != null ) {
          m_isoKineticThermostat.setTargetTemperature( newTemperature );
        }
        if ( m_andersenThermostat != null ) {
          m_andersenThermostat.setTargetTemperature( newTemperature );
        }
        notifyTemperatureChanged();
      },
      /**
       * Get the current temperature set point in model units.
       *
       * @return
       */
      getTemperatureSetPoint: function() {
        return m_temperatureSetPoint;
      },
      /**
       * Get the current temperature in degrees Kelvin.
       *
       * @return
       */
      getTemperatureInKelvin: function() {
        return convertInternalTemperatureToKelvin();
      },
      getGravitationalAcceleration: function() {
        return m_gravitationalAcceleration;
      },
      setGravitationalAcceleration: function( acceleration ) {
        if ( acceleration > MAX_GRAVITATIONAL_ACCEL ) {
          System.err.println( "WARNING: Attempt to set out-of-range value for gravitational acceleration." );
          assert && assert( false );
          m_gravitationalAcceleration = MAX_GRAVITATIONAL_ACCEL;
        }
        else if ( acceleration < 0 ) {
          System.err.println( "WARNING: Attempt to set out-of-range value for gravitational acceleration." );
          assert && assert( false );
          m_gravitationalAcceleration = 0;
        }
        else {
          m_gravitationalAcceleration = acceleration;
        }
      },
      getParticleType: function() {
        return m_currentMolecule;
      },
      /**
       * Get the pressure value which is being calculated by the model and is
       * not adjusted to represent any "real" units (such as atmospheres).
       *
       * @return
       */
      getModelPressure: function() {
        return m_moleculeForceAndMotionCalculator.getPressure();
      },
      getMoleculeType: function() {
        return m_currentMolecule;
      },
      getContainerExploded: function() {
        return m_isExploded;
      },
      /**
       * Cause the lid to blow off the top of the container.
       */
      explodeContainer: function() {
        setContainerExploded( true );
      },
      /**
       * This method is used for an external entity to notify the model that it
       * should explode.
       *
       * @param isExploded
       */

      //private
      setContainerExploded: function( isExploded ) {
        if ( m_isExploded != isExploded ) {
          m_isExploded = isExploded;
          notifyContainerExplodedStateChanged( m_isExploded );
          if ( !m_isExploded ) {
            resetContainerSize();
          }
        }
      },
      /**
       * Return the lid to the container.  It only makes sense to call this after
       * the container has exploded, otherwise it has no effect.
       */
      returnLid: function() {
        if ( !m_isExploded ) {
          console.log( getClass().getName() + " - Warning: Ignoring attempt to return lid when container hadn't exploded." );
          return;
        }
        // with the normalized particles for this.
        var particlesOutsideOfContainer = 0;
        var firstOutsideMoleculeIndex;
        do {
          for ( firstOutsideMoleculeIndex = 0; firstOutsideMoleculeIndex < m_moleculeDataSet.getNumberOfMolecules(); firstOutsideMoleculeIndex++ ) {
            var pos = m_moleculeDataSet.getMoleculeCenterOfMassPositions()[firstOutsideMoleculeIndex];
            if ( pos.getX() < 0 || pos.getX() > m_normalizedContainerWidth || pos.getY() < 0 || pos.getY() > StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT / m_particleDiameter ) {
              // This particle is outside of the container.
              break;
            }
          }
          if ( firstOutsideMoleculeIndex < m_moleculeDataSet.getNumberOfMolecules() ) {
            // Remove the particle that was found.
            m_moleculeDataSet.removeMolecule( firstOutsideMoleculeIndex );
            particlesOutsideOfContainer++;
          }
        } while ( firstOutsideMoleculeIndex != m_moleculeDataSet.getNumberOfMolecules() );
        // explicitly synced up elsewhere.
        var copyOfParticles = new ArrayList( m_particles );
        for ( var i = 0; i < copyOfParticles.size() - m_moleculeDataSet.getNumberOfAtoms(); i++ ) {
          var particle = copyOfParticles.get( i );
          m_particles.remove( particle );
          particle.removedFromModel();
        }
        // Set the container to be unexploded.
        setContainerExploded( false );
        // this generally cools them down into a more manageable state.
        if ( particlesOutsideOfContainer > 0 ) {
          m_phaseStateChanger.setPhase( PhaseStateChanger.PHASE_GAS );
        }
      },
      /**
       * Set the molecule type to be simulated.
       *
       * @param moleculeID
       */
      setMoleculeType: function( moleculeID ) {
        // Verify that this is a supported value.
        if ( (moleculeID != StatesOfMatterConstants.DIATOMIC_OXYGEN) && (moleculeID != StatesOfMatterConstants.NEON) && (moleculeID != StatesOfMatterConstants.ARGON) && (moleculeID != StatesOfMatterConstants.WATER) && (moleculeID != StatesOfMatterConstants.USER_DEFINED_MOLECULE) ) {
          System.err.println( "ERROR: Unsupported molecule type." );
          assert && assert( false );
          moleculeID = StatesOfMatterConstants.NEON;
        }
        // this phase once they have been created and initialized.
        var phase = mapTemperatureToPhase();
        // Remove existing particles and reset the global model parameters.
        removeAllParticles();
        initializeModelParameters();
        // Set the new molecule type.
        m_currentMolecule = moleculeID;
        // Set the model parameters that are dependent upon the molecule type.
        switch( m_currentMolecule ) {
          case StatesOfMatterConstants.DIATOMIC_OXYGEN:
            m_particleDiameter = OxygenAtom.RADIUS * 2;
            m_minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / O2_TRIPLE_POINT_IN_KELVIN;
            break;
          case StatesOfMatterConstants.NEON:
            m_particleDiameter = NeonAtom.RADIUS * 2;
            m_minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / NEON_TRIPLE_POINT_IN_KELVIN;
            break;
          case StatesOfMatterConstants.ARGON:
            m_particleDiameter = ArgonAtom.RADIUS * 2;
            m_minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / ARGON_TRIPLE_POINT_IN_KELVIN;
            break;
          case StatesOfMatterConstants.WATER:
            // solid form will look larger (since water expands when frozen).
            m_particleDiameter = OxygenAtom.RADIUS * 2.9;
            m_minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / WATER_TRIPLE_POINT_IN_KELVIN;
            break;
          case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
            m_particleDiameter = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
            m_minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
            break;
          default:
            // Should never happen, so it should be debugged if it does.
            assert && assert( false );
        }
        // particle diameter.
        resetContainerSize();
        // locations and energy levels.
        initializeParticles( phase );
        // Notify listeners that the molecule type has changed.
        notifyMoleculeTypeChanged();
        notifyInteractionStrengthChanged();
      },
      getThermostatType: function() {
        return m_thermostatType;
      },
      setThermostatType: function( type ) {
        if ( (type == NO_THERMOSTAT) || (type == ISOKINETIC_THERMOSTAT) || (type == ANDERSEN_THERMOSTAT) || (type == ADAPTIVE_THERMOSTAT) ) {
          m_thermostatType = type;
        }
        else {
          throw new IllegalArgumentException( "Thermostat type setting out of range: " + type );
        }
      },
      getNormalizedContainerWidth: function() {
        return m_normalizedContainerWidth;
      },
      getNormalizedContainerHeight: function() {
        return m_normalizedContainerHeight;
      },
      getParticleContainerHeight: function() {
        return m_particleContainerHeight;
      },
      /**
       * Sets the target height of the container.  The target height is set
       * rather than the actual height because the model limits the rate at
       * which the height can changed.  The model will gradually move towards
       * the target height.
       *
       * @param desiredContainerHeight
       */
      setTargetParticleContainerHeight: function( desiredContainerHeight ) {
        desiredContainerHeight = MathUtil.clamp( m_minAllowableContainerHeight, desiredContainerHeight, StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT );
        m_targetContainerHeight = desiredContainerHeight;
      },
      /**
       * Get the sigma value, which is one of the two parameters that describes
       * the Lennard-Jones potential.
       *
       * @return
       */
      getSigma: function() {
        var sigma;
        switch( m_currentMolecule ) {
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
            System.err.println( "Error: Unrecognized molecule type when setting sigma value." );
            sigma = 0;
        }
        return sigma;
      },
      /**
       * Get the epsilon value, which is one of the two parameters that describes
       * the Lennard-Jones potential.
       *
       * @return
       */
      getEpsilon: function() {
        var epsilon;
        switch( m_currentMolecule ) {
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
            epsilon = convertScaledEpsilonToEpsilon( m_moleculeForceAndMotionCalculator.getScaledEpsilon() );
            break;
          default:
            System.err.println( "Error: Unrecognized molecule type when getting epsilon value." );
            epsilon = 0;
        }
        return epsilon;
      },
      setEpsilon: function( epsilon ) {
        if ( m_currentMolecule == StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
          if ( epsilon < MIN_ADJUSTABLE_EPSILON ) {
            epsilon = MIN_ADJUSTABLE_EPSILON;
          }
          else if ( epsilon > MAX_ADJUSTABLE_EPSILON ) {
            epsilon = MAX_ADJUSTABLE_EPSILON;
          }
          m_moleculeForceAndMotionCalculator.setScaledEpsilon( convertEpsilonToScaledEpsilon( epsilon ) );
          notifyInteractionStrengthChanged();
        }
        else {
          // used, so print and error message and ignore the request.
          System.err.println( "Error: Epsilon cannot be set when non-configurable molecule is in use." );
        }
      },
      getMoleculeDataSetRef: function() {
        return m_moleculeDataSet;
      },
//----------------------------------------------------------------------------
// Other Public Methods
//----------------------------------------------------------------------------
      reset: function() {
        initializeModelParameters();
        setMoleculeType( DEFAULT_MOLECULE );
        notifyResetOccurred();
      },
      /**
       * Set the phase of the particles in the simulation.
       *
       * @param state
       */
      setPhase: function( state ) {
        switch( state ) {
          case PHASE_SOLID:
            m_phaseStateChanger.setPhase( PhaseStateChanger.PHASE_SOLID );
            break;
          case PHASE_LIQUID:
            m_phaseStateChanger.setPhase( PhaseStateChanger.PHASE_LIQUID );
            break;
          case PHASE_GAS:
            m_phaseStateChanger.setPhase( PhaseStateChanger.PHASE_GAS );
            break;
          default:
            System.err.println( "Error: Invalid state specified." );
            // Treat it as a solid.
            m_phaseStateChanger.setPhase( PhaseStateChanger.PHASE_SOLID );
            break;
        }
        syncParticlePositions();
      },
      /**
       * Sets the amount of heating or cooling that the system is undergoing.
       *
       * @param normalizedHeatingCoolingAmount - Normalized amount of heating or cooling
       *                                       that the system is undergoing, ranging from -1 to +1.
       */
      setHeatingCoolingAmount: function( normalizedHeatingCoolingAmount ) {
        assert && assert( (normalizedHeatingCoolingAmount <= 1.0) && (normalizedHeatingCoolingAmount >= -1.0) );
        m_heatingCoolingAmount = normalizedHeatingCoolingAmount * MAX_TEMPERATURE_CHANGE_PER_ADJUSTMENT;
      },
      /**
       * Inject a new molecule of the current type into the model.  This uses
       * the current temperature to assign an initial velocity.
       */
      injectMolecule: function() {
        var injectionPointX = StatesOfMatterConstants.CONTAINER_BOUNDS.width / m_particleDiameter * INJECTION_POINT_HORIZ_PROPORTION;
        var injectionPointY = StatesOfMatterConstants.CONTAINER_BOUNDS.height / m_particleDiameter * INJECTION_POINT_VERT_PROPORTION;
        // Make sure that it is okay to inject a new molecule.
        if ( (m_moleculeDataSet.getNumberOfRemainingSlots() > 1) && (m_normalizedContainerHeight > injectionPointY * 1.05) && (!m_isExploded) ) {
          var angle = Math.PI + ((m_rand.nextDouble() - 0.5) * MAX_INJECTED_MOLECULE_ANGLE);
          var velocity = MIN_INJECTED_MOLECULE_VELOCITY + (m_rand.nextDouble() * (MAX_INJECTED_MOLECULE_VELOCITY - MIN_INJECTED_MOLECULE_VELOCITY));
          var xVel = Math.cos( angle ) * velocity;
          var yVel = Math.sin( angle ) * velocity;
          var atomsPerMolecule = m_moleculeDataSet.getAtomsPerMolecule();
          var moleculeCenterOfMassPosition = new Vector2( injectionPointX, injectionPointY );
          var moleculeVelocity = new Vector2( xVel, yVel );
          var moleculeRotationRate = (m_rand.nextDouble() - 0.5) * (Math.PI / 2);
          var atomPositions = new Vector2[atomsPerMolecule];
          for ( var i = 0; i < atomsPerMolecule; i++ ) {
            atomPositions[i] = new Vector2();
          }
          // Add the newly created molecule to the data set.
          m_moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate );
          // Position the atoms that comprise the molecules.
          m_atomPositionUpdater.updateAtomPositions( m_moleculeDataSet );
          if ( m_moleculeDataSet.getAtomsPerMolecule() == 1 ) {
            // Add particle to model set.
            var particle;
            switch( m_currentMolecule ) {
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
            m_particles.add( particle );
            notifyParticleAdded( particle );
          }
          else if ( m_moleculeDataSet.getAtomsPerMolecule() == 2 ) {
            assert && assert( m_currentMolecule == StatesOfMatterConstants.DIATOMIC_OXYGEN );
            // Add particles to model set.
            for ( var i = 0; i < atomsPerMolecule; i++ ) {
              var atom;
              atom = new OxygenAtom( 0, 0 );
              m_particles.add( atom );
              notifyParticleAdded( atom );
              atomPositions[i] = new Vector2();
            }
          }
          else if ( atomsPerMolecule == 3 ) {
            assert && assert( m_currentMolecule == StatesOfMatterConstants.WATER );
            // Add atoms to model set.
            var atom;
            atom = new OxygenAtom( 0, 0 );
            m_particles.add( atom );
            notifyParticleAdded( atom );
            atomPositions[0] = new Vector2();
            atom = new HydrogenAtom( 0, 0 );
            m_particles.add( atom );
            notifyParticleAdded( atom );
            atomPositions[1] = new Vector2();
            atom = new HydrogenAtom( 0, 0 );
            m_particles.add( atom );
            notifyParticleAdded( atom );
            atomPositions[2] = new Vector2();
          }
          if ( m_particles.size() == 1 ) {
            // temperature of zero.
            notifyTemperatureChanged();
          }
          syncParticlePositions();
        }
        // Recalculate the minimum allowable container size, since it depends on the number of particles.
        calculateMinAllowableContainerHeight();
      },
      addListener: function( listener ) {
        if ( m_listeners.contains( listener ) ) {
          // Don't bother re-adding.
          return;
        }
        m_listeners.add( listener );
      },
      removeListener: function( listener ) {
        return m_listeners.remove( listener );
      },
//----------------------------------------------------------------------------
// Private Methods
//----------------------------------------------------------------------------

      //private
      removeAllParticles: function() {
        // Get rid of any existing particles from the model set.
        for ( var m_particle in m_particles ) {
          var particle = m_particle;
          // any necessary cleanup.
          particle.removedFromModel();
        }
        m_particles.clear();
        // Get rid of the normalized particles.
        m_moleculeDataSet = null;
      },
      /**
       * Calculate the minimum allowable container height based on the current
       * number of particles.
       */

      //private
      calculateMinAllowableContainerHeight: function() {
        m_minAllowableContainerHeight = (m_moleculeDataSet.getNumberOfMolecules() / m_normalizedContainerWidth) * m_particleDiameter;
      },
      /**
       * Initialize the particles by calling the appropriate initialization
       * routine, which will set their positions, velocities, etc.
       */

      //private
      initializeParticles: function( phase ) {
        // Initialize the particles.
        switch( m_currentMolecule ) {
          case StatesOfMatterConstants.DIATOMIC_OXYGEN:
            initializeDiatomic( m_currentMolecule, phase );
            break;
          case StatesOfMatterConstants.NEON:
            initializeMonatomic( m_currentMolecule, phase );
            break;
          case StatesOfMatterConstants.ARGON:
            initializeMonatomic( m_currentMolecule, phase );
            break;
          case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
            initializeMonatomic( m_currentMolecule, phase );
            break;
          case StatesOfMatterConstants.WATER:
            initializeTriatomic( m_currentMolecule, phase );
            break;
          default:
            System.err.println( "ERROR: Unrecognized particle type, using default." );
            break;
        }
        // This is needed in case we were switching from another molecule
        notifyPressureChanged();
        // that was under pressure.
        calculateMinAllowableContainerHeight();
      },

      //private
      initializeModelParameters: function() {
        // Initialize the system parameters.
        m_gravitationalAcceleration = INITIAL_GRAVITATIONAL_ACCEL;
        m_heatingCoolingAmount = 0;
        m_tempAdjustTickCounter = 0;
        m_temperatureSetPoint = INITIAL_TEMPERATURE;
        setContainerExploded( false );
      },
      /**
       * Reset both the normalized and non-normalized sizes of the container.
       * Note that the particle diameter must be valid before this will work
       * properly.
       */

      //private
      resetContainerSize: function() {
        // Set the initial size of the container.
        m_particleContainerHeight = StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT;
        m_targetContainerHeight = StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT;
        m_normalizedContainerHeight = m_particleContainerHeight / m_particleDiameter;
        m_normalizedContainerWidth = StatesOfMatterConstants.PARTICLE_CONTAINER_WIDTH / m_particleDiameter;
        // Notify listeners.
        notifyContainerSizeChanged();
      },
      /**
       * Step the model.  There is no time step used, as a fixed internal time
       * step is assumed.
       */
      step: function() {
        if ( !m_isExploded ) {
          // Adjust the particle container height if needed.
          if ( m_targetContainerHeight != m_particleContainerHeight ) {
            m_heightChangeCounter = CONTAINER_SIZE_CHANGE_RESET_COUNT;
            var heightChange = m_targetContainerHeight - m_particleContainerHeight;
            if ( heightChange > 0 ) {
              // The container is growing.
              if ( m_particleContainerHeight + heightChange <= StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT ) {
                m_particleContainerHeight += Math.min( heightChange, MAX_PER_TICK_CONTAINER_EXPANSION );
              }
              else {
                m_particleContainerHeight = StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT;
              }
            }
            else {
              // The container is shrinking.
              if ( m_particleContainerHeight - heightChange >= m_minAllowableContainerHeight ) {
                m_particleContainerHeight += Math.max( heightChange, -MAX_PER_TICK_CONTAINER_SHRINKAGE );
              }
              else {
                m_particleContainerHeight = m_minAllowableContainerHeight;
              }
            }
            m_normalizedContainerHeight = m_particleContainerHeight / m_particleDiameter;
            notifyContainerSizeChanged();
          }
          else {
            if ( m_heightChangeCounter > 0 ) {
              m_heightChangeCounter--;
            }
          }
        }
        else {
          // size until the lid should be well off the screen.
          if ( m_particleContainerHeight < StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT * 10 ) {
            m_particleContainerHeight += MAX_PER_TICK_CONTAINER_EXPANSION;
            notifyContainerSizeChanged();
          }
        }
        // Record the pressure to see if it changes.
        var pressureBeforeAlgorithm = getModelPressure();
        // for each time step.
        for ( var i = 0; i < VERLET_CALCULATIONS_PER_CLOCK_TICK; i++ ) {
          m_moleculeForceAndMotionCalculator.updateForcesAndMotion();
          runThermostat();
        }
        // set).
        syncParticlePositions();
        // If the pressure changed, notify the listeners.
        if ( getModelPressure() != pressureBeforeAlgorithm ) {
          notifyPressureChanged();
        }
        // Adjust the temperature if needed.
        m_tempAdjustTickCounter++;
        if ( (m_tempAdjustTickCounter > TICKS_PER_TEMP_ADJUSTMENT) && m_heatingCoolingAmount != 0 ) {
          m_tempAdjustTickCounter = 0;
          var newTemperature = m_temperatureSetPoint + m_heatingCoolingAmount;
          if ( newTemperature >= MAX_TEMPERATURE ) {
            newTemperature = MAX_TEMPERATURE;
          }
          else if ( (newTemperature <= SOLID_TEMPERATURE * 0.9) && (m_heatingCoolingAmount < 0) ) {
            // Multiplier determined empirically.
            newTemperature = m_temperatureSetPoint * 0.95;
          }
          else if ( newTemperature <= m_minModelTemperature ) {
            newTemperature = m_minModelTemperature;
          }
          m_temperatureSetPoint = newTemperature;
          m_isoKineticThermostat.setTargetTemperature( m_temperatureSetPoint );
          m_andersenThermostat.setTargetTemperature( m_temperatureSetPoint );
          /*
           * TODO JPB TBD - This code causes temperature to decrease towards but
           * not reach absolute zero.  A decision was made on 10/7/2008 to
           * allow decreasing all the way to zero, so this is being removed.
           * It should be taken out permanently after a couple of months if
           * the decision stands.
           else if (m_temperatureSetPoint <= LOW_TEMPERATURE){
           // Below a certain threshold temperature decreases assymtotically
           // towards absolute zero without actually reaching it.
           m_temperatureSetPoint = (m_temperatureSetPoint - m_heatingCoolingAmount) * 0.95;
           }
           */
          notifyTemperatureChanged();
        }
      },
      /**
       * Run the appropriate thermostat based on the settings and the state of
       * the simulation.
       */

      //private
      runThermostat: function() {
        if ( m_isExploded ) {
          // just let those little particles run free!
          return;
        }
        var calculatedTemperature = m_moleculeForceAndMotionCalculator.getTemperature();
        var temperatureIsChanging = false;
        if ( (m_heatingCoolingAmount != 0) || (m_temperatureSetPoint + TEMPERATURE_CLOSENESS_RANGE < calculatedTemperature) || (m_temperatureSetPoint - TEMPERATURE_CLOSENESS_RANGE > calculatedTemperature) ) {
          temperatureIsChanging = true;
        }
        if ( m_heightChangeCounter != 0 && particlesNearTop() ) {
          // is used to set the system temperature set point.
          setTemperature( m_moleculeDataSet.calculateTemperatureFromKineticEnergy() );
        }
        else if ( (m_thermostatType == ISOKINETIC_THERMOSTAT) || (m_thermostatType == ADAPTIVE_THERMOSTAT && (temperatureIsChanging || m_temperatureSetPoint > LIQUID_TEMPERATURE)) ) {
          // Use the isokinetic thermostat.
          m_isoKineticThermostat.adjustTemperature();
        }
        else if ( (m_thermostatType == ANDERSEN_THERMOSTAT) || (m_thermostatType == ADAPTIVE_THERMOSTAT && !temperatureIsChanging) ) {
          // these circumstances.
          m_andersenThermostat.adjustTemperature();
        }
      },
      /**
       * Initialize the various model components to handle a simulation in which
       * all the molecules are single atoms.
       *
       * @param moleculeID
       */

      //private
      initializeMonatomic: function( moleculeID, phase ) {
        // Verify that a valid molecule ID was provided.
        assert && assert( (moleculeID == StatesOfMatterConstants.NEON) || (moleculeID == StatesOfMatterConstants.ARGON) || (moleculeID == StatesOfMatterConstants.USER_DEFINED_MOLECULE) );
        // molecules that can fit depends on the size of the individual.
        var particleDiameter;
        if ( moleculeID == StatesOfMatterConstants.NEON ) {
          particleDiameter = NeonAtom.RADIUS * 2;
        }
        else if ( moleculeID == StatesOfMatterConstants.ARGON ) {
          particleDiameter = ArgonAtom.RADIUS * 2;
        }
        else if ( moleculeID == StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
          particleDiameter = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
        }
        else {
          // Force it to neon.
          moleculeID = StatesOfMatterConstants.NEON;
          particleDiameter = NeonAtom.RADIUS * 2;
        }
        // container.
        var numberOfAtoms = Math.pow( Math.round( StatesOfMatterConstants.CONTAINER_BOUNDS.width / ((particleDiameter * 1.05) * 3) ), 2 );
        // Create the normalized data set for the one-atom-per-molecule case.
        m_moleculeDataSet = new MoleculeForceAndMotionDataSet( 1 );
        // Create the strategies that will work on this data set.
        m_phaseStateChanger = new MonatomicPhaseStateChanger( this );
        m_atomPositionUpdater = new MonatomicAtomPositionUpdater();
        m_moleculeForceAndMotionCalculator = new MonatomicVerletAlgorithm( this );
        m_isoKineticThermostat = new IsokineticThermostat( m_moleculeDataSet, m_minModelTemperature );
        m_andersenThermostat = new AndersenThermostat( m_moleculeDataSet, m_minModelTemperature );
        // Create the individual atoms and add them to the data set.
        for ( var i = 0; i < numberOfAtoms; i++ ) {
          // Create the atom.
          var moleculeCenterOfMassPosition = new Vector2();
          var moleculeVelocity = new Vector2();
          var atomPositions = new Vector2[1];
          atomPositions[0] = new Vector2();
          // Add the atom to the data set.
          m_moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0 );
          // Add particle to model set.
          var atom;
          if ( moleculeID == StatesOfMatterConstants.NEON ) {
            atom = new NeonAtom( 0, 0 );
          }
          else if ( moleculeID == StatesOfMatterConstants.ARGON ) {
            atom = new ArgonAtom( 0, 0 );
          }
          else if ( moleculeID == StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
            atom = new ConfigurableStatesOfMatterAtom( 0, 0 );
          }
          else {
            atom = new NeonAtom( 0, 0 );
          }
          m_particles.add( atom );
          notifyParticleAdded( atom );
        }
        // Initialize the particle positions according the to requested phase.
        setPhase( phase );
        // changing the epsilon value.
        if ( getMoleculeType() == StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
          setTemperature( SLUSH_TEMPERATURE );
        }
      },
      /**
       * Initialize the various model components to handle a simulation in which
       * each molecule consists of two atoms, e.g. oxygen.
       *
       * @param moleculeID
       */

      //private
      initializeDiatomic: function( moleculeID, phase ) {
        // Verify that a valid molecule ID was provided.
        assert && assert( (moleculeID == StatesOfMatterConstants.DIATOMIC_OXYGEN) );
        // molecules that can fit depends on the size of the individual atom.
        var numberOfAtoms = Math.pow( Math.round( StatesOfMatterConstants.CONTAINER_BOUNDS.width / ((OxygenAtom.RADIUS * 2.1) * 3) ), 2 );
        if ( numberOfAtoms % 2 != 0 ) {
          numberOfAtoms--;
        }
        var numberOfMolecules = numberOfAtoms / 2;
        // Create the normalized data set for the one-atom-per-molecule case.
        m_moleculeDataSet = new MoleculeForceAndMotionDataSet( 2 );
        // Create the strategies that will work on this data set.
        m_phaseStateChanger = new DiatomicPhaseStateChanger( this );
        m_atomPositionUpdater = new DiatomicAtomPositionUpdater();
        m_moleculeForceAndMotionCalculator = new DiatomicVerletAlgorithm( this );
        m_isoKineticThermostat = new IsokineticThermostat( m_moleculeDataSet, m_minModelTemperature );
        m_andersenThermostat = new AndersenThermostat( m_moleculeDataSet, m_minModelTemperature );
        // Create the individual atoms and add them to the data set.
        for ( var i = 0; i < numberOfMolecules; i++ ) {
          // Create the molecule.
          var moleculeCenterOfMassPosition = new Vector2();
          var moleculeVelocity = new Vector2();
          var atomPositions = new Vector2[2];
          atomPositions[0] = new Vector2();
          atomPositions[1] = new Vector2();
          // Add the atom to the data set.
          m_moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0 );
          // Add atoms to model set.
          var atom;
          atom = new OxygenAtom( 0, 0 );
          m_particles.add( atom );
          notifyParticleAdded( atom );
          atom = new OxygenAtom( 0, 0 );
          m_particles.add( atom );
          notifyParticleAdded( atom );
        }
        // Initialize the particle positions according the to requested phase.
        setPhase( phase );
      },
      /**
       * Initialize the various model components to handle a simulation in which
       * each molecule consists of three atoms, e.g. water.
       *
       * @param moleculeID
       */

      //private
      initializeTriatomic: function( moleculeID, phase ) {
        // Only water is supported so far.
        assert && assert( (moleculeID == StatesOfMatterConstants.WATER) );
        // molecules that can fit depends on the size of the individual atom.
        var waterMoleculeDiameter = OxygenAtom.RADIUS * 2.1;
        var moleculesAcrossBottom = Math.round( StatesOfMatterConstants.CONTAINER_BOUNDS.width / (waterMoleculeDiameter * 1.2) );
        var numberOfMolecules = Math.pow( moleculesAcrossBottom / 3, 2 );
        // Create the normalized data set for the one-atom-per-molecule case.
        m_moleculeDataSet = new MoleculeForceAndMotionDataSet( 3 );
        // Create the strategies that will work on this data set.
        m_phaseStateChanger = new WaterPhaseStateChanger( this );
        m_atomPositionUpdater = new WaterAtomPositionUpdater();
        m_moleculeForceAndMotionCalculator = new WaterVerletAlgorithm( this );
        m_isoKineticThermostat = new IsokineticThermostat( m_moleculeDataSet, m_minModelTemperature );
        m_andersenThermostat = new AndersenThermostat( m_moleculeDataSet, m_minModelTemperature );
        // Create the individual atoms and add them to the data set.
        for ( var i = 0; i < numberOfMolecules; i++ ) {
          // Create the molecule.
          var moleculeCenterOfMassPosition = new Vector2();
          var moleculeVelocity = new Vector2();
          var atomPositions = new Vector2[3];
          atomPositions[0] = new Vector2();
          atomPositions[1] = new Vector2();
          atomPositions[2] = new Vector2();
          // Add the atom to the data set.
          m_moleculeDataSet.addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0 );
          // Add atoms to model set.
          var atom;
          atom = new OxygenAtom( 0, 0 );
          m_particles.add( atom );
          notifyParticleAdded( atom );
          atom = new HydrogenAtom( 0, 0 );
          m_particles.add( atom );
          notifyParticleAdded( atom );
          // is more on this in the algorithm implementation for water.
          if ( i % 2 == 0 ) {
            atom = new HydrogenAtom( 0, 0 );
            m_particles.add( atom );
            notifyParticleAdded( atom );
          }
          else {
            atom = new HydrogenAtom2( 0, 0 );
            m_particles.add( atom );
            notifyParticleAdded( atom );
          }
        }
        // Initialize the particle positions according the to requested phase.
        setPhase( phase );
      },

      //private
      notifyResetOccurred: function() {
        for ( var listener in m_listeners ) {
          (listener).resetOccurred();
        }
      },

      //private
      notifyParticleAdded: function( particle ) {
        for ( var listener in m_listeners ) {
          (listener).particleAdded( particle );
        }
      },

      //private
      notifyTemperatureChanged: function() {
        for ( var listener in m_listeners ) {
          (listener).temperatureChanged();
        }
      },

      //private
      notifyPressureChanged: function() {
        for ( var listener in m_listeners ) {
          (listener).pressureChanged();
        }
      },

      //private
      notifyContainerSizeChanged: function() {
        for ( var listener in m_listeners ) {
          (listener).containerSizeChanged();
        }
      },

      //private
      notifyMoleculeTypeChanged: function() {
        for ( var listener in m_listeners ) {
          (listener).moleculeTypeChanged();
        }
      },

      //private
      notifyContainerExplodedStateChanged: function( containerExploded ) {
        for ( var listener in m_listeners ) {
          (listener).containerExplodedStateChanged( containerExploded );
        }
      },

      //private
      notifyInteractionStrengthChanged: function() {
        for ( var listener in m_listeners ) {
          (listener).interactionStrengthChanged();
        }
      },
      /**
       * Set the positions of the non-normalized particles based on the positions
       * of the normalized ones.
       */

      //private
      syncParticlePositions: function() {
        var positionMultiplier = m_particleDiameter;
        var atomPositions = m_moleculeDataSet.getAtomPositions();
        for ( var i = 0; i < m_moleculeDataSet.getNumberOfAtoms(); i++ ) {
          (m_particles.get( i )).setPosition( atomPositions[i].getX() * positionMultiplier, atomPositions[i].getY() * positionMultiplier );
        }
        if ( m_moleculeDataSet.getNumberOfAtoms() != m_particles.size() ) {
          console.log( "Inconsistent number of normalized versus non-normalized particles." );
        }
      },
      /**
       * Take the internal temperature value and convert it to Kelvin.  This
       * is dependent on the type of molecule selected.  The values and ranges
       * used in this method were derived from information provided by Paul
       * Beale.
       */

      //private
      convertInternalTemperatureToKelvin: function() {
        if ( m_particles.size() == 0 ) {
          // Temperature is reported as 0 if there are no particles.
          return 0;
        }
        var temperatureInKelvin;
        var triplePoint = 0;
        var criticalPoint = 0;
        switch( m_currentMolecule ) {
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
        if ( m_temperatureSetPoint <= m_minModelTemperature ) {
          // We treat anything below the minimum temperature as absolute zero.
          temperatureInKelvin = 0;
        }
        else if ( m_temperatureSetPoint < TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE ) {
          temperatureInKelvin = m_temperatureSetPoint * triplePoint / TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
          if ( temperatureInKelvin < 0.5 ) {
            // a value until we actually reach the minimum internal temperature.
            temperatureInKelvin = 0.5;
          }
        }
        else if ( m_temperatureSetPoint < CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE ) {
          var slope = (criticalPoint - triplePoint) / (CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE - TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE);
          var offset = triplePoint - (slope * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE);
          temperatureInKelvin = m_temperatureSetPoint * slope + offset;
        }
        else {
          temperatureInKelvin = m_temperatureSetPoint * criticalPoint / CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
        }
        return temperatureInKelvin;
      },
      /**
       * Take the internal pressure value and convert it to atmospheres.  This
       * is dependent on the type of molecule selected.  The values and ranges
       * used in this method were derived from information provided by Paul
       * Beale.
       *
       * @return
       */
      getPressureInAtmospheres: function() {
        var pressureInAtmospheres;
        switch( m_currentMolecule ) {
          case StatesOfMatterConstants.NEON:
            pressureInAtmospheres = 200 * getModelPressure();
            break;
          case StatesOfMatterConstants.ARGON:
            pressureInAtmospheres = 125 * getModelPressure();
            break;
          case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
            // Using the value for Argon at the moment.
            pressureInAtmospheres = 125 * getModelPressure();
            break;
          case StatesOfMatterConstants.WATER:
            pressureInAtmospheres = 200 * getModelPressure();
            break;
          case StatesOfMatterConstants.DIATOMIC_OXYGEN:
            pressureInAtmospheres = 125 * getModelPressure();
            break;
          default:
            pressureInAtmospheres = 0;
            break;
        }
        return pressureInAtmospheres;
      },
      /**
       * Determine whether there are particles close to the top of the
       * container.  This can be important for determining whether movement
       * of the top is causing temperature changes.
       *
       * @return - true if particles are close, false if not
       */

      //private
      particlesNearTop: function() {
        var moleculesPositions = m_moleculeDataSet.getMoleculeCenterOfMassPositions();
        var threshold = m_normalizedContainerHeight - PARTICLE_EDGE_PROXIMITY_RANGE;
        var particlesNearTop = false;
        for ( var i = 0; i < m_moleculeDataSet.getNumberOfMolecules(); i++ ) {
          if ( moleculesPositions[i].getY() > threshold ) {
            particlesNearTop = true;
            break;
          }
        }
        return particlesNearTop;
      },
      /**
       * Return a phase value based on the current temperature.
       *
       * @return
       */

      //private
      mapTemperatureToPhase: function() {
        var phase;
        if ( m_temperatureSetPoint < SOLID_TEMPERATURE + ((LIQUID_TEMPERATURE - SOLID_TEMPERATURE) / 2) ) {
          phase = PHASE_SOLID;
        }
        else if ( m_temperatureSetPoint < LIQUID_TEMPERATURE + ((GAS_TEMPERATURE - LIQUID_TEMPERATURE) / 2) ) {
          phase = PHASE_LIQUID;
        }
        else {
          phase = PHASE_GAS;
        }
        return phase;
      },
      /**
       * Convert a value for epsilon that is in the real range of values into a
       * scaled value that is suitable for use with the motion and force
       * calculators.
       */

      //private
      convertEpsilonToScaledEpsilon: function( epsilon ) {
        // roughly matched that of the existing monatomic molecules.
        return epsilon / (StatesOfMatterConstants.MAX_EPSILON / 2);
      },

      //private
      convertScaledEpsilonToEpsilon: function( scaledEpsilon ) {
        var epsilon = scaledEpsilon * StatesOfMatterConstants.MAX_EPSILON / 2;
        return epsilon;
      }
    },
//statics
    {
      SOLID_TEMPERATURE: SOLID_TEMPERATURE,
      SLUSH_TEMPERATURE: SLUSH_TEMPERATURE,
      LIQUID_TEMPERATURE: LIQUID_TEMPERATURE,
      GAS_TEMPERATURE: GAS_TEMPERATURE,
      DEFAULT_MOLECULE: DEFAULT_MOLECULE,
      INITIAL_TEMPERATURE: INITIAL_TEMPERATURE,
      MAX_TEMPERATURE: MAX_TEMPERATURE,
      MIN_TEMPERATURE: MIN_TEMPERATURE,
      MAX_GRAVITATIONAL_ACCEL: MAX_GRAVITATIONAL_ACCEL,
      PHASE_SOLID: PHASE_SOLID,
      PHASE_LIQUID: PHASE_LIQUID,
      PHASE_GAS: PHASE_GAS,
      NO_THERMOSTAT: NO_THERMOSTAT,
      ISOKINETIC_THERMOSTAT: ISOKINETIC_THERMOSTAT,
      ANDERSEN_THERMOSTAT: ANDERSEN_THERMOSTAT,
      ADAPTIVE_THERMOSTAT: ADAPTIVE_THERMOSTAT,
      TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE: TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE,
      CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE: CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE,
      MIN_ADJUSTABLE_EPSILON: MIN_ADJUSTABLE_EPSILON,
      MAX_ADJUSTABLE_EPSILON: MAX_ADJUSTABLE_EPSILON
    } );
} );

