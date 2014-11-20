// Copyright 2002-2011, University of Colorado
/**
 * This interface allows the implementer to listen for events from a diagram,
 * chart, or whatever, that indicate that the user wants to close or hide the
 * the item.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );


  return inherit( Object, CloseRequestListener, {
    /**
     * Indicates that a request has been received to close or hide this item.
     * An example of when this might occur is when the user clicks a 'close'
     * button (e.g. the 'x' in the corner of the window) and the window is
     * not responsible for hiding itself.
     */
    closeRequestReceived: function() {}
  } );
} );

