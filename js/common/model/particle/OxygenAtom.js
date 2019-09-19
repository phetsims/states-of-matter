// Copyright 2014-2018, University of Colorado Boulder

/**
 * This class represents a single atom of oxygen in the model.
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
  var RADIUS = Element.O.vanDerWaalsRadius;   // In picometers.
  var MASS = Element.O.atomicWeight; // In atomic mass units.

  /**
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y  position in picometers
   * @constructor
   */
  function OxygenAtom( x, y ) {
    SOMAtom.call( this, x, y, RADIUS, MASS, SOMConstants.OXYGEN_COLOR );
  }

  statesOfMatter.register( 'OxygenAtom', OxygenAtom );

  return inherit( SOMAtom, OxygenAtom, {

      /**
       * @returns {string}
       * @public
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
