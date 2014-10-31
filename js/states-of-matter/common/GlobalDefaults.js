// Copyright 2002-2011, University of Colorado
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

