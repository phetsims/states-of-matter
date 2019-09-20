// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas)
 * for a set of water molecules.  It only works for water and would need to be
 * generalized to handle other triatomic molecules.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const AbstractPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/AbstractPhaseStateChanger' );
  const inherit = require( 'PHET_CORE/inherit' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  const WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

  /**
   * @param { MultipleParticleModel } multipleParticleModel - model of a set of particles
   * @constructor
   */
  function WaterPhaseStateChanger( multipleParticleModel ) {

    // Make sure this is not being used on an inappropriate data set.
    assert && assert( multipleParticleModel.moleculeDataSet.getAtomsPerMolecule() === 3 );

    AbstractPhaseStateChanger.call( this, multipleParticleModel );

    // @private
    this.multipleParticleModel = multipleParticleModel;
    this.positionUpdater = WaterAtomPositionUpdater; // @private
  }

  // Initial positions for liquid phase, which is hard to create algorithmically.  These were created by setting the
  // appropriate temperature and iterating until a visually acceptable configuration emerged, then capturing a
  // "snapshot" of the state.
  const LIQUID_INITIAL_STATES = {
    water: {
      numberOfMolecules: 76,
      atomsPerMolecule: 3,
      moleculeCenterOfMassPositions: [
        { x: 12.381, y: 4.629 },
        { x: 13.644, y: 4.597 },
        { x: 10.621, y: 5.919 },
        { x: 11.376, y: 4.902 },
        { x: 10.669, y: 2.71 },
        { x: 12.132, y: 3.394 },
        { x: 14.683, y: 4.87 },
        { x: 12.912, y: 5.477 },
        { x: 11.272, y: 6.801 },
        { x: 10.322, y: 4.714 },
        { x: 9.201, y: 4.436 },
        { x: 11.122, y: 3.863 },
        { x: 9.581, y: 2.633 },
        { x: 11.684, y: 2.388 },
        { x: 12.844, y: 2.48 },
        { x: 13.237, y: 3.497 },
        { x: 15.372, y: 3.954 },
        { x: 11.908, y: 5.989 },
        { x: 5.837, y: 4.901 },
        { x: 7.994, y: 4.119 },
        { x: 6.868, y: 4.109 },
        { x: 8.679, y: 3.4 },
        { x: 8.531, y: 2.256 },
        { x: 10.043, y: 3.65 },
        { x: 8.134, y: 1.166 },
        { x: 9.22, y: 1.453 },
        { x: 10.303, y: 1.702 },
        { x: 11.345, y: 1.454 },
        { x: 13.96, y: 2.581 },
        { x: 15.151, y: 2.95 },
        { x: 14.386, y: 3.706 },
        { x: 15.801, y: 4.975 },
        { x: 17.221, y: 4.942 },
        { x: 9.662, y: 6.371 },
        { x: 4.505, y: 3.302 },
        { x: 4.53, y: 4.331 },
        { x: 6.494, y: 2.887 },
        { x: 3.225, y: 4.523 },
        { x: 5.492, y: 2.539 },
        { x: 3.494, y: 3.416 },
        { x: 4.329, y: 2.141 },
        { x: 6.293, y: 1.843 },
        { x: 7.402, y: 2.036 },
        { x: 12.408, y: 1.512 },
        { x: 13.67, y: 1.588 },
        { x: 14.839, y: 1.848 },
        { x: 15.926, y: 2.135 },
        { x: 15.563, y: 1.035 },
        { x: 16.548, y: 4.116 },
        { x: 17.583, y: 3.739 },
        { x: 19.331, y: 2.352 },
        { x: 20.358, y: 2.634 },
        { x: 14.971, y: 6.012 },
        { x: 8.141, y: 5.11 },
        { x: 4.012, y: 5.302 },
        { x: 2.359, y: 3.199 },
        { x: 1.254, y: 3.474 },
        { x: 2.535, y: 5.346 },
        { x: 1.809, y: 2.192 },
        { x: 1.747, y: 4.464 },
        { x: 5.192, y: 1.485 },
        { x: 18.711, y: 1.521 },
        { x: 20.718, y: 1.414 },
        { x: 17.618, y: 1.451 },
        { x: 19.32, y: 3.471 },
        { x: 16.263, y: 3.138 },
        { x: 18.588, y: 4.329 },
        { x: 16.63, y: 1.004 },
        { x: 17.292, y: 2.566 },
        { x: 18.395, y: 2.878 },
        { x: 13.943, y: 5.702 },
        { x: 4.231, y: 1.014 },
        { x: 7.052, y: 5.186 },
        { x: 5.659, y: 3.708 },
        { x: 7.56, y: 3.072 },
        { x: 3.007, y: 2.239 }
      ],
      moleculeVelocities: [
        { x: 0.373, y: 0.051 },
        { x: -0.571, y: -0.395 },
        { x: -0.492, y: 0.199 },
        { x: 0.127, y: -0.361 },
        { x: 0.434, y: -0.462 },
        { x: 0.423, y: -0.853 },
        { x: -0.234, y: 0.538 },
        { x: -0.611, y: 0.146 },
        { x: -1.567, y: -0.002 },
        { x: -0.409, y: -0.011 },
        { x: 1.511, y: 0.126 },
        { x: 0.438, y: -0.117 },
        { x: 0.427, y: 0.082 },
        { x: 0.193, y: 0.117 },
        { x: 0.021, y: 0.225 },
        { x: -0.147, y: -0.095 },
        { x: -0.209, y: -0.279 },
        { x: -0.449, y: -0.246 },
        { x: 0.021, y: -0.176 },
        { x: -0.096, y: -0.017 },
        { x: -0.465, y: 0.365 },
        { x: 0.241, y: -0.403 },
        { x: 0.109, y: -0.344 },
        { x: -0.126, y: 0.122 },
        { x: -1.099, y: 0.537 },
        { x: -0.596, y: -0.624 },
        { x: -0.821, y: 0.074 },
        { x: 0.03, y: 0.074 },
        { x: 0.257, y: 0.331 },
        { x: -0.439, y: -0.116 },
        { x: -1.07, y: 0.266 },
        { x: 0.138, y: -0.045 },
        { x: -0.591, y: 0.187 },
        { x: 0.036, y: -0.778 },
        { x: 0.307, y: 1.104 },
        { x: -0.021, y: 0.364 },
        { x: -0.237, y: -0.213 },
        { x: -0.17, y: 0.927 },
        { x: 0.268, y: -0.55 },
        { x: -0.292, y: 0.311 },
        { x: 0.411, y: -0.111 },
        { x: 0.382, y: -0.452 },
        { x: 0.403, y: 0.876 },
        { x: -0.558, y: 0.493 },
        { x: -0.813, y: 0.549 },
        { x: 0.561, y: -0.565 },
        { x: -0.151, y: 0.514 },
        { x: -0.289, y: -0.452 },
        { x: 0.235, y: -0.748 },
        { x: 0.088, y: -0.145 },
        { x: 0.741, y: -0.086 },
        { x: -0.252, y: 0.364 },
        { x: 0.598, y: 0.098 },
        { x: -0.389, y: 1.005 },
        { x: -0.668, y: -0.317 },
        { x: -0.388, y: 0.817 },
        { x: -0.526, y: 0.18 },
        { x: -1.467, y: -0.475 },
        { x: -0.439, y: -0.032 },
        { x: 0.607, y: 0.477 },
        { x: 0.454, y: 0.344 },
        { x: 0.15, y: 1.077 },
        { x: 0.189, y: -0.264 },
        { x: -0.318, y: -0.008 },
        { x: 0.53, y: -0.866 },
        { x: -0.423, y: 0.44 },
        { x: -0.799, y: 0.693 },
        { x: -0.106, y: -0.057 },
        { x: -0.09, y: 0.454 },
        { x: -0.804, y: -0.288 },
        { x: 0.228, y: -0.222 },
        { x: -0.218, y: 0.563 },
        { x: 0.136, y: 0.471 },
        { x: -0.12, y: -0.697 },
        { x: -0.096, y: -1.037 },
        { x: 0.169, y: 0.434 }
      ],
      moleculeRotationAngles: [
        12.805,
        123.089,
        58.338,
        63.025,
        72.404,
        -10.622,
        205.407,
        18.946,
        -77.672,
        -14.116,
        -28.209,
        -70.342,
        37.635,
        -32.728,
        -11.527,
        -38.937,
        14.971,
        31.084,
        6.962,
        -49.052,
        -57.121,
        -2.563,
        49.192,
        -5.476,
        -1.84,
        7.09,
        66.794,
        6.95,
        69.805,
        31.047,
        -0.779,
        30.506,
        -6.769,
        -40.692,
        8.791,
        2.636,
        27.657,
        3.266,
        -67.857,
        -51.805,
        92.818,
        32.2,
        118.768,
        157.334,
        -8.478,
        3.555,
        49.083,
        20.081,
        0.642,
        -46.704,
        -2.321,
        -3.979,
        -4.432,
        25.759,
        34.963,
        -6.046,
        157.014,
        77.427,
        -57.64,
        167.529,
        23.482,
        -121.553,
        -61.884,
        40.848,
        -29.722,
        -10.783,
        80.473,
        -152.244,
        54.338,
        131.093,
        -121.152,
        -68.659,
        44.016,
        42.909,
        -18.756,
        80.224,
        0
      ],
      moleculeRotationRates: [
        1.592,
        -1.442,
        4.671,
        1.467,
        -0.557,
        2.068,
        -8.402,
        1.149,
        4.407,
        -4.364,
        0.021,
        3.816,
        1.63,
        -1.759,
        -2.255,
        0.682,
        3.986,
        4.409,
        -1.634,
        -0.42,
        -0.598,
        3.368,
        1.427,
        -1.359,
        2.474,
        3.066,
        -1.835,
        0.244,
        -1.4,
        3.087,
        -0.541,
        -3.417,
        1.426,
        4.243,
        -0.69,
        -2.112,
        -1.158,
        2.977,
        -1.133,
        -3.352,
        1.253,
        4.739,
        3.819,
        -0.367,
        3.733,
        0.024,
        0.723,
        -1.58,
        -2.568,
        4.397,
        -0.713,
        -2.843,
        -5.799,
        -1.408,
        2.166,
        -2.875,
        -0.416,
        -3.883,
        -1.764,
        4.495,
        3.638,
        -2.584,
        -3.613,
        1.849,
        -3.144,
        0.758,
        3.722,
        -2.056,
        -1.215,
        -1.665,
        -1.658,
        2.764,
        0.927,
        0.223,
        0.699,
        1.853,
        0
      ]
    }
  };

  const SOLID_INITIAL_STATES = {
    water: {
      numberOfMolecules: 76,
      atomsPerMolecule: 3,
      moleculeCenterOfMassPositions: [
        { x: 5.420, y: 1.020 },
        { x: 6.485, y: 1.685 },
        { x: 9.020, y: 1.153 },
        { x: 10.259, y: 1.242 },
        { x: 11.446, y: 1.634 },
        { x: 13.364, y: 1.295 },
        { x: 14.525, y: 1.636 },
        { x: 15.666, y: 1.193 },
        { x: 6.219, y: 3.678 },
        { x: 7.262, y: 2.641 },
        { x: 8.657, y: 2.265 },
        { x: 10.534, y: 2.455 },
        { x: 12.496, y: 2.146 },
        { x: 14.104, y: 2.783 },
        { x: 16.724, y: 1.824 },
        { x: 18.004, y: 2.897 },
        { x: 5.533, y: 2.613 },
        { x: 5.917, y: 4.881 },
        { x: 8.268, y: 3.375 },
        { x: 9.560, y: 3.147 },
        { x: 10.453, y: 4.822 },
        { x: 12.961, y: 3.283 },
        { x: 14.880, y: 3.752 },
        { x: 17.930, y: 1.678 },
        { x: 5.033, y: 5.782 },
        { x: 8.067, y: 4.605 },
        { x: 9.305, y: 4.362 },
        { x: 11.685, y: 5.686 },
        { x: 11.631, y: 4.463 },
        { x: 13.222, y: 4.457 },
        { x: 16.139, y: 4.139 },
        { x: 17.426, y: 3.947 },
        { x: 6.181, y: 6.185 },
        { x: 7.163, y: 5.368 },
        { x: 9.443, y: 6.261 },
        { x: 10.698, y: 6.378 },
        { x: 12.556, y: 6.660 },
        { x: 13.323, y: 5.660 },
        { x: 14.311, y: 4.879 },
        { x: 17.214, y: 5.130 },
        { x: 8.151, y: 6.183 },
        { x: 9.008, y: 7.410 },
        { x: 10.232, y: 7.511 },
        { x: 11.239, y: 8.278 },
        { x: 12.453, y: 7.933 },
        { x: 14.952, y: 5.998 },
        { x: 16.230, y: 5.965 },
        { x: 17.822, y: 6.129 },
        { x: 6.376, y: 7.424 },
        { x: 7.700, y: 7.328 },
        { x: 10.029, y: 8.802 },
        { x: 10.677, y: 9.868 },
        { x: 11.834, y: 9.390 },
        { x: 14.435, y: 7.123 },
        { x: 16.596, y: 7.183 },
        { x: 17.830, y: 7.368 },
        { x: 7.419, y: 8.557 },
        { x: 8.776, y: 8.619 },
        { x: 9.496, y: 10.131 },
        { x: 13.058, y: 10.022 },
        { x: 13.442, y: 8.808 },
        { x: 14.597, y: 8.333 },
        { x: 15.848, y: 8.170 },
        { x: 17.626, y: 8.576 },
        { x: 6.356, y: 9.279 },
        { x: 8.189, y: 9.658 },
        { x: 9.157, y: 11.342 },
        { x: 12.955, y: 11.241 },
        { x: 14.369, y: 10.011 },
        { x: 14.813, y: 11.164 },
        { x: 15.352, y: 9.381 },
        { x: 16.600, y: 9.254 },
        { x: 6.785, y: 10.501 },
        { x: 7.983, y: 10.881 },
        { x: 13.155, y: 12.472 },
        { x: 14.389, y: 12.323 }
      ],
      moleculeVelocities: [
        { x: -0.403, y: -0.541 },
        { x: -0.464, y: 0.458 },
        { x: 0.104, y: 0.288 },
        { x: -0.122, y: -0.332 },
        { x: -0.102, y: -0.634 },
        { x: -0.081, y: 0.150 },
        { x: -0.112, y: 0.045 },
        { x: -0.239, y: -0.469 },
        { x: -0.110, y: -0.627 },
        { x: 0.043, y: 0.001 },
        { x: -0.136, y: -0.176 },
        { x: 0.085, y: -0.414 },
        { x: 0.158, y: 0.138 },
        { x: 0.371, y: 0.412 },
        { x: 0.190, y: 0.164 },
        { x: -0.361, y: 0.323 },
        { x: -0.266, y: -0.271 },
        { x: 0.065, y: -0.327 },
        { x: 0.389, y: -0.025 },
        { x: -0.030, y: -0.192 },
        { x: -0.269, y: -0.454 },
        { x: 0.705, y: -0.087 },
        { x: 0.151, y: 0.071 },
        { x: 0.501, y: -0.235 },
        { x: 0.254, y: -0.187 },
        { x: 0.275, y: -0.831 },
        { x: 0.356, y: 0.263 },
        { x: 0.135, y: -0.015 },
        { x: 0.373, y: 0.125 },
        { x: -0.236, y: -0.234 },
        { x: 0.519, y: -0.134 },
        { x: -0.102, y: -0.054 },
        { x: 0.195, y: -0.162 },
        { x: -0.022, y: -0.045 },
        { x: -0.609, y: -0.900 },
        { x: 0.210, y: -0.333 },
        { x: -0.123, y: 0.209 },
        { x: 0.221, y: -0.078 },
        { x: 0.084, y: -0.011 },
        { x: 0.378, y: -0.538 },
        { x: 0.227, y: 0.076 },
        { x: -0.043, y: -0.682 },
        { x: -0.312, y: 0.930 },
        { x: 0.106, y: 0.096 },
        { x: 0.226, y: -0.297 },
        { x: -0.266, y: -0.144 },
        { x: -0.212, y: -0.181 },
        { x: -0.726, y: -0.481 },
        { x: 0.341, y: -0.108 },
        { x: 0.208, y: 0.182 },
        { x: 0.151, y: 0.233 },
        { x: 0.096, y: 0.077 },
        { x: 0.474, y: -0.042 },
        { x: -0.755, y: 0.243 },
        { x: 0.105, y: 0.248 },
        { x: 0.099, y: 0.114 },
        { x: -0.114, y: -0.282 },
        { x: 0.496, y: -0.002 },
        { x: -0.341, y: 0.110 },
        { x: -0.046, y: 0.191 },
        { x: 0.684, y: -0.449 },
        { x: 0.141, y: -0.005 },
        { x: -0.648, y: -0.357 },
        { x: 0.284, y: 0.062 },
        { x: -0.044, y: 0.034 },
        { x: -0.190, y: 0.673 },
        { x: -0.036, y: 0.229 },
        { x: -0.163, y: 0.152 },
        { x: 0.100, y: -0.328 },
        { x: -0.466, y: -0.051 },
        { x: -0.155, y: -0.083 },
        { x: -0.261, y: 0.043 },
        { x: -0.012, y: 0.420 },
        { x: 0.341, y: -0.467 },
        { x: -0.022, y: -0.106 },
        { x: -0.225, y: 0.130 }
      ],
      moleculeRotationAngles: [
        4.676,
        6.991,
        2.112,
        3.248,
        4.054,
        2.510,
        1.631,
        3.161,
        4.003,
        0.417,
        5.478,
        5.198,
        1.155,
        2.938,
        1.560,
        5.015,
        3.235,
        4.941,
        5.685,
        5.882,
        1.399,
        1.415,
        2.242,
        3.611,
        3.284,
        2.456,
        2.664,
        5.118,
        3.411,
        1.123,
        3.834,
        5.301,
        1.503,
        2.679,
        -0.191,
        5.767,
        1.579,
        1.910,
        1.067,
        4.723,
        4.022,
        2.066,
        3.006,
        3.361,
        7.059,
        2.157,
        3.315,
        -2.160,
        -0.004,
        5.125,
        7.683,
        -0.123,
        4.541,
        1.404,
        4.417,
        5.006,
        4.803,
        2.066,
        3.899,
        1.761,
        5.844,
        6.716,
        5.346,
        4.901,
        5.671,
        1.990,
        5.371,
        1.642,
        3.245,
        4.413,
        -0.023,
        -0.305,
        6.561,
        6.869,
        6.429,
        5.357
      ],
      moleculeRotationRates: [
        3.857,
        1.181,
        0.446,
        0.574,
        -2.442,
        -0.480,
        -0.312,
        -0.327,
        0.908,
        -2.361,
        -2.089,
        1.115,
        1.455,
        2.947,
        2.021,
        1.962,
        0.293,
        0.539,
        1.953,
        0.666,
        1.096,
        -3.451,
        1.149,
        2.985,
        -0.869,
        -1.094,
        2.602,
        1.506,
        4.143,
        -0.069,
        -1.711,
        0.700,
        -1.892,
        1.924,
        2.809,
        0.977,
        -1.178,
        0.280,
        -0.869,
        -1.912,
        -2.293,
        1.309,
        0.778,
        0.863,
        -0.386,
        -0.279,
        -1.057,
        -0.750,
        0.395,
        0.492,
        -3.182,
        0.501,
        3.504,
        -1.772,
        1.611,
        -2.148,
        1.300,
        -2.089,
        -2.259,
        -0.085,
        -0.211,
        0.832,
        -0.773,
        -2.029,
        -0.639,
        0.218,
        -0.421,
        -0.191,
        1.195,
        -0.299,
        -0.686,
        1.470,
        -0.517,
        -0.487,
        0.925,
        -2.759
      ]
    }
  };

  //================================================================


  statesOfMatter.register( 'WaterPhaseStateChanger', WaterPhaseStateChanger );

  return inherit( AbstractPhaseStateChanger, WaterPhaseStateChanger, {

    /**
     * @public
     * @param {number} phaseID - state(solid/liquid/gas) of Molecule
     */
    setPhase: function( phaseID ) {

      AbstractPhaseStateChanger.prototype.setPhase.call( this, phaseID );

      // Sync up the atom positions with the molecule positions.
      this.positionUpdater.updateAtomPositions( this.multipleParticleModel.moleculeDataSet );

      // Step the model a number of times in order to prevent the particles from looking too organized.  The number of
      // steps was empirically determined.
      for ( let i = 0; i < 5; i++ ) {
        this.multipleParticleModel.stepInternal( SOMConstants.NOMINAL_TIME_STEP );
      }
    },

    /**
     * Set the phase to the solid state.
     * @protected
     */
    setPhaseSolid: function() {

      let dataSetToLoad;

      // find the data for this substance
      if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.WATER ) {
        dataSetToLoad = SOLID_INITIAL_STATES.water;
      }
      assert && assert( dataSetToLoad, 'unhandled substance: ' + this.multipleParticleModel.substanceProperty.get() );

      // load the previously saved state
      this.loadSavedState( dataSetToLoad );

      // prevent drift
      this.zeroOutCollectiveVelocity();

      // set the multipleParticleModel temperature for this phase
      this.multipleParticleModel.setTemperature( SOMConstants.SOLID_TEMPERATURE );
    },

    /**
     * Set the phase to the liquid state.
     * @protected
     */
    setPhaseLiquid: function() {

      let dataSetToLoad;

      // find the data for this substance
      if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.WATER ) {
        dataSetToLoad = LIQUID_INITIAL_STATES.water;
      }
      assert && assert( dataSetToLoad, 'unhandled substance: ' + this.multipleParticleModel.substanceProperty.get() );

      // load the previously saved state
      this.loadSavedState( dataSetToLoad );

      // set the temperature
      this.multipleParticleModel.setTemperature( SOMConstants.LIQUID_TEMPERATURE );
    }
  } );
} );
