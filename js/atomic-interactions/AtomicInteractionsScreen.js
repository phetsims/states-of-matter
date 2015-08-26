// Copyright 2002-2015, University of Colorado Boulder

/**
 * The 'Atomic Interaction' screen. Conforms to the contract specified in joist/Screen.
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var DualAtomModel = require( 'STATES_OF_MATTER/atomic-interactions/model/DualAtomModel' );
  var AtomicInteractionsIcon = require( 'STATES_OF_MATTER/atomic-interactions/AtomicInteractionsIcon' );
  var AtomicInteractionsScreenView = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var StatesOfMatterColors = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColors' );

  /**
   *
   * @param {Property<boolean>} projectorModeProperty - true to use the projector color scheme, false to use
   * regular color scheme
   * @param {boolean} enableHeterogeneousMolecules
   * @param {string} simTitle
   * @constructor
   */
  function AtomicInteractionsScreen( projectorModeProperty, enableHeterogeneousMolecules, simTitle ) {

    //If this is a single-screen sim, then no icon is necessary.  If there are multiple screens, then the icon must be
    // provided here.
    var screen = this;
    Screen.call( this, simTitle, new AtomicInteractionsIcon( Screen.HOME_SCREEN_ICON_SIZE),
      function() { return new DualAtomModel(); },
      function( model ) { return new AtomicInteractionsScreenView( model, enableHeterogeneousMolecules, projectorModeProperty ); },
      { backgroundColor: StatesOfMatterColors.background.toCSS() }
    );

    projectorModeProperty.link( function( projectorMode ) {
      if ( projectorMode ) {
        StatesOfMatterColors.applyProfile( 'projector' );
      }
      else {
        StatesOfMatterColors.applyProfile( 'default' );
      }
    } );
    StatesOfMatterColors.linkAttribute( 'background', screen, 'backgroundColor' );
  }

  return inherit( Screen, AtomicInteractionsScreen );
} );
