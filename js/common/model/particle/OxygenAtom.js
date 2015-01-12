// Copyright 2002-2013, University of Colorado Boulder

/**
 * The class represents a single atom of oxygen in the model.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/StatesOfMatterAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );

  // constants
  var RADIUS = 162;   // In picometers.
  var MASS = 15.9994; // In atomic mass units.
  var ATOM_TYPE = AtomType.OXYGEN;
  var COLOUR = '#DA1300';

  /**
   * @param {Number} x    position in picometers
   * @param {Number} y    position in picometers
   * @constructor
   */
  function OxygenAtom( x, y ) {
    StatesOfMatterAtom.call( this, x, y, RADIUS, MASS, COLOUR );
  }

  return inherit( StatesOfMatterAtom, OxygenAtom, {

      getType: function() {
        return ATOM_TYPE;
      }

    },
    // public static final
    {
      RADIUS: RADIUS
    } );
} );
