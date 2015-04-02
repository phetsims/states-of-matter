// Copyright 2002-2014, University of Colorado Boulder

/**
 * This is the base class for the objects that directly change the state of
 * the molecules within the multi-particle simulation.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = 2.5;

  /**
   *
   * @param { MultipleParticleModel } multipleParticleModel of the simulation
   * @constructor
   */
  function AbstractPhaseStateChanger( multipleParticleModel ) {
    this.multipleParticleModel = multipleParticleModel;
    this.moleculeLocation = new Vector2();
  }

  return inherit( Object, AbstractPhaseStateChanger, {

      /**
       * @public
       * Does a linear search for a location that is suitably far away enough
       * from all other molecules.  This is generally used when the attempt to
       * place a molecule at a random location fails.  This is expensive in
       * terms of computational power, and should thus be used sparingly.
       *
       * @return
       */
      findOpenMoleculeLocation: function() {

        var posX;
        var posY;
        var minInitialInterParticleDistance;
        var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
        var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;

        minInitialInterParticleDistance = ( moleculeDataSet.atomsPerMolecule === 1 ) ? 1.2 : 1.5;
        var rangeX = this.multipleParticleModel.normalizedContainerWidth - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
        var rangeY = this.multipleParticleModel.normalizedContainerHeight - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
        for ( var i = 0; i < rangeX / minInitialInterParticleDistance; i++ ) {
          for ( var j = 0; j < rangeY / minInitialInterParticleDistance; j++ ) {
            posX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( i * minInitialInterParticleDistance );
            posY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( j * minInitialInterParticleDistance );

            // See if this position is available.
            var positionAvailable = true;
            for ( var k = 0; k < moleculeDataSet.getNumberOfMolecules(); k++ ) {
              if ( moleculeCenterOfMassPositions[ k ].distance( posX, posY ) < minInitialInterParticleDistance ) {
                positionAvailable = false;
                break;
              }
            }
            if ( positionAvailable ) {
              // We found an open position.
              this.moleculeLocation.setXY( posX, posY );
              return this.moleculeLocation;
            }
          }
        }
        console.error( "Error: No open positions available for molecule." );
        return null;
      },

      MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE: MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE,
      DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL: 0.12,  // In particle diameters.
      MAX_PLACEMENT_ATTEMPTS: 500 // For random placement of particles.
    },

    // public static final
    {
      PHASE_SOLID: 1,
      PHASE_LIQUID: 2,
      PHASE_GAS: 3
    } );
} );
