// Copyright 2014-2021, University of Colorado Boulder

/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas) for a set of atoms.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import dotRandom from '../../../../../dot/js/dotRandom.js';
import Utils from '../../../../../dot/js/Utils.js';
import statesOfMatter from '../../../statesOfMatter.js';
import SOMConstants from '../../SOMConstants.js';
import SubstanceType from '../../SubstanceType.js';
import AbstractPhaseStateChanger from './AbstractPhaseStateChanger.js';
import MonatomicAtomPositionUpdater from './MonatomicAtomPositionUpdater.js';

// constants
const MIN_INITIAL_INTER_PARTICLE_DISTANCE = 1.12; // empirically determined

class MonatomicPhaseStateChanger extends AbstractPhaseStateChanger {

  /**
   * @param {MultipleParticleModel} multipleParticleModel
   */
  constructor( multipleParticleModel ) {
    super( multipleParticleModel );
    this.positionUpdater = MonatomicAtomPositionUpdater;
    this.random = dotRandom;
  }

  /**
   * @public
   * @param {number} phaseID - state(solid/liquid/gas) of Molecule
   */
  setPhase( phaseID ) {

    super.setPhase( phaseID );

    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;

    // set an offset based on the substance type so that it will be centered
    let offset = 0;
    if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.ARGON ) {
      offset = 6;
    }
    else if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM ) {
      offset = 4;
    }

    // Sync up the atom positions with the molecule positions.
    this.positionUpdater.updateAtomPositions( moleculeDataSet, offset );

    // Step the model a number of times in order to prevent the particles from looking too organized.  The number of
    // steps was empirically determined.
    for ( let i = 0; i < 5; i++ ) {
      this.multipleParticleModel.stepInTime( SOMConstants.NOMINAL_TIME_STEP );
    }
  }

  /**
   * Set the particle configuration for the solid phase.
   * @protected
   */
  setParticleConfigurationSolid() {

    // Place the molecules into a cube, a.k.a. a crystal.
    this.formCrystal(
      Utils.roundSymmetric( Math.sqrt( this.multipleParticleModel.moleculeDataSet.getNumberOfMolecules() ) ),
      MIN_INITIAL_INTER_PARTICLE_DISTANCE,
      MIN_INITIAL_INTER_PARTICLE_DISTANCE * 0.866,
      MIN_INITIAL_INTER_PARTICLE_DISTANCE / 2,
      MIN_INITIAL_INTER_PARTICLE_DISTANCE,
      false
    );
  }

  /**
   * Set the particle configuration for the liquid phase.
   * @protected
   */
  setParticleConfigurationLiquid() {
    let dataSetToLoad;
    if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.NEON ) {
      dataSetToLoad = LIQUID_INITIAL_STATES.neon;
    }
    else if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.ARGON ) {
      dataSetToLoad = LIQUID_INITIAL_STATES.argon;
    }
    else if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM ) {
      dataSetToLoad = LIQUID_INITIAL_STATES.adjustableAttraction;
    }
    assert && assert( dataSetToLoad, `unhandled substance: ${this.multipleParticleModel.substanceProperty.get()}` );
    this.loadSavedState( dataSetToLoad );
  }
}

