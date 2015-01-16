// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class updates the positions of atoms in a diatomic data set (i.e.
 * where each molecule is made up of two molecules).  IMPORTANT: This class
 * assumes that they molecules are the same, e.g. O2 (diatomic oxygen), and
 * not different, such as OH.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  function DiatomicAtomPositionUpdater() {

  }


  return inherit( Object, DiatomicAtomPositionUpdater, {

    /**
     *
     * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
     */
    updateAtomPositions: function( moleculeDataSet ) {
      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.atomsPerMolecule === 2 );
      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.atomPositions;
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
      var xPos;
      var yPos;
      var cosineTheta;
      var sineTheta;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
        sineTheta = Math.sin( moleculeRotationAngles[ i ] );
        xPos = moleculeCenterOfMassPositions[ i ].x +
               cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[ i ].y +
               sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        atomPositions[ i * 2 ].setXY( xPos, yPos );
        xPos = moleculeCenterOfMassPositions[ i ].x -
               cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        yPos = moleculeCenterOfMassPositions[ i ].y -
               sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
        atomPositions[ i * 2 + 1 ].setXY( xPos, yPos );
      }
    }
  } );
} );

