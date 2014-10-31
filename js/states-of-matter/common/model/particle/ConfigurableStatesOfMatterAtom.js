// Copyright 2002-2011, University of Colorado
/**
 * This class represents an atom that has configurable radius.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var AtomType = require( 'STATES_OF_MATTER/states-of-matter/model/AtomType' );

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
        m_radius = radius;
        notifyRadiusChanged();
      }
    },
//statics
    {
      DEFAULT_INTERACTION_POTENTIAL: DEFAULT_INTERACTION_POTENTIAL,
      DEFAULT_RADIUS: DEFAULT_RADIUS
    } );
} );

