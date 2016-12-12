// Copyright 2014-2015, University of Colorado Boulder

/**
 * This is the base class for the objects that directly change the state of the molecules within the multi-particle
 * simulation.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = 1.5;
  var MAX_PLACEMENT_ATTEMPTS = 500; // for random placement of particles
  var MIN_INITIAL_GAS_PARTICLE_DISTANCE = 1.12; // empirically determined

  /**
   * @param { MultipleParticleModel } multipleParticleModel of the simulation
   * @constructor
   */
  function AbstractPhaseStateChanger( multipleParticleModel ) {
    this.multipleParticleModel = multipleParticleModel;
    this.moleculeLocation = new Vector2();
  }

  statesOfMatter.register( 'AbstractPhaseStateChanger', AbstractPhaseStateChanger );

  return inherit( Object, AbstractPhaseStateChanger, {

    /**
     * Do a linear search for a location that is suitably far away enough from all other molecules.  This is generally
     * used when the attempt to place a molecule at a random location fails.  This is expensive in terms of
     * computational power, and should thus be used sparingly.
     * @return {Vector2}
     * @private
     */
    findOpenMoleculeLocation: function() {

      var posX;
      var posY;
      var minInitialInterParticleDistance;
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;

      minInitialInterParticleDistance = 1.2; // empirically chosen
      var rangeX = this.multipleParticleModel.normalizedContainerWidth - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
      var rangeY = this.multipleParticleModel.normalizedContainerHeight - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
      for ( var i = 0; i < rangeX / minInitialInterParticleDistance; i++ ) {
        for ( var j = 0; j < rangeY / minInitialInterParticleDistance; j++ ) {
          posX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( i * minInitialInterParticleDistance );
          posY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( j * minInitialInterParticleDistance );

          // See if this position is available.
          var positionAvailable = true;
          for ( var k = 0; k < moleculeDataSet.getNumberOfMolecules(); k++ ) {
            if ( moleculeCenterOfMassPositions[ k ].distanceXY( posX, posY ) < minInitialInterParticleDistance ) {
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

      // no open position found, return null
      return null;
    },

    /**
     * Set the phase to gas.  This can be generalized more than the liquid and solid phases, hence it can be defined in
     * the base class.
     * @protected
     */
    setPhaseGas: function() {

      // Set the multipleParticleModel temperature for this phase.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.GAS_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

      // Create and initialize other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPointProperty.get() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Temporarily position the molecules at (0,0).
        moleculeCenterOfMassPositions[ i ].setXY( 0, 0 );

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY(
          temperatureSqrt * phet.joist.random.nextGaussian(),
          temperatureSqrt * phet.joist.random.nextGaussian()
        );

        // Assign each molecule an initial rotational angle and rate.  This isn't used in the monatomic case, but it
        // doesn't hurt anything to set the values.
        moleculeRotationAngles[ i ] = phet.joist.random.nextDouble() * Math.PI * 2;
        moleculeRotationRates[ i ] = ( phet.joist.random.nextDouble() * 2 - 1 ) * temperatureSqrt * Math.PI * 2;

        // Mark each molecule as in the container.
        moleculesInsideContainer[ i ] = true;
      }

      // Redistribute the molecules randomly around the container, but make sure that they are not too close together or
      // they end up with a disproportionate amount of kinetic energy.
      var newPosX;
      var newPosY;
      var rangeX = this.multipleParticleModel.normalizedContainerWidth - ( 2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
      var rangeY = this.multipleParticleModel.normalizedContainerHeight - ( 2 * this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
      for ( i = 0; i < numberOfMolecules; i++ ) {
        for ( var j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++ ) {

          // Pick a random position.
          newPosX = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( phet.joist.random.nextDouble() * rangeX );
          newPosY = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( phet.joist.random.nextDouble() * rangeY );
          var positionAvailable = true;

          // See if this position is available.
          for ( var k = 0; k < i; k++ ) {
            if ( moleculeCenterOfMassPositions[ k ].distanceXY( newPosX, newPosY ) < MIN_INITIAL_GAS_PARTICLE_DISTANCE ) {
              positionAvailable = false;
              break;
            }
          }
          if ( positionAvailable || j === this.MAX_PLACEMENT_ATTEMPTS - 1 ) {

            // We found an open position or we've done all the searching we can.
            moleculeCenterOfMassPositions[ i ].setXY( newPosX, newPosY );
            break;
          }
          else if ( j === this.MAX_PLACEMENT_ATTEMPTS - 2 ) {

            // This is the second to last attempt, so try a linear search for a usable spot.
            var openPoint = this.findOpenMoleculeLocation();
            if ( openPoint !== null ) {
              moleculeCenterOfMassPositions[ i ].set( openPoint );
              break;
            }
          }
        }
      }
    },

    MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE: MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE,
    DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL: 0.12,  // In particle diameters.
    MAX_PLACEMENT_ATTEMPTS: 500 // For random placement of particles.
  } );
} );
