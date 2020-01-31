// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const AtomicInteractionsScreen = require( 'STATES_OF_MATTER/atomic-interactions/AtomicInteractionsScreen' );
  const GlobalOptionsNode = require( 'STATES_OF_MATTER/common/view/GlobalOptionsNode' );
  const PhaseChangesScreen = require( 'STATES_OF_MATTER/phase-changes/PhaseChangesScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const StatesScreen = require( 'STATES_OF_MATTER/states/StatesScreen' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const interactionString = require( 'string!STATES_OF_MATTER/interaction' );
  const statesOfMatterTitleString = require( 'string!STATES_OF_MATTER/states-of-matter.title' );

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

    // Creates content for the Options dialog
    createOptionsDialogContent: () => globalOptionsNode
  };

  SimLauncher.launch( function() {
    const sim = new Sim( statesOfMatterTitleString, [
      new StatesScreen( Tandem.ROOT.createTandem( 'statesScreen' ) ),
      new PhaseChangesScreen( true, Tandem.ROOT.createTandem( 'phaseChangesScreen' ) ),
      new AtomicInteractionsScreen( false, interactionString, Tandem.ROOT.createTandem( 'atomicInteractionsScreen' ) )
      ], simOptions );
    sim.start();
  } );
} );