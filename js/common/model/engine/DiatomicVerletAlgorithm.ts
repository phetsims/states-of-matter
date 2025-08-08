// Copyright 2014-2020, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential.
 * This is the diatomic (i.e. two atoms per molecule) version.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import statesOfMatter from '../../../statesOfMatter.js';
import AbstractVerletAlgorithm from './AbstractVerletAlgorithm.js';
import DiatomicAtomPositionUpdater from './DiatomicAtomPositionUpdater.js';

class DiatomicVerletAlgorithm extends AbstractVerletAlgorithm {

  /**
   * @param {MultipleParticleModel} multipleParticleModel - Model of a set of particles
   */
  constructor( multipleParticleModel ) {
    super( multipleParticleModel );
    this.positionUpdater = DiatomicAtomPositionUpdater; // @private
  }

  /**
   * @override
   * @protected
   */
  initializeForces( moleculeDataSet ) {
    const accelerationDueToGravity = this.multipleParticleModel.gravitationalAcceleration;
    const nextMoleculeForces = moleculeDataSet.nextMoleculeForces;
    const nextMoleculeTorques = moleculeDataSet.nextMoleculeTorques;
    for ( let i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
      nextMoleculeForces[ i ].setXY( 0, accelerationDueToGravity );
      nextMoleculeTorques[ i ] = 0;
    }
  }

  /**
   * Update the forces acting on each molecule due to the other molecules in the data set.
   * @param moleculeDataSet
   * @private
   */
  updateInteractionForces( moleculeDataSet ) {

    const moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
    const nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
    const atomPositions = moleculeDataSet.getAtomPositions();
    const nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();
    const numberOfMolecules = moleculeDataSet.numberOfMolecules;

    for ( let i = 0; i < numberOfMolecules; i++ ) {
      const moleculeCenterOfMassIX = moleculeCenterOfMassPositions[ i ].x;
      const moleculeCenterOfMassIY = moleculeCenterOfMassPositions[ i ].y;
      for ( let j = i + 1; j < numberOfMolecules; j++ ) {
        const moleculeCenterOfMassJX = moleculeCenterOfMassPositions[ j ].x;
        const moleculeCenterOfMassJY = moleculeCenterOfMassPositions[ j ].y;
        for ( let ii = 0; ii < 2; ii++ ) {
          const atom1PosX = atomPositions[ 2 * i + ii ].x;
          const atom1PosY = atomPositions[ 2 * i + ii ].y;
          for ( let jj = 0; jj < 2; jj++ ) {
            const atom2PosX = atomPositions[ 2 * j + jj ].x;
            const atom2PosY = atomPositions[ 2 * j + jj ].y;

            // Calculate the distance between the potentially interacting atoms.
            const dx = atom1PosX - atom2PosX;
            const dy = atom1PosY - atom2PosY;
            let distanceSquared = dx * dx + dy * dy;
            if ( distanceSquared < AbstractVerletAlgorithm.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
              if ( distanceSquared < AbstractVerletAlgorithm.MIN_DISTANCE_SQUARED ) {
                distanceSquared = AbstractVerletAlgorithm.MIN_DISTANCE_SQUARED;
              }
              // Calculate the Lennard-Jones interaction forces.
              const r2inv = 1 / distanceSquared;
              const r6inv = r2inv * r2inv * r2inv;
              const forceScalar = 48 * r2inv * r6inv * ( r6inv - 0.5 );
              const fx = dx * forceScalar;
              const fy = dy * forceScalar;
              nextMoleculeForces[ i ].addXY( fx, fy );
              nextMoleculeForces[ j ].subtractXY( fx, fy );
              nextMoleculeTorques[ i ] += ( atom1PosX - moleculeCenterOfMassIX ) * fy -
                                          ( atom1PosY - moleculeCenterOfMassIY ) * fx;
              nextMoleculeTorques[ j ] -= ( atom2PosX - moleculeCenterOfMassJX ) * fy -
                                          ( atom2PosY - moleculeCenterOfMassJY ) * fx;
              this.potentialEnergy += 4 * r6inv * ( r6inv - 1 ) + 0.016316891136;
            }
          }
        }
      }
    }
  }

  /**
   * Update the translational and rotational velocities for the molecules, calculate the total energy, and record the
   * temperature value for the system.
   * @param moleculeDataSet
   * @param timeStep
   * @private
   */
  updateVelocitiesAndRotationRates( moleculeDataSet, timeStep ) {

    // Obtain references to the model data and parameters so that we can perform fast manipulations.
    const moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
    const moleculeForces = moleculeDataSet.getMoleculeForces();
    const nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
    const numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
    const moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
    const moleculeTorques = moleculeDataSet.getMoleculeTorques();
    const nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();

    // Initialize other values that will be needed for the calculation.
    const massInverse = 1 / moleculeDataSet.getMoleculeMass();
    const inertiaInverse = 1 / moleculeDataSet.getMoleculeRotationalInertia();
    const timeStepHalf = timeStep / 2;
    let translationalKineticEnergy = 0;
    let rotationalKineticEnergy = 0;

    // Update the velocities and rotation rates based on the forces being exerted on the molecules, then calculate
    // the kinetic energy of the system.
    for ( let i = 0; i < numberOfMolecules; i++ ) {
      const xVel = moleculeVelocities[ i ].x +
                   timeStepHalf * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ) * massInverse;
      const yVel = moleculeVelocities[ i ].y +
                   timeStepHalf * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y ) * massInverse;
      moleculeVelocities[ i ].setXY( xVel, yVel );
      moleculeRotationRates[ i ] += timeStepHalf * ( moleculeTorques[ i ] + nextMoleculeTorques[ i ] ) *
                                    inertiaInverse;
      translationalKineticEnergy += 0.5 * moleculeDataSet.moleculeMass * moleculeVelocities[ i ].magnitudeSquared;
      rotationalKineticEnergy += 0.5 * moleculeDataSet.moleculeRotationalInertia *
                                 Math.pow( moleculeRotationRates[ i ], 2 );

      // Move the newly calculated forces and torques into the current spots.
      moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
      moleculeTorques[ i ] = nextMoleculeTorques[ i ];
    }

    // Record the calculated temperature.
    if ( numberOfMolecules > 0 ) {
      this.calculatedTemperature = ( 2 / 3 ) * ( translationalKineticEnergy + rotationalKineticEnergy ) / numberOfMolecules;
    }
    else {
      this.calculatedTemperature = this.multipleParticleModel.minModelTemperature;
    }
  }
}

statesOfMatter.register( 'DiatomicVerletAlgorithm', DiatomicVerletAlgorithm );
export default DiatomicVerletAlgorithm;