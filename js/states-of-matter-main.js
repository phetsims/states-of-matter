// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomicInteractionsScreen = require( 'STATES_OF_MATTER/atomic-interactions/AtomicInteractionsScreen' );
  var GlobalOptionsNode = require( 'STATES_OF_MATTER/common/view/GlobalOptionsNode' );
  var PhaseChangesScreen = require( 'STATES_OF_MATTER/phase-changes/PhaseChangesScreen' );
  var Property = require( 'AXON/Property' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var StatesScreen = require( 'STATES_OF_MATTER/states/StatesScreen' );

  // strings
  var interactionString = require( 'string!STATES_OF_MATTER/interaction' );
  var statesOfMatterTitleString = require( 'string!STATES_OF_MATTER/states-of-matter.title' );

  // property that controls projector mode, initial value can be set via a query parameter
  var projectorModeProperty = new Property( phet.chipper.queryParameters.colorProfile === 'projector' );

  var simOptions = {
    credits: {
      leadDesign: 'Paul Beale, Yuen-ying Carpenter, Sarah McKagan, Emily Moore, Noah Podolefsky, Amy Rouinfar',
      softwareDevelopment: 'John Blanco, Aaron Davis, Aadish Gupta',
      team: 'Wendy Adams, Jack Barbera, Amy Hanson, Kelly Lancaster, Ariel Paul, Kathy Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Oliver Orejola, ' +
                        'Benjamin Roberts, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team to convert this simulation to HTML5.'
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