// Initial positions for liquid phase, which is hard to create algorithmically.  These were created by setting the
// appropriate temperature and iterating until a visually acceptable configuration was  emerged, then capturing a
// "snapshot" of the state.
const LIQUID_INITIAL_STATES = {
  neon: {
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
  },
  argon: {
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
  },
  adjustableAttraction: {
    numberOfMolecules: 81,
    atomsPerMolecule: 1,
    moleculeCenterOfMassPositions: [
      {
        x: 7.069,
        y: 1.462
      },
      {
        x: 11.494,
        y: 2.068
      },
      {
        x: 14.072,
        y: 3.544
      },
      {
        x: 13.317,
        y: 2.780
      },
      {
        x: 14.452,
        y: 2.473
      },
      {
        x: 19.965,
        y: 1.565
      },
      {
        x: 23.489,
        y: 1.583
      },
      {
        x: 20.580,
        y: 2.538
      },
      {
        x: 26.853,
        y: 2.097
      },
      {
        x: 12.559,
        y: 1.988
      },
      {
        x: 9.357,
        y: 1.101
      },
      {
        x: 12.179,
        y: 3.012
      },
      {
        x: 12.595,
        y: 3.968
      },
      {
        x: 16.432,
        y: 1.872
      },
      {
        x: 21.781,
        y: 1.280
      },
      {
        x: 18.728,
        y: 1.764
      },
      {
        x: 24.306,
        y: 4.315
      },
      {
        x: 26.805,
        y: 3.587
      },
      {
        x: 5.465,
        y: 1.005
      },
      {
        x: 8.989,
        y: 2.192
      },
      {
        x: 10.387,
        y: 1.799
      },
      {
        x: 12.472,
        y: 5.149
      },
      {
        x: 14.903,
        y: 4.858
      },
      {
        x: 14.096,
        y: 1.464
      },
      {
        x: 15.298,
        y: 1.719
      },
      {
        x: 25.467,
        y: 3.885
      },
      {
        x: 23.967,
        y: 6.977
      },
      {
        x: 2.811,
        y: 1.493
      },
      {
        x: 8.336,
        y: 1.380
      },
      {
        x: 10.877,
        y: 2.921
      },
      {
        x: 15.123,
        y: 3.732
      },
      {
        x: 15.982,
        y: 4.561
      },
      {
        x: 17.539,
        y: 1.616
      },
      {
        x: 24.614,
        y: 3.174
      },
      {
        x: 26.342,
        y: 4.597
      },
      {
        x: 25.187,
        y: 4.920
      },
      {
        x: 1.473,
        y: 1.820
      },
      {
        x: 5.942,
        y: 2.032
      },
      {
        x: 9.644,
        y: 3.130
      },
      {
        x: 13.572,
        y: 4.631
      },
      {
        x: 11.406,
        y: 5.258
      },
      {
        x: 16.100,
        y: 3.040
      },
      {
        x: 25.560,
        y: 2.545
      },
      {
        x: 22.556,
        y: 2.765
      },
      {
        x: 23.214,
        y: 4.749
      },
      {
        x: 5.314,
        y: 4.128
      },
      {
        x: 4.822,
        y: 2.200
      },
      {
        x: 10.312,
        y: 3.932
      },
      {
        x: 11.376,
        y: 3.907
      },
      {
        x: 13.945,
        y: 5.551
      },
      {
        x: 18.381,
        y: 2.834
      },
      {
        x: 23.679,
        y: 2.625
      },
      {
        x: 24.497,
        y: 1.980
      },
      {
        x: 25.563,
        y: 1.322
      },
      {
        x: 3.493,
        y: 2.537
      },
      {
        x: 4.387,
        y: 3.276
      },
      {
        x: 5.468,
        y: 3.132
      },
      {
        x: 7.446,
        y: 3.848
      },
      {
        x: 15.775,
        y: 5.830
      },
      {
        x: 17.278,
        y: 2.736
      },
      {
        x: 18.964,
        y: 3.719
      },
      {
        x: 21.311,
        y: 3.606
      },
      {
        x: 20.926,
        y: 4.656
      },
      {
        x: 4.002,
        y: 1.395
      },
      {
        x: 3.200,
        y: 3.560
      },
      {
        x: 9.115,
        y: 4.102
      },
      {
        x: 8.567,
        y: 3.246
      },
      {
        x: 17.652,
        y: 6.192
      },
      {
        x: 19.488,
        y: 2.704
      },
      {
        x: 20.217,
        y: 3.505
      },
      {
        x: 22.295,
        y: 3.941
      },
      {
        x: 23.514,
        y: 3.662
      },
      {
        x: 6.831,
        y: 2.805
      },
      {
        x: 2.265,
        y: 2.646
      },
      {
        x: 7.820,
        y: 2.404
      },
      {
        x: 18.368,
        y: 4.579
      },
      {
        x: 16.820,
        y: 5.381
      },
      {
        x: 16.659,
        y: 7.284
      },
      {
        x: 17.351,
        y: 4.053
      },
      {
        x: 23.594,
        y: 5.882
      },
      {
        x: 19.587,
        y: 4.553
      }
    ],
    moleculeVelocities: [
      {
        x: 0.865,
        y: 0.401
      },
      {
        x: 0.112,
        y: 0.033
      },
      {
        x: 1.440,
        y: 0.315
      },
      {
        x: 0.886,
        y: -0.672
      },
      {
        x: 1.081,
        y: -0.185
      },
      {
        x: -0.371,
        y: 1.440
      },
      {
        x: 0.556,
        y: 0.355
      },
      {
        x: -0.434,
        y: -0.180
      },
      {
        x: 0.569,
        y: 0.735
      },
      {
        x: -0.681,
        y: 0.917
      },
      {
        x: 0.058,
        y: -0.156
      },
      {
        x: -0.330,
        y: -0.823
      },
      {
        x: -0.622,
        y: -0.512
      },
      {
        x: 0.551,
        y: -1.327
      },
      {
        x: 0.516,
        y: -0.339
      },
      {
        x: 0.840,
        y: 0.813
      },
      {
        x: -0.177,
        y: -0.642
      },
      {
        x: 0.008,
        y: 0.097
      },
      {
        x: -0.764,
        y: -0.250
      },
      {
        x: 0.824,
        y: 1.414
      },
      {
        x: 0.429,
        y: -0.069
      },
      {
        x: 1.766,
        y: 0.365
      },
      {
        x: -0.369,
        y: -0.203
      },
      {
        x: -0.089,
        y: -1.008
      },
      {
        x: 0.875,
        y: 1.356
      },
      {
        x: 0.827,
        y: 0.829
      },
      {
        x: -1.435,
        y: -0.193
      },
      {
        x: -0.393,
        y: -1.282
      },
      {
        x: 2.400,
        y: 0.038
      },
      {
        x: 0.241,
        y: 0.125
      },
      {
        x: -1.194,
        y: -0.300
      },
      {
        x: 0.904,
        y: -0.079
      },
      {
        x: -0.494,
        y: 0.423
      },
      {
        x: -0.097,
        y: 1.069
      },
      {
        x: -0.637,
        y: -0.893
      },
      {
        x: 0.115,
        y: 0.649
      },
      {
        x: 1.544,
        y: 0.920
      },
      {
        x: 0.843,
        y: 0.967
      },
      {
        x: -0.008,
        y: 0.179
      },
      {
        x: -0.038,
        y: 1.221
      },
      {
        x: -0.338,
        y: -0.438
      },
      {
        x: -0.322,
        y: -1.196
      },
      {
        x: -0.154,
        y: -1.387
      },
      {
        x: 0.054,
        y: 0.518
      },
      {
        x: 0.828,
        y: -0.399
      },
      {
        x: 0.436,
        y: -0.208
      },
      {
        x: -0.492,
        y: -0.043
      },
      {
        x: 0.381,
        y: 1.398
      },
      {
        x: 0.827,
        y: 0.024
      },
      {
        x: -0.399,
        y: 1.669
      },
      {
        x: -0.616,
        y: -0.673
      },
      {
        x: -0.974,
        y: -0.246
      },
      {
        x: 0.906,
        y: 0.645
      },
      {
        x: 0.261,
        y: -0.288
      },
      {
        x: 0.971,
        y: -0.193
      },
      {
        x: -0.996,
        y: -0.314
      },
      {
        x: 0.068,
        y: 0.187
      },
      {
        x: 1.002,
        y: -0.925
      },
      {
        x: -1.474,
        y: -0.967
      },
      {
        x: 0.128,
        y: 0.102
      },
      {
        x: 0.521,
        y: 0.889
      },
      {
        x: -0.163,
        y: -0.350
      },
      {
        x: 0.527,
        y: 0.509
      },
      {
        x: -0.647,
        y: 0.823
      },
      {
        x: 0.712,
        y: 0.423
      },
      {
        x: 2.461,
        y: 0.786
      },
      {
        x: -0.566,
        y: -1.272
      },
      {
        x: 0.313,
        y: 0.225
      },
      {
        x: 0.546,
        y: -0.366
      },
      {
        x: -0.847,
        y: 0.182
      },
      {
        x: 0.385,
        y: -0.342
      },
      {
        x: 0.450,
        y: 0.528
      },
      {
        x: 0.131,
        y: -0.708
      },
      {
        x: 0.145,
        y: 0.264
      },
      {
        x: 0.128,
        y: -1.152
      },
      {
        x: -0.189,
        y: 0.388
      },
      {
        x: 0.691,
        y: 0.331
      },
      {
        x: -0.257,
        y: 0.725
      },
      {
        x: 0.621,
        y: 0.260
      },
      {
        x: -0.225,
        y: -0.823
      },
      {
        x: 0.395,
        y: 0.818
      }
    ]
  }
};

statesOfMatter.register( 'MonatomicPhaseStateChanger', MonatomicPhaseStateChanger );
export default MonatomicPhaseStateChanger;