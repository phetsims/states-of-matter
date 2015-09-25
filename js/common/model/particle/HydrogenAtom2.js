// Copyright 2002-2015, University of Colorado Boulder

/**
 * The class represents a single atom of hydrogen in the model.  This
 * variation of Hydrogen Atom exists primarily to allow the appearance of
 * water to vary.
 *
 * TODO: Consider alternative ways to make water appearance vary.
 *
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var Element = require( 'NITROGLYCERIN/Element' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/StatesOfMatterAtom' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // constants
  var RADIUS = 120;   // In picometers.
  var MASS = Element.H.atomicWeight; // In atomic mass units.

  /**
   * @param {number} xPos  position in picometers
   * @param {number} yPos  position in picometers
   * @constructor
   */
  function HydrogenAtom2( xPos, yPos ) {
    StatesOfMatterAtom.call( this, xPos, yPos, RADIUS, MASS, StatesOfMatterConstants.HYDROGEN_COLOR );
  }

  return inherit( StatesOfMatterAtom, HydrogenAtom2, {

      /**
       * @public
       * @returns {string}
       */
      getType: function() {
        return AtomType.HYDROGEN;
      }
    },
//statics
    {
      RADIUS: RADIUS
    } );
} );

