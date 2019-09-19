// Copyright 2014-2018, University of Colorado Boulder

/**
 * The class represents a single atom of hydrogen in the model.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( require => {
  'use strict';

  // modules
  const AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  const Element = require( 'NITROGLYCERIN/Element' );
  const inherit = require( 'PHET_CORE/inherit' );
  const SOMAtom = require( 'STATES_OF_MATTER/common/model/particle/SOMAtom' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants
  const RADIUS = Element.H.vanDerWaalsRadius;   // In picometers.
  const MASS = Element.H.atomicWeight; // In atomic mass units.

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
