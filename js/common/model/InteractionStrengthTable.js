// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class provides the interaction strength value between a number of
 * different pairs of atoms.  To do them all would be too much, so this is a
 * sparse table.  Feel free to fill them in as more are needed.
 * <p/>
 * The value provided by this table is generally designated as "epsilon" in
 * Lennard-Jones potential calculations.
 * <p/>
 * @author John Blanco
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );

  /**
   * @constructor
   */
  function InteractionStrengthTable() {
  }

  return inherit( Object, InteractionStrengthTable, {}, {

    /**
     * Get the interaction potential between two atoms.  Units are such that
     * the value divided by k-boltzmann is in Kelvin.  This is apparently how
     * it is generally done.  Note that this value is used as the "epsilon"
     * parameter in Lennard-Jones potential calculations.
     * @public
     * @param {String} atomType1
     * @param {String} atomType2
     * @returns {*}
     */
    getInteractionPotential: function( atomType1, atomType2 ) {
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
          // Source: Noah P, who got it from Robert Parsons.
          return 59500;
        }
        else if ( atomType1 === AtomType.ADJUSTABLE ) {
          return ConfigurableStatesOfMatterAtom.DEFAULT_INTERACTION_POTENTIAL;
        }
        else {
          console.error( 'Error: Interaction potential not available for requested atom: ' + atomType1 );
          assert && assert( false );
          return StatesOfMatterConstants.MAX_EPSILON / 2;  // In the real world, default to an arbitrary value.
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
          return ( StatesOfMatterConstants.MAX_EPSILON - StatesOfMatterConstants.MIN_EPSILON ) / 2;
        }
        else {
          console.error( 'Warning: No data for this combination of molecules, using default.' );
          console.error( '         atomType1 = ' + atomType1 + ', atomType2 = ' + atomType2 );
          return ( StatesOfMatterConstants.MAX_EPSILON - StatesOfMatterConstants.MIN_EPSILON ) / 2;
        }
      }
    }
  } );
} );
