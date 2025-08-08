// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class updates the positions of atoms in a diatomic data set (i.e. where each molecule is made up of two
 * molecules).  IMPORTANT: This class assumes that the two atoms that comprise each molecule are the same, e.g. O2
 * (diatomic oxygen), and not different, such as OH.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import statesOfMatter from '../../../statesOfMatter.js';
import SOMConstants from '../../SOMConstants.js';

// static object (no constructor)
const DiatomicAtomPositionUpdater = {

  /**
   * @public
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   */
  updateAtomPositions: moleculeDataSet => {

    // Make sure this is not being used on an inappropriate data set.
    assert && assert( moleculeDataSet.atomsPerMolecule === 2 );

    // Get direct references to the data in the data set.
    const atomPositions = moleculeDataSet.atomPositions;
    const moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
    const moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
    let xPos;
    let yPos;
    let cosineTheta;
    let sineTheta;
    for ( let i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
      cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
      sineTheta = Math.sin( moleculeRotationAngles[ i ] );
      xPos = moleculeCenterOfMassPositions[ i ].x +
             cosineTheta * ( SOMConstants.DIATOMIC_PARTICLE_DISTANCE / 2 );
      yPos = moleculeCenterOfMassPositions[ i ].y +
             sineTheta * ( SOMConstants.DIATOMIC_PARTICLE_DISTANCE / 2 );
      atomPositions[ i * 2 ].setXY( xPos, yPos );
      xPos = moleculeCenterOfMassPositions[ i ].x -
             cosineTheta * ( SOMConstants.DIATOMIC_PARTICLE_DISTANCE / 2 );
      yPos = moleculeCenterOfMassPositions[ i ].y -
             sineTheta * ( SOMConstants.DIATOMIC_PARTICLE_DISTANCE / 2 );
      atomPositions[ i * 2 + 1 ].setXY( xPos, yPos );
    }
  }
};

statesOfMatter.register( 'DiatomicAtomPositionUpdater', DiatomicAtomPositionUpdater );

export default DiatomicAtomPositionUpdater;