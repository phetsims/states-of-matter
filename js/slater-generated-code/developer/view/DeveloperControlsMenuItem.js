// Copyright 2002-2014, University of Colorado Boulder
/**
 * Menu item that provides access to developer controls.
 * Not internationalized.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Frame = require( 'java.awt.Frame' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var WindowAdapter = require( 'java.awt.event.WindowAdapter' );
  var WindowEvent = require( 'java.awt.event.WindowEvent' );
  var JCheckBoxMenuItem = require( 'javax.swing.JCheckBoxMenuItem' );
  var JDialog = require( 'javax.swing.JDialog' );
  var PhetApplication = require( 'edu.colorado.phet.common.phetcommon.application.PhetApplication' );
  var AbstractStatesOfMatterApplication = require( 'STATES_OF_MATTER/states-of-matter/view/AbstractStatesOfMatterApplication' );

  function DeveloperControlsMenuItem( app ) {

    //private
    this._app;

    //private
    this._developerControlsDialog;
    JCheckBoxMenuItem.call( this, "Developer controls..." );
    _app = app;
    addActionListener( new ActionListener().withAnonymousClassBody( {
      actionPerformed: function( event ) {
        handleDeveloperControls();
      }
    } ) );
  }

  return inherit( JCheckBoxMenuItem, DeveloperControlsMenuItem, {

    //private
    handleDeveloperControls: function() {
      if ( isSelected() ) {
        var owner = PhetApplication.getInstance().getPhetFrame();
        if ( _app instanceof AbstractStatesOfMatterApplication ) {
          _developerControlsDialog = new StatesOfMaterDeveloperControlsDialog( owner, _app );
        }
        _developerControlsDialog.setVisible( true );
        _developerControlsDialog.addWindowListener( new WindowAdapter().withAnonymousClassBody( {
          windowClosed: function( e ) {
            cleanup();
          },
          windowClosing: function( e ) {
            cleanup();
          },

          //private
          cleanup: function() {
            setSelected( false );
            _developerControlsDialog = null;
          }
        } ) );
      }
      else {
        _developerControlsDialog.dispose();
      }
    }
  } );
} );

