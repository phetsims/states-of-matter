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
  var PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  var Random = require( 'DOT/Random' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );

  // @private
  var MIN_INITIAL_DIAMETER_DISTANCE = 1.4;

  // The following constants can be adjusted to make the the corresponding
  // phase more or less dense.
  var LIQUID_SPACING_FACTOR = 0.8;
  var GAS_SPACING_FACTOR = 1.0;

  /**
   * @param { MultipleParticleModel } multipleParticleModel - model of a set of particles
   * @constructor
   */
  function WaterPhaseStateChanger( multipleParticleModel ) {

    // Make sure this is not being used on an inappropriate data set.
    assert && assert( multipleParticleModel.getMoleculeDataSetRef().getAtomsPerMolecule() === 3 );

    this.multiPleParticleModel = multipleParticleModel;
    this.rand = new Random(); //@private
    this.positionUpdater = WaterAtomPositionUpdater; // @private
    AbstractPhaseStateChanger.call( this, multipleParticleModel );
  }

  statesOfMatter.register( 'WaterPhaseStateChanger', WaterPhaseStateChanger );

  return inherit( AbstractPhaseStateChanger, WaterPhaseStateChanger, {

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
        default:
          throw new Error( 'invalid phaseID: ' + phaseID );
      }
      var moleculeDataSet = this.multiPleParticleModel.getMoleculeDataSetRef();

      // Sync up the atom positions with the molecule positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Step the model a number of times in order to prevent the particles from looking too organized.  The number of
      // steps was empirically determined.
      for ( var i = 0; i < 5; i++ ) {
        this.multiPleParticleModel.stepInternal( 0.016 );
      }
    },

    /**
     * @private
     * Set the phase to the solid state.
     */
    setPhaseSolid: function() {

      // Set the multiPleParticleModel temperature for this phase.
      this.multiPleParticleModel.setTemperature( StatesOfMatterConstants.SOLID_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multiPleParticleModel.getMoleculeDataSetRef();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
      var moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

      // Create and initialize other variables needed to do the job
      var temperatureSqrt = Math.sqrt( this.multiPleParticleModel.getTemperatureSetPoint() );
      var moleculesPerLayer = Math.floor( Math.sqrt( numberOfMolecules ) );

      // Initialize the velocities and angles of the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.rand.nextGaussian(), temperatureSqrt * this.rand.nextGaussian() );

        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[ i ] = phet.joist.random.nextDouble() * temperatureSqrt * Math.PI * 2;
      }

      // Establish the starting position, which will be the lower left corner
      // of the "cube".
      var crystalWidth = (moleculesPerLayer - 1) * MIN_INITIAL_DIAMETER_DISTANCE;
      var startingPosX = (this.multiPleParticleModel.getNormalizedContainerWidth() / 2) - (crystalWidth / 2);
      var startingPosY = MIN_INITIAL_DIAMETER_DISTANCE;

      // Place the molecules by placing their centers of mass.
      var moleculesPlaced = 0;
      var xPos;
      var yPos;
      for ( i = 0; i < numberOfMolecules; i++ ) {

        // One iteration per layer.
        for ( var j = 0; (j < moleculesPerLayer) && (moleculesPlaced < numberOfMolecules); j++ ) {
          xPos = startingPosX + (j * MIN_INITIAL_DIAMETER_DISTANCE);
          if ( i % 2 !== 0 ) {

            // Every other row is shifted a bit to create hexagonal pattern.
            xPos += MIN_INITIAL_DIAMETER_DISTANCE / 2;
          }
          yPos = startingPosY + (i * MIN_INITIAL_DIAMETER_DISTANCE * 0.866);
          var atomIndex = ( i * moleculesPerLayer ) + j;
          moleculeCenterOfMassPositions[ atomIndex ].setXY( xPos, yPos );
          moleculeRotationAngles[ atomIndex ] = phet.joist.random.nextDouble() * 2 * Math.PI;
          moleculesInsideContainer[ atomIndex ] = true;
          moleculesPlaced++;
        }
      }
    },

    /**
     * @private
     * Set the phase to the liquid state.
     */
    setPhaseLiquid: function() {

      // Set the model temperature for this phase.
      this.multiPleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multiPleParticleModel.getMoleculeDataSetRef();
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
      var moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multiPleParticleModel.getTemperatureSetPoint() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

      // Initialize the velocities and angles of the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.rand.nextGaussian(), temperatureSqrt * this.rand.nextGaussian() );

        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[ i ] = phet.joist.random.nextDouble() * temperatureSqrt * Math.PI * 2;

        // Mark each molecule as in the container.
        moleculesInsideContainer[ i ] = true;
      }

      // Assign each molecule to a position.
      var moleculesPlaced = 0;
      var centerPointX = this.multiPleParticleModel.getNormalizedContainerWidth() / 2;
      var centerPointY = this.multiPleParticleModel.getNormalizedContainerHeight() / 4;
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
                                                             (MIN_INITIAL_DIAMETER_DISTANCE * LIQUID_SPACING_FACTOR) );
            particlesOnCurrentLayer = 0;
          }

          // Check if the position is too close to the wall.  Note that we don't check inter-particle distances here -
          // we rely on the placement algorithm to make sure that this is not a problem.
          if ( (xPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
               (xPos < this.multiPleParticleModel.getNormalizedContainerWidth() - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
               (yPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) &&
               (xPos < this.multiPleParticleModel.getNormalizedContainerHeight() - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) ) {

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
     * @private
     * Set the phase to the gaseous state.
     */
    setPhaseGas: function() {

      // Set the multiPleParticleModel temperature for this phase.
      this.multiPleParticleModel.setTemperature( StatesOfMatterConstants.GAS_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multiPleParticleModel.getMoleculeDataSetRef();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multiPleParticleModel.getTemperatureSetPoint() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Temporarily position the molecules at (0,0).
        moleculeCenterOfMassPositions[ i ].setXY( 0, 0 );

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.rand.nextGaussian(), temperatureSqrt * this.rand.nextGaussian() );

        // Assign each molecule an initial rotational position.
        moleculeRotationAngles[ i ] = phet.joist.random.nextDouble() * Math.PI * 2;

        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[ i ] = ( phet.joist.random.nextDouble() * 2 - 1 ) * temperatureSqrt * Math.PI * 2;

        // Mark each molecule as in the container.
        moleculesInsideContainer[ i ] = true;
      }

      // Redistribute the molecules randomly around the container, but make sure that they are not too close together or
      // they end up with a disproportionate amount of kinetic energy.
      var newPosX;
      var newPosY;
      var rangeX = this.multiPleParticleModel.getNormalizedContainerWidth() - (2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      var rangeY = this.multiPleParticleModel.getNormalizedContainerHeight() - (2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      for ( i = 0; i < numberOfMolecules; i++ ) {
        for ( var j = 0; j < this.MAX_PLACEMENT_ATTEMPTS; j++ ) {

          // Pick a random position.
          newPosX = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (  phet.joist.random.nextDouble() * rangeX);
          newPosY = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (  phet.joist.random.nextDouble() * rangeY);
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

            // This is the last attempt, so do a linear search for a usable spot
            var openPoint = this.findOpenMoleculeLocation();
            if ( openPoint !== null ) {
              moleculeCenterOfMassPositions[ i ].setXY( openPoint );
            }
          }
        }
      }
    }
  } );
} );
