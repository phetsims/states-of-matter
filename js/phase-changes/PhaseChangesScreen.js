// Copyright 2014-2020, University of Colorado Boulder

/**
 * The 'Phase Changes' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Screen from '../../../joist/js/Screen.js';
import inherit from '../../../phet-core/js/inherit.js';
import SOMConstants from '../common/SOMConstants.js';
import SOMColorProfile from '../common/view/SOMColorProfile.js';
import statesOfMatterStrings from '../statesOfMatterStrings.js';
import statesOfMatter from '../statesOfMatter.js';
import PhaseChangesIcon from './PhaseChangesIcon.js';
import PhaseChangesModel from './PhaseChangesModel.js';
import PhaseChangesScreenView from './view/PhaseChangesScreenView.js';

// constants
const phaseChangesString = statesOfMatterStrings.phaseChanges;

/**
 * @param {boolean} isInteractionDiagramEnabled
 * @param {Tandem} tandem
 * @constructor
 */
function PhaseChangesScreen( isInteractionDiagramEnabled, tandem ) {

  const options = {
    name: phaseChangesString,
    backgroundColorProperty: SOMColorProfile.backgroundProperty,
    homeScreenIcon: new PhaseChangesIcon(),
    navigationBarIcon: new PhaseChangesIcon( {
      size: Screen.MINIMUM_NAVBAR_ICON_SIZE,
      fill: SOMColorProfile.navigationBarIconBackgroundProperty
    } ),
    showUnselectedHomeScreenIconFrame: true,
    maxDT: SOMConstants.MAX_DT,
    tandem: tandem
  };

  Screen.call( this,
    function() { return new PhaseChangesModel( tandem.createTandem( 'model' ) ); },
    function( model ) {
      return new PhaseChangesScreenView( model, isInteractionDiagramEnabled, tandem.createTandem( 'view' ) );
    },
    options
  );
}

statesOfMatter.register( 'PhaseChangesScreen', PhaseChangesScreen );

inherit( Screen, PhaseChangesScreen );
export default PhaseChangesScreen;