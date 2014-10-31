// Copyright 2002-2011, University of Colorado
/**
 * This class is a collection of constants that configure global properties.
 * If you change something here, it will change *everywhere* in this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'KITE/Rectangle' );
  var FrameSetup = require( 'edu.colorado.phet.common.phetcommon.view.util.FrameSetup' );

//----------------------------------------------------------------------------
// Application
//----------------------------------------------------------------------------
// Project name and flavors
  var PROJECT_NAME = "states-of-matter";
  var FLAVOR_STATES_OF_MATTER = "states-of-matter";
  var FLAVOR_STATES_OF_MATTER_BASICS = "states-of-matter-basics";
  var FLAVOR_INTERACTION_POTENTIAL = "atomic-interactions";
  var FRAME_SETUP = new FrameSetup.CenteredWithSize( 1024, 768 );
//----------------------------------------------------------------------------
// Paints
//----------------------------------------------------------------------------
// Color of the "play area"
  var CANVAS_BACKGROUND = Color.BLACK;
// Color of labels placed directly on the play area
  var CONTROL_PANEL_COLOR = new Color( 210, 210, 210 );
//----------------------------------------------------------------------------
// Simulation Control
//----------------------------------------------------------------------------
// Maximum number of atoms that can be simulated.
  var MAX_NUM_ATOMS = 500;
// Dimensions of the container in which the particles will reside, in picometers.
  var PARTICLE_CONTAINER_WIDTH = 10000;
  var PARTICLE_CONTAINER_INITIAL_HEIGHT = PARTICLE_CONTAINER_WIDTH * 1.00;
  var CONTAINER_BOUNDS = new Rectangle.Number( 0, 0, PARTICLE_CONTAINER_WIDTH, PARTICLE_CONTAINER_INITIAL_HEIGHT );
// Maximum temperature, in degrees Kelvin, that the Thermometer will display.
  var MAX_DISPLAYED_TEMPERATURE = 1000;
// Identifiers for the various supported molecules.
  var NEON = 1;
  var ARGON = 2;
  var MONATOMIC_OXYGEN = 3;
  var DIATOMIC_OXYGEN = 4;
  var WATER = 5;
  var USER_DEFINED_MOLECULE = 6;
// Lennard-Jones potential interaction values for multiatomic atoms.
// Epsilon/k-Boltzmann is in Kelvin.
  var EPSILON_FOR_DIATOMIC_OXYGEN = 113;
// In picometers.
  var SIGMA_FOR_DIATOMIC_OXYGEN = 365;
// Epsilon/k-Boltzmann is in Kelvin.
  var EPSILON_FOR_WATER = 200;
// In picometers.
  var SIGMA_FOR_WATER = 444;
// Max and min values for parameters of Lennard-Jones potential 
// calculations.  These are used in places were non-normalized LJ
// calculations are made, graphed, and otherwise controlled.
// In picometers.
  var MAX_SIGMA = 500;
// In picometers.
  var MIN_SIGMA = 75;
// Epsilon/k-Boltzmann is in Kelvin.
  var MAX_EPSILON = 450;
// Epsilon/k-Boltzmann is in Kelvin.
  var MIN_EPSILON = 20;
// Constants used to describe the the spatial relationship between 
// This is not quite the real value for a water
  var THETA_HOH = 120 * Math.PI / 180;
// molecule, but it is close and worked better in
// the simulation.
// Number supplied by Paul Beale.
  var DISTANCE_FROM_OXYGEN_TO_HYDROGEN = 1.0 / 3.12;
// Distance between diatomic pairs.
// In particle diameters.
  var DIATOMIC_PARTICLE_DISTANCE = 0.9;
//----------------------------------------------------------------------------
// Physical Constants
//----------------------------------------------------------------------------
// Boltzmann's constant.
  var K_BOLTZMANN = 1.38E-23;
//----------------------------------------------------------------------------
// Images
//----------------------------------------------------------------------------
  var PUSH_PIN_IMAGE = "push-pin.png";
  var ICE_CUBE_IMAGE = "ice-cube.png";
  var LIQUID_IMAGE = "liquid-in-cup.png";
  var GAS_IMAGE = "gas.png";
  /* Not intended for instantiation. */

  //private
  function StatesOfMatterConstants() {
  }

//----------------------------------------------------------------------------
// Cursors
//----------------------------------------------------------------------------

  return inherit( Object, StatesOfMatterConstants, {
    },
//statics
    {
      PROJECT_NAME: PROJECT_NAME,
      FLAVOR_STATES_OF_MATTER: FLAVOR_STATES_OF_MATTER,
      FLAVOR_STATES_OF_MATTER_BASICS: FLAVOR_STATES_OF_MATTER_BASICS,
      FLAVOR_INTERACTION_POTENTIAL: FLAVOR_INTERACTION_POTENTIAL,
      FRAME_SETUP: FRAME_SETUP,
      CANVAS_BACKGROUND: CANVAS_BACKGROUND,
      CONTROL_PANEL_COLOR: CONTROL_PANEL_COLOR,
      MAX_NUM_ATOMS: MAX_NUM_ATOMS,
      PARTICLE_CONTAINER_WIDTH: PARTICLE_CONTAINER_WIDTH,
      PARTICLE_CONTAINER_INITIAL_HEIGHT: PARTICLE_CONTAINER_INITIAL_HEIGHT,
      CONTAINER_BOUNDS: CONTAINER_BOUNDS,
      MAX_DISPLAYED_TEMPERATURE: MAX_DISPLAYED_TEMPERATURE,
      NEON: NEON,
      ARGON: ARGON,
      MONATOMIC_OXYGEN: MONATOMIC_OXYGEN,
      DIATOMIC_OXYGEN: DIATOMIC_OXYGEN,
      WATER: WATER,
      USER_DEFINED_MOLECULE: USER_DEFINED_MOLECULE,
      EPSILON_FOR_DIATOMIC_OXYGEN: EPSILON_FOR_DIATOMIC_OXYGEN,
      SIGMA_FOR_DIATOMIC_OXYGEN: SIGMA_FOR_DIATOMIC_OXYGEN,
      EPSILON_FOR_WATER: EPSILON_FOR_WATER,
      SIGMA_FOR_WATER: SIGMA_FOR_WATER,
      MAX_SIGMA: MAX_SIGMA,
      MIN_SIGMA: MIN_SIGMA,
      MAX_EPSILON: MAX_EPSILON,
      MIN_EPSILON: MIN_EPSILON,
      THETA_HOH: THETA_HOH,
      DISTANCE_FROM_OXYGEN_TO_HYDROGEN: DISTANCE_FROM_OXYGEN_TO_HYDROGEN,
      DIATOMIC_PARTICLE_DISTANCE: DIATOMIC_PARTICLE_DISTANCE,
      K_BOLTZMANN: K_BOLTZMANN,
      PUSH_PIN_IMAGE: PUSH_PIN_IMAGE,
      ICE_CUBE_IMAGE: ICE_CUBE_IMAGE,
      LIQUID_IMAGE: LIQUID_IMAGE,
      GAS_IMAGE: GAS_IMAGE
    } );
} );

