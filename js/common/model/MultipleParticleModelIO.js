// Copyright 2020, University of Colorado Boulder

/**
 * IO type for MoleculeForceAndMotionDataSet
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import MoleculeForceAndMotionDataSetIO from './MoleculeForceAndMotionDataSetIO.js';
import MultipleParticleModel from './MultipleParticleModel.js';

class MultipleParticleModelIO extends ObjectIO {

  /**
   * serialize components that aren't instrumented and so can't serialize themselves.
   * @param {MultipleParticleModel} model
   * @returns {Object}
   */
  static toStateObject( model ) {
    validate( model, this.validator );
    return {
      moleculeDataSet: MoleculeForceAndMotionDataSetIO.toStateObject( model.moleculeDataSet )
    };
  }

  /**
   * Deserialize component parts into an intermediate object that can be set in setValue.
   * @param {Object} stateObject
   * @returns {MoleculeForceAndMotionDataSet}
   */
  static fromStateObject( stateObject ) {
    return {
      moleculeDataSet: MoleculeForceAndMotionDataSetIO.fromStateObject( stateObject.moleculeDataSet )
    };
  }

  /**
   * @param {MultipleParticleModel} model
   * @param {Object} fromStateObject - see fromStateObject
   */
  static setValue( model, fromStateObject ) {
    model.moleculeDataSet = fromStateObject.moleculeDataSet;
  }
}

MultipleParticleModelIO.documentation = 'particle model';
MultipleParticleModelIO.validator = { isValidValue: v => v instanceof MultipleParticleModel };
MultipleParticleModelIO.typeName = 'MultipleParticleModelIO';
ObjectIO.validateSubtype( MultipleParticleModelIO );

statesOfMatter.register( 'MultipleParticleModelIO', MultipleParticleModelIO );
export default MultipleParticleModelIO;