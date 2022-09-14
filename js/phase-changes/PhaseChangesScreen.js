// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Phase Changes' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import SOMConstants from '../common/SOMConstants.js';
import SOMColors from '../common/view/SOMColors.js';
import statesOfMatter from '../statesOfMatter.js';
import StatesOfMatterStrings from '../StatesOfMatterStrings.js';
import PhaseChangesIcon from './PhaseChangesIcon.js';
import PhaseChangesModel from './PhaseChangesModel.js';
import PhaseChangesScreenView from './view/PhaseChangesScreenView.js';

class PhaseChangesScreen extends Screen {

  /**
   * @param {boolean} isPotentialGraphEnabled
   * @param {Tandem} tandem
   */
  constructor( isPotentialGraphEnabled, tandem ) {

    const options = {
      name: StatesOfMatterStrings.phaseChangesStringProperty,
      backgroundColorProperty: SOMColors.backgroundProperty,
      homeScreenIcon: new PhaseChangesIcon(),
      navigationBarIcon: new PhaseChangesIcon( {
        size: Screen.MINIMUM_NAVBAR_ICON_SIZE,
        fill: SOMColors.navigationBarIconBackgroundProperty
      } ),
      showUnselectedHomeScreenIconFrame: true,
      maxDT: SOMConstants.MAX_DT,
      tandem: tandem
    };

    super(
      () => new PhaseChangesModel( tandem.createTandem( 'model' ) ),
      model => {
        return new PhaseChangesScreenView( model, isPotentialGraphEnabled, tandem.createTandem( 'view' ) );
      },
      options
    );
  }
}

statesOfMatter.register( 'PhaseChangesScreen', PhaseChangesScreen );
export default PhaseChangesScreen;