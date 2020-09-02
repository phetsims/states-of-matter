// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for MoleculeForceAndMotionDataSet, uses "data type" serialization where `fromStateObject returns a new
 * instance.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import MoleculeForceAndMotionDataSet from './MoleculeForceAndMotionDataSet.js';

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
    return moleculeForceAndMotionDataSet.toStateObject();
  }
}

MoleculeForceAndMotionDataSetIO.documentation = 'particle data set';
MoleculeForceAndMotionDataSetIO.validator = { valueType: MoleculeForceAndMotionDataSet };
MoleculeForceAndMotionDataSetIO.typeName = 'MoleculeForceAndMotionDataSetIO';
ObjectIO.validateSubtype( MoleculeForceAndMotionDataSetIO );

statesOfMatter.register( 'MoleculeForceAndMotionDataSetIO', MoleculeForceAndMotionDataSetIO );
export default MoleculeForceAndMotionDataSetIO;