// Copyright 2020-2022, University of Colorado Boulder

/**
 * slider with a title over the top
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, Text, VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const DEFAULT_TITLE_FONT = new PhetFont( 12 );

class TitledSlider extends VBox {

  /**
   * @param {NumberProperty} valueProperty - value property that will be controlled by the slider
   * @param {Range} range - range for the value property
   * @param {string} titleText - the text string that will be used to create the title
   * @param {Tandem} tandem
   * @param [options]
   */
  constructor( valueProperty, range, titleText, tandem, options ) {

    options = merge( {
      spacing: 5,
      align: 'center',
      tandem: tandem,
      titleOptions: {
        font: DEFAULT_TITLE_FONT,
        fill: Color.BLACK,
        tandem: tandem.createTandem( 'titleText' )
      },
      sliderOptions: {
        trackSize: new Dimension2( 140, 5 ), // empirically determined for this sim
        tandem: tandem.createTandem( 'slider' )
      }
    }, options );

    const title = new Text( titleText, options.titleOptions );
    const slider = new HSlider( valueProperty, range, options.sliderOptions );

    // VBox is used to make it easy to add additional options
    super( merge( options, {
      children: [ title, slider ]
    } ) );

    // @public (read-only) - accessible so that tick marks and titles can be manipulated after creation
    this.slider = slider;
  }
}

statesOfMatter.register( 'TitledSlider', TitledSlider );
export default TitledSlider;