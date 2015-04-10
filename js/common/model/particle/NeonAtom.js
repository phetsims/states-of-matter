// Copyright 2002-2013, University of Colorado Boulder

/**
 * The class represents a single atom of neon in the model.
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
  var RADIUS = 154;   // In picometers.
  var MASS = 20.1797; // In atomic mass units.
  var EPSILON = 32.8; // epsilon/k-Boltzmann is in Kelvin.
  var ATOM_TYPE = AtomType.NEON;

  /**
   * @param {Number} x  position in picometers
   * @param {Number} y  position in picometers
   * @constructor
   */
  function NeonAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, RADIUS, MASS, StatesOfMatterConstants.NEON_COLOR );
  }

  return inherit( StatesOfMatterAtom, NeonAtom, {

      /**
       * @public
       * @returns {exports.NEON|*}
       */
      getType: function() {
        return ATOM_TYPE;
      }
    },

    // public static final
    {
      RADIUS: RADIUS,
      EPSILON: EPSILON
    } );
} );
