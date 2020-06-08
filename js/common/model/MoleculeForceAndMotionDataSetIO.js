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
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import Float64ArrayIO from '../../../../tandem/js/types/Float64ArrayIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import MoleculeForceAndMotionDataSet from './MoleculeForceAndMotionDataSet.js';

// constants
const ArrayIONullableIOVector2IO = ArrayIO( NullableIO( Vector2IO ) );
const ArrayIOBooleanIO = ArrayIO( BooleanIO );

class MoleculeForceAndMotionDataSetIO extends ObjectIO {

  /**
   * Encodes a MoleculeForceAndMotionDataSet instance to a state.
   * @param {MoleculeForceAndMotionDataSet} moleculeForceAndMotionDataSet
   * @returns {Object}
   * @public
   * @override
   */
  static toStateObject( moleculeForceAndMotionDataSet ) {
    validate( moleculeForceAndMotionDataSet, this.validator );

    return {
      atomsPerMolecule: NumberIO.toStateObject( moleculeForceAndMotionDataSet.atomsPerMolecule ),
      numberOfAtoms: NumberIO.toStateObject( moleculeForceAndMotionDataSet.numberOfAtoms ),
      numberOfMolecules: NumberIO.toStateObject( moleculeForceAndMotionDataSet.numberOfMolecules ),
      moleculeMass: NumberIO.toStateObject( moleculeForceAndMotionDataSet.moleculeMass ),
      moleculeRotationalInertia: NumberIO.toStateObject( moleculeForceAndMotionDataSet.moleculeRotationalInertia ),

      // arrays
      atomPositions: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.atomPositions ),
      moleculeCenterOfMassPositions: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.moleculeCenterOfMassPositions ),
      moleculeVelocities: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.moleculeVelocities ),
      moleculeForces: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.moleculeForces ),
      nextMoleculeForces: ArrayIONullableIOVector2IO.toStateObject( moleculeForceAndMotionDataSet.nextMoleculeForces ),
      insideContainer: ArrayIOBooleanIO.toStateObject( moleculeForceAndMotionDataSet.insideContainer ),
      moleculeRotationAngles: Float64ArrayIO.toStateObject( moleculeForceAndMotionDataSet.moleculeRotationAngles ),
      moleculeRotationRates: Float64ArrayIO.toStateObject( moleculeForceAndMotionDataSet.moleculeRotationRates ),
      moleculeTorques: Float64ArrayIO.toStateObject( moleculeForceAndMotionDataSet.moleculeTorques ),
      nextMoleculeTorques: Float64ArrayIO.toStateObject( moleculeForceAndMotionDataSet.nextMoleculeTorques )
    };
  }

  /**
   * Decodes a state into a MoleculeForceAndMotionDataSet.
   * @param {Object} stateObject
   * @returns {MoleculeForceAndMotionDataSet}
   * @public
   * @override
   */
  static fromStateObject( stateObject ) {

    const newDataSet = new MoleculeForceAndMotionDataSet( stateObject.atomsPerMolecule );

    // single values that pertain to the entire data set
    newDataSet.numberOfAtoms = NumberIO.fromStateObject( stateObject.numberOfAtoms );
    newDataSet.numberOfMolecules = NumberIO.fromStateObject( stateObject.numberOfMolecules );
    newDataSet.moleculeMass = NumberIO.fromStateObject( stateObject.moleculeMass );
    newDataSet.moleculeRotationalInertia = NumberIO.fromStateObject( stateObject.moleculeRotationalInertia );
    newDataSet.atomsPerMolecule = NumberIO.fromStateObject( stateObject.atomsPerMolecule );

    // arrays
    newDataSet.atomPositions = ArrayIONullableIOVector2IO.fromStateObject( stateObject.atomPositions );
    newDataSet.moleculeCenterOfMassPositions = ArrayIONullableIOVector2IO.fromStateObject( stateObject.moleculeCenterOfMassPositions );
    newDataSet.moleculeVelocities = ArrayIONullableIOVector2IO.fromStateObject( stateObject.moleculeVelocities );
    newDataSet.moleculeForces = ArrayIONullableIOVector2IO.fromStateObject( stateObject.moleculeForces );
    newDataSet.nextMoleculeForces = ArrayIONullableIOVector2IO.fromStateObject( stateObject.nextMoleculeForces );
    newDataSet.moleculeRotationAngles = Float64ArrayIO.fromStateObject( stateObject.moleculeRotationAngles );
    newDataSet.moleculeRotationRates = Float64ArrayIO.fromStateObject( stateObject.moleculeRotationRates );
    newDataSet.moleculeTorques = Float64ArrayIO.fromStateObject( stateObject.moleculeTorques );
    newDataSet.insideContainer = ArrayIOBooleanIO.fromStateObject( stateObject.insideContainer );

    return newDataSet;
  }
}

MoleculeForceAndMotionDataSetIO.documentation = 'particle data set';
MoleculeForceAndMotionDataSetIO.validator = { valueType: MoleculeForceAndMotionDataSet };
MoleculeForceAndMotionDataSetIO.typeName = 'MoleculeForceAndMotionDataSetIO';
ObjectIO.validateSubtype( MoleculeForceAndMotionDataSetIO );

statesOfMatter.register( 'MoleculeForceAndMotionDataSetIO', MoleculeForceAndMotionDataSetIO );
export default MoleculeForceAndMotionDataSetIO;