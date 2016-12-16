// Copyright 2014-2015, University of Colorado Boulder

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

      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );
      var temperatureSqrt = Math.sqrt( StatesOfMatterConstants.LIQUID_TEMPERATURE );

      // Set the initial velocity for each of the atoms based on the new temperature.
      var numberOfAtoms = this.multipleParticleModel.moleculeDataSet.numberOfAtoms;
      var moleculeCenterOfMassPositions = this.multipleParticleModel.moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = this.multipleParticleModel.moleculeDataSet.moleculeVelocities;
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

      for ( var i = 0; i < numberOfAtoms; i++ ) {

        // Assign each particle an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.random.nextGaussian(),
          temperatureSqrt * this.random.nextGaussian() );
      }

      // Assign each atom to a position centered on its blob.
      var atomsPlaced = 0;
      var centerPointX = this.multipleParticleModel.normalizedContainerWidth / 2;
      var centerPointY = this.multipleParticleModel.normalizedContainerHeight / 4;
      var currentLayer = 0;
      var particlesOnCurrentLayer = 0;
      var particlesThatWillFitOnCurrentLayer = 1;

      for ( var j = 0; j < numberOfAtoms; j++ ) {
        for ( var k = 0; k < this.MAX_PLACEMENT_ATTEMPTS; k++ ) {

          var distanceFromCenter = currentLayer * MIN_INITIAL_INTER_PARTICLE_DISTANCE;
          var angle = ( particlesOnCurrentLayer / particlesThatWillFitOnCurrentLayer * 2 * Math.PI ) +
                      ( particlesThatWillFitOnCurrentLayer / ( 4 * Math.PI ) );
          var xPos = centerPointX + ( distanceFromCenter * Math.cos( angle ) );
          var yPos = centerPointY + ( distanceFromCenter * Math.sin( angle ) );
          particlesOnCurrentLayer++;  // Consider this spot used even if we don't actually put the particle there.
          if ( particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer ) {

            // This layer is full - move to the next one.
            currentLayer++;
            particlesThatWillFitOnCurrentLayer = Math.floor( currentLayer * 2 * Math.PI / MIN_INITIAL_INTER_PARTICLE_DISTANCE );
            particlesOnCurrentLayer = 0;
          }

          // Check if the position is too close to the wall.  Note that we don't check inter-particle distances here -
          // we rely on the placement algorithm to make sure that we don't run into problems with this.
          if ( ( xPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( xPos < this.multipleParticleModel.normalizedContainerWidth - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( yPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( xPos < this.multipleParticleModel.normalizedContainerHeight - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) ) {

            // This is an acceptable position.
            moleculeCenterOfMassPositions[ atomsPlaced ].setXY( xPos, yPos );
            moleculesInsideContainer[ atomsPlaced ] = true;
            atomsPlaced++;
            break;
          }
        }
      }
    }
  } );
} );