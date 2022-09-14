// Copyright 2014-2022, University of Colorado Boulder

/**
 * The 'Solid Liquid Gas' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import MultipleParticleModel from '../common/model/MultipleParticleModel.js';
import SOMConstants from '../common/SOMConstants.js';
import SubstanceType from '../common/SubstanceType.js';
import SOMColors from '../common/view/SOMColors.js';
import statesOfMatter from '../statesOfMatter.js';
import StatesOfMatterStrings from '../StatesOfMatterStrings.js';
import StatesIcon from './StatesIcon.js';
import StatesScreenView from './view/StatesScreenView.js';

class StatesScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: StatesOfMatterStrings.statesStringProperty,
      backgroundColorProperty: SOMColors.backgroundProperty,
      homeScreenIcon: new StatesIcon(),
      navigationBarIcon: new StatesIcon( {
        size: Screen.MINIMUM_NAVBAR_ICON_SIZE,
        fill: SOMColors.navigationBarIconBackgroundProperty
      } ),
      showUnselectedHomeScreenIconFrame: true,
      maxDT: SOMConstants.MAX_DT,
      tandem: tandem
    };

    // remove the adjustable atom from the list of substances that are supported in this screen
    const validSubstances = SubstanceType.VALUES.filter( substance => substance !== SubstanceType.ADJUSTABLE_ATOM );

    super(
      () => {
        return new MultipleParticleModel( tandem.createTandem( 'model' ), { validSubstances: validSubstances } );
      },
      model => new StatesScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

statesOfMatter.register( 'StatesScreen', StatesScreen );
export default StatesScreen;