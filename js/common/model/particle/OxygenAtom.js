// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class represents a single atom of oxygen in the model.
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
  var RADIUS = 162;   // In picometers.
  var MASS = 15.9994; // In atomic mass units.

  /**
   * @param {number} x   - atom x position in picometers
   * @param {number} y   - atom y  position in picometers
   * @constructor
   */
  function OxygenAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, RADIUS, MASS, StatesOfMatterConstants.OXYGEN_COLOR );
  }

  return inherit( StatesOfMatterAtom, OxygenAtom, {

      /**
       * @public
       * @returns {string}
       */
      getType: function() {
        return AtomType.OXYGEN;
      }
    },

    // public static final
    {
      RADIUS: RADIUS
    } );
} );
