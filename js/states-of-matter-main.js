// Copyright 2014-2015, University of Colorado Boulder

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
      leadDesign: 'Paul Beale, Yuen-ying Carpenter, Sarah McKagan, Emily Moore,\nNoah Podolefsky, Amy Rouinfar',
      softwareDevelopment: 'John Blanco, Aadish Gupta',
      team: 'Wendy Adams, Jack Barbera, Kelly Lancaster, Arial Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Oliver Orejola, Benjamin Roberts,\nBryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team\nto convert this simulation to HTML5.'
    },
    optionsNode: new GlobalOptionsNode( projectorModeProperty ),
    showSmallHomeScreenIconFrame: true
  };

  SimLauncher.launch( function() {
    var sim = new Sim( statesOfMatterTitleString, [
      new StatesScreen( ),
      new PhaseChangesScreen( true ),
      new AtomicInteractionsScreen( false, interactionString )
      ], simOptions );
    sim.start();
  } );
} );