// Copyright 2014-2020, University of Colorado Boulder

/**
 * The 'Phase Changes' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  const PhaseChangesIcon = require( 'STATES_OF_MATTER/phase-changes/PhaseChangesIcon' );
  const PhaseChangesScreenView = require( 'STATES_OF_MATTER/phase-changes/view/PhaseChangesScreenView' );
  const Screen = require( 'JOIST/Screen' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // strings
  const phaseChangesString = require( 'string!STATES_OF_MATTER/phaseChanges' );

  /**
   * @param {boolean} isInteractionDiagramEnabled
   * @param {Tandem} tandem
   * @constructor
   */
  function PhaseChangesScreen( isInteractionDiagramEnabled, tandem ) {

    const options = {
      name: phaseChangesString,
      backgroundColorProperty: SOMColorProfile.backgroundProperty,
      homeScreenIcon: new PhaseChangesIcon( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE ),
      showUnselectedHomeScreenIconFrame: true,
      maxDT: SOMConstants.MAX_DT,
      tandem: tandem
    };

    Screen.call( this,
      function() { return new MultipleParticleModel( tandem.createTandem( 'model' ) ); },
      function( model ) { return new PhaseChangesScreenView( model, isInteractionDiagramEnabled ); },
      options
    );
  }

  statesOfMatter.register( 'PhaseChangesScreen', PhaseChangesScreen );

  return inherit( Screen, PhaseChangesScreen );
} );