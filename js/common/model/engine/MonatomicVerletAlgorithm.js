// Copyright 2014-2020, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential -
 * monatomic (i.e. one atom per molecule) version.
 *
 * @author John Blanco
 * @author Aaron Davis
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import statesOfMatter from '../../../statesOfMatter.js';
import AbstractVerletAlgorithm from './AbstractVerletAlgorithm.js';
import MonatomicAtomPositionUpdater from './MonatomicAtomPositionUpdater.js';

class MonatomicVerletAlgorithm extends AbstractVerletAlgorithm {

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   */
  constructor( multipleParticleModel ) {
    super( multipleParticleModel );

    // @private
    this.positionUpdater = MonatomicAtomPositionUpdater;
    this.epsilon = 1; // controls the strength of particle interaction
    this.velocityVector = new Vector2( 0, 0 ); // reusable vector to save allocations
  }

  /**
   * @param {number} scaledEpsilon
   * @public
   */
  setScaledEpsilon( scaledEpsilon ) {
    this.epsilon = scaledEpsilon;
  }

  /**
   * @returns {number}
   * @public
   */
  getScaledEpsilon() {
    return this.epsilon;
  }

  /**
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   * @override
   * @protected
   */
  initializeForces( moleculeDataSet ) {
    const accelerationDueToGravity = this.multipleParticleModel.gravitationalAcceleration;
    const nextAtomForces = moleculeDataSet.nextMoleculeForces;
    for ( let i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
      nextAtomForces[ i ].setXY( 0, accelerationDueToGravity );
    }
  }

  /**
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   * @override
   * @private
   */
  updateInteractionForces( moleculeDataSet ) {

    const numberOfAtoms = moleculeDataSet.numberOfMolecules;
    const atomCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
    const nextAtomForces = moleculeDataSet.nextMoleculeForces;

    for ( let i = 0; i < numberOfAtoms; i++ ) {

      const atomCenterOfMassPositionsIX = atomCenterOfMassPositions[ i ].x;
      const atomCenterOfMassPositionsIY = atomCenterOfMassPositions[ i ].y;
      const nextAtomForcesI = nextAtomForces[ i ];

      for ( let j = i + 1; j < numberOfAtoms; j++ ) {

        let dx = atomCenterOfMassPositionsIX - atomCenterOfMassPositions[ j ].x;
        let dy = atomCenterOfMassPositionsIY - atomCenterOfMassPositions[ j ].y;
        let distanceSqrd = Math.max( dx * dx + dy * dy, AbstractVerletAlgorithm.MIN_DISTANCE_SQUARED );

        if ( distanceSqrd === 0 ) {
          // Handle the special case where the particles are right on top of each other by assigning an arbitrary
          // spacing. In general, this only happens when injecting new particles.
          dx = 1;
          dy = 1;
          distanceSqrd = 2;
        }

        if ( distanceSqrd < AbstractVerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
          // This pair of particles is close enough to one another that we need to calculate their interaction forces.
          const r2inv = 1 / distanceSqrd;
          const r6inv = r2inv * r2inv * r2inv;
          const forceScalar = 48 * r2inv * r6inv * ( r6inv - 0.5 ) * this.epsilon;
          const forceX = dx * forceScalar;
          const forceY = dy * forceScalar;
          nextAtomForcesI.addXY( forceX, forceY );
          nextAtomForces[ j ].subtractXY( forceX, forceY );
        }
      }
    }
  }

  /**
   * @param {MoleculeForcesAndMotionDataSet} moleculeDataSet
   * @param {number} timeStep
   * @override
   * @protected
   */
  updateVelocitiesAndRotationRates( moleculeDataSet, timeStep ) {

    let atomVelocity;
    const numberOfAtoms = moleculeDataSet.numberOfAtoms;
    const atomVelocities = moleculeDataSet.moleculeVelocities;
    const atomForces = moleculeDataSet.moleculeForces;
    const nextAtomForces = moleculeDataSet.nextMoleculeForces;
    const timeStepHalf = timeStep / 2;
    let totalKineticEnergy = 0;
    let velocityVector = this.velocityVector;

    // Update the atom velocities based upon the forces that are acting on them, then calculate the kinetic energy.
    for ( let i = 0; i < numberOfAtoms; i++ ) {
      atomVelocity = atomVelocities[ i ];
      const moleculeForce = atomForces[ i ];
      velocityVector = velocityVector.setXY(
        atomVelocity.x + timeStepHalf * ( moleculeForce.x + nextAtomForces[ i ].x ),
        atomVelocity.y + timeStepHalf * ( moleculeForce.y + nextAtomForces[ i ].y )
      );
      if ( velocityVector.magnitude > 10 ) {
        velocityVector.setMagnitude( 10 );
      }

      atomVelocity.set( velocityVector );
      totalKineticEnergy += ( ( atomVelocity.x * atomVelocity.x ) + ( atomVelocity.y * atomVelocity.y ) ) / 2;

      // update to the new force value for the next model step
      moleculeForce.setXY( nextAtomForces[ i ].x, nextAtomForces[ i ].y );
    }

    // Update the temperature.
    if ( numberOfAtoms > 0 ) {
      this.calculatedTemperature = ( 2 / 3 ) * ( totalKineticEnergy / numberOfAtoms );
    }
    else {
      this.calculatedTemperature = this.multipleParticleModel.minModelTemperature;
    }
  }
}

statesOfMatter.register( 'MonatomicVerletAlgorithm', MonatomicVerletAlgorithm );
export default MonatomicVerletAlgorithm;