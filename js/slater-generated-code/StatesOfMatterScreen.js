//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var StatesOfMatterModel = require( 'STATES_OF_MATTER/states-of-matter/model/StatesOfMatterModel' );
  var StatesOfMatterScreenView = require( 'STATES_OF_MATTER/states-of-matter/view/StatesOfMatterScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var statesOfMatterSimString = require( 'string!STATES_OF_MATTER/states-of-matter.name' );

  /**
   * @constructor
   */
  function StatesOfMatterScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, statesOfMatterSimString, icon,
      function() { return new StatesOfMatterModel(); },
      function( model ) { return new StatesOfMatterScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, StatesOfMatterScreen );
} );