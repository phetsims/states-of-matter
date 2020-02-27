// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class provides the value of sigma for Lennard-Jones calculations.  The
 * value of sigma is in units of distance, and is (apparently) different for
 * each different pair of atom types.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';
import AtomType from './AtomType.js';
import ArgonAtom from './particle/ArgonAtom.js';
import ConfigurableStatesOfMatterAtom from './particle/ConfigurableStatesOfMatterAtom.js';
import NeonAtom from './particle/NeonAtom.js';
import OxygenAtom from './particle/OxygenAtom.js';

// static object (no constructor)
const SigmaTable = {

  /**
   * Get the value of sigma, in picometers, for the atom types specified.
   * @public
   * @param {AtomType} atomType1
   * @param {AtomType} atomType2
   * @returns {number}
   */
  getSigma: function( atomType1, atomType2 ) {
    if ( atomType1 === atomType2 ) {
      // Heterogeneous pair of atoms.
      if ( atomType1 === AtomType.NEON ) {
        // Source: Noah P, who got it from Robert Parsons.
        return 308;
      }
      else if ( atomType1 === AtomType.ARGON ) {
        // Source: Noah P, who got it from Robert Parsons.
        return 376;
      }
      else if ( atomType1 === AtomType.OXYGEN ) {
        // "Hollywoded" value to be smaller than other values, but not really as small as bonded oxygen
        return 200;
      }
      else if ( atomType1 === AtomType.ADJUSTABLE ) {
        return ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
      }
      else {
        assert && assert( false, 'Error: Interaction potential not available for requested atom: ' + atomType1 );
        return SOMConstants.MAX_EPSILON / 2;
      }
    }
    else {
      if ( ( ( atomType1 === AtomType.NEON ) && ( atomType2 === AtomType.ARGON ) ) ||
           ( atomType1 === AtomType.ARGON ) && ( atomType2 === AtomType.NEON ) ) {
        // Source: Noah P, who got it from Robert Parsons.
        return 343;
      }
      else if ( ( ( atomType1 === AtomType.NEON ) && ( atomType2 === AtomType.OXYGEN ) ) ||
                ( atomType1 === AtomType.OXYGEN ) && ( atomType2 === AtomType.NEON ) ) {
        // Don't have a value for this, Noah P says use average of the diameters.
        return ( NeonAtom.RADIUS + OxygenAtom.RADIUS );
      }
      else if ( ( ( atomType1 === AtomType.ARGON ) && ( atomType2 === AtomType.OXYGEN ) ) ||
                ( atomType1 === AtomType.OXYGEN ) && ( atomType2 === AtomType.ARGON ) ) {
        // Don't have a value for this, Noah P says use average of the diameters.
        return ( ArgonAtom.RADIUS + OxygenAtom.RADIUS );
      }
      else if ( ( atomType1 === AtomType.ADJUSTABLE ) || ( atomType2 === AtomType.ADJUSTABLE ) ) {
        // In this case, where one of the atoms is adjustable, we just use a default value.
        return ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
      }
      else {
        assert && assert( false, 'Error: sigma data not available for this combination of molecules: ' + atomType1 +
                                 ', ' + atomType2 );
        return ( SOMConstants.MAX_SIGMA - SOMConstants.MIN_SIGMA ) / 2;
      }
    }
  }
};

statesOfMatter.register( 'SigmaTable', SigmaTable );

export default SigmaTable;