// Copyright 2015-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * Programmatically generated icon for the 'States' screen.
 *
 * @author John Blanco
 */

import Screen from '../../../joist/js/Screen.js';
import ScreenIcon, { ScreenIconOptions } from '../../../joist/js/ScreenIcon.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../scenery/js/util/Color.js';
import gasIcon_png from '../../mipmaps/gasIcon_png.js';
import liquidIcon_png from '../../mipmaps/liquidIcon_png.js';
import solidIcon_png from '../../mipmaps/solidIcon_png.js';
import statesOfMatter from '../statesOfMatter.js';

type SelfOptions = EmptySelfOptions;

type StatesIconOptions = SelfOptions & ScreenIconOptions;

class StatesIcon extends ScreenIcon {

  public constructor( providedOptions?: StatesIconOptions ) {

    const options = optionize<StatesIconOptions, SelfOptions, ScreenIconOptions>()( {
      size: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE,
      maxIconWidthProportion: 0.9,
      maxIconHeightProportion: 0.9,
      fill: Color.BLACK
    }, providedOptions );

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