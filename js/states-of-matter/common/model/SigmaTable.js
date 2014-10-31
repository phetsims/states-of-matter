// Copyright 2002-2011, University of Colorado
/**
 * This class provides the value of sigma for Lennard-Jones calculations.  The
 * value of sigma is in units of distance, and is (apparently) different for
 * each different pair of atom types.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var ArgonAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/ArgonAtom' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/ConfigurableStatesOfMatterAtom' );
  var NeonAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/OxygenAtom' );


  return inherit( Object, SigmaTable, {
    /**
     * Get the value of sigma, in picometers, for the atom types specified.
     */
    getSigma: function( atomType1, atomType2 ) {
      if ( atomType1 == atomType2 ) {
        // Heterogeneous pair of atoms.
        if ( atomType1 == AtomType.NEON ) {
          // Source: Noah P, who got it from Robert Parsons.
          return 308;
        }
        else if ( atomType1 == AtomType.ARGON ) {
          // Source: Noah P, who got it from Robert Parsons.
          return 376;
        }
        else if ( atomType1 == AtomType.OXYGEN ) {
          // Source: Noah P, who got it from Robert Parsons.
          return 110;
        }
        else if ( atomType1 == AtomType.ADJUSTABLE ) {
          return ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
        }
        else {
          System.err.println( "Error: Interaction potential not available for requested atom: " + atomType1 );
          assert && assert( (false) );
          // In the real world, default to an arbitrary value.
          return StatesOfMatterConstants.MAX_EPSILON / 2;
        }
      }
      else {
        if ( ((atomType1 == AtomType.NEON) && (atomType2 == AtomType.ARGON)) || (atomType1 == AtomType.ARGON) && (atomType2 == AtomType.NEON) ) {
          // Source: Noah P, who got it from Robert Parsons.
          return 343;
        }
        else if ( ((atomType1 == AtomType.NEON) && (atomType2 == AtomType.OXYGEN)) || (atomType1 == AtomType.OXYGEN) && (atomType2 == AtomType.NEON) ) {
          // Don't have a value for this, Noah P says use average of the diameters.
          return (NeonAtom.RADIUS + OxygenAtom.RADIUS);
        }
        else if ( ((atomType1 == AtomType.ARGON) && (atomType2 == AtomType.OXYGEN)) || (atomType1 == AtomType.OXYGEN) && (atomType2 == AtomType.ARGON) ) {
          // Don't have a value for this, Noah P says use average of the diameters.
          return (ArgonAtom.RADIUS + OxygenAtom.RADIUS);
        }
        else if ( (atomType1 == AtomType.ADJUSTABLE) || (atomType2 == AtomType.ADJUSTABLE) ) {
          // In this case, where one of the atoms is adjustable, we just use a default value.
          return ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
        }
        else {
          System.err.println( "Error: Do not have sigma data for this combination of molecules, using default." );
          System.err.println( "       atomType1 = " + atomType1 + ", atomType2 = " + atomType2 );
          return (StatesOfMatterConstants.MAX_SIGMA - StatesOfMatterConstants.MIN_SIGMA) / 2;
        }
      }
    }
  } );
} );

