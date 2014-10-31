// Copyright 2002-2014, University of Colorado Boulder
/**
 * This interface allows users to directly set the phase state (i.e. solid,
 * liquid, or gas) of the implementer.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  var PHASE_SOLID = 1;
  var PHASE_LIQUID = 2;
  var PHASE_GAS = 3;

  return inherit( Object, PhaseStateChanger, {
      setPhase: function( phaseID ) {}
    },
//statics
    {
      PHASE_SOLID: PHASE_SOLID,
      PHASE_LIQUID: PHASE_LIQUID,
      PHASE_GAS: PHASE_GAS
    } );
} );

