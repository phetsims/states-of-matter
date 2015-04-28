// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class represents an atom that has configurable radius.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/StatesOfMatterAtom' );

  // constants
  var DEFAULT_INTERACTION_POTENTIAL = StatesOfMatterConstants.MAX_EPSILON / 2;
  var DEFAULT_RADIUS = 175; // in picometers
  var MASS = 25; // in atomic mass units

  /**
   * @param {number} x position
   * @param {number} y position
   * @constructor
   */
  function ConfigurableStatesOfMatterAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, DEFAULT_RADIUS, MASS, StatesOfMatterConstants.ADJUSTABLE_ATTRACTION_COLOR );
  }

  return inherit( StatesOfMatterAtom, ConfigurableStatesOfMatterAtom, {

      /**
       * @returns {AtomType}
       * @public
       */
      getType: function() {
        return AtomType.ADJUSTABLE;
      },

      /**
       * @param {number} radius in picometers
       * @public
       */
      setRadius: function( radius ) {
        this.radius = radius;
      }
    },
    // statics
    {
      DEFAULT_INTERACTION_POTENTIAL: DEFAULT_INTERACTION_POTENTIAL,
      DEFAULT_RADIUS: DEFAULT_RADIUS
    } );
} );

