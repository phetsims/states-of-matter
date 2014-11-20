// Copyright 2002-2014, University of Colorado Boulder
/**
 * This is essentially an enum for the atom types used in this simulation.  We
 * are restricted to Java 1.4 at this time, so enums are not available.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  var NEON = new AtomType( "Neon" );
  var ARGON = new AtomType( "Argon" );
  var OXYGEN = new AtomType( "Oxygen" );
  var HYDROGEN = new AtomType( "Hydrogen" );
  var ADJUSTABLE = new AtomType( "Adjustable" );

  function AtomType( name ) {

    //private
    this.m_name;
    this.m_name = name;
  }

  return inherit( Object, AtomType, {
      toString: function() {
        return m_name;
      }
    },
//statics
    {
      NEON: NEON,
      ARGON: ARGON,
      OXYGEN: OXYGEN,
      HYDROGEN: HYDROGEN,
      ADJUSTABLE: ADJUSTABLE
    } );
} );

