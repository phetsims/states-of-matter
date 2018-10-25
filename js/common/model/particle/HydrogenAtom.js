// Copyright 2014-2017, University of Colorado Boulder

/**
 * The class represents a single atom of hydrogen in the model.
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
  var SOMAtom = require( 'STATES_OF_MATTER/common/model/particle/SOMAtom' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants
  var RADIUS = Element.H.vanDerWaalsRadius;   // In picometers.
  var MASS = Element.H.atomicWeight; // In atomic mass units.

  /**
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
   * @param {boolean} renderBelowOxygen - flag which says whether it has to be in the front or at the back of oxygen
   * @constructor
   */
  function HydrogenAtom( x, y, renderBelowOxygen ) {
    SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.HYDROGEN_COLOR );
    this.renderBelowOxygen = renderBelowOxygen; // @public, read-only
  }

  statesOfMatter.register( 'HydrogenAtom', HydrogenAtom );

  return inherit( SOMAtom, HydrogenAtom, {

      /**
       * @public
       * @returns {string}
       */
      getType: function() {
        return  AtomType.HYDROGEN;
      }

    },

    // public static final
    {
      RADIUS: RADIUS
    } );
} );
