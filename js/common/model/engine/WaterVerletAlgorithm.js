// Copyright 2014-2021, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential.
 * This version is used specifically for simulating water, i.e. H2O, and also includes calculations for the charge
 * distributions present in this molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Jonathan Olson
 */

import statesOfMatter from '../../../statesOfMatter.js';
import AbstractVerletAlgorithm from './AbstractVerletAlgorithm.js';
import WaterAtomPositionUpdater from './WaterAtomPositionUpdater.js';

// constants, mostly parameters used for "hollywooding" of the water crystal
const WATER_FULLY_MELTED_TEMPERATURE = 0.3;
const WATER_FULLY_MELTED_ELECTROSTATIC_FORCE = 1.0;
const WATER_FULLY_FROZEN_TEMPERATURE = 0.22;
const WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE = 4.25;
const MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER = 5.25;
const MAX_ROTATION_RATE = 16; // revolutions per second, empirically determined, see usage below
const TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES = 0.10;

class WaterVerletAlgorithm extends AbstractVerletAlgorithm {

  /**
   * @param {MultipleParticleModel} multipleParticleModel
   */
  constructor( multipleParticleModel ) {

    super( multipleParticleModel );
    this.positionUpdater = WaterAtomPositionUpdater;

    // @private precomputed values to save time later
    this.massInverse = 1 / multipleParticleModel.moleculeDataSet.getMoleculeMass();
    this.inertiaInverse = 1 / multipleParticleModel.moleculeDataSet.getMoleculeRotationalInertia();

    // @private pre-allocated arrays to avoid reallocation with each force and position update
    this.normalCharges = new Array( 3 );
    this.alteredCharges = new Array( 3 );
  }

  /**
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   * @override
   * @protected
   */
  initializeForces( moleculeDataSet ) {
    const temperatureSetPoint = this.multipleParticleModel.temperatureSetPointProperty.get();
    let accelerationDueToGravity = this.multipleParticleModel.gravitationalAcceleration;
    if ( temperatureSetPoint < TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES ) {

      // Below a certain temperature, gravity is increased to counteract some odd-looking behavior caused by the
      // thermostat.  The multiplier was empirically determined.
      accelerationDueToGravity = accelerationDueToGravity *
                                 ( 1 + ( TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES - temperatureSetPoint ) * 0.32 );
    }
    const nextMoleculeForces = moleculeDataSet.nextMoleculeForces;
    const nextMoleculeTorques = moleculeDataSet.nextMoleculeTorques;
    for ( let i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
      nextMoleculeForces[ i ].setXY( 0, accelerationDueToGravity );
      nextMoleculeTorques[ i ] = 0;
    }
  }

  /**
   * @param moleculeDataSet
   * @override
   * @protected
   */
  updateInteractionForces( moleculeDataSet ) {

    const moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
    const atomPositions = moleculeDataSet.atomPositions;
    const nextMoleculeForces = moleculeDataSet.nextMoleculeForces;
    const nextMoleculeTorques = moleculeDataSet.nextMoleculeTorques;
    const temperatureSetPoint = this.multipleParticleModel.temperatureSetPointProperty.get();

    // Verify that this is being used on an appropriate data set.
    assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );

    // Set up the values for the charges that will be used when calculating the coloumb interactions.
    let q0;
    let temperatureFactor;

    // A scaling factor is added here for the repulsive portion of the Lennard-Jones force.  The idea is that the
    // force goes up at lower temperatures in order to make the ice appear more spacious.  This is not real physics,
    // it is "hollywooding" in order to get the crystalline behavior we need for ice.
    let repulsiveForceScalingFactor;

