// Copyright 2002-2015, University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'STATES_OF_MATTER/common/model/Random' );
  var AbstractPhaseStateChanger = require( 'STATES_OF_MATTER/common/model/engine/AbstractPhaseStateChanger' );
  var WaterAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/WaterAtomPositionUpdater' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  //private
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

  return inherit( AbstractPhaseStateChanger, WaterPhaseStateChanger, {

    /**
     * @public
     * @param {Number} phaseID - state(solid/liquid/gas) of Molecule
     */
    setPhase: function( phaseID ) {

      switch( phaseID ) {
        case AbstractPhaseStateChanger.PHASE_SOLID:
          this.setPhaseSolid();
          break;
        case AbstractPhaseStateChanger.PHASE_LIQUID:
          this.setPhaseLiquid();
          break;
        case AbstractPhaseStateChanger.PHASE_GAS:
          this.setPhaseGas();
          break;
      }
      var moleculeDataSet = this.multiPleParticleModel.getMoleculeDataSetRef();

      // in safe positions.
      this.multiPleParticleModel.getMoleculeDataSetRef().setNumberOfSafeMolecules( moleculeDataSet.getNumberOfMolecules() );

      // Sync up the atom positions with the molecule positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // determined.
      for ( var i = 0; i < 100; i++ ) {
        this.multiPleParticleModel.step();
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
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      // Create and initialize other variables needed to do the job
      var temperatureSqrt = Math.sqrt( this.multiPleParticleModel.getTemperatureSetPoint() );
      var moleculesPerLayer = Math.sqrt( numberOfMolecules );
      // Initialize the velocities and angles of the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.rand.nextGaussian(), temperatureSqrt * this.rand.nextGaussian() );
        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[ i ] = Math.random() * temperatureSqrt * Math.PI * 2;
      }
      // of the "cube".
      var crystalWidth = (moleculesPerLayer - 1) * MIN_INITIAL_DIAMETER_DISTANCE;
      var startingPosX = (this.multiPleParticleModel.getNormalizedContainerWidth() / 2) - (crystalWidth / 2);
      var startingPosY = MIN_INITIAL_DIAMETER_DISTANCE;
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
          moleculeCenterOfMassPositions[ (i * moleculesPerLayer) + j ].setXY( xPos, yPos );
          moleculeRotationAngles[ (i * moleculesPerLayer) + j ] = Math.random() * 2 * Math.PI;
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
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multiPleParticleModel.getTemperatureSetPoint() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      // Initialize the velocities and angles of the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY( temperatureSqrt * this.rand.nextGaussian(), temperatureSqrt * this.rand.nextGaussian() );
        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[ i ] = Math.random() * temperatureSqrt * Math.PI * 2;
      }
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
          // Consider this spot used even if we don't actually put the
          particlesOnCurrentLayer++;
          // particle there.
          if ( particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer ) {
            // This layer is full - move to the next one.
            currentLayer++;
            particlesThatWillFitOnCurrentLayer = (currentLayer * 2 * Math.PI /
                                                  (MIN_INITIAL_DIAMETER_DISTANCE * LIQUID_SPACING_FACTOR));
            particlesOnCurrentLayer = 0;
          }
          // problem.
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
      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multiPleParticleModel.getTemperatureSetPoint() );
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
      // disproportionate amount of kinetic energy.
      var newPosX;
      var newPosY;
      var rangeX = this.multiPleParticleModel.getNormalizedContainerWidth() - (2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      var rangeY = this.multiPleParticleModel.getNormalizedContainerHeight() - (2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      for ( i = 0; i < numberOfMolecules; i++ ) {
        for ( var j = 0; j < this.MAX_PLACEMENT_ATTEMPTS; j++ ) {
          // Pick a random position.
          newPosX = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (  Math.random() * rangeX);
          newPosY = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (  Math.random() * rangeY);
          var positionAvailable = true;
          // See if this position is available.
          for ( var k = 0; k < i; k++ ) {
            if ( moleculeCenterOfMassPositions[ k ].distance( newPosX, newPosY ) <
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
            // usable spot.
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

