// Copyright 2014-2020, University of Colorado Boulder

/**
 * The 'Solid Liquid Gas' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import MultipleParticleModel from '../common/model/MultipleParticleModel.js';
import SOMConstants from '../common/SOMConstants.js';
import SubstanceType from '../common/SubstanceType.js';
import SOMColorProfile from '../common/view/SOMColorProfile.js';
import statesOfMatterStrings from '../states-of-matter-strings.js';
import statesOfMatter from '../statesOfMatter.js';
import StatesIcon from './StatesIcon.js';
import StatesScreenView from './view/StatesScreenView.js';

const statesString = statesOfMatterStrings.states;

/**
 * @param {Tandem} tandem
 * @constructor
 */
function StatesScreen( tandem ) {

  const options = {
    name: statesString,
    backgroundColorProperty: SOMColorProfile.backgroundProperty,
    homeScreenIcon: new StatesIcon( Screen.MINIMUM_HOME_SCREEN_ICON_SIZE ),
    showUnselectedHomeScreenIconFrame: true,
    maxDT: SOMConstants.MAX_DT,
    tandem: tandem
  };

  // remove the adjustable atom from the list of substances that are supported in this screen
  const validSubstances = SubstanceType.VALUES.filter( substance => substance !== SubstanceType.ADJUSTABLE_ATOM );

  Screen.call( this,
    function() {
      return new MultipleParticleModel( tandem.createTandem( 'model' ), { validSubstances: validSubstances } );
    },
    function( model ) { return new StatesScreenView( model, tandem.createTandem( 'view' ) ); },
    options
  );
}

statesOfMatter.register( 'StatesScreen', StatesScreen );

inherit( Screen, StatesScreen );
export default StatesScreen;