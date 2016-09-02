// Copyright 2014-2015, University of Colorado Boulder

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
  var PhaseChangesIcon = require( 'STATES_OF_MATTER/phase-changes/PhaseChangesIcon' );
  var PhaseChangesScreenView = require( 'STATES_OF_MATTER/phase-changes/view/PhaseChangesScreenView' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColorProfile = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColorProfile' );

  // strings
  var phaseChangesString = require( 'string!STATES_OF_MATTER/phaseChanges' );

  /**
   * @param {boolean} isInteractionDiagramEnabled
   * @constructor
   */
  function PhaseChangesScreen( isInteractionDiagramEnabled ) {
    Screen.call( this, phaseChangesString, new PhaseChangesIcon( Screen.HOME_SCREEN_ICON_SIZE ),
      function() { return new MultipleParticleModel(); },
      function( model ) { return new PhaseChangesScreenView( model, isInteractionDiagramEnabled ); },
      { backgroundColor: StatesOfMatterColorProfile.background.toCSS() }
    );
    var self = this;
    StatesOfMatterColorProfile.backgroundProperty.link( function( color ){
      self.backgroundColor = color;
    } );
  }

  statesOfMatter.register( 'PhaseChangesScreen', PhaseChangesScreen );

  return inherit( Screen, PhaseChangesScreen );
} );