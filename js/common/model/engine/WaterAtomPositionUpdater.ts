// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class updates the positions of atoms in a water molecule based on the position and rotation information for the
 * molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import statesOfMatter from '../../../statesOfMatter.js';
import WaterMoleculeStructure from './WaterMoleculeStructure.js';

// constants
const STRUCTURE_X = WaterMoleculeStructure.moleculeStructureX;
const STRUCTURE_Y = WaterMoleculeStructure.moleculeStructureY;

// static object (no constructor)
const WaterAtomPositionUpdater = {

  /**
   * @public
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   * @param {number} timeStep
   */
  updateAtomPositions: moleculeDataSet => {

    // Make sure this is not being used on an inappropriate data set.
    assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );

    // Get direct references to the data in the data set.
    const atomPositions = moleculeDataSet.getAtomPositions();
    const moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
    const moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();

    // other vars
    let xPos;
    let yPos;
    let cosineTheta;
    let sineTheta;

    // Loop through all molecules and position the individual atoms based on center of gravity position, molecule
    // structure, and rotational angle.
    for ( let i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
      cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
      sineTheta = Math.sin( moleculeRotationAngles[ i ] );
      for ( let j = 0; j < 3; j++ ) {
        const xOffset = ( cosineTheta * STRUCTURE_X[ j ] ) - ( sineTheta * STRUCTURE_Y[ j ] );
        const yOffset = ( sineTheta * STRUCTURE_X[ j ] ) + ( cosineTheta * STRUCTURE_Y[ j ] );
        xPos = moleculeCenterOfMassPositions[ i ].x + xOffset;
        yPos = moleculeCenterOfMassPositions[ i ].y + yOffset;
        atomPositions[ i * 3 + j ].setXY( xPos, yPos );
      }
    }
  }
};

statesOfMatter.register( 'WaterAtomPositionUpdater', WaterAtomPositionUpdater );

export default WaterAtomPositionUpdater;