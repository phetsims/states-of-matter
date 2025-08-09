// Copyright 2014-2020, University of Colorado Boulder

/**
 * This object provides information about the structure of a water molecule,
 * i.e. the spatial and angular relationships between the atoms that comprise
 * the molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import statesOfMatter from '../../../statesOfMatter.js';
import SOMConstants from '../../SOMConstants.js';

const moleculeStructureX = [];
const moleculeStructureY = [];

// Initialize the data that defines the molecular structure of the water molecule.  This defines the distances in the
// x and y dimensions from the center of mass when the rotational angle is zero.
moleculeStructureX[ 0 ] = 0;
moleculeStructureY[ 0 ] = 0;
moleculeStructureX[ 1 ] = SOMConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN;
moleculeStructureY[ 1 ] = 0;
moleculeStructureX[ 2 ] = SOMConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN *
                          Math.cos( SOMConstants.THETA_HOH );
moleculeStructureY[ 2 ] = SOMConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN *
                          Math.sin( SOMConstants.THETA_HOH );
const xcm0 = ( moleculeStructureX[ 0 ] + 0.25 * moleculeStructureX[ 1 ] + 0.25 * moleculeStructureX[ 2 ] ) / 1.5;
const ycm0 = ( moleculeStructureY[ 0 ] + 0.25 * moleculeStructureY[ 1 ] + 0.25 * moleculeStructureY[ 2 ] ) / 1.5;
for ( let i = 0; i < 3; i++ ) {
  moleculeStructureX[ i ] -= xcm0;
  moleculeStructureY[ i ] -= ycm0;
}

const rotationalInertia = ( Math.pow( moleculeStructureX[ 0 ], 2 ) + Math.pow( moleculeStructureY[ 0 ], 2 ) ) +
                          0.25 * ( Math.pow( moleculeStructureX[ 1 ], 2 ) + Math.pow( moleculeStructureY[ 1 ], 2 ) ) +
                          0.25 * ( Math.pow( moleculeStructureX[ 2 ], 2 ) + Math.pow( moleculeStructureY[ 2 ], 2 ) );

const WaterMoleculeStructure = {
  moleculeStructureX: moleculeStructureX,
  moleculeStructureY: moleculeStructureY,
  rotationalInertia: rotationalInertia
};

statesOfMatter.register( 'WaterMoleculeStructure', WaterMoleculeStructure );

export default WaterMoleculeStructure;