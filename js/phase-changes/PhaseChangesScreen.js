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

  // strings
  var phaseChangesString = require( 'string!STATES_OF_MATTER/phaseChanges' );

  // images
  var phaseChangesScreenIcon = require( 'image!STATES_OF_MATTER/som-phase-changes-screen.png' );

  /**
   * @constructor
   */
  function PhaseChangesScreen( isInteractionDiagramEnabled ) {
    Screen.call( this, phaseChangesString, new Image( phaseChangesScreenIcon ),
      function() { return new MultipleParticleModel(); },
      function( model ) { return new PhaseChangesScreenView( model, isInteractionDiagramEnabled ); },
      { backgroundColor: 'black' }
    );
  }

  return inherit( Screen, PhaseChangesScreen );
} );