// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * The 'Phase Changes' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var PhaseChangesScreenView = require( 'STATES_OF_MATTER/phase-changes/view/PhaseChangesScreenView' );
  var Image = require( 'SCENERY/nodes/Image' );
  var AtomicInteractionColors = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionColors' );

  // strings
  var phaseChangesString = require( 'string!STATES_OF_MATTER/phaseChanges' );

  // images
  var phaseChangesScreenIcon = require( 'image!STATES_OF_MATTER/som-phase-changes-icon.png' );

  /**
   * @param {Property<boolean>} projectorModeProperty - true for projector color scheme (white back ground), false for regular black back ground
   * @param {boolean} isInteractionDiagramEnabled
   * @constructor
   */
  function PhaseChangesScreen( projectorModeProperty, isInteractionDiagramEnabled ) {
    Screen.call( this, phaseChangesString, new Image( phaseChangesScreenIcon ),
      function() { return new MultipleParticleModel(); },
      function( model ) { return new PhaseChangesScreenView( model, isInteractionDiagramEnabled, projectorModeProperty ); },
      { backgroundColor: 'black' }
    );
    var screen = this;
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

  return inherit( Screen, PhaseChangesScreen );
} );