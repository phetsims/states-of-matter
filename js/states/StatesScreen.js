// Copyright 2014-2015, University of Colorado Boulder

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
  var Screen = require( 'JOIST/Screen' );
  var StatesScreenView = require( 'STATES_OF_MATTER/states/view/StatesScreenView' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var StatesIcon = require( 'STATES_OF_MATTER/states/StatesIcon' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColors = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColors' );

  // strings
  var statesString = require( 'string!STATES_OF_MATTER/states' );

  /**
   * @param {Property<boolean>} projectorModeProperty - true for projector color scheme (white back ground), false for
   * regular black back ground
   * @constructor
   */
  function StatesScreen( projectorModeProperty ) {
    Screen.call( this,
      statesString,
      new StatesIcon( Screen.HOME_SCREEN_ICON_SIZE ),
      function() { return new MultipleParticleModel(); },
      function( model ) { return new StatesScreenView( model, projectorModeProperty ); },
      { backgroundColor: 'black' }
    );
    var screen = this;
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

  statesOfMatter.register( 'StatesScreen', StatesScreen );

  return inherit( Screen, StatesScreen );
} );