// Copyright 2002-2013, University of Colorado Boulder

/**
 * This class is a collection of constants that configure global properties.
 * If you change something here, it will change *everywhere* in this simulation.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Element = require( 'NITROGLYCERIN/Element' );

  // constants (these are vars because other constants refer to them)
  var PARTICLE_CONTAINER_WIDTH = 10000;
  var PARTICLE_CONTAINER_INITIAL_HEIGHT = PARTICLE_CONTAINER_WIDTH * 1.00;
  var SOLID_TEMPERATURE = 0.15;
  var NEON_ATOM_EPSILON = 32.8; // epsilon/k-Boltzmann is in Kelvin.
  var NEON_TRIPLE_POINT_IN_KELVIN = 23;   // Tweaked a little from actual value for better temperature mapping.
  var NEON_CRITICAL_POINT_IN_KELVIN = 44;
  var ARGON_TRIPLE_POINT_IN_KELVIN = 75;  // Tweaked a little from actual value for better temperature mapping.
  var ARGON_CRITICAL_POINT_IN_KELVIN = 151;
  var O2_TRIPLE_POINT_IN_KELVIN = 54;
  var O2_CRITICAL_POINT_IN_KELVIN = 155;
  var WATER_TRIPLE_POINT_IN_KELVIN = 273;
  var WATER_CRITICAL_POINT_IN_KELVIN = 647;

  return {

    SCREEN_VIEW_OPTIONS: { layoutBounds: new Bounds2( 0, 0, 834, 504 ) },

    TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE: 0.26,    // Empirically determined.
    CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE: 0.8,  // Empirically determined.
    NEON_TRIPLE_POINT_IN_KELVIN: NEON_TRIPLE_POINT_IN_KELVIN,  // Tweaked a little from actual value for better temperature mapping.
    NEON_CRITICAL_POINT_IN_KELVIN: NEON_CRITICAL_POINT_IN_KELVIN,
    ARGON_TRIPLE_POINT_IN_KELVIN: ARGON_TRIPLE_POINT_IN_KELVIN, // Tweaked a little from actual value for better temperature mapping.
    ARGON_CRITICAL_POINT_IN_KELVIN: ARGON_CRITICAL_POINT_IN_KELVIN,
    O2_TRIPLE_POINT_IN_KELVIN: O2_TRIPLE_POINT_IN_KELVIN,
    O2_CRITICAL_POINT_IN_KELVIN: O2_CRITICAL_POINT_IN_KELVIN,
    WATER_TRIPLE_POINT_IN_KELVIN: WATER_TRIPLE_POINT_IN_KELVIN,
    WATER_CRITICAL_POINT_IN_KELVIN: WATER_CRITICAL_POINT_IN_KELVIN,

    // Maximum number of atoms that can be simulated.
    MAX_NUM_ATOMS: 500,

    // Dimensions of the container in which the particles will reside, in picometers.
    PARTICLE_CONTAINER_WIDTH: PARTICLE_CONTAINER_WIDTH,
    PARTICLE_CONTAINER_INITIAL_HEIGHT: PARTICLE_CONTAINER_INITIAL_HEIGHT,
    CONTAINER_BOUNDS: new Bounds2( 0, 0, PARTICLE_CONTAINER_WIDTH, PARTICLE_CONTAINER_INITIAL_HEIGHT ),

    // Dimensions of container in view coordinates
    VIEW_CONTAINER_WIDTH: 280,
    VIEW_CONTAINER_HEIGHT: 285,

    // Maximum temperature, in degrees Kelvin, that the Thermometer will display.
    MAX_DISPLAYED_TEMPERATURE: 1000,

    // Identifiers for the various supported molecules.
    NEON: 1,
    ARGON: 2,
    MONATOMIC_OXYGEN: 3,
    DIATOMIC_OXYGEN: 4,
    WATER: 5,
    USER_DEFINED_MOLECULE: 6,

    // Lennard-Jones potential interaction values for multiatomic atoms.
    EPSILON_FOR_DIATOMIC_OXYGEN: 113, // Epsilon/k-Boltzmann is in Kelvin.
    SIGMA_FOR_DIATOMIC_OXYGEN: 365,   // In picometers.
    EPSILON_FOR_WATER: 200,           // Epsilon/k-Boltzmann is in Kelvin.
    SIGMA_FOR_WATER: 444,             // In picometers.

    // Max and min values for parameters of Lennard-Jones potential
    // calculations.  These are used in places were non-normalized LJ
    // calculations are made, graphed, and otherwise controlled.
    MAX_SIGMA: 500,      // In picometers.
    MIN_SIGMA: 75,       // In picometers.
    MAX_EPSILON: 450,    // Epsilon/k-Boltzmann is in Kelvin.
    MIN_EPSILON: 20,     // Epsilon/k-Boltzmann is in Kelvin.

    // constants used to describe the the spatial relationship between
    THETA_HOH: ( 120 * Math.PI / 180 ),  // This is not quite the real value for a water

    // molecule, but it is close and worked better in
    // the simulation.
    DISTANCE_FROM_OXYGEN_TO_HYDROGEN: 1.0 / 3.12,  // Number supplied by Paul Beale.

    // Distance between diatomic pairs.
    DIATOMIC_PARTICLE_DISTANCE: 0.9,  // In particle diameters.

    // atoms and molecules colors
    OXYGEN_COLOR: Element.O.color.toCSS(), // TODO: handled uniquely until Element is fixed, see https://github.com/phetsims/nitroglycerin/issues/8
    NEON_COLOR: Element.Ne.color,
    ARGON_COLOR: Element.Ar.color,
    HYDROGEN_COLOR: Element.H.color,
    ADJUSTABLE_ATTRACTION_COLOR: '#CC66CC',

    // adjustable attraction min epsilon
    MIN_ADJUSTABLE_EPSILON: (1.5 * NEON_ATOM_EPSILON),

    //----------------------------------------------------------------------------
    // Physical Constants
    //----------------------------------------------------------------------------
    K_BOLTZMANN: 1.38E-23, // Boltzmann's constant.

    // constants moved from MultipleParticleModel
    SOLID_TEMPERATURE: SOLID_TEMPERATURE,
    SLUSH_TEMPERATURE: 0.33,
    LIQUID_TEMPERATURE: 0.34,
    GAS_TEMPERATURE: 1.0,
    INITIAL_TEMPERATURE: SOLID_TEMPERATURE
  };
} );