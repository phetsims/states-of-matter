// Copyright 2002-2011, University of Colorado
/**
 * This is the base class for the objects that directly change the state of
 * the molecules within the multi-particle simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// In particle diameters.
  var DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL = 0.12;
// For random placement of particles.
  var MAX_PLACEMENT_ATTEMPTS = 500;
  var MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = 2.5;

  function AbstractPhaseStateChanger( model ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    this.m_model;
    m_model = model;
  }

  return inherit( Object, AbstractPhaseStateChanger, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    setPhase: function( phaseID ) {
    },
//----------------------------------------------------------------------------
// Private and Protected Methods
//----------------------------------------------------------------------------
    /**
     * Does a linear search for a location that is suitably far away enough
     * from all other molecules.  This is generally used when the attempt to
     * place a molecule at a random location fails.  This is expensive in
     * terms of computational power, and should thus be used sparingly.
     *
     * @return
     */
    findOpenMoleculeLocation: function() {
      var posX, posY;
      var minInitialInterParticleDistance;
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      if ( moleculeDataSet.getAtomsPerMolecule() == 1 ) {
        minInitialInterParticleDistance = 1.2;
      }
      else {
        minInitialInterParticleDistance = 1.5;
      }
      var rangeX = m_model.getNormalizedContainerWidth() - (2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      var rangeY = m_model.getNormalizedContainerHeight() - (2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE);
      for ( var i = 0; i < rangeX / minInitialInterParticleDistance; i++ ) {
        for ( var j = 0; j < rangeY / minInitialInterParticleDistance; j++ ) {
          posX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (i * minInitialInterParticleDistance);
          posY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + (j * minInitialInterParticleDistance);
          // See if this position is available.
          var positionAvailable = true;
          for ( var k = 0; k < moleculeDataSet.getNumberOfMolecules(); k++ ) {
            if ( moleculeCenterOfMassPositions[k].distance( posX, posY ) < minInitialInterParticleDistance ) {
              positionAvailable = false;
              break;
            }
          }
          if ( positionAvailable ) {
            // We found an open position.
            return new Vector2( posX, posY );
          }
        }
      }
      System.err.println( "Error: No open positions available for molecule." );
      return null;
    }
  } );
} );

