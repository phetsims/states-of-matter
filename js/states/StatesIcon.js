// Copyright 2015-2021, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'States' screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../scenery/js/util/Color.js';
import gasIconImage from '../../mipmaps/gas-icon_png.js';
import liquidIconImage from '../../mipmaps/liquid-icon_png.js';
import solidIconImage from '../../mipmaps/solid-icon_png.js';
import statesOfMatter from '../statesOfMatter.js';
import merge from '../../../phet-core/js/merge.js';

class StatesIcon extends ScreenIcon {

  /**
   * {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      size: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE,
      maxIconWidthProportion: 0.9,
      maxIconHeightProportion: 0.9,
      fill: Color.BLACK
    }, options );

    // icons packed into a nice little box
    const iconsBox = new HBox( {
      children: [ new Image( solidIconImage ), new Image( liquidIconImage ), new Image( gasIconImage ) ],
      spacing: 20, // empirically determined
      maxWidth: options.size.width,
      centerX: options.size.width / 2,
      centerY: options.size.height / 2
    } );

    const iconRootNode = new Rectangle( 0, 0, options.size.width, options.size.height, 0, 0, {
      fill: Color.BLACK,
      children: [ iconsBox ]
    } );

    super( iconRootNode, options );
  }
}

statesOfMatter.register( 'StatesIcon', StatesIcon );
export default StatesIcon;