// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for MoleculeForceAndMotionDataSet, uses "data type" serialization where `fromStateObject returns a new
 * instance.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import IOType from '../../../../tandem/js/types/IOType.js';
import statesOfMatter from '../../statesOfMatter.js';
import MoleculeForceAndMotionDataSet from './MoleculeForceAndMotionDataSet.js';

const MoleculeForceAndMotionDataSetIO = new IOType( 'MoleculeForceAndMotionDataSetIO', {
  valueType: MoleculeForceAndMotionDataSet,
  documentation: 'particle data set',
  toStateObject: moleculeForceAndMotionDataSet => moleculeForceAndMotionDataSet.toStateObject()
} );

statesOfMatter.register( 'MoleculeForceAndMotionDataSetIO', MoleculeForceAndMotionDataSetIO );
export default MoleculeForceAndMotionDataSetIO;