// Copyright 2002-2011, University of Colorado
/**
 * The class represents a single atom of neon in the model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AtomType = require( 'STATES_OF_MATTER/states-of-matter/model/AtomType' );

// In picometers.
  var RADIUS = 154;
// In atomic mass units.

  //private
  var MASS = 20.1797;
// epsilon/k-Boltzmann is in Kelvin.
  var EPSILON = 32.8;
  var ATOM_TYPE = AtomType.NEON;

  function NeonAtom( xPos, yPos ) {
    StatesOfMatterAtom.call( this, xPos, yPos, RADIUS, MASS );
  }

  return inherit( StatesOfMatterAtom, NeonAtom, {
      getType: function() {
        return ATOM_TYPE;
      }
    },
//statics
    {
      RADIUS: RADIUS,
      EPSILON: EPSILON
    } );
} );

