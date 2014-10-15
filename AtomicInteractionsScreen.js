//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomicInteractionsModel = require( 'ATOMIC_INTERACTIONS/atomic-interactions/model/AtomicInteractionsModel' );
  var AtomicInteractionsScreenView = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/AtomicInteractionsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var atomicInteractionsSimString = require( 'string!ATOMIC_INTERACTIONS/atomic-interactions.name' );

  /**
   * @constructor
   */
  function AtomicInteractionsScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, atomicInteractionsSimString, icon,
      function() { return new AtomicInteractionsModel(); },
      function( model ) { return new AtomicInteractionsScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, AtomicInteractionsScreen );
} );