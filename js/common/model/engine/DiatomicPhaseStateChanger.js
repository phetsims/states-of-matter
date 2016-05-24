// Copyright 2014-2015, University of Colorado Boulder

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
  var Random = require( 'DOT/Random' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // constants
  var MIN_INITIAL_DIAMETER_DISTANCE = 2.0;

  // The following constants can be adjusted to make the the corresponding phase more or less dense.
  var LIQUID_SPACING_FACTOR = 0.7;
  var GAS_SPACING_FACTOR = 1.0;

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function DiatomicPhaseStateChanger( multipleParticleModel ) {

    // Make sure this is not being used on an inappropriate data set.
    assert && assert( multipleParticleModel.getMoleculeDataSetRef().getAtomsPerMolecule() === 2 );

    // initialization
    this.positionUpdater = DiatomicAtomPositionUpdater; // @private
    AbstractPhaseStateChanger.call( this, multipleParticleModel );
    this.multipleParticleModel = multipleParticleModel;
    this.rand = new Random();
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
          postChangeModelSteps = 200;
          break;
        case PhaseStateEnum.GAS:
          this.setPhaseGas();
          postChangeModelSteps = 0;
          break;
      }

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;

      // Assume that we've done our job correctly and that all the atoms are in safe positions.
      this.multipleParticleModel.moleculeDataSet.numberOfSafeMolecules = moleculeDataSet.getNumberOfMolecules();

      // Sync up the atom positions with the molecule positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Step the model a number of times in order to prevent the particles
      // from looking too organized.  The number of steps was empirically
      // determined.
      for ( var i = 0; i < postChangeModelSteps; i++ ) {
        this.multipleParticleModel.stepInternal( 0.016 );
      }
    },

    /**
     * Set the phase to the solid state.
     * @private
     */
    setPhaseSolid: function() {

      // Set the model temperature for this phase.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.SOLID_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;

      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPoint );
      var moleculesPerLayer = (Math.round( Math.sqrt( numberOfMolecules * 2 ) ) / 2 );

      // Establish the starting position, which will be the lower left corner
      // of the "cube".  The molecules will all be rotated so that they are
      // lying down.
      var crystalWidth = moleculesPerLayer * ( 2.0 - 0.3 ); // Final term is a fudge factor that can be adjusted to center the cube.
      var startingPosX = ( this.multipleParticleModel.normalizedContainerWidth / 2 ) - ( crystalWidth / 2);

      var startingPosY = 1.2 + this.DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL; // multiplier can be tweaked to minimize initial "bounce"

      // Place the molecules by placing their centers of mass.
      var moleculesPlaced = 0;
      var xPos;
      var yPos;
      for ( var i = 0; i < numberOfMolecules; i++ ) {      // One iteration per layer.

        for ( var j = 0; (j < moleculesPerLayer ) && ( moleculesPlaced < numberOfMolecules ); j++ ) {
          xPos = startingPosX + (j * MIN_INITIAL_DIAMETER_DISTANCE);
          if ( i % 2 !== 0 ) {

            // Every other row is shifted a bit to create hexagonal pattern.
            xPos += ( 1 + this.DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL ) / 2;
          }
          yPos = startingPosY + ( i * MIN_INITIAL_DIAMETER_DISTANCE * 0.5 );
          moleculeCenterOfMassPositions[ (i * moleculesPerLayer) + j ].setXY( xPos, yPos );
          moleculeRotationAngles[ ( i * moleculesPerLayer) + j ] = 0;
          moleculesPlaced++;

          // Assign each molecule an initial velocity.
          var xVel = temperatureSqrt * this.rand.nextGaussian();
          var yVel = temperatureSqrt * this.rand.nextGaussian();
          moleculeVelocities[ ( i * moleculesPerLayer) + j ].setXY( xVel, yVel );
        }
      }
    },

    /**
     * Set the phase to the liquid state.
     * @private
     */
    setPhaseLiquid: function() {

      // Set the model temperature for this phase.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multipleParticleModel.getMoleculeDataSetRef();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();

      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.getTemperatureSetPoint() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

      // Initialize the velocities and angles of the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.rand.nextGaussian(), temperatureSqrt * this.rand.nextGaussian() );

        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[ i ] = Math.random() * temperatureSqrt * Math.PI * 2;
      }
      // Assign each molecule to a position.
      var moleculesPlaced = 0;
      var centerPointX = this.multipleParticleModel.getNormalizedContainerWidth() / 2;
      var centerPointY = this.multipleParticleModel.getNormalizedContainerHeight() / 4;
      var currentLayer = 0;
      var particlesOnCurrentLayer = 0;
      var particlesThatWillFitOnCurrentLayer = 1;
      for ( i = 0; i < numberOfMolecules; i++ ) {
        for ( var j = 0; j < this.MAX_PLACEMENT_ATTEMPTS; j++ ) {
          var distanceFromCenter = currentLayer * MIN_INITIAL_DIAMETER_DISTANCE * LIQUID_SPACING_FACTOR;
          var angle = (particlesOnCurrentLayer / particlesThatWillFitOnCurrentLayer * 2 * Math.PI) +
                      (particlesThatWillFitOnCurrentLayer / (4 * Math.PI));
          var xPos = centerPointX + (distanceFromCenter * Math.cos( angle ));
          var yPos = centerPointY + (distanceFromCenter * Math.sin( angle ));

          // Consider this spot used even if we don't actually put the particle there.
          particlesOnCurrentLayer++;
          if ( particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer ) {

            // This layer is full - move to the next one.
            currentLayer++;
            particlesThatWillFitOnCurrentLayer = Math.floor( currentLayer * 2 * Math.PI /
                                                             ( MIN_INITIAL_DIAMETER_DISTANCE * LIQUID_SPACING_FACTOR ) );
            particlesOnCurrentLayer = 0;
          }
          // Check if the position is too close to the wall.  Note
          // that we don't check inter-particle distances here - we rely
          // on the placement algorithm to make sure that this is not a
          // problem.
          if ( (xPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
               (xPos < this.multipleParticleModel.getNormalizedContainerWidth() - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
               (yPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
               (xPos < this.multipleParticleModel.getNormalizedContainerHeight() - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) ) {

            // This is an acceptable position.
            moleculeCenterOfMassPositions[ moleculesPlaced ].setXY( xPos, yPos );
            moleculeRotationAngles[ moleculesPlaced ] = angle + Math.PI / 2;
            moleculesPlaced++;
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

      // Set the model temperature for this phase.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.GAS_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multipleParticleModel.getMoleculeDataSetRef();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();

      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.getTemperatureSetPoint() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Temporarily position the molecules at (0,0).
        moleculeCenterOfMassPositions[ i ].setXY( 0, 0 );

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.rand.nextGaussian(), temperatureSqrt * this.rand.nextGaussian() );

        // Assign each molecule an initial rotational position.
        moleculeRotationAngles[ i ] = Math.random() * Math.PI * 2;

        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[ i ] = Math.random() * temperatureSqrt * Math.PI * 2;
      }

      // Redistribute the molecules randomly around the container, but make sure that they are not too close together or
      // they end up with a disproportionate amount of kinetic energy.
      var newPosX;
      var newPosY;
      var rangeX = this.multipleParticleModel.getNormalizedContainerWidth() - (2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      var rangeY = this.multipleParticleModel.getNormalizedContainerWidth() - ( 2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      for ( i = 0; i < numberOfMolecules; i++ ) {
        for ( var j = 0; j < this.MAX_PLACEMENT_ATTEMPTS; j++ ) {

          // Pick a random position.
          newPosX = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( Math.random() * rangeX);
          newPosY = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( Math.random() * rangeY);
          var positionAvailable = true;

          // See if this position is available.
          for ( var k = 0; k < i; k++ ) {
            if ( moleculeCenterOfMassPositions[ k ].distanceXY( newPosX, newPosY ) <
                 MIN_INITIAL_DIAMETER_DISTANCE * GAS_SPACING_FACTOR ) {
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
            var openPoint = this.findOpenMoleculeLocation();
            if ( openPoint !== null ) {
              moleculeCenterOfMassPositions[ i ].setXY( openPoint.x, openPoint.y );
            }
          }
        }
      }
    }
  } );
} );
