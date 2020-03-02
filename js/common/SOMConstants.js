// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class is a collection of constants that configure global properties. If you change something here, it will
 * change *everywhere* in this simulation.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Element from '../../../nitroglycerin/js/Element.js';
import statesOfMatter from '../statesOfMatter.js';

// constants (these are vars because other constants refer to them)
const SOLID_TEMPERATURE = 0.15;
const NEON_ATOM_EPSILON = 32.8; // epsilon/k-Boltzmann is in Kelvin.
const EPSILON_FOR_WATER = 200; // epsilon/k-Boltzmann is in Kelvin.

const SOMConstants = {

  MAX_DT: 0.320, // seconds, max time step (delta time), this is 20x the nominal step 0f 16ms

  SCREEN_VIEW_OPTIONS: { layoutBounds: new Bounds2( 0, 0, 834, 504 ) },

  TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE: 0.26, // empirically determined
  CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE: 0.8, // empirically determined
  TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE: 0.3, // empirically determined
  CRITICAL_POINT_DIATOMIC_MODEL_TEMPERATURE: 1.5, // empirically determined
  TRIPLE_POINT_WATER_MODEL_TEMPERATURE: 0.28, // empirically determined
  CRITICAL_POINT_WATER_MODEL_TEMPERATURE: 2.0, // empirically determined
  NEON_TRIPLE_POINT_IN_KELVIN: 24.5,
  NEON_CRITICAL_POINT_IN_KELVIN: 45,
  ARGON_TRIPLE_POINT_IN_KELVIN: 75, // Tweaked a little from actual value for better temperature mapping.
  ARGON_CRITICAL_POINT_IN_KELVIN: 151,
  O2_TRIPLE_POINT_IN_KELVIN: 54,
  O2_CRITICAL_POINT_IN_KELVIN: 155,
  WATER_TRIPLE_POINT_IN_KELVIN: 273,
  WATER_CRITICAL_POINT_IN_KELVIN: 647,

  // Maximum number of atoms that can be simulated.
  MAX_NUM_ATOMS: 500,

  // size of container in view, empirically determined
  VIEW_CONTAINER_WIDTH: 280,

  // Lennard-Jones potential interaction values for multi-atomic atoms.
  EPSILON_FOR_WATER: EPSILON_FOR_WATER,
  SIGMA_FOR_WATER: 444,             // In picometers.
  EPSILON_FOR_DIATOMIC_OXYGEN: 113, // Epsilon/k-Boltzmann is in Kelvin.
  SIGMA_FOR_DIATOMIC_OXYGEN: 365,   // In picometers.

  // Max and min values for parameters of Lennard-Jones potential calculations.  These are used in places were non-
  // normalized LJ calculations are made, graphed, and otherwise used.
  MAX_SIGMA: 500,      // In picometers.
  MIN_SIGMA: 75,       // In picometers.
  MAX_EPSILON: 450,    // Epsilon/k-Boltzmann is in Kelvin.
  MIN_EPSILON: 20,     // Epsilon/k-Boltzmann is in Kelvin.

  // constants used to describe the spatial relationship between the atoms that comprise a water molecule
  THETA_HOH: ( 120 * Math.PI / 180 ),  // This is not quite the real value for a water

  // Distance from oxygen to hydrogen in water molecules.  This is not exactly accurate, but it is close and worked
  // better in the simulation than the actual value.
  DISTANCE_FROM_OXYGEN_TO_HYDROGEN: 1.0 / 3.12,  // Number supplied by Paul Beale.

  // Distance between diatomic pairs.
  DIATOMIC_PARTICLE_DISTANCE: 0.9,  // In particle diameters.

  // atoms colors
  OXYGEN_COLOR: Element.O.color.toCSS(),
  NEON_COLOR: Element.Ne.color,
  ARGON_COLOR: Element.Ar.color,
  HYDROGEN_COLOR: Element.H.color,
  ADJUSTABLE_ATTRACTION_COLOR: '#CC66CC',

  // adjustable attraction min and max epsilon values, chosen empirically based on how the interaction looks
  MIN_ADJUSTABLE_EPSILON: ( 1.5 * NEON_ATOM_EPSILON ),
  MAX_ADJUSTABLE_EPSILON: EPSILON_FOR_WATER * 1.7,

  // physical constants
  K_BOLTZMANN: 1.38E-23, // Boltzmann's constant.

  // constants moved from MultipleParticleModel
  SOLID_TEMPERATURE: SOLID_TEMPERATURE,
  LIQUID_TEMPERATURE: 0.34,
  GAS_TEMPERATURE: 1.0,
  INITIAL_TEMPERATURE: SOLID_TEMPERATURE,

  // misc
  RESET_ALL_BUTTON_RADIUS: 17,
  RESET_ALL_BUTTON_DISTANCE_FROM_SIDE: 15,
  RESET_ALL_BUTTON_DISTANCE_FROM_BOTTOM: 5,
  PANEL_CORNER_RADIUS: 6,
  NOMINAL_TIME_STEP: 1 / 60, // seconds, the expected delta time (dt) value per model step, based on nominal browser frame rate
  PLAY_PAUSE_BUTTON_RADIUS: 18,
  STEP_BUTTON_RADIUS: 12
};

statesOfMatter.register( 'SOMConstants', SOMConstants );

export default SOMConstants;