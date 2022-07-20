// Copyright 2015-2022, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'States' screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import { Color, HBox, Image, Rectangle } from '../../../scenery/js/imports.js';
import gasIcon_png from '../../mipmaps/gasIcon_png.js';
import liquidIcon_png from '../../mipmaps/liquidIcon_png.js';
import solidIcon_png from '../../mipmaps/solidIcon_png.js';
import statesOfMatter from '../statesOfMatter.js';

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
      children: [ new Image( solidIcon_png ), new Image( liquidIcon_png ), new Image( gasIcon_png ) ],
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