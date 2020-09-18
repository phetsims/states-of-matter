// Copyright 2020, University of Colorado Boulder

import IOType from '../../../../tandem/js/types/IOType.js';
import statesOfMatter from '../../statesOfMatter.js';
import MultipleParticleModel from './MultipleParticleModel.js';

const MultipleParticleModelIO = new IOType( 'MultipleParticleModelIO', {
  isValidValue: v => v instanceof MultipleParticleModel,
  documentation: 'multiple particle model that simulates interactions that lead to phase-like behavior',
  toStateObject: multipleParticleModel => multipleParticleModel.toStateObject(),
  applyState: ( multipleParticleModel, state ) => multipleParticleModel.applyState( state )
} );

statesOfMatter.register( 'MultipleParticleModelIO', MultipleParticleModelIO );
export default MultipleParticleModelIO;