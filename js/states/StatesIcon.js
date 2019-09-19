// Copyright 2015-2017, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'States' screen.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // images
  const gasIconImage = require( 'mipmap!STATES_OF_MATTER/gas-icon.png,level=5' );
  const liquidIconImage = require( 'mipmap!STATES_OF_MATTER/liquid-icon.png,level=5' );
  const solidIconImage = require( 'mipmap!STATES_OF_MATTER/solid-icon.png,level=5' );

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

  statesOfMatter.register( 'StatesIcon', StatesIcon );

  return inherit( Node, StatesIcon );
} );
