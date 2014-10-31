// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class updates the positions of atoms in a water molecule based on the
 * position and rotation information for the molecule.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
// In particle diameters.

  //private
  var BONDED_PARTICLE_DISTANCE = 0.9;

  function WaterAtomPositionUpdater() {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    this.structureX;
    this.structureY;
    // Get the relational data necessary for doing the positional updates.
    structureX = WaterMoleculeStructure.getInstance().getStructureArrayX();
    structureY = WaterMoleculeStructure.getInstance().getStructureArrayY();
  }

  return inherit( Object, WaterAtomPositionUpdater, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    updateAtomPositions: function( moleculeDataSet ) {
      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() == 3 );
      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var xPos, yPos, cosineTheta, sineTheta;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[i] );
        sineTheta = Math.sin( moleculeRotationAngles[i] );
        xPos = moleculeCenterOfMassPositions[i].getX() + cosineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[i].getY() + sineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        atomPositions[i * 2].setLocation( xPos, yPos );
        xPos = moleculeCenterOfMassPositions[i].getX() - cosineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[i].getY() - sineTheta * (BONDED_PARTICLE_DISTANCE / 2);
        atomPositions[i * 2 + 1].setLocation( xPos, yPos );
      }
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[i] );
        sineTheta = Math.sin( moleculeRotationAngles[i] );
        for ( var j = 0; j < 3; j++ ) {
          xPos = moleculeCenterOfMassPositions[i].getX() + (cosineTheta * structureX[j]) - (sineTheta * structureY[j]);
          yPos = moleculeCenterOfMassPositions[i].getY() + (sineTheta * structureX[j]) + (cosineTheta * structureY[j]);
          atomPositions[i * 3 + j].setLocation( xPos, yPos );
        }
      }
    }
  } );
} );

