//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var DualAtomModel = require( 'ATOMIC_INTERACTIONS/atomic-interactions/model/DualAtomModel' );
  var AtomicInteractionsScreenView = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/AtomicInteractionsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var atomicInteractionsSimString = require( 'string!ATOMIC_INTERACTIONS/atomic-interactions.name' );

  /**
   * @constructor
   */
  function AtomicInteractionsScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    // var icon = null;

    Screen.call( this, atomicInteractionsSimString, new Rectangle( 0, 0, 50, 50 ),
      function() { return new DualAtomModel(); },
      function( model ) { return new AtomicInteractionsScreenView( model ); },
      { backgroundColor: 'black', navigationBarIcon: new Rectangle( 0, 0, 50, 50 )}
    );
  }

  return inherit( Screen, AtomicInteractionsScreen );
} );