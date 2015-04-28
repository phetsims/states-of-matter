// Copyright 2002-2013, University of Colorado Boulder

/**
 * The class represents a single atom of hydrogen in the model.
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
  var RADIUS = 120;   // In picometers.
  var MASS = 1.00794; // In atomic mass units.
  var ATOM_TYPE = AtomType.HYDROGEN;

  /**
   * @param {number} x position in picometers
   * @param {number} y position in picometers
   * @constructor
   */
  function HydrogenAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, RADIUS, MASS, StatesOfMatterConstants.HYDROGEN_COLOR );
  }

  return inherit( StatesOfMatterAtom, HydrogenAtom, {
      /**
       * @public
       * @returns {AtomType}
       */
      getType: function() {
        return ATOM_TYPE;
      }

    },

    // public static final
    {
      RADIUS: RADIUS
    } );
} );
