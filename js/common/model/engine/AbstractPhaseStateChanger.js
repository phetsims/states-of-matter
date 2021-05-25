// Copyright 2014-2021, University of Colorado Boulder

/**
 * This is the base class for the objects that directly change the state of the molecules within the multi-particle
 * simulation.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import dotRandom from '../../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import statesOfMatter from '../../../statesOfMatter.js';
import PhaseStateEnum from '../../PhaseStateEnum.js';
import SOMConstants from '../../SOMConstants.js';

// constants
const MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = 1.5;
const MAX_PLACEMENT_ATTEMPTS = 500; // for random placement of particles
const MIN_INITIAL_GAS_PARTICLE_DISTANCE = 1.1; // empirically determined

class AbstractPhaseStateChanger {

  /**
   * @param { MultipleParticleModel } multipleParticleModel of the simulation
   * @public
   */
  constructor( multipleParticleModel ) {

    // @private
    this.multipleParticleModel = multipleParticleModel;
    this.moleculePosition = new Vector2( 0, 0 );
    this.random = dotRandom;
    this.reusableVector = new Vector2( 0, 0 );
  }

  /**
   * Set the phase based on the specified ID.  This often needs to be overridden in descendant classes to do more
   * specific activities.
   * @param {PhaseStateEnum} phaseID
   * @public
   */
  setPhase( phaseID ) {
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
        throw new Error( `invalid phaseID: ${phaseID}` );
    }
  }

  /**
   * Set the positions and velocities of the particles without setting the model temperature.
   * @param {PhaseStateEnum} phaseID
   * @public
   */
  setParticleConfigurationForPhase( phaseID ) {
    switch( phaseID ) {
      case PhaseStateEnum.SOLID:
        this.setParticleConfigurationSolid();
        break;
      case PhaseStateEnum.LIQUID:
        this.setParticleConfigurationLiquid();
        break;
      case PhaseStateEnum.GAS:
        this.setParticleConfigurationGas();
        break;
      default:
        throw new Error( `invalid phaseID: ${phaseID}` );
    }
  }

  /**
   * Set the model temperature for the specified phase.
   * @param {PhaseStateEnum} phaseID
   * @public
   */
  setTemperatureForPhase( phaseID ) {
    switch( phaseID ) {
      case PhaseStateEnum.SOLID:
        this.multipleParticleModel.setTemperature( SOMConstants.SOLID_TEMPERATURE );
        break;
      case PhaseStateEnum.LIQUID:
        this.multipleParticleModel.setTemperature( SOMConstants.LIQUID_TEMPERATURE );
        break;
      case PhaseStateEnum.GAS:
        this.multipleParticleModel.setTemperature( SOMConstants.GAS_TEMPERATURE );
        break;
      default:
        throw new Error( `invalid phaseID: ${phaseID}` );
    }
  }

  /**
   * set the phase to solid
   * @protected
   */
  setPhaseSolid() {
    this.setTemperatureForPhase( PhaseStateEnum.SOLID );
    this.setParticleConfigurationSolid();
  }

  /**
   * set the phase to liquid
   * @protected
   */
  setPhaseLiquid() {
    this.setTemperatureForPhase( PhaseStateEnum.LIQUID );
    this.setParticleConfigurationLiquid();
  }

  /**
   * set the phase to gas
   * @protected
   */
  setPhaseGas() {
    this.setTemperatureForPhase( PhaseStateEnum.GAS );
    this.setParticleConfigurationGas();
  }

  /**
   * Do a linear search for a position that is suitably far away enough from all other molecules.  This is generally
   * used when the attempt to place a molecule at a random position fails.  This is expensive in terms of
   * computational power, and should thus be used sparingly.
   * @returns {Vector2}
   * @private
   */
  findOpenMoleculePosition() {

    let posX;
    let posY;
    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;

    const minInitialInterParticleDistance = 1.2; // empirically chosen
    const rangeX = this.multipleParticleModel.normalizedContainerWidth - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
    const rangeY = this.multipleParticleModel.normalizedContainerHeight - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
    for ( let i = 0; i < rangeX / minInitialInterParticleDistance; i++ ) {
      for ( let j = 0; j < rangeY / minInitialInterParticleDistance; j++ ) {
        posX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( i * minInitialInterParticleDistance );
        posY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( j * minInitialInterParticleDistance );

        // See if this position is available.
        let positionAvailable = true;
        for ( let k = 0; k < moleculeDataSet.getNumberOfMolecules(); k++ ) {
          if ( moleculeCenterOfMassPositions[ k ].distanceXY( posX, posY ) < minInitialInterParticleDistance ) {
            positionAvailable = false;
            break;
          }
        }
        if ( positionAvailable ) {

          // We found an open position.
          this.moleculePosition.setXY( posX, posY );
          return this.moleculePosition;
        }
      }
    }

    // no open position found, return null
    return null;
  }

  /**
   * form the molecules into a crystal, which is essentially a cube shape
   * @param {number} moleculesPerLayer
   * @param {number} xSpacing
   * @param {number} ySpacing
   * @param {number} alternateRowOffset
   * @param {number} bottomY
   * @param {boolean} randomizeRotationalAngle
   * @protected
   */
  formCrystal( moleculesPerLayer, xSpacing, ySpacing, alternateRowOffset, bottomY, randomizeRotationalAngle ) {

    // Get references to the various elements of the data set.
    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    const moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
    const moleculeVelocities = moleculeDataSet.moleculeVelocities;
    const moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
    const moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

    // Set up other variables needed to do the job.
    const temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPointProperty.get() );
    const crystalWidth = moleculesPerLayer * xSpacing;
    const startingPosX = ( this.multipleParticleModel.normalizedContainerWidth / 2 ) - ( crystalWidth / 2 );

    // Place the molecules by placing their centers of mass.
    let moleculesPlaced = 0;
    let xPos;
    let yPos;
    this.reusableVector.setXY( 0, 0 );
    for ( let i = 0; i < numberOfMolecules; i++ ) {

      // Position one layer of molecules.
      for ( let j = 0; ( j < moleculesPerLayer ) && ( moleculesPlaced < numberOfMolecules ); j++ ) {
        xPos = startingPosX + ( j * xSpacing );
        if ( i % 2 !== 0 ) {

          // Every other row is shifted a little.
          xPos += alternateRowOffset;
        }
        yPos = bottomY + ( i * ySpacing );
        const moleculeIndex = ( i * moleculesPerLayer ) + j;
        moleculeCenterOfMassPositions[ moleculeIndex ].setXY( xPos, yPos );
        moleculeRotationAngles[ moleculeIndex ] = 0;
        moleculesPlaced++;

        // Assign each molecule an initial velocity.
        const xVel = temperatureSqrt * this.random.nextGaussian();
        const yVel = temperatureSqrt * this.random.nextGaussian();
        moleculeVelocities[ moleculeIndex ].setXY( xVel, yVel );

        // Track total velocity in the X direction.
        this.reusableVector.addXY( xVel, yVel );

        // Assign an initial rotational angle (has no effect for single-atom data sets)
        moleculeRotationAngles[ moleculeIndex ] = randomizeRotationalAngle ?
                                                  this.random.nextDouble() * 2 * Math.PI :
                                                  0;

        // Mark the molecule as being in the container.
        moleculesInsideContainer[ i ] = true;
      }
    }

    this.zeroOutCollectiveVelocity();
  }

  /**
   * Set the particle configuration for gas.  This can be generalized more than the liquid and solid phases, hence it
   * can be defined in the base class.
   * @protected
   */
  setParticleConfigurationGas() {

    // Get references to the various elements of the data set.
    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
    const moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
    const moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
    const moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
    const moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

    // Set up other variables needed to do the job.
    const temperatureSqrt = Math.sqrt( this.multipleParticleModel.temperatureSetPointProperty.get() );
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

    for ( let i = 0; i < numberOfMolecules; i++ ) {

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
    let newPosX;
    let newPosY;
    const rangeX = this.multipleParticleModel.normalizedContainerWidth - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
    const rangeY = this.multipleParticleModel.normalizedContainerHeight - ( 2 * MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE );
    for ( let i = 0; i < numberOfMolecules; i++ ) {
      for ( let j = 0; j < MAX_PLACEMENT_ATTEMPTS; j++ ) {

        // Pick a random position.
        newPosX = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( this.random.nextDouble() * rangeX );
        newPosY = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE + ( this.random.nextDouble() * rangeY );
        let positionAvailable = true;

        // See if this position is available.
        for ( let k = 0; k < i; k++ ) {
          if ( moleculeCenterOfMassPositions[ k ].distanceXY( newPosX, newPosY ) < MIN_INITIAL_GAS_PARTICLE_DISTANCE ) {
            positionAvailable = false;
            break;
          }
        }
        if ( positionAvailable || j === MAX_PLACEMENT_ATTEMPTS - 1 ) {

          // We found an open position or we've done all the searching we can.
          moleculeCenterOfMassPositions[ i ].setXY( newPosX, newPosY );
          break;
        }
        else if ( j === MAX_PLACEMENT_ATTEMPTS - 2 ) {

          // This is the second to last attempt, so try a linear search for a usable spot.
          const openPoint = this.findOpenMoleculePosition();
          if ( openPoint !== null ) {
            moleculeCenterOfMassPositions[ i ].set( openPoint );
            break;
          }
        }
      }
    }
  }

  /**
   * zero out the collective velocity of the substance, generally used to help prevent drift after changing phase
   * @protected
   */
  zeroOutCollectiveVelocity() {

    const moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    const moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
    this.reusableVector.setXY( 0, 0 );
    let i;
    for ( i = 0; i < numberOfMolecules; i++ ) {
      this.reusableVector.add( moleculeVelocities[ i ] );
    }
    const xAdjustment = -this.reusableVector.x / numberOfMolecules;
    const yAdjustment = -this.reusableVector.y / numberOfMolecules;
    for ( i = 0; i < numberOfMolecules; i++ ) {
      moleculeVelocities[ i ].addXY( xAdjustment, yAdjustment );
    }
  }

  /**
   * Load previously saved position and motion state, does NOT load forces state
   * @protected
   */
  loadSavedState( savedState ) {

    assert && assert(
      this.multipleParticleModel.moleculeDataSet.numberOfMolecules === savedState.numberOfMolecules,
      'unexpected number of particles in saved data set'
    );

    // Set the initial velocity for each of the atoms based on the new temperature.
    const numberOfMolecules = this.multipleParticleModel.moleculeDataSet.numberOfMolecules;
    const moleculeCenterOfMassPositions = this.multipleParticleModel.moleculeDataSet.moleculeCenterOfMassPositions;
    const moleculeVelocities = this.multipleParticleModel.moleculeDataSet.moleculeVelocities;
    const moleculeRotationAngles = this.multipleParticleModel.moleculeDataSet.moleculeRotationAngles;
    const moleculeRotationRates = this.multipleParticleModel.moleculeDataSet.moleculeRotationRates;
    const moleculesInsideContainer = this.multipleParticleModel.moleculeDataSet.insideContainer;

    // for ( var i = 0; i < numberOfMolecules; i++ ) {
    for ( let i = 0; i < numberOfMolecules; i++ ) {
      moleculeCenterOfMassPositions[ i ].setXY(
        savedState.moleculeCenterOfMassPositions[ i ].x,
        savedState.moleculeCenterOfMassPositions[ i ].y
      );
      moleculeVelocities[ i ].setXY(
        savedState.moleculeVelocities[ i ].x,
        savedState.moleculeVelocities[ i ].y
      );
      if ( savedState.moleculeRotationAngles ) {
        moleculeRotationAngles[ i ] = savedState.moleculeRotationAngles[ i ];
      }
      if ( savedState.moleculeRotationAngles ) {
        moleculeRotationRates[ i ] = savedState.moleculeRotationRates[ i ];
      }
      moleculesInsideContainer[ i ] = true;
    }
  }
}

// statics
AbstractPhaseStateChanger.MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE = MIN_INITIAL_PARTICLE_TO_WALL_DISTANCE;
AbstractPhaseStateChanger.DISTANCE_BETWEEN_PARTICLES_IN_CRYSTAL = 0.12; // in particle diameters
AbstractPhaseStateChanger.MAX_PLACEMENT_ATTEMPTS = MAX_PLACEMENT_ATTEMPTS; // for random placement of particles

statesOfMatter.register( 'AbstractPhaseStateChanger', AbstractPhaseStateChanger );
export default AbstractPhaseStateChanger;
