// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class updates the positions of atoms in a monatomic data set, i.e.
 * where each molecule is just a single atom.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Util = require( 'DOT/Util' );

  // static object (no constructor)
  var MonatomicAtomPositionUpdater = {
    /**
     * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
     * @param {Number} timeStep
     * @param {Number} offset
     * @public
     */
    updateAtomPositions: function( moleculeDataSet, timeStep, offset ) {

      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.atomsPerMolecule === 1 );

      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.atomPositions;
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;

      // Position the atoms to match the position of the molecules.
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        if ( timeStep >= 0.018 ){
          // contain the particles inside the container in particles left and right wall
          atomPositions[ i ].x = Util.clamp( moleculeCenterOfMassPositions[ i ].x, StatesOfMatterConstants.CONTAINER_LEFT_WALL,
            StatesOfMatterConstants.CONTAINER_RIGHT_WALL - offset );
          atomPositions[ i ].y = Math.max( moleculeCenterOfMassPositions[ i ].y, StatesOfMatterConstants.CONTAINER_BOTTOM_WALL )
        }
        else {
          atomPositions[ i ] = moleculeCenterOfMassPositions[ i ];
        }
      }
    }
  };

  statesOfMatter.register( 'MonatomicAtomPositionUpdater', MonatomicAtomPositionUpdater );

  return MonatomicAtomPositionUpdater;

} );
