// Copyright 2002-2011, University of Colorado
/**
 * This class updates the positions of atoms in a diatomic data set (i.e.
 * where each molecule is made up of two molecules).  IMPORTANT: This class
 * assumes that they molecules are the same, e.g. O2 (diatomic oxygen), and
 * not different, such as OH.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );


  return inherit( Object, DiatomicAtomPositionUpdater, {
//----------------------------------------------------------------------------
// Public Functions
//----------------------------------------------------------------------------
    updateAtomPositions: function( moleculeDataSet ) {
      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() == 2 );
      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var xPos, yPos, cosineTheta, sineTheta;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[i] );
        sineTheta = Math.sin( moleculeRotationAngles[i] );
        xPos = moleculeCenterOfMassPositions[i].getX() + cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[i].getY() + sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        atomPositions[i * 2].setLocation( xPos, yPos );
        xPos = moleculeCenterOfMassPositions[i].getX() - cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[i].getY() - sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        atomPositions[i * 2 + 1].setLocation( xPos, yPos );
      }
    }
  } );
} );

