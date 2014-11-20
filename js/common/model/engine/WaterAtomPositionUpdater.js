// Copyright 2002-2014, University of Colorado Boulder
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

  function WaterAtomPositionUpdater() {

    var waterMoleculeStructure = new WaterMoleculeStructure();
    // Get the relational data necessary for doing the positional updates.
    this.structureX = waterMoleculeStructure.getStructureArrayX();
    this.structureY = waterMoleculeStructure.getStructureArrayY();
  }

  return inherit( Object, WaterAtomPositionUpdater, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    updateAtomPositions: function( moleculeDataSet ) {
      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );
      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var xPos, yPos, cosineTheta, sineTheta;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[i] );
        sineTheta = Math.sin( moleculeRotationAngles[i] );
        for ( var j = 0; j < 3; j++ ) {
          xPos = moleculeCenterOfMassPositions[i].x + (cosineTheta * this.structureX[j]) -
                 (sineTheta * this.structureY[j]);
          yPos = moleculeCenterOfMassPositions[i].y + (sineTheta * this.structureX[j]) +
                 (cosineTheta * this.structureY[j]);
          atomPositions[i * 3 + j].setXY( xPos, yPos );
        }
      }
    }
  } );
} );

