// Copyright 2002-2011, University of Colorado
/**
 * This interface is used to update the positions of the atoms that make up a
 * molecule based on the data that represents the molecule's position.  This
 * is often necessary since the simulations will tend to operate on the
 * molecular velocity, location, and rotation, and the individual atoms must
 * be moved as a result.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );


  return inherit( Object, AtomPositionUpdater, {
    /**
     * Update the positions of the atoms.  It is assumed that the implementer
     * already has references to the needed data.
     */
    updateAtomPositions: function( moleculeDataSet ) {}
  } );
} );

