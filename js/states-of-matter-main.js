// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import AtomicInteractionsScreen from './atomic-interactions/AtomicInteractionsScreen.js';
import GlobalOptionsNode from './common/view/GlobalOptionsNode.js';
import PhaseChangesScreen from './phase-changes/PhaseChangesScreen.js';
import statesOfMatterStrings from './statesOfMatterStrings.js';
import StatesScreen from './states/StatesScreen.js';

const interactionString = statesOfMatterStrings.interaction;
const statesOfMatterTitleString = statesOfMatterStrings[ 'states-of-matter' ].title;

simLauncher.launch( function() {

  // Eagerly create GlobalOptionsNode so it works smoothly with PhET-iO
  const globalOptionsNode = new GlobalOptionsNode( Tandem.ROOT.createTandem( 'global' ).createTandem( 'view' ).createTandem( 'globalOptionsNode' ) );

  const simOptions = {
    credits: {
      leadDesign: 'Paul Beale, Yuen-ying Carpenter, Sarah McKagan, Emily B. Moore, Noah Podolefsky,<br>Amy Rouinfar',
      softwareDevelopment: 'John Blanco, Aaron Davis, Aadish Gupta',
      team: 'Wendy Adams, Jack Barbera, Amy Hanson, Kelly Lancaster, Ariel Paul, Kathy Perkins,<br>Carl Wieman',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Liam Mulhall,<br>' +
                        'Oliver Orejola, Laura Rea, Benjamin Roberts, Jacob Romero, Kathryn Woessner, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team to convert this simulation to HTML5.'
    },

    // create content for the Options dialog
    createOptionsDialogContent: () => globalOptionsNode
  };

  const sim = new Sim( statesOfMatterTitleString, [
    new StatesScreen( Tandem.ROOT.createTandem( 'statesScreen' ) ),
    new PhaseChangesScreen( true, Tandem.ROOT.createTandem( 'phaseChangesScreen' ) ),
    new AtomicInteractionsScreen( false, interactionString, Tandem.ROOT.createTandem( 'interactionScreen' ) )
  ], simOptions );
  sim.start();
} );