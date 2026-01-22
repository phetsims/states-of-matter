// Copyright 2014-2016, University of Colorado Boulder

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
  var PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = 1.5;
  var MAX_PLACEMENT_ATTEMPTS = 500; // for random placement of particles
  var MIN_INITIAL_GAS_PARTICLE_DISTANCE = 1.1; // empirically determined

  /**
   * @param { MultipleParticleModel } multipleParticleModel of the simulation
   * @constructor
   */
  function AbstractPhaseStateChanger( multipleParticleModel ) {
    this.multipleParticleModel = multipleParticleModel;
    this.moleculeLocation = new Vector2();
    this.random = phet.joist.random;
  }

  statesOfMatter.register( 'AbstractPhaseStateChanger', AbstractPhaseStateChanger );

  return inherit( Object, AbstractPhaseStateChanger, {

    /**
     * Set the phase based on the specified ID.  This often needs to be overridden in descendant classes to do more
     * specific activities.
     * @param phaseID
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
    },

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
     * form the molecules into a crystal, which is essentially a cube shape
     * @param {number} moleculesPerLayer
     * @param {number} xSpacing
     * @param {number} ySpacing
     * @param {number} alternateRowOffset
     * @param {number} bottomY
     * @param {boolean} randomizeRotationalAngle
     */
    formCrystal: function( moleculesPerLayer, xSpacing, ySpacing, alternateRowOffset, bottomY, randomizeRotationalAngle ) {

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

      // Set up other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPointProperty.get() );
      var crystalWidth = moleculesPerLayer * xSpacing;
      var startingPosX = ( this.multipleParticleModel.normalizedContainerWidth / 2 ) - ( crystalWidth / 2 );

      // Place the molecules by placing their centers of mass.
      var moleculesPlaced = 0;
      var xPos;
      var yPos;
      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Position one layer of molecules.
        for ( var j = 0; ( j < moleculesPerLayer ) && ( moleculesPlaced < numberOfMolecules ); j++ ) {
          xPos = startingPosX + ( j * xSpacing );
          if ( i % 2 !== 0 ) {

            // Every other row is shifted a bit.
            xPos += alternateRowOffset;
          }
          yPos = bottomY + ( i * ySpacing );
          var moleculeIndex = ( i * moleculesPerLayer ) + j;
          moleculeCenterOfMassPositions[ moleculeIndex ].setXY( xPos, yPos );
          moleculeRotationAngles[ moleculeIndex ] = 0;
          moleculesPlaced++;

          // Assign each molecule an initial velocity.
          var xVel = temperatureSqrt * this.random.nextGaussian();
          var yVel = temperatureSqrt * this.random.nextGaussian();
          moleculeVelocities[ moleculeIndex ].setXY( xVel, yVel );

          // Assign an initial rotational angle (has no effect for single-atom data sets)
          moleculeRotationAngles[ moleculeIndex ] = randomizeRotationalAngle ?
                                                    this.random.nextDouble() * 2 * Math.PI :
                                                    0;

          // Mark the molecule as being in the container.
          moleculesInsideContainer[ i ] = true;
        }
      }
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

      // Set up other variables needed to do the job.
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPointProperty.get() );
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

      for ( var i = 0; i < numberOfMolecules; i++ ) {

        // Temporarily position the molecules at (0,0).
        moleculeCenterOfMassPositions[ i ].setXY( 0, 0 );

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY(
          temperatureSqrt * this.random.nextGaussian(),
          temperatureSqrt * this.random.nextGaussian()
        );

        // Assign each molecule an initial rotational angle and rate.  This isn't used in the monatomic case, but it
        // doesn't hurt anything to set the values.
        moleculeRotationAngles[ i ] = this.random.nextDouble() * Math.PI * 2;
        moleculeRotationRates[ i ] = ( this.random.nextDouble() * 2 - 1 ) * temperatureSqrt * Math.PI * 2;

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
          newPosX = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( this.random.nextDouble() * rangeX );
          newPosY = this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( this.random.nextDouble() * rangeY );
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

    /**
     * Set the initial linear and rotational velocities for molecules with more than one atom.
     */
    initializeVelocities: function() {

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
      var moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;
      var temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPointProperty.get() );

      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {

        // Assign each molecule an initial velocity.
        moleculeVelocities[ i ].setXY(
          temperatureSqrt * this.random.nextGaussian(),
          temperatureSqrt * this.random.nextGaussian()
        );

        // Assign each molecule an initial rotation rate.  This has no effect for multi-atom particles, but doesn't
        // hurt anything.
        moleculeRotationRates[ i ] = this.random.nextDouble() * temperatureSqrt * Math.PI * 2;

        // Mark each molecule as in the container.
        moleculesInsideContainer[ i ] = true;
      }
    },

    /**
     * Set the phase state to liquid, works for all multi-atom molecules (so far).
     * @protected
     */
    setPhaseLiquidMultiAtom: function( minInitialDistance, spacingFactor ) {

      // Set the model temperature for this phase.
      this.multipleParticleModel.setTemperature( StatesOfMatterConstants.LIQUID_TEMPERATURE );

      // Get references to the various elements of the data set.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;

      // Initialize the velocities of the molecules.
      this.initializeVelocities();

      // Assign each molecule to a position.
      var moleculesPlaced = 0;
      var centerPointX = this.multipleParticleModel.normalizedContainerWidth / 2;
      var centerPointY = this.multipleParticleModel.normalizedContainerHeight / 4;
      var currentLayer = 0;
      var particlesOnCurrentLayer = 0;
      var particlesThatWillFitOnCurrentLayer = 1;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        for ( var j = 0; j < this.MAX_PLACEMENT_ATTEMPTS; j++ ) {
          var distanceFromCenter = currentLayer * minInitialDistance * spacingFactor;
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
                                                             ( minInitialDistance * spacingFactor ) );
            particlesOnCurrentLayer = 0;
          }

          // Check if the position is too close to the wall.  Note that we don't check inter-particle distances here -
          // we rely on the placement algorithm to make sure that this is not a problem.
          if ( ( xPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( xPos < this.multipleParticleModel.normalizedContainerWidth - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( yPos > this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) &&
               ( xPos < this.multipleParticleModel.normalizedContainerHeight - this.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE ) ) {

            // This is an acceptable position.
            moleculeCenterOfMassPositions[ moleculesPlaced ].setXY( xPos, yPos );
            moleculeRotationAngles[ moleculesPlaced ] = angle + Math.PI / 2;
            moleculesPlaced++;
            break;
          }
        }
      }
    },

    MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE: MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE,
    DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL: 0.12,  // In particle diameters.
    MAX_PLACEMENT_ATTEMPTS: 500 // For random placement of particles.
  } );
} )
;
