// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class represents a single atom of oxygen in the model.
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
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/StatesOfMatterAtom' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // constants
  var RADIUS = Element.O.vanDerWaalsRadius;   // In picometers.
  var MASS = Element.O.atomicWeight; // In atomic mass units.

  /**
   * @param {number} x   - atom x position in picometers
   * @param {number} y   - atom y  position in picometers
   * @constructor
   */
  function OxygenAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, RADIUS, MASS, StatesOfMatterConstants.OXYGEN_COLOR );
  }

  statesOfMatter.register( 'OxygenAtom', OxygenAtom );

  return inherit( StatesOfMatterAtom, OxygenAtom, {

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
