// Copyright 2002-2011, University of Colorado
/**
 * Main application class for the States of Matter simulation.
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
  var AtomicInteractionsModule = require( 'STATES_OF_MATTER/states-of-matter/module/atomicinteractions/AtomicInteractionsModule' );
  var PhaseChangesModule = require( 'STATES_OF_MATTER/states-of-matter/module/phasechanges/PhaseChangesModule' );
  var SolidLiquidGasModule = require( 'STATES_OF_MATTER/states-of-matter/module/solidliquidgas/SolidLiquidGasModule' );
  var AbstractStatesOfMatterApplication = require( 'STATES_OF_MATTER/states-of-matter/view/AbstractStatesOfMatterApplication' );

  /**
   * Constructor.
   *
   * @param config
   */
  function StatesOfMatterApplication( config ) {
    AbstractStatesOfMatterApplication.call( this, config );
    initModules();
  }

  return inherit( AbstractStatesOfMatterApplication, StatesOfMatterApplication, {
    /**
     * Initializes the modules.
     */

    //private
    initModules: function() {
      var parentFrame = getPhetFrame();
      addModule( new SolidLiquidGasModule() );
      addModule( new PhaseChangesModule( true ) );
      addModule( new AtomicInteractionsModule( false ) );
    },
    /**
     * Main entry point.
     *
     * @param args command line arguments
     */
    main: function( args ) {
      var appConstructor = new ApplicationConstructor().withAnonymousClassBody( {
        getApplication: function( config ) {
          return new StatesOfMatterApplication( config );
        }
      } );
      var appConfig = new PhetApplicationConfig( args, StatesOfMatterConstants.PROJECT_NAME, StatesOfMatterConstants.FLAVOR_STATES_OF_MATTER );
      var p = new PhetLookAndFeel();
      p.setBackgroundColor( StatesOfMatterConstants.CONTROL_PANEL_COLOR );
      appConfig.setLookAndFeel( p );
      new PhetApplicationLauncher().launchSim( appConfig, appConstructor );
    }
  } );
} );

