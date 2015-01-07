// Copyright (c) 2002 - 2014. University of Colorado Boulder

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
  var SolidLiquidGasScreenView = require( 'STATES_OF_MATTER/solid-liquid-gas/view/SolidLiquidGasScreenView' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var Image = require( 'SCENERY/nodes/Image' );

  // strings
  var statesString = require( 'string!STATES_OF_MATTER/states' );
  // images
  var statesScreenIcon = require( 'image!STATES_OF_MATTER/som-states-screen.png' );

  /**
   * @constructor
   */
  function SolidLiquidGasScreen() {
    Screen.call( this,
      statesString,
      new Image( statesScreenIcon ),
      function() { return new MultipleParticleModel(); },
      function( model ) { return new SolidLiquidGasScreenView( model ); },
      { backgroundColor: 'black' }
    );
  }

  return inherit( Screen, SolidLiquidGasScreen );
} );