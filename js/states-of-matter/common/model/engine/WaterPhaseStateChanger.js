// Copyright 2002-2012, University of Colorado
/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas)
 * for a set of water molecules.  It only works for water and would need to be
 * generalized to handle other triatomic molecules.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var Random = require( 'java.util.Random' );
  var Vector2 = require( 'DOT/Vector2' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------

  //private
  var MIN_INITIAL_DIAMETER_DISTANCE = 1.4;
// The following constants can be adjusted to make the the corresponding
// phase more or less dense.

  //private
  var LIQUID_SPACING_FACTOR = 0.8;

  //private
  var GAS_SPACING_FACTOR = 1.0;

  function WaterPhaseStateChanger( model ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_positionUpdater = new WaterAtomPositionUpdater();
    AbstractPhaseStateChanger.call( this, model );
    // Make sure this is not being used on an inappropriate data set.
    assert && assert( m_model.getMoleculeDataSetRef().getAtomsPerMolecule() == 3 );
  }

  return inherit( AbstractPhaseStateChanger, WaterPhaseStateChanger, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    setPhase: function( phaseID ) {
      switch( phaseID ) {
        case PhaseStateChanger.PHASE_SOLID:
          setPhaseSolid();
          break;
        case PhaseStateChanger.PHASE_LIQUID:
          setPhaseLiquid();
          break;
        case PhaseStateChanger.PHASE_GAS:
          setPhaseGas();
          break;
      }
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
      // in safe positions.
      m_model.getMoleculeDataSetRef().setNumberOfSafeMolecules( moleculeDataSet.getNumberOfMolecules() );
      // Sync up the atom positions with the molecule positions.
      m_positionUpdater.updateAtomPositions( moleculeDataSet );
      // determined.
      for ( var i = 0; i < 100; i++ ) {
        m_model.step();
      }
    },
    /**
     * Set the phase to the solid state.
     */

    //private
    setPhaseSolid: function() {
      // Set the model temperature for this phase.
      m_model.setTemperature( MultipleParticleModel.SOLID_TEMPERATURE );
      // Get references to the various elements of the data set.
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      // Create and initialize other variables needed to do the job.
      var rand = new Random();
      var temperatureSqrt = Math.sqrt( m_model.getTemperatureSetPoint() );
      var moleculesPerLayer = Math.sqrt( numberOfMolecules );
      // Initialize the velocities and angles of the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        // Assign each molecule an initial velocity.
        moleculeVelocities[i].setComponents( temperatureSqrt * rand.nextGaussian(), temperatureSqrt * rand.nextGaussian() );
        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[i] = rand.nextDouble() * temperatureSqrt * Math.PI * 2;
      }
      // of the "cube".
      var crystalWidth = (moleculesPerLayer - 1) * MIN_INITIAL_DIAMETER_DISTANCE;
      var startingPosX = (m_model.getNormalizedContainerWidth() / 2) - (crystalWidth / 2);
      var startingPosY = MIN_INITIAL_DIAMETER_DISTANCE;
      var moleculesPlaced = 0;
      var xPos, yPos;
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        // One iteration per layer.
        for ( var j = 0; (j < moleculesPerLayer) && (moleculesPlaced < numberOfMolecules); j++ ) {
          xPos = startingPosX + (j * MIN_INITIAL_DIAMETER_DISTANCE);
          if ( i % 2 != 0 ) {
            // Every other row is shifted a bit to create hexagonal pattern.
            xPos += MIN_INITIAL_DIAMETER_DISTANCE / 2;
          }
          yPos = startingPosY + (i * MIN_INITIAL_DIAMETER_DISTANCE * 0.866);
          moleculeCenterOfMassPositions[(i * moleculesPerLayer) + j].setLocation( xPos, yPos );
          moleculeRotationAngles[(i * moleculesPerLayer) + j] = rand.nextDouble() * 2 * Math.PI;
          moleculesPlaced++;
        }
      }
    },
    /**
     * Set the phase to the liquid state.
     */

    //private
    setPhaseLiquid: function() {
      // Set the model temperature for this phase.
      m_model.setTemperature( MultipleParticleModel.LIQUID_TEMPERATURE );
      // Get references to the various elements of the data set.
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      // Create and initialize other variables needed to do the job.
      var rand = new Random();
      var temperatureSqrt = Math.sqrt( m_model.getTemperatureSetPoint() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      // Initialize the velocities and angles of the molecules.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        // Assign each molecule an initial velocity.
        moleculeVelocities[i].setComponents( temperatureSqrt * rand.nextGaussian(), temperatureSqrt * rand.nextGaussian() );
        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[i] = rand.nextDouble() * temperatureSqrt * Math.PI * 2;
      }
      var moleculesPlaced = 0;
      var centerPoint = new Vector2( m_model.getNormalizedContainerWidth() / 2, m_model.getNormalizedContainerHeight() / 4 );
      var currentLayer = 0;
      var particlesOnCurrentLayer = 0;
      var particlesThatWillFitOnCurrentLayer = 1;
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        for ( var j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++ ) {
          var distanceFromCenter = currentLayer * MIN_INITIAL_DIAMETER_DISTANCE * LIQUID_SPACING_FACTOR;
          var angle = (particlesOnCurrentLayer / particlesThatWillFitOnCurrentLayer * 2 * Math.PI) + (particlesThatWillFitOnCurrentLayer / (4 * Math.PI));
          var xPos = centerPoint.getX() + (distanceFromCenter * Math.cos( angle ));
          var yPos = centerPoint.getY() + (distanceFromCenter * Math.sin( angle ));
          // Consider this spot used even if we don't actually put the
          particlesOnCurrentLayer++;
          // particle there.
          if ( particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer ) {
            // This layer is full - move to the next one.
            currentLayer++;
            particlesThatWillFitOnCurrentLayer = (currentLayer * 2 * Math.PI / (MIN_INITIAL_DIAMETER_DISTANCE * LIQUID_SPACING_FACTOR));
            particlesOnCurrentLayer = 0;
          }
          // problem.
          if ( (xPos > MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) && (xPos < m_model.getNormalizedContainerWidth() - MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) && (yPos > MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) && (xPos < m_model.getNormalizedContainerHeight() - MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) ) {
            // This is an acceptable position.
            moleculeCenterOfMassPositions[moleculesPlaced].setLocation( xPos, yPos );
            moleculeRotationAngles[moleculesPlaced] = angle + Math.PI / 2;
            moleculesPlaced++;
            break;
          }
        }
      }
    },
    /**
     * Set the phase to the gaseous state.
     */

    //private
    setPhaseGas: function() {
      // Set the model temperature for this phase.
      m_model.setTemperature( MultipleParticleModel.GAS_TEMPERATURE );
      // Get references to the various elements of the data set.
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      // Create and initialize other variables needed to do the job.
      var rand = new Random();
      var temperatureSqrt = Math.sqrt( m_model.getTemperatureSetPoint() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        // Temporarily position the molecules at (0,0).
        moleculeCenterOfMassPositions[i].setLocation( 0, 0 );
        // Assign each molecule an initial velocity.
        moleculeVelocities[i].setComponents( temperatureSqrt * rand.nextGaussian(), temperatureSqrt * rand.nextGaussian() );
        // Assign each molecule an initial rotational position.
        moleculeRotationAngles[i] = rand.nextDouble() * Math.PI * 2;
        // Assign each molecule an initial rotation rate.
        moleculeRotationRates[i] = rand.nextDouble() * temperatureSqrt * Math.PI * 2;
      }
      // disproportionate amount of kinetic energy.
      var newPosX, newPosY;
      var rangeX = m_model.getNormalizedContainerWidth() - (2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      var rangeY = m_model.getNormalizedContainerHeight() - (2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        for ( var j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++ ) {
          // Pick a random position.
          newPosX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (rand.nextDouble() * rangeX);
          newPosY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (rand.nextDouble() * rangeY);
          var positionAvailable = true;
          // See if this position is available.
          for ( var k = 0; k < i; k++ ) {
            if ( moleculeCenterOfMassPositions[k].distance( newPosX, newPosY ) < MIN_INITIAL_DIAMETER_DISTANCE * GAS_SPACING_FACTOR ) {
              positionAvailable = false;
              break;
            }
          }
          if ( positionAvailable ) {
            // We found an open position.
            moleculeCenterOfMassPositions[i].setLocation( newPosX, newPosY );
            break;
          }
          else if ( j == MAX_PLACEMENT_ATTEMPTS - 1 ) {
            // usable spot.
            var openPoint = findOpenMoleculeLocation();
            if ( openPoint != null ) {
              moleculeCenterOfMassPositions[i].setLocation( openPoint );
            }
          }
        }
      }
    }
  } );
} );

