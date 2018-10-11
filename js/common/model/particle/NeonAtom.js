// Copyright 2014-2017, University of Colorado Boulder

/**
 * The class represents a single atom of neon in the model.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var SOMAtom = require( 'STATES_OF_MATTER/common/model/particle/SOMAtom' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );

  // constants
  var RADIUS = Element.Ne.vanDerWaalsRadius;   // In picometers.
  var MASS = Element.Ne.atomicWeight; // In atomic mass units.
  var EPSILON = 32.8; // epsilon/k-Boltzmann is in Kelvin.

  /**
   * @param {number} x - position in picometers
   * @param {number} y - position in picometers
   * @constructor
   */
  function NeonAtom( x, y ) {
    SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.NEON_COLOR );
  }

  statesOfMatter.register( 'NeonAtom', NeonAtom );

  return inherit( SOMAtom, NeonAtom, {

      getType: function() {

        /**
         * @returns {string}
         * @public
         */
        return  AtomType.NEON;
      }
    },

    // public static final
    {
      RADIUS: RADIUS,
      EPSILON: EPSILON
    } );
} );
