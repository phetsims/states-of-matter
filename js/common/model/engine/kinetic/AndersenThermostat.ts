// Copyright 2014-2021, University of Colorado Boulder

/**
 * Model for an Andersen Thermostat, which adjusts the velocity of all atoms/molecules in the system by the same amount
 * in order to get the overall system temperature to the desired set point.  There is a short Wikipedia entry for this
 * algorithm at https://en.wikipedia.org/wiki/Andersen_thermostat.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import dotRandom from '../../../../../../dot/js/dotRandom.js';
import Vector2, { Vector2StateObject } from '../../../../../../dot/js/Vector2.js';
import IOType from '../../../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../../../tandem/js/types/NumberIO.js';
import statesOfMatter from '../../../../statesOfMatter.js';
import SOMConstants from '../../../SOMConstants.js';
import MoleculeForceAndMotionDataSet from '../../MoleculeForceAndMotionDataSet.js';

// constants
const PROPORTION_COMPENSATION_FACTOR = 0.25; // used for drift compensation, value empirically determined
const INTEGRAL_COMPENSATION_FACTOR = 0.5; // used for drift compensation, value empirically determined

class AndersenThermostat {

  // target temperature in normalized model units
  public targetTemperature: number;

  // minimum temperature in normalized model units, below this is considered absolute 0;
  public minModelTemperature: number;

  // reference to the molecule data set
  private readonly moleculeDataSet: MoleculeForceAndMotionDataSet;

  // pseudo-random number generator
  private readonly random: typeof dotRandom;

  // reusable vector used for calculating velocity changes
  private readonly previousParticleVelocity: Vector2;

  // vectors used to correct for a collective drift that can occur
  private readonly totalVelocityChangePreviousStep: Vector2;
  private readonly totalVelocityChangeThisStep: Vector2;
  private readonly accumulatedAverageVelocityChange: Vector2;

  /**
   * Constructor for the Andersen thermostat.
   * @param moleculeDataSet - Data set on which operations will be performed.
   * @param minTemperature - The temperature that should be considered absolute zero, below which motion should cease
   */
  public constructor( moleculeDataSet: MoleculeForceAndMotionDataSet, minTemperature: number ) {

    this.targetTemperature = SOMConstants.INITIAL_TEMPERATURE;

    this.minModelTemperature = minTemperature;

    this.moleculeDataSet = moleculeDataSet;

    this.random = dotRandom;

    this.previousParticleVelocity = new Vector2( 0, 0 );

    this.totalVelocityChangePreviousStep = new Vector2( 0, 0 );
    this.totalVelocityChangeThisStep = new Vector2( 0, 0 );
    this.accumulatedAverageVelocityChange = new Vector2( 0, 0 );
  }

  public adjustTemperature(): void {

    // A Note to Future Maintainers: This code was originally provided by Paul Beale of the University of Colorado and
    // converted into Java, and then JavaScript, by @jbphet. For many years, it had separate gamma values the X and Y
    // directions, but those values were always set to the same thing.  In early August of 2018, I (jbphet) refactored
    // this to have a single gamma value in order to reduce the number of calculations done and thus improve
    // performance.  If it's ever needed, separate values could be brought back for X and Y.

    let gamma;
    let temperature = this.targetTemperature;
    if ( temperature > this.minModelTemperature ) {

      // Use a values that will cause the molecules to stop moving pretty quickly if we are below the minimum
      // temperature, since we want to create the appearance of absolute zero.  Values were empirically determined.
      gamma = 0.999;
    }
    else {

      // Use a values that will cause the molecules to stop moving pretty quickly if we are below the minimum
      // temperature, since we want to create the appearance of absolute zero.  Values were empirically determined.
      gamma = 0.5;
      temperature = 0;
    }

    const massInverse = 1 / this.moleculeDataSet.moleculeMass;
    const inertiaInverse = 1 / this.moleculeDataSet.moleculeRotationalInertia;
    const scalingFactor = temperature * ( 1 - Math.pow( gamma, 2 ) );
    const velocityScalingFactor = Math.sqrt( massInverse * scalingFactor );
    const rotationScalingFactor = Math.sqrt( inertiaInverse * scalingFactor );
    const numMolecules = this.moleculeDataSet.getNumberOfMolecules();

    // Calculate a compensation factor for any overall drift that is being added by this thermostat.  Without this,
    // we often see solids drifting to the left or right for no apparent reason.  Compensation is only done in the X
    // direction since the Y direction wasn't visually problematic.  For more information on this, please see
    // https://github.com/phetsims/states-of-matter-basics/issues/15.
    const xCompensation = -this.totalVelocityChangePreviousStep.x / numMolecules * PROPORTION_COMPENSATION_FACTOR -
                          this.accumulatedAverageVelocityChange.x * INTEGRAL_COMPENSATION_FACTOR;

    // local vars for convenience and performance
    const moleculeVelocities = this.moleculeDataSet.moleculeVelocities;
    const moleculeRotationRates = this.moleculeDataSet.moleculeRotationRates;

    for ( let i = 0; i < numMolecules; i++ ) {
      const moleculeVelocity = moleculeVelocities[ i ]!;
      this.previousParticleVelocity.set( moleculeVelocity );

      // Calculate the new x and y velocity for this particle.
      const xVel = moleculeVelocity.x * gamma + this.random.nextGaussian() * velocityScalingFactor + xCompensation;
      const yVel = moleculeVelocity.y * gamma + this.random.nextGaussian() * velocityScalingFactor;
      moleculeVelocity.setXY( xVel, yVel );
      moleculeRotationRates[ i ] = gamma * moleculeRotationRates[ i ] +
                                   this.random.nextGaussian() * rotationScalingFactor;
      this.totalVelocityChangeThisStep.addXY(
        xVel - this.previousParticleVelocity.x,
        yVel - this.previousParticleVelocity.y
      );
    }
    this.accumulatedAverageVelocityChange.addXY(
      this.totalVelocityChangeThisStep.x / numMolecules,
      this.totalVelocityChangeThisStep.y / numMolecules
    );
    this.totalVelocityChangePreviousStep.set( this.totalVelocityChangeThisStep );
  }

  /**
   * clear the accumulated velocity bias, should be done when this thermostat starts being used for a number of steps
   * in a row
   */
  public clearAccumulatedBias(): void {
    this.accumulatedAverageVelocityChange.setXY( 0, 0 );
    this.totalVelocityChangePreviousStep.setXY( 0, 0 );
  }

  /**
   * Get an object that describes the current state, used to restore state using setState, used only for phet-io.
   * for phet-io support only
   */
  public toStateObject(): AndersenThermostatStateObject {

    // Note: The moleculeDataSet is *not* included as part of the state because this is assumed to be a reference that
    // is shared with the model, and the model is responsible for updating its state during deserialization.

    return {
      targetTemperature: this.targetTemperature,
      minModelTemperature: this.minModelTemperature,
      previousParticleVelocity: this.previousParticleVelocity.toStateObject(),
      totalVelocityChangePreviousStep: this.totalVelocityChangePreviousStep.toStateObject(),
      totalVelocityChangeThisStep: this.totalVelocityChangeThisStep.toStateObject(),
      accumulatedAverageVelocityChange: this.accumulatedAverageVelocityChange.toStateObject()
    };
  }

  /**
   * Set the state of this instance for phet-io.  This is used for phet-io, but not directly by the PhetioStateEngine -
   * it is instead called during explicit de-serialization.
   * @param stateObject - returned from toStateObject
   */
  public setState( stateObject: AndersenThermostatStateObject ): void {

    // Note: The moleculeDataSet is *not* included as part of the state because this is assumed to be a reference that
    // is shared with the model, and the model is responsible for updating its state during deserialization.

    this.targetTemperature = stateObject.targetTemperature;
    this.minModelTemperature = stateObject.minModelTemperature;
    this.previousParticleVelocity.set( Vector2.fromStateObject( stateObject.previousParticleVelocity ) );
    this.totalVelocityChangePreviousStep.set( Vector2.fromStateObject( stateObject.totalVelocityChangePreviousStep ) );
    this.totalVelocityChangeThisStep.set( Vector2.fromStateObject( stateObject.totalVelocityChangeThisStep ) );
    this.accumulatedAverageVelocityChange.set( Vector2.fromStateObject( stateObject.accumulatedAverageVelocityChange ) );
  }

  public static readonly AndersenThermostatIO = new IOType( 'AndersenThermostatIO', {
    valueType: AndersenThermostat,
    stateSchema: {
      targetTemperature: NumberIO,
      minModelTemperature: NumberIO,
      previousParticleVelocity: Vector2.Vector2IO,
      totalVelocityChangePreviousStep: Vector2.Vector2IO,
      totalVelocityChangeThisStep: Vector2.Vector2IO,
      accumulatedAverageVelocityChange: Vector2.Vector2IO
    }
  } );
}

export type AndersenThermostatStateObject = {
  targetTemperature: number;
  minModelTemperature: number;
  previousParticleVelocity: Vector2StateObject;
  totalVelocityChangePreviousStep: Vector2StateObject;
  totalVelocityChangeThisStep: Vector2StateObject;
  accumulatedAverageVelocityChange: Vector2StateObject;
};

statesOfMatter.register( 'AndersenThermostat', AndersenThermostat );
export default AndersenThermostat;