// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class updates the positions of atoms in a water molecule based on the position and rotation information for the
 * molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const WaterMoleculeStructure = require( 'STATES_OF_MATTER/common/model/engine/WaterMoleculeStructure' );

  // constants
  var STRUCTURE_X = WaterMoleculeStructure.moleculeStructureX;
  var STRUCTURE_Y = WaterMoleculeStructure.moleculeStructureY;

  // static object (no constructor)
  var WaterAtomPositionUpdater = {

    /**
     * @public
     * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
     * @param {number} timeStep
     */
    updateAtomPositions: function( moleculeDataSet ) {

      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );

      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();

      // other vars
      var xPos;
      var yPos;
      var cosineTheta;
      var sineTheta;

      // Loop through all molecules and position the individual atoms based on center of gravity position, molecule
      // structure, and rotational angle.
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
        sineTheta = Math.sin( moleculeRotationAngles[ i ] );
        for ( var j = 0; j < 3; j++ ) {
          var xOffset = ( cosineTheta * STRUCTURE_X[ j ] ) - ( sineTheta * STRUCTURE_Y[ j ] );
          var yOffset = ( sineTheta * STRUCTURE_X[ j ] ) + ( cosineTheta * STRUCTURE_Y[ j ] );
          xPos = moleculeCenterOfMassPositions[ i ].x + xOffset;
          yPos = moleculeCenterOfMassPositions[ i ].y + yOffset;
          atomPositions[ i * 3 + j ].setXY( xPos, yPos );
        }
      }
    }
  };

  statesOfMatter.register( 'WaterAtomPositionUpdater', WaterAtomPositionUpdater );

  return WaterAtomPositionUpdater;
} );
