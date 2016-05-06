// Copyright 2014-2015, University of Colorado Boulder

/**
 * The class represents a single atom of hydrogen in the model.
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
  var RADIUS = Element.H.vanDerWaalsRadius;   // In picometers.
  var MASS = Element.H.atomicWeight; // In atomic mass units.

  /**
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
   * @param {boolean} layerFlag - flag which says whether it has to be in the front or at the back of oxygen. It replaces the Hydrogen2 File
   * @constructor
   */
  function HydrogenAtom( x, y, layerFlag ) {
    StatesOfMatterAtom.call( this, x, y, RADIUS, MASS, StatesOfMatterConstants.HYDROGEN_COLOR );
    this.layerFlag = layerFlag;
  }

  statesOfMatter.register( 'HydrogenAtom', HydrogenAtom );

  return inherit( StatesOfMatterAtom, HydrogenAtom, {

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
