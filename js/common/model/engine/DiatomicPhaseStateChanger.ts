// Copyright 2014-2021, University of Colorado Boulder

/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas) for a set of diatomic (i.e. two atoms per
 * molecule) molecules.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Utils from '../../../../../dot/js/Utils.js';
import statesOfMatter from '../../../statesOfMatter.js';
import PhaseStateEnum from '../../PhaseStateEnum.js';
import SOMConstants from '../../SOMConstants.js';
import SubstanceType from '../../SubstanceType.js';
import AbstractPhaseStateChanger from './AbstractPhaseStateChanger.js';
import DiatomicAtomPositionUpdater from './DiatomicAtomPositionUpdater.js';

// constants
const MIN_INITIAL_DIAMETER_DISTANCE = 2.02;

class DiatomicPhaseStateChanger extends AbstractPhaseStateChanger {

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   */
  constructor( multipleParticleModel ) {

    // Make sure this is not being used on an inappropriate data set.
    assert && assert( multipleParticleModel.moleculeDataSet.getAtomsPerMolecule() === 2 );

    // initialization
    super( multipleParticleModel );
    this.positionUpdater = DiatomicAtomPositionUpdater; // @private
    this.multipleParticleModel = multipleParticleModel; // @private
  }

  /**
   * @param {PhaseStateEnum} phaseState - phase state (solid/liquid/gas) of the collection of molecules
   * @public
   */
  setPhase( phaseState ) {
    let postChangeModelSteps = 0;
    switch( phaseState ) {
      case PhaseStateEnum.SOLID:
        this.setPhaseSolid();
        postChangeModelSteps = 0;
        break;
      case PhaseStateEnum.LIQUID:
        this.setPhaseLiquid();
        postChangeModelSteps = 20;
        break;
      case PhaseStateEnum.GAS:
        this.setPhaseGas();
        postChangeModelSteps = 0;
        break;
      default:
        throw new Error( `invalid phaseState: ${phaseState}` );
    }

    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;

    // Sync up the atom positions with the molecule positions.
    this.positionUpdater.updateAtomPositions( moleculeDataSet );

    // Step the model a number of times in order to prevent the particles from looking too organized.  The number of
    // steps was empirically determined.
    for ( let i = 0; i < postChangeModelSteps; i++ ) {
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
      Utils.roundSymmetric( Math.sqrt( this.multipleParticleModel.moleculeDataSet.getNumberOfMolecules() * 2 ) ) / 2,
      MIN_INITIAL_DIAMETER_DISTANCE,
      MIN_INITIAL_DIAMETER_DISTANCE * 0.5,
      0.5,
      1.4, // empirically determined to minimize bounce
      false
    );
  }

  /**
   * Set the particle configuration for the liquid phase.
   * @protected
   */
  setParticleConfigurationLiquid() {

    let dataSetToLoad;

    // find the data for this substance
    if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.DIATOMIC_OXYGEN ) {
      dataSetToLoad = LIQUID_INITIAL_STATES.oxygen;
    }
    assert && assert( dataSetToLoad, `unhandled substance: ${this.multipleParticleModel.substanceProperty.get()}` );

    // load the previously saved state
    this.loadSavedState( dataSetToLoad );
  }
}

