// Copyright 2014-2021, University of Colorado Boulder

/**
 * This singleton is a collection of constants that are used in multiple places throughout the simulation.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Element from '../../../nitroglycerin/js/Element.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color } from '../../../scenery/js/imports.js';
import statesOfMatter from '../statesOfMatter.js';
import AtomType from './model/AtomType.js';
import SOMColors from './view/SOMColors.js';

// constants (these are vars because other constants refer to them)
const SOLID_TEMPERATURE = 0.15;
const NEON_ATOM_EPSILON = 32.8; // epsilon/k-Boltzmann is in Kelvin.
const EPSILON_FOR_WATER = 200; // epsilon/k-Boltzmann is in Kelvin.
const NEON_RADIUS = Element.Ne.vanDerWaalsRadius;
const ARGON_RADIUS = Element.Ar.vanDerWaalsRadius;
const OXYGEN_RADIUS = Element.O.vanDerWaalsRadius;
const HYDROGEN_RADIUS = Element.H.vanDerWaalsRadius;
const ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS = 175;
const OXYGEN_COLOR = new Color( Element.O.color );
const NEON_COLOR = new Color( Element.Ne.color );
const ARGON_COLOR = new Color( Element.Ar.color );
const HYDROGEN_COLOR = new Color( Element.H.color );
const ADJUSTABLE_ATTRACTION_COLOR = new Color( '#CC66CC' );

// set up map of atom types to attributes, can't use constructor due to lack of support in IE
const MAP_ATOM_TYPE_TO_ATTRIBUTES = new Map(); // {key:AtomType, value:Object}
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.NEON,
  {
    radius: NEON_RADIUS, // in picometers
    mass: Element.Ne.atomicWeight, // in atomic mass units,
    color: NEON_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.ARGON,
  {
    radius: ARGON_RADIUS, // in picometers
    mass: Element.Ar.atomicWeight, // in atomic mass units,
    color: ARGON_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.OXYGEN,
  {
    radius: OXYGEN_RADIUS, // in picometers
    mass: Element.O.atomicWeight, // in atomic mass units,
    color: OXYGEN_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.HYDROGEN,
  {
    radius: HYDROGEN_RADIUS, // in picometers
    mass: Element.H.atomicWeight, // in atomic mass units,
    color: HYDROGEN_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.ADJUSTABLE,
  {
    radius: ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS, // in picometers
    mass: 25, // in atomic mass units,
    color: ADJUSTABLE_ATTRACTION_COLOR
  }
);

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

  // atom colors
  OXYGEN_COLOR: OXYGEN_COLOR,
  NEON_COLOR: NEON_COLOR,
  ARGON_COLOR: ARGON_COLOR,
  HYDROGEN_COLOR: HYDROGEN_COLOR,
  ADJUSTABLE_ATTRACTION_COLOR: ADJUSTABLE_ATTRACTION_COLOR,

  // atom radii, in picometers
  OXYGEN_RADIUS: OXYGEN_RADIUS,
  NEON_RADIUS: NEON_RADIUS,
  ARGON_RADIUS: ARGON_RADIUS,
  HYDROGEN_RADIUS: HYDROGEN_RADIUS,
  ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS: ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS,

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

  // map of atom types to the attributes needed in this sim, can't use constructor due to limitations in IE
  MAP_ATOM_TYPE_TO_ATTRIBUTES: MAP_ATOM_TYPE_TO_ATTRIBUTES,

  // slider options that are common to the sliders that are used to control the attraction level between atoms
  ADJUSTABLE_ATTRACTION_SLIDER_COMMON_OPTIONS: {
    majorTickLength: 15,
    majorTickStroke: SOMColors.controlPanelTextProperty,
    minorTickStroke: SOMColors.controlPanelTextProperty,
    thumbSize: new Dimension2( 14, 25 ),
    thumbFill: new Color( '#A670DB' ),
    thumbFillHighlighted: new Color( '#D966FF' ),
    thumbCenterLineStroke: Color.BLACK,
    thumbTouchAreaXDilation: 8,
    thumbTouchAreaYDilation: 8,
    trackFill: Color.WHITE,
    trackStroke: SOMColors.controlPanelTextProperty
  },
  SLIDER_TICK_TEXT_FONT: new PhetFont( 10 ),

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