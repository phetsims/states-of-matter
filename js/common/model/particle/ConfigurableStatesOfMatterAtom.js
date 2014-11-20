// Copyright 2002-2014, University of Colorado Boulder
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
  var DEFAULT_INTERACTION_POTENTIAL = StatesOfMatterConstants.MAX_EPSILON / 2;

  // In picometers.
  var DEFAULT_RADIUS = 175;
  // In atomic mass units.

  //private
  var MASS = 25;

  function ConfigurableStatesOfMatterAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, DEFAULT_RADIUS, MASS );
  }

  return inherit( StatesOfMatterAtom, ConfigurableStatesOfMatterAtom, {
      getType: function() {
        return AtomType.ADJUSTABLE;
      },
      setRadius: function( radius ) {
        this.radius = radius;

      }
    },
//statics
    {
      DEFAULT_INTERACTION_POTENTIAL: DEFAULT_INTERACTION_POTENTIAL,
      DEFAULT_RADIUS: DEFAULT_RADIUS
    } );
} );