    if ( temperatureSetPoint < WATER_FULLY_FROZEN_TEMPERATURE ) {

      // Use stronger electrostatic forces in order to create more of a crystal structure.
      q0 = WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE;

      // Scale by the max to force space in the crystal.
      repulsiveForceScalingFactor = MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER;
    }
    else if ( temperatureSetPoint > WATER_FULLY_MELTED_TEMPERATURE ) {

      // Use weaker electrostatic forces in order to create more of an appearance of liquid.
      q0 = WATER_FULLY_MELTED_ELECTROSTATIC_FORCE;

      // No scaling of the repulsive force.
      repulsiveForceScalingFactor = 1;
    }
    else {
      // We are somewhere in between the temperature for being fully melted or frozen, so scale accordingly.
      temperatureFactor = ( temperatureSetPoint - WATER_FULLY_FROZEN_TEMPERATURE ) /
                          ( WATER_FULLY_MELTED_TEMPERATURE - WATER_FULLY_FROZEN_TEMPERATURE );
      q0 = WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE -
           ( temperatureFactor * ( WATER_FULLY_FROZEN_ELECTROSTATIC_FORCE - WATER_FULLY_MELTED_ELECTROSTATIC_FORCE ) );
      repulsiveForceScalingFactor = MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER -
                                    ( temperatureFactor * ( MAX_REPULSIVE_SCALING_FACTOR_FOR_WATER - 1 ) );
    }
    this.normalCharges[ 0 ] = -2 * q0;
    this.normalCharges[ 1 ] = q0;
    this.normalCharges[ 2 ] = q0;
    this.alteredCharges[ 0 ] = -2 * q0;
    this.alteredCharges[ 1 ] = 1.67 * q0;
    this.alteredCharges[ 2 ] = 0.33 * q0;

