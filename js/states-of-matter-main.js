// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var SolidLiquidGasScreen = require( 'STATES_OF_MATTER/solid-liquid-gas/SolidLiquidGasScreen' );
  var PhaseChangesScreen = require( 'STATES_OF_MATTER/phase-changes/PhaseChangesScreen' );
  var AtomicInteractionsScreen = require( 'STATES_OF_MATTER/atomic-interactions/AtomicInteractionsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var GlobalOptionsNode = require( 'STATES_OF_MATTER/common/view/GlobalOptionsNode' );
  var Property = require( 'AXON/Property' );

  // strings
  var simTitle = require( 'string!STATES_OF_MATTER/states-of-matter.name' );
  var interactionString = require( 'string!STATES_OF_MATTER/interaction' );

  var colorsProperty = new Property( false );

  var simOptions = {
    credits: {
      leadDesign: 'Paul Beale, Sarah McKagan, Emily Moore, Noah Podolefsky, Amy Rouinfar',
      softwareDevelopment: 'John Blanco',
      team: 'Wendy Adams, Jack Barbera, Kelly Lancaster, Kathy Perkins',
      qualityAssurance: 'Steele Dalton',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team\nto convert this simulation to HTML5.'
    }, optionsNode: new GlobalOptionsNode( colorsProperty )
  };

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [
        new SolidLiquidGasScreen( colorsProperty ),
      new PhaseChangesScreen( colorsProperty, true ),
      new AtomicInteractionsScreen( colorsProperty, false, interactionString )
      ], simOptions );
    sim.start();
  } );
} );