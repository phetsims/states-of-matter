// Copyright 2015-2023, University of Colorado Boulder

/**
 * The 'Atomic Interaction' screen. Conforms to the contract specified in joist/Screen.
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import SOMConstants from '../common/SOMConstants.js';
import SOMColors from '../common/view/SOMColors.js';
import statesOfMatter from '../statesOfMatter.js';
import AtomicInteractionsIcon from './AtomicInteractionsIcon.js';
import DualAtomModel from './model/DualAtomModel.js';
import AtomicInteractionsScreenView from './view/AtomicInteractionsScreenView.js';

class AtomicInteractionsScreen extends Screen {

  /**
   * @param {boolean} enableHeterogeneousMolecules
   * @param {string} screenTitle
   * @param {Tandem} tandem
   */
  constructor( enableHeterogeneousMolecules, screenTitle, tandem ) {

    const options = {
      name: screenTitle,
      backgroundColorProperty: SOMColors.backgroundProperty,
      homeScreenIcon: new AtomicInteractionsIcon(),
      navigationBarIcon: new AtomicInteractionsIcon( {
        size: Screen.MINIMUM_NAVBAR_ICON_SIZE,
        fill: SOMColors.navigationBarIconBackgroundProperty
      } ),
      showUnselectedHomeScreenIconFrame: true,
      maxDT: SOMConstants.MAX_DT,
      tandem: tandem
    };

    super(
      () => new DualAtomModel( tandem.createTandem( 'model' ), enableHeterogeneousMolecules ),
      model => new AtomicInteractionsScreenView( model, enableHeterogeneousMolecules, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

statesOfMatter.register( 'AtomicInteractionsScreen', AtomicInteractionsScreen );
export default AtomicInteractionsScreen;
