// Copyright (c) 2002 - 2014. University of Colorado Boulder

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
  var AtomicInteractionColors = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/AtomicInteractionColors' );

  // strings
  var phaseChangesString = require( 'string!STATES_OF_MATTER/phaseChanges' );

  // images
  var phaseChangesScreenIcon = require( 'image!STATES_OF_MATTER/som-phase-changes-screen.png' );

  /**
   *
   * @param {Boolean} isInteractionDiagramEnabled
   * @param {Property<Boolean>} projectorColorsProperty - true for projector color scheme (white back ground), false for regular black back ground
   * @constructor
   */
  function PhaseChangesScreen( isInteractionDiagramEnabled, projectorColorsProperty ) {
    Screen.call( this, phaseChangesString, new Image( phaseChangesScreenIcon ),
      function() { return new MultipleParticleModel(); },
      function( model ) { return new PhaseChangesScreenView( model, isInteractionDiagramEnabled, projectorColorsProperty ); },
      { backgroundColor: 'black' }
    );
    var screen = this;
    projectorColorsProperty.link( function( color ) {
      if ( color ) {
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