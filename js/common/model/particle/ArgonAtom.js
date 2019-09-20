// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class represents a single atom of argon in the model.
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
  const RADIUS = Element.Ar.vanDerWaalsRadius;  // In picometers.
  const MASS = Element.Ar.atomicWeight; // In atomic mass units.

  /**
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
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
