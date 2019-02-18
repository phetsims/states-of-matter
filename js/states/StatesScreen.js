// Copyright 2014-2019, University of Colorado Boulder

/**
 * The 'Solid Liquid Gas' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var Screen = require( 'JOIST/Screen' );
  var SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var StatesIcon = require( 'STATES_OF_MATTER/states/StatesIcon' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesScreenView = require( 'STATES_OF_MATTER/states/view/StatesScreenView' );

  // strings
  var statesString = require( 'string!STATES_OF_MATTER/states' );

  /**
   * @constructor
   */
  function StatesScreen() {

    var options = {
      name: statesString,
      backgroundColorProperty: SOMColorProfile.backgroundProperty,
      homeScreenIcon: new StatesIcon( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE ),
      showUnselectedHomeScreenIconFrame: true,
      maxDT: SOMConstants.MAX_DT
    };

    Screen.call( this,
      function() { return new MultipleParticleModel(); },
      function( model ) { return new StatesScreenView( model ); },
      options
    );
  }

  statesOfMatter.register( 'StatesScreen', StatesScreen );

  return inherit( Screen, StatesScreen );
} );