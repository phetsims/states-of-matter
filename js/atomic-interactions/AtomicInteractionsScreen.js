// Copyright 2015-2019, University of Colorado Boulder

/**
 * The 'Atomic Interaction' screen. Conforms to the contract specified in joist/Screen.
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const AtomicInteractionsIcon = require( 'STATES_OF_MATTER/atomic-interactions/AtomicInteractionsIcon' );
  const AtomicInteractionsScreenView = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionsScreenView' );
  const DualAtomModel = require( 'STATES_OF_MATTER/atomic-interactions/model/DualAtomModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Screen = require( 'JOIST/Screen' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @param {boolean} enableHeterogeneousMolecules
   * @param {string} screenTitle
   * @constructor
   */
  function AtomicInteractionsScreen( enableHeterogeneousMolecules, screenTitle ) {

    var options = {
      name: screenTitle,
      backgroundColorProperty: SOMColorProfile.backgroundProperty,
      homeScreenIcon: new AtomicInteractionsIcon( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE ),
      showUnselectedHomeScreenIconFrame: true,
      maxDT: SOMConstants.MAX_DT
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
