// Copyright 2014-2021, University of Colorado Boulder

/**
 * This class provides the interaction strength value between a number of
 * different pairs of atoms.  To do them all would be too much, so this is a
 * sparse table.  Feel free to fill them in as more are needed.
 *
 * The value provided by this table is generally designated as "epsilon" in
 * Lennard-Jones potential calculations.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';
import AtomType from './AtomType.js';

// constants
const DEFAULT_ADJUSTABLE_INTERACTION_POTENTIAL = SOMConstants.MAX_EPSILON / 2;

// static object (no constructor)
const InteractionStrengthTable = {

  /**
   * Get the interaction potential between two atoms.  Units are such that
   * the value divided by k-boltzmann is in Kelvin.  This is apparently how
   * it is generally done.  Note that this value is used as the "epsilon"
   * parameter in Lennard-Jones potential calculations.
   * @public
   * @param {AtomType} atomType1
   * @param {AtomType} atomType2
   * @returns {number}
   */
  getInteractionPotential: ( atomType1, atomType2 ) => {
    if ( atomType1 === atomType2 ) {
      // Heterogeneous pair of atoms.
      if ( atomType1 === AtomType.NEON ) {
        // Source: Hansen & McDouald, Theory of Simple Liquids, obtained from the web
        return 35.8;
      }
      else if ( atomType1 === AtomType.ARGON ) {
        // Source: F. Cuadros, I. Cachadina, and W. Ahamuda, Molc. Engineering, 6, 319 (1996), provided
        // in the original spec for the SOM simulation.
        return 111.84;
      }
      else if ( atomType1 === AtomType.OXYGEN ) {
        //  "Hollywooded" value to be larger than other values, but not really as big as bonded oxygen
        return 1000;
      }
      else if ( atomType1 === AtomType.ADJUSTABLE ) {
        return DEFAULT_ADJUSTABLE_INTERACTION_POTENTIAL;
      }
      else {
        assert && assert( false, `Interaction potential not available for requested atom: ${atomType1}` );
        return SOMConstants.MAX_EPSILON / 2;  // In the real world, default to an arbitrary value.
      }
    }
    else {
      if ( ( ( atomType1 === AtomType.NEON ) && ( atomType2 === AtomType.ARGON ) ) ||
           ( atomType1 === AtomType.ARGON ) && ( atomType2 === AtomType.NEON ) ) {
        // Source: Noah P, who got it from Robert Parsons.
        return 59.5;
      }
      else if ( ( ( atomType1 === AtomType.NEON ) && ( atomType2 === AtomType.OXYGEN ) ) ||
                ( atomType1 === AtomType.OXYGEN ) && ( atomType2 === AtomType.NEON ) ) {
        // Source: Noah P, who got it from Robert Parsons.
        return 51;
      }
      else if ( ( ( atomType1 === AtomType.ARGON ) && ( atomType2 === AtomType.OXYGEN ) ) ||
                ( atomType1 === AtomType.OXYGEN ) && ( atomType2 === AtomType.ARGON ) ) {
        // Source: Noah P, who got it from Robert Parsons.
        return 85;
      }
      else if ( ( atomType1 === AtomType.ADJUSTABLE ) || ( atomType2 === AtomType.ADJUSTABLE ) ) {
        // In this case, where one of the atoms is adjustable, we just use a default value.
        return ( SOMConstants.MAX_EPSILON - SOMConstants.MIN_EPSILON ) / 2;
      }
      else {
        assert && assert( false, 'Error: No data for this combination of molecules' );
        return ( SOMConstants.MAX_EPSILON - SOMConstants.MIN_EPSILON ) / 2;
      }
    }
  }
};

statesOfMatter.register( 'InteractionStrengthTable', InteractionStrengthTable );

export default InteractionStrengthTable;