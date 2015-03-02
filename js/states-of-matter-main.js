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
  var AtomicInteractionsScreen = require( 'ATOMIC_INTERACTIONS/atomic-interactions/AtomicInteractionsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var GlobalOptionsNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/GlobalOptionsNode' );
  var Property = require( 'AXON/Property' );

  // strings
  var simTitle = require( 'string!STATES_OF_MATTER/statesOfMatter' );
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

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var isHeterogeneousMoleculeControlPanel = false;
    var sim = new Sim( simTitle, [ new SolidLiquidGasScreen( colorsProperty ), new PhaseChangesScreen( true, colorsProperty ),
      new AtomicInteractionsScreen( isHeterogeneousMoleculeControlPanel,
        interactionString, colorsProperty ) ], simOptions );
    sim.start();
  } );
} );