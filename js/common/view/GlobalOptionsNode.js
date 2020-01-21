// Copyright 2015-2019, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const OptionsDialog = require( 'JOIST/OptionsDialog' );
  const ProjectorModeCheckbox = require( 'JOIST/ProjectorModeCheckbox' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const VBox = require( 'SCENERY/nodes/VBox' );

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

  return inherit( VBox, GlobalOptionsNode );
} );