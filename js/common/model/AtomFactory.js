// Copyright 2002-2011, University of Colorado
/**
 * This class is used to create an instance of the desired type of atom.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );

  /**
   *
   * @constructor
   */
  function AtomFactory() {
  }

  return inherit( Object, AtomFactory, {
    /**
     *
     * @param {String} atomType
     * @returns {*}
     */
    createAtom: function( atomType ) {
      var atom = null;
      if ( atomType === AtomType.ADJUSTABLE ) {
        atom = new ConfigurableStatesOfMatterAtom( 0, 0 );
      }
      else if ( atomType === AtomType.ARGON ) {
        atom = new ArgonAtom( 0, 0 );
      }
      else if ( atomType === AtomType.NEON ) {
        atom = new NeonAtom( 0, 0 );
      }
      else if ( atomType === AtomType.OXYGEN ) {
        atom = new OxygenAtom( 0, 0 );
      }
      return atom;
    }
  } );
} );

