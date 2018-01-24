// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas)
 * for a set of water molecules.  It only works for water and would need to be
 * generalized to handle other triatomic molecules.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AbstractPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/AbstractPhaseStateChanger' );
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

  // @private
  var MIN_INITIAL_DIAMETER_DISTANCE = 1.4;

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
  var WATER_LIQUID_INITIAL_STATE = {
    numberOfMolecules: 76,
    atomsPerMolecule: 3,
    moleculeCenterOfMassPositions: [
      {
        x: 12.381,
        y: 4.629
      },
      {
        x: 13.644,
        y: 4.597
      },
      {
        x: 10.621,
        y: 5.919
      },
      {
        x: 11.376,
        y: 4.902
      },
      {
        x: 10.669,
        y: 2.71
      },
      {
        x: 12.132,
        y: 3.394
      },
      {
        x: 14.683,
        y: 4.87
      },
      {
        x: 12.912,
        y: 5.477
      },
      {
        x: 11.272,
        y: 6.801
      },
      {
        x: 10.322,
        y: 4.714
      },
      {
        x: 9.201,
        y: 4.436
      },
      {
        x: 11.122,
        y: 3.863
      },
      {
        x: 9.581,
        y: 2.633
      },
      {
        x: 11.684,
        y: 2.388
      },
      {
        x: 12.844,
        y: 2.48
      },
      {
        x: 13.237,
        y: 3.497
      },
      {
        x: 15.372,
        y: 3.954
      },
      {
        x: 11.908,
        y: 5.989
      },
      {
        x: 5.837,
        y: 4.901
      },
      {
        x: 7.994,
        y: 4.119
      },
      {
        x: 6.868,
        y: 4.109
      },
      {
        x: 8.679,
        y: 3.4
      },
      {
        x: 8.531,
        y: 2.256
      },
      {
        x: 10.043,
        y: 3.65
      },
      {
        x: 8.134,
        y: 1.166
      },
      {
        x: 9.22,
        y: 1.453
      },
      {
        x: 10.303,
        y: 1.702
      },
      {
        x: 11.345,
        y: 1.454
      },
      {
        x: 13.96,
        y: 2.581
      },
      {
        x: 15.151,
        y: 2.95
      },
      {
        x: 14.386,
        y: 3.706
      },
      {
        x: 15.801,
        y: 4.975
      },
      {
        x: 17.221,
        y: 4.942
      },
      {
        x: 9.662,
        y: 6.371
      },
      {
        x: 4.505,
        y: 3.302
      },
      {
        x: 4.53,
        y: 4.331
      },
      {
        x: 6.494,
        y: 2.887
      },
      {
        x: 3.225,
        y: 4.523
      },
      {
        x: 5.492,
        y: 2.539
      },
      {
        x: 3.494,
        y: 3.416
      },
      {
        x: 4.329,
        y: 2.141
      },
      {
        x: 6.293,
        y: 1.843
      },
      {
        x: 7.402,
        y: 2.036
      },
      {
        x: 12.408,
        y: 1.512
      },
      {
        x: 13.67,
        y: 1.588
      },
      {
        x: 14.839,
        y: 1.848
      },
      {
        x: 15.926,
        y: 2.135
      },
      {
        x: 15.563,
        y: 1.035
      },
      {
        x: 16.548,
        y: 4.116
      },
      {
        x: 17.583,
        y: 3.739
      },
      {
        x: 19.331,
        y: 2.352
      },
      {
        x: 20.358,
        y: 2.634
      },
      {
        x: 14.971,
        y: 6.012
      },
      {
        x: 8.141,
        y: 5.11
      },
      {
        x: 4.012,
        y: 5.302
      },
      {
        x: 2.359,
        y: 3.199
      },
      {
        x: 1.254,
        y: 3.474
      },
      {
        x: 2.535,
        y: 5.346
      },
      {
        x: 1.809,
        y: 2.192
      },
      {
        x: 1.747,
        y: 4.464
      },
      {
        x: 5.192,
        y: 1.485
      },
      {
        x: 18.711,
        y: 1.521
      },
      {
        x: 20.718,
        y: 1.414
      },
      {
        x: 17.618,
        y: 1.451
      },
      {
        x: 19.32,
        y: 3.471
      },
      {
        x: 16.263,
        y: 3.138
      },
      {
        x: 18.588,
        y: 4.329
      },
      {
        x: 16.63,
        y: 1.004
      },
      {
        x: 17.292,
        y: 2.566
      },
      {
        x: 18.395,
        y: 2.878
      },
      {
        x: 13.943,
        y: 5.702
      },
      {
        x: 4.231,
        y: 1.014
      },
      {
        x: 7.052,
        y: 5.186
      },
      {
        x: 5.659,
        y: 3.708
      },
      {
        x: 7.56,
        y: 3.072
      },
      {
        x: 3.007,
        y: 2.239
      }
    ],
    moleculeVelocities: [
      {
        x: 0.373,
        y: 0.051
      },
      {
        x: -0.571,
        y: -0.395
      },
      {
        x: -0.492,
        y: 0.199
      },
      {
        x: 0.127,
        y: -0.361
      },
      {
        x: 0.434,
        y: -0.462
      },
      {
        x: 0.423,
        y: -0.853
      },
      {
        x: -0.234,
        y: 0.538
      },
      {
        x: -0.611,
        y: 0.146
      },
      {
        x: -1.567,
        y: -0.002
      },
      {
        x: -0.409,
        y: -0.011
      },
      {
        x: 1.511,
        y: 0.126
      },
      {
        x: 0.438,
        y: -0.117
      },
      {
        x: 0.427,
        y: 0.082
      },
      {
        x: 0.193,
        y: 0.117
      },
      {
        x: 0.021,
        y: 0.225
      },
      {
        x: -0.147,
        y: -0.095
      },
      {
        x: -0.209,
        y: -0.279
      },
      {
        x: -0.449,
        y: -0.246
      },
      {
        x: 0.021,
        y: -0.176
      },
      {
        x: -0.096,
        y: -0.017
      },
      {
        x: -0.465,
        y: 0.365
      },
      {
        x: 0.241,
        y: -0.403
      },
      {
        x: 0.109,
        y: -0.344
      },
      {
        x: -0.126,
        y: 0.122
      },
      {
        x: -1.099,
        y: 0.537
      },
      {
        x: -0.596,
        y: -0.624
      },
      {
        x: -0.821,
        y: 0.074
      },
      {
        x: 0.03,
        y: 0.074
      },
      {
        x: 0.257,
        y: 0.331
      },
      {
        x: -0.439,
        y: -0.116
      },
      {
        x: -1.07,
        y: 0.266
      },
      {
        x: 0.138,
        y: -0.045
      },
      {
        x: -0.591,
        y: 0.187
      },
      {
        x: 0.036,
        y: -0.778
      },
      {
        x: 0.307,
        y: 1.104
      },
      {
        x: -0.021,
        y: 0.364
      },
      {
        x: -0.237,
        y: -0.213
      },
      {
        x: -0.17,
        y: 0.927
      },
      {
        x: 0.268,
        y: -0.55
      },
      {
        x: -0.292,
        y: 0.311
      },
      {
        x: 0.411,
        y: -0.111
      },
      {
        x: 0.382,
        y: -0.452
      },
      {
        x: 0.403,
        y: 0.876
      },
      {
        x: -0.558,
        y: 0.493
      },
      {
        x: -0.813,
        y: 0.549
      },
      {
        x: 0.561,
        y: -0.565
      },
      {
        x: -0.151,
        y: 0.514
      },
      {
        x: -0.289,
        y: -0.452
      },
      {
        x: 0.235,
        y: -0.748
      },
      {
        x: 0.088,
        y: -0.145
      },
      {
        x: 0.741,
        y: -0.086
      },
      {
        x: -0.252,
        y: 0.364
      },
      {
        x: 0.598,
        y: 0.098
      },
      {
        x: -0.389,
        y: 1.005
      },
      {
        x: -0.668,
        y: -0.317
      },
      {
        x: -0.388,
        y: 0.817
      },
      {
        x: -0.526,
        y: 0.18
      },
      {
        x: -1.467,
        y: -0.475
      },
      {
        x: -0.439,
        y: -0.032
      },
      {
        x: 0.607,
        y: 0.477
      },
      {
        x: 0.454,
        y: 0.344
      },
      {
        x: 0.15,
        y: 1.077
      },
      {
        x: 0.189,
        y: -0.264
      },
      {
        x: -0.318,
        y: -0.008
      },
      {
        x: 0.53,
        y: -0.866
      },
      {
        x: -0.423,
        y: 0.44
      },
      {
        x: -0.799,
        y: 0.693
      },
      {
        x: -0.106,
        y: -0.057
      },
      {
        x: -0.09,
        y: 0.454
      },
      {
        x: -0.804,
        y: -0.288
      },
      {
        x: 0.228,
        y: -0.222
      },
      {
        x: -0.218,
        y: 0.563
      },
      {
        x: 0.136,
        y: 0.471
      },
      {
        x: -0.12,
        y: -0.697
      },
      {
        x: -0.096,
        y: -1.037
      },
      {
        x: 0.169,
        y: 0.434
      }
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
  };


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
      for ( var i = 0; i < 5; i++ ) {
        this.multipleParticleModel.stepInternal( StatesOfMatterConstants.NOMINAL_TIME_STEP );
      }
    },

    /**
     * Set the phase to the solid state.
     * @protected
     */
    setPhaseSolid: function() {

      // Set the multipleParticleModel temperature for this phase.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.SOLID_TEMPERATURE );

      // Place the molecules into a cube, a.k.a. a crystal.
      this.formCrystal(
        Math.round( Math.floor( Math.sqrt( this.multipleParticleModel.moleculeDataSet.getNumberOfMolecules() ) ) ),
        MIN_INITIAL_DIAMETER_DISTANCE,
        MIN_INITIAL_DIAMETER_DISTANCE * 0.866,
        MIN_INITIAL_DIAMETER_DISTANCE / 2,
        MIN_INITIAL_DIAMETER_DISTANCE,
        true
      );
    },

    /**
     * Set the phase to the liquid state.
     * @protected
     */
    setPhaseLiquid: function() {

      var dataSetToLoad;

      // find the data for this substance
      if ( this.multipleParticleModel.substanceProperty.get() === SubstanceType.WATER ) {
        dataSetToLoad = WATER_LIQUID_INITIAL_STATE;
      }
      assert && assert( dataSetToLoad, 'unhandled substance: ' + this.multipleParticleModel.substanceProperty.get() );

      // load the previously saved state
      this.loadSavedState( dataSetToLoad );

      // set the temperature
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );
    }
  } );
} );
