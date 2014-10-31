// Copyright 2002-2011, University of Colorado
/**
 * This class contains the default settings for the "Solid, Liquid, Gas" Module.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

// Clock
  var CLOCK_RUNNING = GlobalDefaults.CLOCK_RUNNING;
// Frames per second.
  var CLOCK_FRAME_RATE = 30;
  var CLOCK_FRAME_DELAY = 1000 / CLOCK_FRAME_RATE;
// Milliseconds per tick.
  var CLOCK_DT = 5;
  /* Not intended for instantiation */

  //private
  function SolidLiquidGasDefaults() {
  }

  return inherit( Object, SolidLiquidGasDefaults, {
    },
//statics
    {
      CLOCK_RUNNING: CLOCK_RUNNING,
      CLOCK_FRAME_RATE: CLOCK_FRAME_RATE,
      CLOCK_FRAME_DELAY: CLOCK_FRAME_DELAY,
      CLOCK_DT: CLOCK_DT
    } );
} );

