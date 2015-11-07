// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class is used to create an instance of the desired type of atom.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );

  // static object (no constructor)
  return {

    /**
     * @public
     * @param {string} atomType
     * @returns {StatesOfMatterAtom}
     */
    createAtom: function( atomType ) {
      var atom = null;
      switch( atomType ) {
        case AtomType.ADJUSTABLE:
          atom = new ConfigurableStatesOfMatterAtom( 0, 0 );
          break;
        case AtomType.ARGON:
          atom = new ArgonAtom( 0, 0 );
          break;
        case  AtomType.NEON:
          atom = new NeonAtom( 0, 0 );
          break;
        case AtomType.OXYGEN:
          atom = new OxygenAtom( 0, 0 );
          break;
        default:
          atom = null;
          break;
      }
      return atom;
    }
  };
} );

