// Copyright 2014-2015, University of Colorado Boulder

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
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

  // @private
  var MIN_INITIAL_DIAMETER_DISTANCE = 1.4;

  // The following constants can be adjusted to make the the corresponding phase more or less dense.
  var LIQUID_SPACING_FACTOR = 0.8;

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
      AbstractPhaseStateChanger.prototype.setPhaseLiquidMultiAtom.call(
        this,
        MIN_INITIAL_DIAMETER_DISTANCE,
        LIQUID_SPACING_FACTOR
      );
    }
  } );
} );
