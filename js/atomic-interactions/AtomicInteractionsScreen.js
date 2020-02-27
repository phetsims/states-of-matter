// Copyright 2015-2020, University of Colorado Boulder

/**
 * The 'Atomic Interaction' screen. Conforms to the contract specified in joist/Screen.
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import SOMConstants from '../common/SOMConstants.js';
import SOMColorProfile from '../common/view/SOMColorProfile.js';
import statesOfMatter from '../statesOfMatter.js';
import AtomicInteractionsIcon from './AtomicInteractionsIcon.js';
import DualAtomModel from './model/DualAtomModel.js';
import AtomicInteractionsScreenView from './view/AtomicInteractionsScreenView.js';

/**
 * @param {boolean} enableHeterogeneousMolecules
 * @param {string} screenTitle
 * @param {Tandem} tandem
 * @constructor
 */
function AtomicInteractionsScreen( enableHeterogeneousMolecules, screenTitle, tandem ) {

  const options = {
    name: screenTitle,
    backgroundColorProperty: SOMColorProfile.backgroundProperty,
    homeScreenIcon: new AtomicInteractionsIcon( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE ),
    showUnselectedHomeScreenIconFrame: true,
    maxDT: SOMConstants.MAX_DT,
    tandem: tandem
  };

  Screen.call( this,
    function() { return new DualAtomModel( tandem.createTandem( 'model' ) ); },
    function( model ) {
      return new AtomicInteractionsScreenView( model, enableHeterogeneousMolecules, tandem.createTandem( 'view' ) );
    },
    options
  );
}

statesOfMatter.register( 'AtomicInteractionsScreen', AtomicInteractionsScreen );

inherit( Screen, AtomicInteractionsScreen );
export default AtomicInteractionsScreen;