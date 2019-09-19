// Copyright 2014-2017, University of Colorado Boulder

/**
 * This object updates the positions of atoms in a monatomic data set, i.e. where each molecule is just a single atom.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( require => {
  'use strict';

  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // static object (no constructor)
  const MonatomicAtomPositionUpdater = {

    /**
     * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
     * @public
     */
    updateAtomPositions: function( moleculeDataSet ) {

      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.atomsPerMolecule === 1 );

      // Get direct references to the data in the data set.
      const atomPositions = moleculeDataSet.atomPositions;
      const moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;

      // Position the atoms to match the position of the molecules.
      for ( let i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
          atomPositions[ i ] = moleculeCenterOfMassPositions[ i ];
      }
    }
  };

  statesOfMatter.register( 'MonatomicAtomPositionUpdater', MonatomicAtomPositionUpdater );

  return MonatomicAtomPositionUpdater;

} );
