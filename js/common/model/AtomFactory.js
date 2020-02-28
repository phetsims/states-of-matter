// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class is used to create an instance of the desired type of atom.
 *
 * @author John Blanco
 */

import statesOfMatter from '../../statesOfMatter.js';
import AtomType from './AtomType.js';
import ArgonAtom from './particle/ArgonAtom.js';
import ConfigurableStatesOfMatterAtom from './particle/ConfigurableStatesOfMatterAtom.js';
import NeonAtom from './particle/NeonAtom.js';
import OxygenAtom from './particle/OxygenAtom.js';

// static object (no constructor)
const AtomFactory = {

  /**
   * @param {AtomType} atomType
   * @returns {SOMAtom}
   * @public
   */
  createAtom: function( atomType ) {
    let atom = null;
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

export default AtomFactory;