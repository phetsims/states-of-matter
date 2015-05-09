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
  var AtomicInteractionsScreenView = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var AtomicInteractionColors = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionColors' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var atomicInteractionScreenIcon = require( 'image!STATES_OF_MATTER/som-atomic-interactions-icon.png' );

  /**
   *
   * @param {Property<boolean>} projectorModeProperty
   * @param {boolean} enableHeterogeneousMolecules
   * @param {string} simTitle
   * @constructor
   */
  function AtomicInteractionsScreen( projectorModeProperty, enableHeterogeneousMolecules, simTitle ) {

    //If this is a single-screen sim, then no icon is necessary.  If there are multiple screens, then the icon must be
    // provided here.
    var screen = this;
    Screen.call( this, simTitle, new Image( atomicInteractionScreenIcon ),
      function() { return new DualAtomModel(); },
      function( model ) { return new AtomicInteractionsScreenView( model, enableHeterogeneousMolecules ); },
      { backgroundColor: AtomicInteractionColors.background.toCSS() }
    );

    projectorModeProperty.link( function( projectorMode ) {
      if ( projectorMode ) {
        AtomicInteractionColors.applyProfile( 'projector' );
      }
      else {
        AtomicInteractionColors.applyProfile( 'default' );
      }
    } );
    AtomicInteractionColors.linkAttribute( 'background', screen, 'backgroundColor' );
  }

  return inherit( Screen, AtomicInteractionsScreen );
} );