    // Calculate the force and torque due to inter-particle interactions.
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    for ( let i = 0; i < numberOfMolecules; i++ ) {
      const moleculeCenterOfMassPosition1 = moleculeCenterOfMassPositions[ i ];
      const m1x = moleculeCenterOfMassPosition1.x;
      const m1y = moleculeCenterOfMassPosition1.y;
      const nextMoleculeForceI = nextMoleculeForces[ i ];

      // Select which charges to use for this molecule.  This is part of the "hollywooding" to make the solid form
      // appear more crystalline.
      let chargesA;
      if ( i % 2 === 0 ) {
        chargesA = this.normalCharges;
      }
      else {
        chargesA = this.alteredCharges;
      }

      for ( let j = i + 1; j < numberOfMolecules; j++ ) {
        const moleculeCenterOfMassPosition2 = moleculeCenterOfMassPositions[ j ];
        const m2x = moleculeCenterOfMassPosition2.x;
        const m2y = moleculeCenterOfMassPosition2.y;
        const nextMoleculeForceJ = nextMoleculeForces[ j ];

        // Calculate Lennard-Jones potential between mass centers.
        let dx = m1x - m2x;
        let dy = m1y - m2y;
        let distanceSquared = Math.max( dx * dx + dy * dy, AbstractVerletAlgorithm.MIN_DISTANCE_SQUARED );
        if ( distanceSquared < AbstractVerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
          // Select charges for the other molecule.
          let chargesB;
          if ( j % 2 === 0 ) {
            chargesB = this.normalCharges;
          }
          else {
            chargesB = this.alteredCharges;
          }

          // Calculate the Lennard-Jones interaction forces.
          let r2inv = 1 / distanceSquared;
          const r6inv = r2inv * r2inv * r2inv;

          let forceScalar = 48 * r2inv * r6inv * ( ( r6inv * repulsiveForceScalingFactor ) - 0.5 );
          let forceX = dx * forceScalar;
          let forceY = dy * forceScalar;
          nextMoleculeForceI.addXY( forceX, forceY );
          nextMoleculeForceJ.subtractXY( forceX, forceY );
          this.potentialEnergy += 4 * r6inv * ( r6inv - 1 ) + 0.016316891136;

          // Calculate coulomb-like interactions between atoms on individual water molecules.
          for ( let ii = 0; ii < 3; ii++ ) {
            const atomIndex1 = 3 * i + ii;
            if ( ( atomIndex1 + 1 ) % 6 === 0 ) {

              // This is a hydrogen atom that is not going to be included in the calculation in order to try to
              // create a more crystalline solid.  This is part of the "hollywooding" that we do to create a better
              // looking water crystal at low temperatures.
              continue;
            }

            const chargeAii = chargesA[ ii ];
            const atomPosition1 = atomPositions[ atomIndex1 ];
            const a1x = atomPosition1.x;
            const a1y = atomPosition1.y;

            for ( let jj = 0; jj < 3; jj++ ) {
              const atomIndex2 = 3 * j + jj;
              if ( ( atomIndex2 + 1 ) % 6 === 0 ) {

                // This is a hydrogen atom that is not going to be included in the calculation in order to try to
                // create a more crystalline solid.  This is part of the "hollywooding" that we do to create a better
                // looking water crystal at low temperatures.
                continue;
              }

              const atomPosition2 = atomPositions[ atomIndex2 ];
              const a2x = atomPosition2.x;
              const a2y = atomPosition2.y;

              dx = atomPosition1.x - atomPosition2.x;
              dy = atomPosition1.y - atomPosition2.y;
              distanceSquared = Math.max( dx * dx + dy * dy, AbstractVerletAlgorithm.MIN_DISTANCE_SQUARED );
              r2inv = 1 / distanceSquared;
              forceScalar = chargeAii * chargesB[ jj ] * r2inv * r2inv;
              forceX = dx * forceScalar;
              forceY = dy * forceScalar;
              nextMoleculeForceI.addXY( forceX, forceY );
              nextMoleculeForceJ.subtractXY( forceX, forceY );
              nextMoleculeTorques[ i ] += ( a1x - m1x ) * forceY - ( a1y - m1y ) * forceX;
              nextMoleculeTorques[ j ] -= ( a2x - m2x ) * forceY - ( a2y - m2y ) * forceX;
            }
          }
        }
      }
    }
  }

  /**
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   * @param {number} timeStep
   * @override
   * @protected
   */
  updateVelocitiesAndRotationRates( moleculeDataSet, timeStep ) {

    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    const moleculeVelocities = moleculeDataSet.moleculeVelocities;
    const moleculeForces = moleculeDataSet.moleculeForces;
    const nextMoleculeForces = moleculeDataSet.nextMoleculeForces;
    const moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
    const moleculeTorques = moleculeDataSet.moleculeTorques;
    const nextMoleculeTorques = moleculeDataSet.nextMoleculeTorques;
    const moleculeMass = moleculeDataSet.getMoleculeMass();
    const moleculeRotationalInertia = moleculeDataSet.getMoleculeRotationalInertia();

    const timeStepHalf = timeStep / 2;

    // Update the velocities and rotation rates based on the forces being exerted on the molecules, then calculate
    // the kinetic energy of the system.
    let translationalKineticEnergy = 0;
    let rotationalKineticEnergy = 0;
    for ( let i = 0; i < numberOfMolecules; i++ ) {
      const xVel = moleculeVelocities[ i ].x + timeStepHalf * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ) * this.massInverse;
      const yVel = moleculeVelocities[ i ].y + timeStepHalf * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y ) * this.massInverse;
      moleculeVelocities[ i ].setXY( xVel, yVel );
      let rotationRate = moleculeRotationRates[ i ] +
                         timeStepHalf * ( moleculeTorques[ i ] + nextMoleculeTorques[ i ] ) * this.inertiaInverse;

      // If needed, clamp the rotation rate to an empirically determined max to prevent runaway rotation, see
      // https://github.com/phetsims/states-of-matter/issues/152
      if ( rotationRate > MAX_ROTATION_RATE ) {
        rotationRate = MAX_ROTATION_RATE;
      }
      else if ( rotationRate < -MAX_ROTATION_RATE ) {
        rotationRate = -MAX_ROTATION_RATE;
      }
      moleculeRotationRates[ i ] = rotationRate;

      // calculate the kinetic energy
      translationalKineticEnergy += 0.5 * moleculeMass * moleculeVelocities[ i ].magnitudeSquared;
      rotationalKineticEnergy += 0.5 * moleculeRotationalInertia * moleculeRotationRates[ i ] * moleculeRotationRates[ i ];

      // Move the newly calculated forces and torques into the current spots.
      moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
      moleculeTorques[ i ] = nextMoleculeTorques[ i ];
    }

    // Record the calculated temperature.
    if ( numberOfMolecules > 0 ) {
      this.calculatedTemperature = ( translationalKineticEnergy + rotationalKineticEnergy ) / numberOfMolecules;
    }
    else {
      this.calculatedTemperature = this.multipleParticleModel.minModelTemperature;
    }
  }
}

statesOfMatter.register( 'WaterVerletAlgorithm', WaterVerletAlgorithm );
export default WaterVerletAlgorithm;