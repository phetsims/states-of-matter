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
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // static object (no constructor)
  var AtomFactory = {

    /**
     * @param {AtomType} atomType
     * @returns {StatesOfMatterAtom}
     * @public
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
          assert && assert( false, 'invalid atom type' );
          atom = null;
          break;
      }
      return atom;
    }
  };

  statesOfMatter.register( 'AtomFactory', AtomFactory );

  return AtomFactory;
} );

