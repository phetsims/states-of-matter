// Copyright 2014-2023, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */

import PreferencesModel from '../../joist/js/preferences/PreferencesModel.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import AtomicInteractionsScreen from './atomic-interactions/AtomicInteractionsScreen.js';
import PhaseChangesScreen from './phase-changes/PhaseChangesScreen.js';
import StatesScreen from './states/StatesScreen.js';
import StatesOfMatterStrings from './StatesOfMatterStrings.js';

const interactionStringProperty = StatesOfMatterStrings.interactionStringProperty;
const statesOfMatterTitleStringProperty = StatesOfMatterStrings[ 'states-of-matter' ].titleStringProperty;

simLauncher.launch( () => {

  const simOptions = {
    credits: {
      leadDesign: 'Paul Beale, Yuen-ying Carpenter, Sarah McKagan, Emily B. Moore, Noah Podolefsky,<br>Amy Rouinfar',
      softwareDevelopment: 'John Blanco, Aaron Davis, Aadish Gupta',
      team: 'Wendy Adams, Jack Barbera, Amy Hanson, Kelly Lancaster, Ariel Paul, Kathy Perkins,<br>Carl Wieman',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Liam Mulhall,<br>' +
                        'Oliver Orejola, Laura Rea, Benjamin Roberts, Jacob Romero, Kathryn Woessner, Bryan Yoelin',
      thanks: 'Thanks to Actual Concepts for working with the PhET development team to convert this simulation to HTML5.'
    },

    preferencesModel: new PreferencesModel( {
      visualOptions: {
        supportsProjectorMode: true
      }
    } ),

    // phet-io options
    phetioDesigned: true
  };

  const sim = new Sim( statesOfMatterTitleStringProperty, [
    new StatesScreen( Tandem.ROOT.createTandem( 'statesScreen' ) ),
    new PhaseChangesScreen( true, Tandem.ROOT.createTandem( 'phaseChangesScreen' ) ),
    new AtomicInteractionsScreen( false, interactionStringProperty, Tandem.ROOT.createTandem( 'interactionScreen' ) )
  ], simOptions );
  sim.start();
} );