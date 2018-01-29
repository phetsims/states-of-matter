// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class represents a single atom of argon in the model.
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
  var RADIUS = Element.Ar.vanDerWaalsRadius;  // In picometers.
  var MASS = Element.Ar.atomicWeight; // In atomic mass units.

  /**
   * @param {number} x  - atom x position in picometers
   * @param {number} y  - atom y position in picometers
   * @constructor
   */
  function ArgonAtom( x, y ) {
    SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.ARGON_COLOR );
  }

  statesOfMatter.register( 'ArgonAtom', ArgonAtom );

  return inherit( SOMAtom, ArgonAtom, {

      /**
       * @returns {string}
       * @public
       */
      getType: function() {
        return AtomType.ARGON;
      }
    },

    // public static final
    {
      RADIUS: RADIUS
    } );
} );
