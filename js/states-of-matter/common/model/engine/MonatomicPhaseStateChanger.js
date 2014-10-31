// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class is used to change the phase state (i.e. solid, liquid, or gas)
 * for a set of molecules.
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
  var MIN_INITIAL_INTER_PARTICLE_DISTANCE = 1.12;

  function MonatomicPhaseStateChanger( model ) {

    //private
    this.m_positionUpdater = new MonatomicAtomPositionUpdater();
    AbstractPhaseStateChanger.call( this, model );
  }

  return inherit( AbstractPhaseStateChanger, MonatomicPhaseStateChanger, {
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
      for ( var i = 0; i < 20; i++ ) {
        m_model.step();
      }
    },
    /**
     * Set the phase to the solid state.
     */

    //private
    setPhaseSolid: function() {
      // Set the temperature in the model.
      m_model.setTemperature( MultipleParticleModel.SOLID_TEMPERATURE );
      var numberOfAtoms = m_model.getMoleculeDataSetRef().getNumberOfAtoms();
      var moleculeCenterOfMassPositions = m_model.getMoleculeDataSetRef().getMoleculeCenterOfMassPositions();
      var moleculeVelocities = m_model.getMoleculeDataSetRef().getMoleculeVelocities();
      var rand = new Random();
      var temperatureSqrt = Math.sqrt( m_model.getTemperatureSetPoint() );
      var atomsPerLayer = Math.round( Math.sqrt( numberOfAtoms ) );
      // of the "cube".
      var crystalWidth = (atomsPerLayer - 1) * MIN_INITIAL_INTER_PARTICLE_DISTANCE;
      var startingPosX = (m_model.getNormalizedContainerWidth() / 2) - (crystalWidth / 2);
      var startingPosY = MIN_INITIAL_INTER_PARTICLE_DISTANCE;
      var particlesPlaced = 0;
      var xPos, yPos;
      for ( var i = 0; particlesPlaced < numberOfAtoms; i++ ) {
        // One iteration per layer.
        for ( var j = 0; (j < atomsPerLayer) && (particlesPlaced < numberOfAtoms); j++ ) {
          xPos = startingPosX + (j * MIN_INITIAL_INTER_PARTICLE_DISTANCE);
          if ( i % 2 != 0 ) {
            // Every other row is shifted a bit to create hexagonal pattern.
            xPos += MIN_INITIAL_INTER_PARTICLE_DISTANCE / 2;
          }
          yPos = startingPosY + i * MIN_INITIAL_INTER_PARTICLE_DISTANCE * 0.866;
          moleculeCenterOfMassPositions[(i * atomsPerLayer) + j].setLocation( xPos, yPos );
          particlesPlaced++;
          // Assign each particle an initial velocity.
          moleculeVelocities[(i * atomsPerLayer) + j].setComponents( temperatureSqrt * rand.nextGaussian(), temperatureSqrt * rand.nextGaussian() );
        }
      }
    },
    /**
     * Set the phase to the liquid state.
     */

    //private
    setPhaseLiquid: function() {
      m_model.setTemperature( MultipleParticleModel.LIQUID_TEMPERATURE );
      var temperatureSqrt = Math.sqrt( MultipleParticleModel.LIQUID_TEMPERATURE );
      var numberOfAtoms = m_model.getMoleculeDataSetRef().getNumberOfAtoms();
      var moleculeCenterOfMassPositions = m_model.getMoleculeDataSetRef().getMoleculeCenterOfMassPositions();
      var moleculeVelocities = m_model.getMoleculeDataSetRef().getMoleculeVelocities();
      var rand = new Random();
      for ( var i = 0; i < numberOfAtoms; i++ ) {
        // Assign each particle an initial velocity.
        moleculeVelocities[i].setComponents( temperatureSqrt * rand.nextGaussian(), temperatureSqrt * rand.nextGaussian() );
      }
      var atomsPlaced = 0;
      var centerPoint = new Vector2( m_model.getNormalizedContainerWidth() / 2, m_model.getNormalizedContainerHeight() / 4 );
      var currentLayer = 0;
      var particlesOnCurrentLayer = 0;
      var particlesThatWillFitOnCurrentLayer = 1;
      for ( var j = 0; j < numberOfAtoms; j++ ) {
        for ( var k = 0; k < MAX_PLACEMENT_ATTEMPTS; k++ ) {
          var distanceFromCenter = currentLayer * MIN_INITIAL_INTER_PARTICLE_DISTANCE;
          var angle = (particlesOnCurrentLayer / particlesThatWillFitOnCurrentLayer * 2 * Math.PI) + (particlesThatWillFitOnCurrentLayer / (4 * Math.PI));
          var xPos = centerPoint.getX() + (distanceFromCenter * Math.cos( angle ));
          var yPos = centerPoint.getY() + (distanceFromCenter * Math.sin( angle ));
          // Consider this spot used even if we don't actually put the
          particlesOnCurrentLayer++;
          // particle there.
          if ( particlesOnCurrentLayer >= particlesThatWillFitOnCurrentLayer ) {
            // This layer is full - move to the next one.
            currentLayer++;
            particlesThatWillFitOnCurrentLayer = (currentLayer * 2 * Math.PI / MIN_INITIAL_INTER_PARTICLE_DISTANCE);
            particlesOnCurrentLayer = 0;
          }
          // run into problems with this.
          if ( (xPos > MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) && (xPos < m_model.getNormalizedContainerWidth() - MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) && (yPos > MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) && (xPos < m_model.getNormalizedContainerHeight() - MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE) ) {
            // This is an acceptable position.
            moleculeCenterOfMassPositions[atomsPlaced++].setLocation( xPos, yPos );
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
      // Set the temperature for the new state.
      m_model.setTemperature( MultipleParticleModel.GAS_TEMPERATURE );
      var temperatureSqrt = Math.sqrt( MultipleParticleModel.GAS_TEMPERATURE );
      var numberOfAtoms = m_model.getMoleculeDataSetRef().getNumberOfAtoms();
      var moleculeCenterOfMassPositions = m_model.getMoleculeDataSetRef().getMoleculeCenterOfMassPositions();
      var moleculeVelocities = m_model.getMoleculeDataSetRef().getMoleculeVelocities();
      var rand = new Random();
      for ( var i = 0; i < numberOfAtoms; i++ ) {
        // Temporarily position the particles at (0,0).
        moleculeCenterOfMassPositions[i].setLocation( 0, 0 );
        // Assign each particle an initial velocity.
        moleculeVelocities[i].setComponents( temperatureSqrt * rand.nextGaussian(), temperatureSqrt * rand.nextGaussian() );
      }
      // disproportionate amount of kinetic energy.
      var newPosX, newPosY;
      var rangeX = m_model.getNormalizedContainerWidth() - (2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      var rangeY = m_model.getNormalizedContainerHeight() - (2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      for ( var i = 0; i < numberOfAtoms; i++ ) {
        for ( var j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++ ) {
          // Pick a random position.
          newPosX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (rand.nextDouble() * rangeX);
          newPosY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (rand.nextDouble() * rangeY);
          var positionAvailable = true;
          // See if this position is available.
          for ( var k = 0; k < i; k++ ) {
            if ( moleculeCenterOfMassPositions[k].distance( newPosX, newPosY ) < MIN_INITIAL_INTER_PARTICLE_DISTANCE ) {
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
            // This is the last attempt, so use this position anyway.
            moleculeCenterOfMassPositions[i].setLocation( newPosX, newPosY );
          }
        }
      }
    }
  } );
} );

