// Copyright 2002-2013, University of Colorado Boulder

/**
 * The class represents a single atom of argon in the model.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/StatesOfMatterAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // constants
  var RADIUS = 181;  // In picometers.
  var MASS = 39.948; // In atomic mass units.
  var ATOM_TYPE = AtomType.ARGON;

  /**
   * @param {Number} x  position in picometers
   * @param {Number} y  position in picometers
   * @constructor
   */
  function ArgonAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, RADIUS, MASS, StatesOfMatterConstants.ARGON_COLOR );
  }

  return inherit( StatesOfMatterAtom, ArgonAtom, {

      getType: function() {
        return ATOM_TYPE;
      }

    },

    // public static final
    {
      RADIUS: RADIUS
    } );
} );
