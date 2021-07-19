// Copyright 2015-2021, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import OptionsDialog from '../../../../joist/js/OptionsDialog.js';
import ProjectorModeCheckbox from '../../../../joist/js/ProjectorModeCheckbox.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import statesOfMatter from '../../statesOfMatter.js';

class GlobalOptionsNode extends VBox {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // add support for setting projector mode
    const projectorModeCheckbox = new ProjectorModeCheckbox( {
      tandem: tandem.createTandem( 'projectorModeCheckbox' )
    } );

    // VBox is used to make it easy to add additional options
    super( {
      children: [ projectorModeCheckbox ],
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } );

    // @private
    this.disposeGlobalOptionsNode = () => {
      projectorModeCheckbox.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeGlobalOptionsNode();
    super.dispose();
  }
}

statesOfMatter.register( 'GlobalOptionsNode', GlobalOptionsNode );
export default GlobalOptionsNode;