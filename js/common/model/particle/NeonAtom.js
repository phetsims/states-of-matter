// Copyright 2014-2019, University of Colorado Boulder

/**
 * The class represents a single atom of neon in the model.
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
  const RADIUS = Element.Ne.vanDerWaalsRadius;   // In picometers.
  const MASS = Element.Ne.atomicWeight; // In atomic mass units.
  const EPSILON = 32.8; // epsilon/k-Boltzmann is in Kelvin.

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
