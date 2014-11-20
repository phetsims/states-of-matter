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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var phaseChangesString = require( 'string!STATES_OF_MATTER/phase-changes' );

  /**
   * @constructor
   */
  function PhaseChangesScreen() {
    Screen.call( this, phaseChangesString, new Rectangle( 0, 0, 50, 50 ),
      function() { return new MultipleParticleModel(); },
      function( model ) { return new PhaseChangesScreenView( model ); },
      { backgroundColor: 'black', navigationBarIcon: new Rectangle( 0, 0, 50, 50 ) }
    );
  }

  return inherit( Screen, PhaseChangesScreen );
} );