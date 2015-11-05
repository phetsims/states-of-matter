// Copyright 2002-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var StatesScreen = require( 'STATES_OF_MATTER/states/StatesScreen' );
  var PhaseChangesScreen = require( 'STATES_OF_MATTER/phase-changes/PhaseChangesScreen' );
  var AtomicInteractionsScreen = require( 'STATES_OF_MATTER/atomic-interactions/AtomicInteractionsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var GlobalOptionsNode = require( 'STATES_OF_MATTER/common/view/GlobalOptionsNode' );
  var Property = require( 'AXON/Property' );

  // strings
  var statesOfMatterTitleString = require( 'string!STATES_OF_MATTER/states-of-matter.title' );
  var interactionString = require( 'string!STATES_OF_MATTER/interaction' );

  var projectorModeProperty = new Property( false );

  var simOptions = {
    credits: {
      leadDesign: 'Paul Beale, Sarah McKagan, Emily Moore, Noah Podolefsky, Amy Rouinfar',
      softwareDevelopment: 'John Blanco',
      team: 'Wendy Adams, Jack Barbera, Kelly Lancaster, Kathy Perkins',
      qualityAssurance: 'Steele Dalton',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team\nto convert this simulation to HTML5.'
    },
    optionsNode: new GlobalOptionsNode( projectorModeProperty ),
    showSmallHomeScreenIconFrame: true
  };

  SimLauncher.launch( function() {
    var sim = new Sim( statesOfMatterTitleString, [
      new StatesScreen( projectorModeProperty ),
      new PhaseChangesScreen( projectorModeProperty, true ),
      new AtomicInteractionsScreen( projectorModeProperty, false, interactionString )
      ], simOptions );
    sim.start();
  } );
} );