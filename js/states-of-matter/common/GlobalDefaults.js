// Copyright 2002-2014, University of Colorado Boulder
/* package private! */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

// Clock
  var CLOCK_RUNNING = true;
  /* Not intended for instantiation */

  //private
  function GlobalDefaults() {
  }

  return inherit( Object, GlobalDefaults, {
    },
//statics
    {
      CLOCK_RUNNING: CLOCK_RUNNING
    } );
} );

