// Copyright 2002-2014, University of Colorado Boulder
/**
 * Main application class for the Atomic Interactions simulation flavor.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Frame = require( 'java.awt.Frame' );
  var ApplicationConstructor = require( 'edu.colorado.phet.common.phetcommon.application.ApplicationConstructor' );
  var PhetApplication = require( 'edu.colorado.phet.common.phetcommon.application.PhetApplication' );
  var PhetApplicationConfig = require( 'edu.colorado.phet.common.phetcommon.application.PhetApplicationConfig' );
  var PhetApplicationLauncher = require( 'edu.colorado.phet.common.phetcommon.application.PhetApplicationLauncher' );
  var IProguardKeepClass = require( 'edu.colorado.phet.common.phetcommon.util.IProguardKeepClass' );
  var PhetLookAndFeel = require( 'edu.colorado.phet.common.phetcommon.view.PhetLookAndFeel' );
  var PiccoloPhetApplication = require( 'edu.colorado.phet.common.piccolophet.PiccoloPhetApplication' );
  var AtomicInteractionsModule = require( 'STATES_OF_MATTER/states-of-matter/module/atomicinteractions/AtomicInteractionsModule' );

  function AtomicInteractionsApplication( config ) {
    PiccoloPhetApplication.call( this, config );
    initModules();
  }

  return inherit( PiccoloPhetApplication, AtomicInteractionsApplication, {
//----------------------------------------------------------------------------
// Methods
//----------------------------------------------------------------------------
    /**
     * Initializes the modules.
     */

    //private
    initModules: function() {
      var parentFrame = getPhetFrame();
      addModule( new AtomicInteractionsModule( true ) );
    },
//----------------------------------------------------------------------------
// main
//----------------------------------------------------------------------------
    main: function( args ) {
      var applicationConstructor = new ApplicationConstructor().withAnonymousClassBody( {
        getApplication: function( config ) {
          // Create the application.
          return (new AtomicInteractionsApplication( config ));
        }
      } );
      var config = new PhetApplicationConfig( args, StatesOfMatterConstants.PROJECT_NAME, StatesOfMatterConstants.FLAVOR_INTERACTION_POTENTIAL );
      config.setFrameSetup( StatesOfMatterConstants.FRAME_SETUP );
      var p = new PhetLookAndFeel();
      p.setBackgroundColor( StatesOfMatterConstants.CONTROL_PANEL_COLOR );
      config.setLookAndFeel( p );
      new PhetApplicationLauncher().launchSim( config, applicationConstructor );
    }
  } );
} );

