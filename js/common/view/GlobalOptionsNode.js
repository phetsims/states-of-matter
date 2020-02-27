// Copyright 2015-2020, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import OptionsDialog from '../../../../joist/js/OptionsDialog.js';
import ProjectorModeCheckbox from '../../../../joist/js/ProjectorModeCheckbox.js';
import inherit from '../../../../phet-core/js/inherit.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import statesOfMatter from '../../statesOfMatter.js';
import SOMColorProfile from './SOMColorProfile.js';

/**
 * @param {Tandem} tandem
 * @constructor
 */
function GlobalOptionsNode( tandem ) {

  // add support for setting projector mode
  const projectorModeCheckbox = new ProjectorModeCheckbox( SOMColorProfile, {
    tandem: tandem.createTandem( 'projectorModeCheckbox' )
  } );

  // VBox is used to make it easy to add additional options
  VBox.call( this, {
    children: [ projectorModeCheckbox ],
    spacing: OptionsDialog.DEFAULT_SPACING,
    align: 'left'
  } );
}

statesOfMatter.register( 'GlobalOptionsNode', GlobalOptionsNode );

inherit( VBox, GlobalOptionsNode );
export default GlobalOptionsNode;