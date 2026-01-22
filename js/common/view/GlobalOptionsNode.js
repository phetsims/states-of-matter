// Copyright 2015-2016, University of Colorado Boulder

/**
 * Global options shown in the "Options" dialog from the PhET Menu
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CheckBox = require( 'SUN/CheckBox' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColorProfile = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColorProfile' );

  // strings
  var projectorModeString = require( 'string!STATES_OF_MATTER/projectorMode' );

  /**
   *
   * @param { Property<boolean> } projectorModeProperty
   * @constructor
   */
  function GlobalOptionsNode( projectorModeProperty ) {
    var children = [];
    projectorModeProperty.link( function( projectorMode ) {
      if ( projectorMode ) {
        StatesOfMatterColorProfile.profileNameProperty.set( 'projector' );
      }
      else {
        StatesOfMatterColorProfile.profileNameProperty.set( 'default' );
      }
    } );

    children.push( new CheckBox( new Text( projectorModeString, { font: OptionsDialog.DEFAULT_FONT } ),
      projectorModeProperty, {} ) );

    VBox.call( this, _.extend( {
      children: children,
      spacing: OptionsDialog.DEFAULT_SPACING,
      align: 'left'
    } ) );
  }

  statesOfMatter.register( 'GlobalOptionsNode', GlobalOptionsNode );

  return inherit( VBox, GlobalOptionsNode );
} );