// Copyright 2015-2019, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'States' screen.
 *
 * @author John Blanco
 */

import inherit from '../../../phet-core/js/inherit.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import gasIconImage from '../../mipmaps/gas-icon_png.js';
import liquidIconImage from '../../mipmaps/liquid-icon_png.js';
import solidIconImage from '../../mipmaps/solid-icon_png.js';
import statesOfMatter from '../statesOfMatter.js';

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
  const iconsBox = new HBox( {
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

inherit( Node, StatesIcon );
export default StatesIcon;