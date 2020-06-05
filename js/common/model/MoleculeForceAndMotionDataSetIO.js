// Copyright 2020, University of Colorado Boulder

/**
 * IO type for MoleculeForceAndMotionDataSet, uses "data type" serialization where `fromStateObject will return of
 * new instance.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import MoleculeForceAndMotionDataSet from './MoleculeForceAndMotionDataSet.js';

// constants
const ArrayIONullableIOVector2IO = ArrayIO( NullableIO( Vector2IO ) );

class MoleculeForceAndMotionDataSetIO extends ObjectIO {

  /**
   * Encodes a MoleculeForceAndMotionDataSet instance to a state.
   * @param {MoleculeForceAndMotionDataSet} moleculeForceAndMotionDataSet
   * @returns {Object}
   */
  static toStateObject( moleculeForceAndMotionDataSet ) {
    validate( moleculeForceAndMotionDataSet, this.validator );

    return {
      atomsPerMolecule: moleculeForceAndMotionDataSet.atomsPerMolecule,
      numberOfAtoms: moleculeForceAndMotionDataSet.numberOfAtoms,
      numberOfMolecules: moleculeForceAndMotionDataSet.numberOfMolecules,
      moleculeMass: moleculeForceAndMotionDataSet.moleculeMass,

      // arrays
      atomPositions: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.atomPositions ),
      moleculeCenterOfMassPositions: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.moleculeCenterOfMassPositions ),
      moleculeVelocities: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.moleculeVelocities ),
      moleculeForces: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.moleculeForces ),
      nextMoleculeForces: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.nextMoleculeForces ),
      insideContainer: moleculeForceAndMotionDataSet.insideContainer,
      moleculeRotationAngles: moleculeForceAndMotionDataSet.moleculeRotationAngles,
      moleculeRotationRates: moleculeForceAndMotionDataSet.moleculeRotationRates,
      moleculeTorques: moleculeForceAndMotionDataSet.moleculeTorques,
      nextMoleculeTorques: moleculeForceAndMotionDataSet.nextMoleculeTorques,
      moleculeRotationalInertia: moleculeForceAndMotionDataSet.moleculeRotationalInertia
    };
  }

  /**
   * Decodes a state into a MoleculeForceAndMotionDataSet.
   * @param {Object} stateObject
   * @returns {MoleculeForceAndMotionDataSet}
   */
  static fromStateObject( stateObject ) {

    const newDataSet = new MoleculeForceAndMotionDataSet( stateObject.atomsPerMolecule );

    newDataSet.numberOfAtoms = stateObject.numberOfAtoms;
    newDataSet.numberOfMolecules = stateObject.numberOfMolecules;
    newDataSet.moleculeMass = stateObject.moleculeMass;
    newDataSet.moleculeRotationalInertia = stateObject.moleculeRotationalInertia;

    // arrays
    for ( let i = 0; i < newDataSet.numberOfAtoms; i++ ) {
      newDataSet.atomPositions[ i ] = Vector2IO.fromStateObject( stateObject.atomPositions[ i ] );
    }
    for ( let i = 0; i < newDataSet.numberOfMolecules; i++ ) {
      newDataSet.moleculeCenterOfMassPositions[ i ] = Vector2IO.fromStateObject( stateObject.moleculeCenterOfMassPositions[ i ] );
      newDataSet.moleculeVelocities[ i ] = Vector2IO.fromStateObject( stateObject.moleculeVelocities[ i ] );
      newDataSet.moleculeForces[ i ] = Vector2IO.fromStateObject( stateObject.moleculeForces[ i ] );
      newDataSet.nextMoleculeForces[ i ] = Vector2IO.fromStateObject( stateObject.nextMoleculeForces[ i ] );
      newDataSet.insideContainer[ i ] = stateObject.insideContainer[ i ];
      newDataSet.moleculeRotationAngles[ i ] = stateObject.moleculeRotationAngles[ i ];
      newDataSet.moleculeRotationRates[ i ] = stateObject.moleculeRotationRates[ i ];
      newDataSet.moleculeTorques[ i ] = stateObject.moleculeTorques[ i ];
      newDataSet.nextMoleculeTorques[ i ] = stateObject.nextMoleculeTorques[ i ];
    }

    return newDataSet;
  }
}

MoleculeForceAndMotionDataSetIO.documentation = 'particle data set';
MoleculeForceAndMotionDataSetIO.validator = { valueType: MoleculeForceAndMotionDataSet };
MoleculeForceAndMotionDataSetIO.typeName = 'MoleculeForceAndMotionDataSetIO';
ObjectIO.validateSubtype( MoleculeForceAndMotionDataSetIO );

statesOfMatter.register( 'MoleculeForceAndMotionDataSetIO', MoleculeForceAndMotionDataSetIO );
export default MoleculeForceAndMotionDataSetIO;