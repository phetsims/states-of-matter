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
  var PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  var Random = require( 'DOT/Random' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

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
      switch( phaseID ) {
        case PhaseStateEnum.SOLID:
          this.setPhaseSolid();
          break;
        case PhaseStateEnum.LIQUID:
          this.setPhaseLiquid();
          break;
        case PhaseStateEnum.GAS:
          this.setPhaseGas();
          break;
      }

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;

      // Assume that we've done our job correctly and that all the atoms are in safe positions.
      this.multipleParticleModel.moleculeDataSet.numberOfSafeMolecules = moleculeDataSet.getNumberOfMolecules();

      // Sync up the atom positions with the molecule positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Step the model a number of times in order to prevent the particles
      // from looking too organized.  The number of steps was empirically determined.
      for ( var i = 0; i < 20; i++ ) {
        this.multipleParticleModel.stepInternal( 0.016 );
      }
    },

    /**
     * Set the phase to the solid state.
     * @private
     */
    setPhaseSolid: function() {

      // Set the temperature in the model.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.SOLID_TEMPERATURE );

      // Create the solid form, a.k.a. a crystal.
      var numberOfAtoms = this.multipleParticleModel.moleculeDataSet.numberOfAtoms;
      var moleculeCenterOfMassPositions = this.multipleParticleModel.moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = this.multipleParticleModel.moleculeDataSet.moleculeVelocities;
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPoint );
      var atomsPerLayer = Math.round( Math.sqrt( numberOfAtoms ) );

      // Establish the starting position, which will be the lower left corner of the "cube".
      var crystalWidth = ( atomsPerLayer - 1 ) * MIN_INITIAL_INTER_PARTICLE_DISTANCE;

      var startingPosX = ( this.multipleParticleModel.normalizedContainerWidth / 2 ) - ( crystalWidth / 2 );
      var startingPosY = MIN_INITIAL_INTER_PARTICLE_DISTANCE;

      var particlesPlaced = 0;
      var xPos;
      var yPos;
      for ( var i = 0; particlesPlaced < numberOfAtoms; i++ ) { // One iteration per layer.
        for ( var j = 0; ( j < atomsPerLayer ) && ( particlesPlaced < numberOfAtoms ); j++ ) {
          xPos = startingPosX + ( j * MIN_INITIAL_INTER_PARTICLE_DISTANCE );
          if ( i % 2 !== 0 ) {

            // Every other row is shifted a bit to create hexagonal pattern.
            xPos += MIN_INITIAL_INTER_PARTICLE_DISTANCE / 2;
          }
          yPos = startingPosY + i * MIN_INITIAL_INTER_PARTICLE_DISTANCE * 0.866;
          moleculeCenterOfMassPositions[ ( i * atomsPerLayer ) + j ].setXY( xPos, yPos );

          particlesPlaced++;

          // Assign each particle an initial velocity.
          moleculeVelocities[ ( i * atomsPerLayer ) + j ].x = temperatureSqrt * this.random.nextGaussian();
          moleculeVelocities[ ( i * atomsPerLayer ) + j ].y = temperatureSqrt * this.random.nextGaussian();
        }
      }
    },

    /**
     * Set the phase to the liquid state.
     * @private
     */
    setPhaseLiquid: function() {

      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );
      var temperatureSqrt = Math.sqrt( StatesOfMatterConstants.LIQUID_TEMPERATURE );

      // Set the initial velocity for each of the atoms based on the new temperature.
      var numberOfAtoms = this.multipleParticleModel.moleculeDataSet.numberOfAtoms;
      var moleculeCenterOfMassPositions = this.multipleParticleModel.moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = this.multipleParticleModel.moleculeDataSet.moleculeVelocities;
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

          // Check if the position is too close to the wall.  Note
          // that we don't check inter-particle distances here - we
          // rely on the placement algorithm to make sure that we don't
          // run into problems with this.
          if ( ( xPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( xPos < this.multipleParticleModel.normalizedContainerWidth - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( yPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( xPos < this.multipleParticleModel.normalizedContainerHeight - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) ) {

            // This is an acceptable position.
            moleculeCenterOfMassPositions[ atomsPlaced++ ].setXY( xPos, yPos );
            break;
          }
        }
      }
    },

    /**
     * Set the phase to the gaseous state.
     * @private
     */
    setPhaseGas: function() {

      // Set the temperature for the new state.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.GAS_TEMPERATURE );
      var temperatureSqrt = Math.sqrt( StatesOfMatterConstants.GAS_TEMPERATURE );
      var numberOfAtoms = this.multipleParticleModel.moleculeDataSet.numberOfAtoms;
      var moleculeCenterOfMassPositions = this.multipleParticleModel.moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = this.multipleParticleModel.moleculeDataSet.moleculeVelocities;

      for ( var i = 0; i < numberOfAtoms; i++ ) {
        // Temporarily position the particles at (0,0).
        moleculeCenterOfMassPositions[ i ].setXY( 0, 0 );

        // Assign each particle an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.random.nextGaussian(),
          temperatureSqrt * this.random.nextGaussian() );
      }

      // Redistribute the particles randomly around the container, but make sure that they are not too close together or
      // they end up with a disproportionate amount of kinetic energy.
      var newPosX;
      var newPosY;
      var rangeX = this.multipleParticleModel.normalizedContainerWidth - ( 2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
      var rangeY = this.multipleParticleModel.normalizedContainerWidth - ( 2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
      for ( i = 0; i < numberOfAtoms; i++ ) {
        for ( var j = 0; j < this.MAX_PLACEMENT_ATTEMPTS; j++ ) {

          // Pick a random position.
          newPosX = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( Math.random() * rangeX );
          newPosY = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( Math.random() * rangeY );
          var positionAvailable = true;
          // See if this position is available.
          for ( var k = 0; k < i; k++ ) {
            if ( moleculeCenterOfMassPositions[ k ].distanceXY( newPosX, newPosY ) < MIN_INITIAL_INTER_PARTICLE_DISTANCE ) {
              positionAvailable = false;
              break;
            }
          }
          if ( positionAvailable ) {
            // We found an open position.
            moleculeCenterOfMassPositions[ i ].setXY( newPosX, newPosY );
            break;
          }
          else if ( j === this.MAX_PLACEMENT_ATTEMPTS - 1 ) {
            // This is the last attempt, so use this position anyway.
            moleculeCenterOfMassPositions[ i ].setXY( newPosX, newPosY );
          }
        }
      }
    }
  } );
} );