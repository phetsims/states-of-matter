// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas) for a set of atoms.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var AbstractPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/AbstractPhaseStateChanger' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MonatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/MonatomicAtomPositionUpdater' );
  var Random = require( 'DOT/Random' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );

  // constants
  var MIN_INITIAL_INTER_PARTICLE_DISTANCE = 1.12; // empirically determined

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function MonatomicPhaseStateChanger( multipleParticleModel ) {
    AbstractPhaseStateChanger.call( this, multipleParticleModel );
    this.positionUpdater = MonatomicAtomPositionUpdater;
    this.random = new Random();
  }

  statesOfMatter.register( 'MonatomicPhaseStateChanger', MonatomicPhaseStateChanger );

  // Initial positions for liquid phase, which is hard to create algorithmically.  These were created by setting the
  // appropriate temperature and iterating until a visually acceptable configuration was  emerged, then capturing a
  // "snapshot" of the state.
  var NEON_LIQUID_INITIAL_STATE = {
    numberOfMolecules: 100,
    atomsPerMolecule: 1,
    moleculeCenterOfMassPositions: [
      {
        x: 10.599,
        y: 3.375
      },
      {
        x: 25.451,
        y: 5.918
      },
      {
        x: 27.355,
        y: 3.489
      },
      {
        x: 12.872,
        y: 1.088
      },
      {
        x: 25.089,
        y: 7.747
      },
      {
        x: 10.13,
        y: 2.182
      },
      {
        x: 23.838,
        y: 6.835
      },
      {
        x: 29.146,
        y: 5.785
      },
      {
        x: 11.801,
        y: 1.199
      },
      {
        x: 27.501,
        y: 5.624
      },
      {
        x: 15.702,
        y: 3.489
      },
      {
        x: 27.296,
        y: 7.328
      },
      {
        x: 26.107,
        y: 1.51
      },
      {
        x: 10.388,
        y: 5.495
      },
      {
        x: 9.737,
        y: 6.456
      },
      {
        x: 25.326,
        y: 4.622
      },
      {
        x: 16.817,
        y: 5.294
      },
      {
        x: 16.555,
        y: 2.417
      },
      {
        x: 23.539,
        y: 4.907
      },
      {
        x: 14.991,
        y: 5.984
      },
      {
        x: 10.674,
        y: 1.152
      },
      {
        x: 17.789,
        y: 4.347
      },
      {
        x: 9.097,
        y: 5.338
      },
      {
        x: 10.022,
        y: 4.431
      },
      {
        x: 19.615,
        y: 3.821
      },
      {
        x: 9.557,
        y: 3.218
      },
      {
        x: 21.176,
        y: 5.2
      },
      {
        x: 11.937,
        y: 6.689
      },
      {
        x: 23.26,
        y: 2.948
      },
      {
        x: 15.628,
        y: 4.601
      },
      {
        x: 17.829,
        y: 2.212
      },
      {
        x: 26.365,
        y: 5.141
      },
      {
        x: 24.968,
        y: 1.346
      },
      {
        x: 5.88,
        y: 3.062
      },
      {
        x: 22.889,
        y: 3.992
      },
      {
        x: 26.418,
        y: 6.511
      },
      {
        x: 12.659,
        y: 5.479
      },
      {
        x: 21.762,
        y: 3.897
      },
      {
        x: 20.044,
        y: 4.925
      },
      {
        x: 13.045,
        y: 3.725
      },
      {
        x: 16.429,
        y: 6.817
      },
      {
        x: 7.841,
        y: 2.033
      },
      {
        x: 7.093,
        y: 2.976
      },
      {
        x: 6.637,
        y: 3.957
      },
      {
        x: 19.922,
        y: 2.752
      },
      {
        x: 25.284,
        y: 2.357
      },
      {
        x: 28.686,
        y: 3.91
      },
      {
        x: 12.27,
        y: 4.492
      },
      {
        x: 18.465,
        y: 3.498
      },
      {
        x: 20.677,
        y: 4.005
      },
      {
        x: 18.942,
        y: 4.771
      },
      {
        x: 6.955,
        y: 5.051
      },
      {
        x: 5.371,
        y: 5.234
      },
      {
        x: 7.721,
        y: 4.188
      },
      {
        x: 13.978,
        y: 2.663
      },
      {
        x: 27.985,
        y: 8.155
      },
      {
        x: 4.832,
        y: 3.323
      },
      {
        x: 8.877,
        y: 4.271
      },
      {
        x: 24.339,
        y: 5.742
      },
      {
        x: 20.469,
        y: 1.711
      },
      {
        x: 8.317,
        y: 3.189
      },
      {
        x: 21.547,
        y: 1.531
      },
      {
        x: 29.443,
        y: 4.667
      },
      {
        x: 9.077,
        y: 2.239
      },
      {
        x: 25.303,
        y: 3.399
      },
      {
        x: 23.634,
        y: 1.887
      },
      {
        x: 28.9,
        y: 7.397
      },
      {
        x: 21.224,
        y: 2.587
      },
      {
        x: 24.357,
        y: 2.751
      },
      {
        x: 11.473,
        y: 5.429
      },
      {
        x: 22.213,
        y: 6.162
      },
      {
        x: 28.217,
        y: 2.921
      },
      {
        x: 10.805,
        y: 6.68
      },
      {
        x: 18.87,
        y: 2.543
      },
      {
        x: 18.09,
        y: 5.493
      },
      {
        x: 26.308,
        y: 2.943
      },
      {
        x: 28.38,
        y: 4.982
      },
      {
        x: 22.754,
        y: 7.152
      },
      {
        x: 20.307,
        y: 5.99
      },
      {
        x: 19.195,
        y: 5.78
      },
      {
        x: 14.148,
        y: 3.791
      },
      {
        x: 22.414,
        y: 5.013
      },
      {
        x: 26.359,
        y: 4.016
      },
      {
        x: 11.059,
        y: 4.447
      },
      {
        x: 13.936,
        y: 5.707
      },
      {
        x: 5.631,
        y: 4.184
      },
      {
        x: 28.058,
        y: 6.633
      },
      {
        x: 23.24,
        y: 5.905
      },
      {
        x: 14.588,
        y: 4.834
      },
      {
        x: 4.545,
        y: 4.439
      },
      {
        x: 12.307,
        y: 2.396
      },
      {
        x: 11.112,
        y: 2.344
      },
      {
        x: 13.356,
        y: 4.699
      },
      {
        x: 11.803,
        y: 3.398
      },
      {
        x: 27.289,
        y: 4.608
      },
      {
        x: 24.203,
        y: 3.826
      },
      {
        x: 28.914,
        y: 1.767
      },
      {
        x: 17.396,
        y: 3.269
      },
      {
        x: 6.638,
        y: 1.958
      },
      {
        x: 16.764,
        y: 4.11
      }
    ],
    moleculeVelocities: [
      {
        x: -0.247,
        y: 0.195
      },
      {
        x: -0.075,
        y: 0.618
      },
      {
        x: 0.242,
        y: -0.469
      },
      {
        x: -0.164,
        y: -0.477
      },
      {
        x: 0.058,
        y: 0.623
      },
      {
        x: 0.079,
        y: 0.159
      },
      {
        x: -0.671,
        y: -0.329
      },
      {
        x: 0.651,
        y: 0.564
      },
      {
        x: 0.213,
        y: -0.649
      },
      {
        x: 0.987,
        y: -0.216
      },
      {
        x: -0.814,
        y: 0.351
      },
      {
        x: -0.033,
        y: 0.029
      },
      {
        x: -0.783,
        y: 0.421
      },
      {
        x: 0.738,
        y: 0.148
      },
      {
        x: 0.394,
        y: -0.288
      },
      {
        x: -0.931,
        y: 0.263
      },
      {
        x: 0.012,
        y: -1.019
      },
      {
        x: -0.963,
        y: -0.04
      },
      {
        x: 0.088,
        y: 1.616
      },
      {
        x: -0.315,
        y: 0.364
      },
      {
        x: 0.006,
        y: 0.562
      },
      {
        x: 0.066,
        y: -1.493
      },
      {
        x: 0.022,
        y: -0.094
      },
      {
        x: 0.373,
        y: -0.168
      },
      {
        x: -0.399,
        y: -0.389
      },
      {
        x: -0.83,
        y: -0.26
      },
      {
        x: 0.954,
        y: -1.023
      },
      {
        x: -0.815,
        y: 0.367
      },
      {
        x: -1.017,
        y: 0.28
      },
      {
        x: 1.476,
        y: 0.763
      },
      {
        x: -0.264,
        y: 0.07
      },
      {
        x: 0.677,
        y: -0.619
      },
      {
        x: -0.905,
        y: -0.033
      },
      {
        x: -0.583,
        y: -1.033
      },
      {
        x: 0.103,
        y: 0.312
      },
      {
        x: 0.98,
        y: 0.086
      },
      {
        x: -0.176,
        y: 0.397
      },
      {
        x: -0.722,
        y: -0.408
      },
      {
        x: -0.647,
        y: -0.169
      },
      {
        x: -0.673,
        y: -0.714
      },
      {
        x: -0.211,
        y: -0.632
      },
      {
        x: 0.469,
        y: -0.159
      },
      {
        x: -0.77,
        y: -0.552
      },
      {
        x: -0.007,
        y: 1.006
      },
      {
        x: -0.671,
        y: -0.917
      },
      {
        x: 0.408,
        y: 0.152
      },
      {
        x: -0.715,
        y: 0.54
      },
      {
        x: 0.695,
        y: 0.155
      },
      {
        x: 0.935,
        y: 0.356
      },
      {
        x: 1.469,
        y: 0.109
      },
      {
        x: 0.556,
        y: -1.449
      },
      {
        x: -0.519,
        y: 0.073
      },
      {
        x: -1.09,
        y: 0.824
      },
      {
        x: 0.073,
        y: -1.196
      },
      {
        x: -0.397,
        y: -0.312
      },
      {
        x: 0.359,
        y: -0.795
      },
      {
        x: 0.369,
        y: 1.191
      },
      {
        x: 1.113,
        y: 1.276
      },
      {
        x: 0.065,
        y: -1.049
      },
      {
        x: 1.438,
        y: 0.196
      },
      {
        x: 1.083,
        y: -0.215
      },
      {
        x: 0.532,
        y: 0.863
      },
      {
        x: 0.425,
        y: -0.553
      },
      {
        x: 0.266,
        y: -0.225
      },
      {
        x: -0.286,
        y: -0.185
      },
      {
        x: -0.289,
        y: -0.21
      },
      {
        x: -0.568,
        y: 0.668
      },
      {
        x: -0.115,
        y: 0.503
      },
      {
        x: -0.802,
        y: -0.096
      },
      {
        x: -1.26,
        y: 0.24
      },
      {
        x: 0.029,
        y: 0.561
      },
      {
        x: 0.521,
        y: 1.061
      },
      {
        x: -0.477,
        y: 0.382
      },
      {
        x: -0.933,
        y: 0.497
      },
      {
        x: -0.256,
        y: 0.089
      },
      {
        x: -0.312,
        y: 0.211
      },
      {
        x: -0.064,
        y: 0.518
      },
      {
        x: 0.432,
        y: -0.056
      },
      {
        x: -0.384,
        y: -0.973
      },
      {
        x: -0.5,
        y: -0.577
      },
      {
        x: -0.665,
        y: -0.761
      },
      {
        x: -0.026,
        y: 0.472
      },
      {
        x: 0.065,
        y: -0.443
      },
      {
        x: -0.527,
        y: 0.677
      },
      {
        x: 0.766,
        y: -0.824
      },
      {
        x: -0.325,
        y: 0.228
      },
      {
        x: 0.652,
        y: -0.773
      },
      {
        x: 0.173,
        y: 0.74
      },
      {
        x: -0.183,
        y: 0.582
      },
      {
        x: 0.785,
        y: -0.471
      },
      {
        x: -0.467,
        y: -0.285
      },
      {
        x: 0.726,
        y: 0.088
      },
      {
        x: -0.272,
        y: -0.321
      },
      {
        x: 0.015,
        y: 0.957
      },
      {
        x: 0.136,
        y: -0.299
      },
      {
        x: -0.141,
        y: -0.219
      },
      {
        x: -0.408,
        y: 1.32
      },
      {
        x: -0.091,
        y: 0.576
      },
      {
        x: 0.324,
        y: -0.566
      },
      {
        x: -0.491,
        y: 0.609
      }
    ]
  };
  var ARGON_LIQUID_INITIAL_STATE = {
    numberOfMolecules: 64,
    atomsPerMolecule: 1,
    moleculeCenterOfMassPositions: [
      {
        x: 4.586,
        y: 4.415
      },
      {
        x: 3.638,
        y: 3.802
      },
      {
        x: 17.452,
        y: 3.614
      },
      {
        x: 6.576,
        y: 3.661
      },
      {
        x: 16.067,
        y: 7.562
      },
      {
        x: 15.372,
        y: 3.304
      },
      {
        x: 5.455,
        y: 3.817
      },
      {
        x: 12.007,
        y: 6.182
      },
      {
        x: 20.789,
        y: 2.966
      },
      {
        x: 7.117,
        y: 2.553
      },
      {
        x: 14.862,
        y: 4.308
      },
      {
        x: 12.126,
        y: 2.843
      },
      {
        x: 8.292,
        y: 2.689
      },
      {
        x: 17.712,
        y: 2.333
      },
      {
        x: 7.639,
        y: 3.703
      },
      {
        x: 8.573,
        y: 1.599
      },
      {
        x: 8.761,
        y: 3.821
      },
      {
        x: 19.756,
        y: 3.156
      },
      {
        x: 21.174,
        y: 5.067
      },
      {
        x: 16.322,
        y: 2.797
      },
      {
        x: 15.007,
        y: 2.131
      },
      {
        x: 13.575,
        y: 4.174
      },
      {
        x: 10.78,
        y: 1.302
      },
      {
        x: 22.258,
        y: 4.837
      },
      {
        x: 17.725,
        y: 1.184
      },
      {
        x: 16.266,
        y: 6.268
      },
      {
        x: 13.135,
        y: 1.736
      },
      {
        x: 12.099,
        y: 1.561
      },
      {
        x: 4.602,
        y: 1.183
      },
      {
        x: 10.856,
        y: 4.686
      },
      {
        x: 16.604,
        y: 4.176
      },
      {
        x: 7.961,
        y: 5.692
      },
      {
        x: 18.548,
        y: 3.592
      },
      {
        x: 11.26,
        y: 3.693
      },
      {
        x: 22.716,
        y: 3.583
      },
      {
        x: 22.548,
        y: 1.14
      },
      {
        x: 9.874,
        y: 4.332
      },
      {
        x: 22.964,
        y: 2.371
      },
      {
        x: 13.216,
        y: 2.962
      },
      {
        x: 14.195,
        y: 1.433
      },
      {
        x: 10.868,
        y: 5.764
      },
      {
        x: 15.441,
        y: 1.182
      },
      {
        x: 15.407,
        y: 5.368
      },
      {
        x: 20.235,
        y: 4.107
      },
      {
        x: 14.287,
        y: 3.274
      },
      {
        x: 9.387,
        y: 2.813
      },
      {
        x: 3.388,
        y: 1.428
      },
      {
        x: 8.83,
        y: 4.931
      },
      {
        x: 5.407,
        y: 9.768
      },
      {
        x: 6.633,
        y: 6.201
      },
      {
        x: 21.861,
        y: 2.751
      },
      {
        x: 4.652,
        y: 2.403
      },
      {
        x: 16.739,
        y: 1.691
      },
      {
        x: 7.424,
        y: 4.744
      },
      {
        x: 12.474,
        y: 3.924
      },
      {
        x: 7.524,
        y: 6.967
      },
      {
        x: 6.373,
        y: 1.618
      },
      {
        x: 12.084,
        y: 4.921
      },
      {
        x: 19.008,
        y: 4.626
      },
      {
        x: 5.765,
        y: 2.752
      },
      {
        x: 21.623,
        y: 3.79
      },
      {
        x: 9.82,
        y: 5.502
      },
      {
        x: 18.766,
        y: 2.402
      },
      {
        x: 13.178,
        y: 5.732
      }
    ],
    moleculeVelocities: [
      {
        x: -0.426,
        y: -0.438
      },
      {
        x: 0.851,
        y: -1.254
      },
      {
        x: 0.723,
        y: -0.3
      },
      {
        x: 0.007,
        y: 0.44
      },
      {
        x: -0.514,
        y: 0.232
      },
      {
        x: 1.159,
        y: 0.819
      },
      {
        x: 0.393,
        y: -0.866
      },
      {
        x: 0.482,
        y: -0.36
      },
      {
        x: -0.645,
        y: 0.572
      },
      {
        x: -1.975,
        y: 0.981
      },
      {
        x: -0.529,
        y: -0.326
      },
      {
        x: -0.76,
        y: -0.089
      },
      {
        x: 0.502,
        y: -0.365
      },
      {
        x: -0.496,
        y: -0.251
      },
      {
        x: -0.861,
        y: 0.537
      },
      {
        x: -0.056,
        y: 0.67
      },
      {
        x: -0.973,
        y: 0.22
      },
      {
        x: -0.43,
        y: -0.216
      },
      {
        x: -0.859,
        y: -0.581
      },
      {
        x: -0.46,
        y: -0.241
      },
      {
        x: -1.183,
        y: 0.661
      },
      {
        x: 1.305,
        y: -0.331
      },
      {
        x: 1.824,
        y: 0.638
      },
      {
        x: 1.575,
        y: 0.052
      },
      {
        x: 1.58,
        y: 1.62
      },
      {
        x: -1.425,
        y: 1.124
      },
      {
        x: 0.06,
        y: 0.449
      },
      {
        x: -0.977,
        y: -0.743
      },
      {
        x: 0.02,
        y: -0.066
      },
      {
        x: 0.501,
        y: -0.409
      },
      {
        x: 0.73,
        y: 0.808
      },
      {
        x: 1.323,
        y: -0.64
      },
      {
        x: 0.463,
        y: -0.68
      },
      {
        x: 0.063,
        y: 0.629
      },
      {
        x: -0.566,
        y: -0.768
      },
      {
        x: -0.891,
        y: -0.916
      },
      {
        x: 0.161,
        y: -1.19
      },
      {
        x: 1.053,
        y: -0.868
      },
      {
        x: -0.48,
        y: -0.243
      },
      {
        x: 0.214,
        y: -0.091
      },
      {
        x: -0.769,
        y: 0.103
      },
      {
        x: 0.604,
        y: 0.814
      },
      {
        x: 0.376,
        y: -0.03
      },
      {
        x: -0.566,
        y: -0.233
      },
      {
        x: 0.389,
        y: -0.793
      },
      {
        x: 0.339,
        y: -0.617
      },
      {
        x: 0.315,
        y: 0.883
      },
      {
        x: 0.434,
        y: -1.549
      },
      {
        x: 0.288,
        y: 0.726
      },
      {
        x: -0.456,
        y: -0.357
      },
      {
        x: -0.631,
        y: 1.907
      },
      {
        x: 0.194,
        y: 0.155
      },
      {
        x: 0.716,
        y: 0.153
      },
      {
        x: -0.784,
        y: 0.102
      },
      {
        x: 0.195,
        y: -0.936
      },
      {
        x: 1.037,
        y: -0.573
      },
      {
        x: 0.46,
        y: -0.189
      },
      {
        x: -0.625,
        y: 1.53
      },
      {
        x: -0.689,
        y: 0.382
      },
      {
        x: -0.271,
        y: -0.234
      },
      {
        x: 0.441,
        y: 0.633
      },
      {
        x: -0.092,
        y: 0.5
      },
      {
        x: -0.832,
        y: 0.334
      },
      {
        x: -0.276,
        y: -0.438
      }
    ]
  };

  return inherit( AbstractPhaseStateChanger, MonatomicPhaseStateChanger, {

    /**
     * @public
     * @param {number} phaseID - state(solid/liquid/gas) of Molecule
     */
    setPhase: function( phaseID ) {

      AbstractPhaseStateChanger.prototype.setPhase.call( this, phaseID );

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;

      var offset = 0;
      if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.ARGON ) {
        offset = 6;
      }

      if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM ) {
        offset = 4;
      }

      // Sync up the atom positions with the molecule positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet, offset );

      // Step the model a number of times in order to prevent the particles from looking too organized.  The number of
      // steps was empirically determined.
      for ( var i = 0; i < 5; i++ ) {
        this.multipleParticleModel.stepInternal( StatesOfMatterConstants.NOMINAL_TIME_STEP );
      }
    },

    /**
     * Set the phase to the solid state.
     * @protected
     */
    setPhaseSolid: function() {

      // Set the temperature in the model.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.SOLID_TEMPERATURE );

      // Place the molecules into a cube, a.k.a. a crystal.
      this.formCrystal(
        Math.round( Math.sqrt( this.multipleParticleModel.moleculeDataSet.getNumberOfMolecules() ) ),
        MIN_INITIAL_INTER_PARTICLE_DISTANCE,
        MIN_INITIAL_INTER_PARTICLE_DISTANCE * 0.866,
        MIN_INITIAL_INTER_PARTICLE_DISTANCE / 2,
        MIN_INITIAL_INTER_PARTICLE_DISTANCE,
        false
      );
    },

    /**
     * Set the phase to the liquid state.
     * @protected
     */
    setPhaseLiquid: function() {
      var dataSetToLoad;
      if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.NEON ) {
        dataSetToLoad = NEON_LIQUID_INITIAL_STATE;
      }
      else if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.ARGON ) {
        dataSetToLoad = ARGON_LIQUID_INITIAL_STATE;
      }
      assert && assert( dataSetToLoad, 'unhandled substance: ' + this.multipleParticleModel.substanceProperty.get() );
      this.loadSavedState( dataSetToLoad );
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );
    }
  } );
} );