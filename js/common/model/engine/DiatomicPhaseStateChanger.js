// Copyright 2014-2016, University of Colorado Boulder

/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas)
 * for a set of diatomic (i.e. two atoms per molecule) molecules.
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

  // constants
  var MIN_INITIAL_DIAMETER_DISTANCE = 2.0;

  // The following constants can be adjusted to make the the corresponding phase more or less dense.
  var LIQUID_SPACING_FACTOR = 0.7;

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
      AbstractPhaseStateChanger.prototype.setPhaseLiquidMultiAtom.call(
        this,
        MIN_INITIAL_DIAMETER_DISTANCE,
        LIQUID_SPACING_FACTOR
      );
    }
  } );
} );
