// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas) for a set of diatomic (i.e. two atoms per
 * molecule) molecules.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AbstractPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/AbstractPhaseStateChanger' );
  var DiatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/DiatomicAtomPositionUpdater' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );

  // constants
  var MIN_INITIAL_DIAMETER_DISTANCE = 2.0;

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function DiatomicPhaseStateChanger( multipleParticleModel ) {

    // Make sure this is not being used on an inappropriate data set.
    assert && assert( multipleParticleModel.moleculeDataSet.getAtomsPerMolecule() === 2 );

    // initialization
    this.positionUpdater = DiatomicAtomPositionUpdater; // @private
    AbstractPhaseStateChanger.call( this, multipleParticleModel );
    this.multipleParticleModel = multipleParticleModel; // @private
  }

  // Initial positions for liquid phase, which is hard to create algorithmically.  These were created by setting the
  // appropriate temperature and iterating until a visually acceptable configuration emerged, then capturing a
  // "snapshot" of the state.
  var OXYGEN_LIQUID_INITIAL_STATE = {
    numberOfMolecules: 50,
    atomsPerMolecule: 2,
    moleculeCenterOfMassPositions: [
      {
        x: 11.466,
        y: 6.2
      },
      {
        x: 20.365,
        y: 7.93
      },
      {
        x: 16.372,
        y: 9.867
      },
      {
        x: 13.88,
        y: 8.451
      },
      {
        x: 20.703,
        y: 2.214
      },
      {
        x: 10.367,
        y: 5.072
      },
      {
        x: 14.801,
        y: 9.336
      },
      {
        x: 11.313,
        y: 3.238
      },
      {
        x: 12.768,
        y: 9.452
      },
      {
        x: 22.562,
        y: 5.131
      },
      {
        x: 21.325,
        y: 7.207
      },
      {
        x: 21.476,
        y: 4.09
      },
      {
        x: 17.512,
        y: 10.631
      },
      {
        x: 13.092,
        y: 6.282
      },
      {
        x: 15.653,
        y: 8.412
      },
      {
        x: 17.416,
        y: 3.208
      },
      {
        x: 14.465,
        y: 6.968
      },
      {
        x: 16.63,
        y: 1.674
      },
      {
        x: 24.388,
        y: 4.15
      },
      {
        x: 12.669,
        y: 7.705
      },
      {
        x: 22.136,
        y: 8.939
      },
      {
        x: 18.567,
        y: 7.778
      },
      {
        x: 17.691,
        y: 9.035
      },
      {
        x: 22.031,
        y: 3.157
      },
      {
        x: 24.585,
        y: 5.464
      },
      {
        x: 19.114,
        y: 1.082
      },
      {
        x: 16.255,
        y: 7.568
      },
      {
        x: 11.839,
        y: 1.343
      },
      {
        x: 14.488,
        y: 2.607
      },
      {
        x: 12.941,
        y: 4.463
      },
      {
        x: 17.431,
        y: 5.122
      },
      {
        x: 18.61,
        y: 3.996
      },
      {
        x: 19.648,
        y: 8.873
      },
      {
        x: 15.556,
        y: 2.221
      },
      {
        x: 19.809,
        y: 6.181
      },
      {
        x: 14.835,
        y: 3.903
      },
      {
        x: 11.979,
        y: 4.995
      },
      {
        x: 18.519,
        y: 6.104
      },
      {
        x: 20.952,
        y: 5.186
      },
      {
        x: 19.533,
        y: 10.08
      },
      {
        x: 13.115,
        y: 3.118
      },
      {
        x: 19.785,
        y: 4.17
      },
      {
        x: 17.164,
        y: 6.896
      },
      {
        x: 14.436,
        y: 5.447
      },
      {
        x: 19.132,
        y: 2.593
      },
      {
        x: 10.608,
        y: 2.009
      },
      {
        x: 17.852,
        y: 1.21
      },
      {
        x: 15.995,
        y: 5.891
      },
      {
        x: 13.042,
        y: 1.582
      },
      {
        x: 15.867,
        y: 4.709
      }
    ],
    moleculeVelocities: [
      {
        x: 0.192,
        y: -0.488
      },
      {
        x: 0.741,
        y: 0.057
      },
      {
        x: -0.247,
        y: -0.266
      },
      {
        x: 0.033,
        y: 0.229
      },
      {
        x: -0.174,
        y: 0.158
      },
      {
        x: 0.294,
        y: 0.122
      },
      {
        x: 0.605,
        y: 0.008
      },
      {
        x: 0.402,
        y: -0.27
      },
      {
        x: -0.05,
        y: 0.312
      },
      {
        x: 1.041,
        y: -0.519
      },
      {
        x: 1.139,
        y: -0.041
      },
      {
        x: -0.328,
        y: 0.195
      },
      {
        x: 0.196,
        y: 0.574
      },
      {
        x: 0.048,
        y: 0.303
      },
      {
        x: -0.477,
        y: -0.46
      },
      {
        x: 0.101,
        y: 0.139
      },
      {
        x: 0.989,
        y: 0.32
      },
      {
        x: 0.07,
        y: 0.077
      },
      {
        x: -0.002,
        y: -0.335
      },
      {
        x: 0.519,
        y: 0.887
      },
      {
        x: 0.444,
        y: 0.655
      },
      {
        x: -0.661,
        y: -0.644
      },
      {
        x: -0.389,
        y: 0.266
      },
      {
        x: 0.048,
        y: 0.751
      },
      {
        x: 0.484,
        y: 0.159
      },
      {
        x: -0.243,
        y: -0.262
      },
      {
        x: 0.266,
        y: -0.479
      },
      {
        x: 0.519,
        y: -0.848
      },
      {
        x: 0.912,
        y: 0.172
      },
      {
        x: 0.615,
        y: -0.176
      },
      {
        x: -0.564,
        y: -0.038
      },
      {
        x: -0.324,
        y: 0.596
      },
      {
        x: 0.832,
        y: 0.375
      },
      {
        x: 0.911,
        y: -0.439
      },
      {
        x: 0.358,
        y: -0.175
      },
      {
        x: -0.43,
        y: 0.087
      },
      {
        x: 0.257,
        y: 0.431
      },
      {
        x: 0.071,
        y: -0.264
      },
      {
        x: 0.345,
        y: 0.816
      },
      {
        x: 0.204,
        y: -0.394
      },
      {
        x: 0.909,
        y: -0.447
      },
      {
        x: -0.289,
        y: -0.046
      },
      {
        x: 0.036,
        y: -0.2
      },
      {
        x: 0.024,
        y: 0.629
      },
      {
        x: -0.103,
        y: 0.085
      },
      {
        x: 0.753,
        y: -0.613
      },
      {
        x: 0.53,
        y: 0.694
      },
      {
        x: -1.05,
        y: -0.549
      },
      {
        x: -0.14,
        y: -1.431
      },
      {
        x: 0,
        y: 0.253
      }
    ],
    moleculeRotationAngles: [
      -93.389,
      0.334,
      2.252,
      5.224,
      17.152,
      24.192,
      67.454,
      1.867,
      0.831,
      20.915,
      0.368,
      0.856,
      -0.42,
      5.377,
      0.943,
      -0.914,
      6.353,
      13.283,
      11.767,
      22.424,
      13.088,
      8.612,
      -8.714,
      4.238,
      27.725,
      13.389,
      19.838,
      7.55,
      1.087,
      10.315,
      -1.934,
      14.603,
      3.478,
      16.508,
      20.569,
      -9.562,
      -5.457,
      11.578,
      -2.046,
      -5.851,
      9.727,
      21.191,
      7.488,
      10.494,
      -2.68,
      -10.494,
      -11.672,
      30.84,
      45.075,
      15.117
    ],
    moleculeRotationRates: [
      -0.278,
      -0.207,
      -0.391,
      -0.846,
      0.11,
      0.02,
      -0.437,
      -1.312,
      0.47,
      0.148,
      0.11,
      -0.027,
      -0.113,
      0.247,
      0.42,
      0.153,
      1.791,
      0.669,
      0.571,
      1.121,
      -0.695,
      -0.633,
      -0.182,
      1.193,
      -0.169,
      0.53,
      0.398,
      -0.103,
      0.316,
      -0.417,
      0.925,
      0.8,
      -1.114,
      -0.677,
      0.241,
      2.832,
      -0.54,
      0.019,
      -0.083,
      -0.097,
      0.018,
      -0.024,
      -1.127,
      0.275,
      0.426,
      0.098,
      0.311,
      -0.61,
      0.135,
      -0.124
    ]
  };

  statesOfMatter.register( 'DiatomicPhaseStateChanger', DiatomicPhaseStateChanger );

  return inherit( AbstractPhaseStateChanger, DiatomicPhaseStateChanger, {

    /**
     * @param {number} phaseState - phase state (solid/liquid/gas) of the collection of molecules
     * @public
     */
    setPhase: function( phaseState ) {
      var postChangeModelSteps = 0;
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
          throw new Error( 'invalid phaseState: ' + phaseState );
      }

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;

      // Sync up the atom positions with the molecule positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Step the model a number of times in order to prevent the particles from looking too organized.  The number of
      // steps was empirically determined.
      for ( var i = 0; i < postChangeModelSteps; i++ ) {
        this.multipleParticleModel.stepInternal( StatesOfMatterConstants.NOMINAL_TIME_STEP );
      }
    },

    /**
     * Set the phase to the solid state.
     * @public
     */
    setPhaseSolid: function() {

      // Set the model temperature for this phase.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.SOLID_TEMPERATURE );

      // Place the molecules into a cube, a.k.a. a crystal.
      this.formCrystal(
        Math.round( Math.sqrt( this.multipleParticleModel.moleculeDataSet.getNumberOfMolecules() * 2 ) ) / 2,
        MIN_INITIAL_DIAMETER_DISTANCE,
        MIN_INITIAL_DIAMETER_DISTANCE * 0.5,
        0.5,
        1.5, // empirically determined to minimize bounce
        false
      );
    },

    /**
     * Set the phase to the liquid state.
     * @protected
     */
    setPhaseLiquid: function() {

      var dataSetToLoad;

      if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.DIATOMIC_OXYGEN ) {
        dataSetToLoad = OXYGEN_LIQUID_INITIAL_STATE;
      }
      else {
        assert && assert( false, 'unhandled substance: ' + this.multipleParticleModel.substanceProperty.get() );
      }

      assert && assert(
        this.multipleParticleModel.moleculeDataSet.numberOfMolecules === dataSetToLoad.numberOfMolecules,
        'unexpected number of particles in data set'
      );

      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );

      // Set the initial velocity for each of the atoms based on the new temperature.
      var numberOfMolecules = this.multipleParticleModel.moleculeDataSet.numberOfMolecules;
      var moleculeCenterOfMassPositions = this.multipleParticleModel.moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = this.multipleParticleModel.moleculeDataSet.moleculeVelocities;
      var moleculeRotationAngles = this.multipleParticleModel.moleculeDataSet.moleculeRotationAngles;
      var moleculeRotationRates = this.multipleParticleModel.moleculeDataSet.moleculeRotationRates;
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

      // for ( var i = 0; i < numberOfMolecules; i++ ) {
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        moleculeCenterOfMassPositions[ i ].setXY(
          dataSetToLoad.moleculeCenterOfMassPositions[ i ].x,
          dataSetToLoad.moleculeCenterOfMassPositions[ i ].y
        );
        moleculeVelocities[ i ].setXY(
          dataSetToLoad.moleculeVelocities[ i ].x,
          dataSetToLoad.moleculeVelocities[ i ].y
        );
        moleculeRotationAngles[ i ] = dataSetToLoad.moleculeRotationAngles[ i ];
        moleculeRotationRates[ i ] = dataSetToLoad.moleculeRotationRates[ i ];
        moleculesInsideContainer[ i ] = true;
      }
    }
  } );
} );
