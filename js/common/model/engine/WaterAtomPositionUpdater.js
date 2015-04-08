// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * This class updates the positions of atoms in a water molecule based on the
 * position and rotation information for the molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var WaterMoleculeStructure = require( 'STATES_OF_MATTER/common/model/engine/WaterMoleculeStructure' );

  // constants
  var BONDED_PARTICLE_DISTANCE = 0.9;
  var STRUCTURE_X = WaterMoleculeStructure.moleculeStructureX;
  var STRUCTURE_Y = WaterMoleculeStructure.moleculeStructureY;

  // static object (no constructor)
  return {
    /**
     * @public
     * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
     */
    updateAtomPositions: function( moleculeDataSet ) {
      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );
      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var xPos;
      var yPos;
      var cosineTheta;
      var sineTheta;

      // todo: what is this for loop for? Seems to be getting over-ridden anyway
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
        sineTheta = Math.sin( moleculeRotationAngles[ i ] );
        xPos = moleculeCenterOfMassPositions[ i ].x + cosineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[ i ].y + sineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        atomPositions[ i * 2 ].setXY( xPos, yPos );
        xPos = moleculeCenterOfMassPositions[ i ].x - cosineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[ i ].y - sineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        atomPositions[ i * 2 + 1 ].setXY( xPos, yPos );
      }

      for ( i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
        sineTheta = Math.sin( moleculeRotationAngles[ i ] );
        for ( var j = 0; j < 3; j++ ) {
          var xadd = (cosineTheta * STRUCTURE_X[ j ]) - (sineTheta * STRUCTURE_Y[ j ]);

          var yadd = (sineTheta * STRUCTURE_X[ j ]) + (cosineTheta * STRUCTURE_Y[ j ]);

          xPos = moleculeCenterOfMassPositions[ i ].x + xadd;
          yPos = moleculeCenterOfMassPositions[ i ].y + yadd;
          atomPositions[ i * 3 + j ].setXY( xPos, yPos );
        }
      }
    }
  };
} );