// Initial positions for liquid phase, which is hard to create algorithmically.  These were created by setting the
// appropriate temperature and iterating until a visually acceptable configuration emerged, then capturing a "snapshot"
// of the state.
const LIQUID_INITIAL_STATES = {
  oxygen: {
    numberOfMolecules: 50,
    atomsPerMolecule: 2,
    moleculeCenterOfMassPositions: [
      {
        x: 17.596,
        y: 8.366
      },
      {
        x: 23.688,
        y: 1.796
      },
      {
        x: 13.468,
        y: 6.096
      },
      {
        x: 15.316,
        y: 2.408
      },
      {
        x: 20.72,
        y: 1.54
      },
      {
        x: 10.194,
        y: 5.473
      },
      {
        x: 19.331,
        y: 7.266
      },
      {
        x: 11.863,
        y: 7.171
      },
      {
        x: 19.919,
        y: 8.203
      },
      {
        x: 21.704,
        y: 4.9
      },
      {
        x: 24.954,
        y: 3.323
      },
      {
        x: 22.397,
        y: 1.187
      },
      {
        x: 13.267,
        y: 4.746
      },
      {
        x: 14.62,
        y: 7.352
      },
      {
        x: 15.052,
        y: 5.098
      },
      {
        x: 18.224,
        y: 1.529
      },
      {
        x: 18.383,
        y: 6.08
      },
      {
        x: 17.019,
        y: 1.793
      },
      {
        x: 17.652,
        y: 3.345
      },
      {
        x: 10.137,
        y: 6.859
      },
      {
        x: 22.132,
        y: 5.911
      },
      {
        x: 20.723,
        y: 6.43
      },
      {
        x: 23.6,
        y: 5.478
      },
      {
        x: 21.859,
        y: 2.565
      },
      {
        x: 14.453,
        y: 1.291
      },
      {
        x: 20.012,
        y: 3.437
      },
      {
        x: 18.643,
        y: 4.688
      },
      {
        x: 15.925,
        y: 5.989
      },
      {
        x: 10.468,
        y: 4.064
      },
      {
        x: 11.574,
        y: 4.429
      },
      {
        x: 16.896,
        y: 4.876
      },
      {
        x: 18.922,
        y: 3.124
      },
      {
        x: 24.261,
        y: 4.527
      },
      {
        x: 10.947,
        y: 2.715
      },
      {
        x: 22.73,
        y: 6.918
      },
      {
        x: 13.797,
        y: 3.136
      },
      {
        x: 9,
        y: 3.826
      },
      {
        x: 15.834,
        y: 8.573
      },
      {
        x: 23.051,
        y: 3.61
      },
      {
        x: 16.58,
        y: 7.307
      },
      {
        x: 15.86,
        y: 1.222
      },
      {
        x: 21.234,
        y: 3.879
      },
      {
        x: 19.851,
        y: 5.311
      },
      {
        x: 14.723,
        y: 3.682
      },
      {
        x: 9.534,
        y: 2.544
      },
      {
        x: 11.987,
        y: 6
      },
      {
        x: 16.095,
        y: 3.665
      },
      {
        x: 17.54,
        y: 6.689
      },
      {
        x: 12.689,
        y: 3.378
      },
      {
        x: 12.527,
        y: 1.71
      }
    ],
    moleculeVelocities: [
      {
        x: -0.106,
        y: 0.17
      },
      {
        x: -0.024,
        y: -0.614
      },
      {
        x: 0.024,
        y: 0.679
      },
      {
        x: -0.4,
        y: -0.111
      },
      {
        x: 0.225,
        y: -0.287
      },
      {
        x: -0.094,
        y: 0.111
      },
      {
        x: 0.007,
        y: 0.116
      },
      {
        x: -0.208,
        y: 0.272
      },
      {
        x: -0.333,
        y: 0.031
      },
      {
        x: -0.278,
        y: -0.449
      },
      {
        x: 0.464,
        y: -0.342
      },
      {
        x: 0.808,
        y: 0.374
      },
      {
        x: -0.105,
        y: -0.262
      },
      {
        x: 0.068,
        y: 0.327
      },
      {
        x: -0.003,
        y: -0.117
      },
      {
        x: -0.725,
        y: 0.298
      },
      {
        x: -0.445,
        y: 0.074
      },
      {
        x: -0.039,
        y: -0.349
      },
      {
        x: -0.002,
        y: -0.307
      },
      {
        x: -0.41,
        y: -0.611
      },
      {
        x: 0.003,
        y: 0.381
      },
      {
        x: -0.199,
        y: -0.105
      },
      {
        x: 0.14,
        y: 0.174
      },
      {
        x: -0.448,
        y: 0.407
      },
      {
        x: -0.022,
        y: 0.263
      },
      {
        x: -0.48,
        y: -0.625
      },
      {
        x: 0.194,
        y: -0.14
      },
      {
        x: 0.049,
        y: 0.667
      },
      {
        x: -0.271,
        y: -0.457
      },
      {
        x: -0.81,
        y: 0.343
      },
      {
        x: 0.202,
        y: -0.086
      },
      {
        x: -0.269,
        y: -0.535
      },
      {
        x: 0.073,
        y: 0.402
      },
      {
        x: -0.724,
        y: -0.304
      },
      {
        x: 0.074,
        y: 0.78
      },
      {
        x: 0.614,
        y: 0.01
      },
      {
        x: -0.015,
        y: -0.184
      },
      {
        x: 0.486,
        y: 0.101
      },
      {
        x: 0.203,
        y: -0.096
      },
      {
        x: -0.105,
        y: 0.184
      },
      {
        x: 0.24,
        y: -0.102
      },
      {
        x: 0.121,
        y: -0.11
      },
      {
        x: 0.129,
        y: -0.356
      },
      {
        x: -0.138,
        y: -0.162
      },
      {
        x: 0.28,
        y: 0.154
      },
      {
        x: 0.299,
        y: -0.37
      },
      {
        x: 0.417,
        y: 0.034
      },
      {
        x: 0.212,
        y: -0.291
      },
      {
        x: 0.361,
        y: -0.44
      },
      {
        x: -0.418,
        y: 0.389
      }
    ],
    moleculeRotationAngles: [
      -101.152,
      9.222,
      5.043,
      6.861,
      8.62,
      28.293,
      59.163,
      -28.589,
      -6.758,
      12.385,
      7.042,
      2.24,
      6.139,
      6.926,
      9.106,
      -7.787,
      3.908,
      8.385,
      1.821,
      27.392,
      6.061,
      23.261,
      -14.532,
      0.164,
      33.913,
      8.415,
      22.01,
      8.997,
      1.752,
      14.208,
      0.798,
      14.502,
      -5.312,
      -2.72,
      31.317,
      -1.457,
      -18.215,
      8.498,
      -13.712,
      -8.736,
      26.673,
      12.332,
      11.645,
      4.884,
      -11.093,
      -19.197,
      -13.131,
      25.93,
      39.223,
      12.803,
      0
    ],
    moleculeRotationRates: [
      0.084,
      0.928,
      -0.726,
      -0.233,
      -0.807,
      -0.332,
      0.208,
      -0.387,
      0.541,
      0.117,
      0.158,
      -0.016,
      0.825,
      1.468,
      0.138,
      -0.401,
      -0.57,
      -0.052,
      -0.703,
      0.595,
      0.422,
      0.904,
      -0.242,
      -1.094,
      0.664,
      -0.128,
      0.391,
      0.835,
      -0.055,
      0.106,
      -0.178,
      0.074,
      -0.705,
      0.401,
      -0.671,
      0.516,
      -0.104,
      -0.501,
      -0.337,
      0.818,
      0.516,
      -0.282,
      0.016,
      -0.564,
      0.017,
      0.335,
      0.131,
      -0.922,
      -0.375,
      -0.16,
      0
    ]
  }
};

statesOfMatter.register( 'DiatomicPhaseStateChanger', DiatomicPhaseStateChanger );
export default DiatomicPhaseStateChanger;