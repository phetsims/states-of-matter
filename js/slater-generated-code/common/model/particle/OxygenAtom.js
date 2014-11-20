// Copyright 2002-2014, University of Colorado Boulder
/**
 * The class represents a single atom of oxygen in the model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AtomType = require( 'STATES_OF_MATTER/states-of-matter/model/AtomType' );

// In picometers.
  var RADIUS = 162;
// In atomic mass units.

  //private
  var MASS = 15.9994;
  var ATOM_TYPE = AtomType.OXYGEN;

  function OxygenAtom( xPos, yPos ) {
    StatesOfMatterAtom.call( this, xPos, yPos, RADIUS, MASS );
  }

  return inherit( StatesOfMatterAtom, OxygenAtom, {
      getType: function() {
        return ATOM_TYPE;
      }
    },
//statics
    {
      RADIUS: RADIUS
    } );
} );

