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

  // constants (these are vars because other constants refer to them)
  var PARTICLE_CONTAINER_WIDTH = 10000;
  var PARTICLE_CONTAINER_INITIAL_HEIGHT = PARTICLE_CONTAINER_WIDTH * 1.00;
  var SOLID_TEMPERATURE = 0.15;

  return {
    // Maximum number of atoms that can be simulated.
    MAX_NUM_ATOMS: 500,

    // Dimensions of the container in which the particles will reside, in picometers.
    PARTICLE_CONTAINER_WIDTH: PARTICLE_CONTAINER_WIDTH,
    PARTICLE_CONTAINER_INITIAL_HEIGHT: PARTICLE_CONTAINER_INITIAL_HEIGHT,
    CONTAINER_BOUNDS: new Bounds2( 0, 0, PARTICLE_CONTAINER_WIDTH, PARTICLE_CONTAINER_INITIAL_HEIGHT ),

    // Dimensions of container in view coordinates
    VIEW_CONTAINER_WIDTH: 250,
    VIEW_CONTAINER_HEIGHT: 250,

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

    // Constants used to describe the the spatial relationship between
    THETA_HOH: 120 * Math.PI / 180,  // This is not quite the real value for a water
    // molecule, but it is close and worked better in
    // the simulation.
    DISTANCE_FROM_OXYGEN_TO_HYDROGEN: 1.0 / 3.12,  // Number supplied by Paul Beale.

    // Distance between diatomic pairs.
    DIATOMIC_PARTICLE_DISTANCE: 0.9,  // In particle diameters.


    //----------------------------------------------------------------------------
    // Physical Constants
    //----------------------------------------------------------------------------
    K_BOLTZMANN: 1.38E-23, // Boltzmann's constant.

    // Constants moved from MultipleParticleModel
    SOLID_TEMPERATURE: SOLID_TEMPERATURE,
    SLUSH_TEMPERATURE: 0.33,
    LIQUID_TEMPERATURE: 0.34,
    GAS_TEMPERATURE: 1.0,
    INITIAL_TEMPERATURE: SOLID_TEMPERATURE
  };
} );