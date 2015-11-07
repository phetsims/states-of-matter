// Copyright 2015, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'States' screen.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // images
  var gasIconImage = require( 'mipmap!STATES_OF_MATTER/gas-icon.png,level=5' );
  var liquidIconImage = require( 'mipmap!STATES_OF_MATTER/liquid-icon.png,level=5' );
  var solidIconImage = require( 'mipmap!STATES_OF_MATTER/solid-icon.png,level=5' );

  /**
   * {Dimension2} size
   * @constructor
   */
  function StatesIcon( size ) {

    Node.call( this );

    // background
    this.addChild( new Rectangle( 0, 0, size.width, size.height, 0, 0, {
      fill: 'black'
    } ) );

    // icons packed into a nice little box
    var iconsBox = new HBox( {
      children: [ new Image( solidIconImage ), new Image( liquidIconImage ), new Image( gasIconImage ) ],
      spacing: 20 // empirically determined
    } );

    // scale to take up most, but not all, of the background width
    iconsBox.scale( ( size.width * 0.9 ) / iconsBox.width );

    // center over the background rectangle
    iconsBox.center = this.center;

    this.addChild( iconsBox );
  }

  return inherit( Node, StatesIcon );
} );
