// Copyright 2015, University of Colorado Boulder

/**
 * The 'Atomic Interaction' screen. Conforms to the contract specified in joist/Screen.
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomicInteractionsIcon = require( 'STATES_OF_MATTER/atomic-interactions/AtomicInteractionsIcon' );
  var AtomicInteractionsScreenView = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionsScreenView' );
  var DualAtomModel = require( 'STATES_OF_MATTER/atomic-interactions/model/DualAtomModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColorProfile = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColorProfile' );

  /**
   * @param {boolean} enableHeterogeneousMolecules
   * @param {string} screenTitle
   * @constructor
   */
  function AtomicInteractionsScreen( enableHeterogeneousMolecules, screenTitle ) {

    var options = {
      name: screenTitle,
      backgroundColorProperty: StatesOfMatterColorProfile.backgroundProperty,
      homeScreenIcon: new AtomicInteractionsIcon( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE )
    };

    Screen.call( this,
      function() { return new DualAtomModel(); },
      function( model ) { return new AtomicInteractionsScreenView( model, enableHeterogeneousMolecules ); },
      options
    );
  }

  statesOfMatter.register( 'AtomicInteractionsScreen', AtomicInteractionsScreen );

  return inherit( Screen, AtomicInteractionsScreen );
} );
