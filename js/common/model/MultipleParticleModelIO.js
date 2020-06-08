// Copyright 2020, University of Colorado Boulder

import validate from '../../../../axon/js/validate.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import MultipleParticleModel from './MultipleParticleModel.js';

/**
 * IO type for MultipleParticleModel
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
class MultipleParticleModelIO extends ObjectIO {

  /**
   * serialized a MultipleParticleModel instance
   * @param {MultipleParticleModel} multipleParticleModel
   * @returns {Object}
   * @public
   * @override
   */
  static toStateObject( multipleParticleModel ) {
    validate( multipleParticleModel, this.validator );
    return multipleParticleModel.toStateObject();
  }

  /**
   * Deserialize component parts into an intermediate object that can be set in setValue.
   * @param {Object} stateObject
   * @returns {Object}
   * @public
   * @override
   */
  static fromStateObject( stateObject ) {
    return MultipleParticleModel.fromStateObject( stateObject );
  }

  /**
   * set the state of a MultipleParticleModel instance
   * @param {MultipleParticleModel} multipleParticleModel
   * @param {Object} state
   * @public
   * @override
   */
  static setValue( multipleParticleModel, state ) {
    multipleParticleModel.setValue( state );
  }
}

MultipleParticleModelIO.documentation = 'particle model';
MultipleParticleModelIO.validator = { isValidValue: v => v instanceof MultipleParticleModel };
MultipleParticleModelIO.typeName = 'MultipleParticleModelIO';
ObjectIO.validateSubtype( MultipleParticleModelIO );

statesOfMatter.register( 'MultipleParticleModelIO', MultipleParticleModelIO );
export default MultipleParticleModelIO;