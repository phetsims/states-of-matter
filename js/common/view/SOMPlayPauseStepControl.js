// Copyright 2017-2020, University of Colorado Boulder

/**
 * combination of Play/Pause and step buttons
 */

import merge from '../../../../phet-core/js/merge.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';

// constants
const TOUCH_AREA_DILATION = 2.5;
const STROKE = 'black';
const FILL = '#005566';
const PAUSE_SIZE_INCREASE_FACTOR = 1.25;

class SOMPlayPauseStepControl extends TimeControlNode {

  /**
   * @param {Property.<boolean>} playingProperty
   * @param {function} stepFunction
   * @param {Object} [options]
   * @constructor
   */
  constructor( playingProperty, stepFunction, options ) {

    options = merge( {
      playPauseOptions: {
        radius: 18,
        scaleFactorWhenPaused: PAUSE_SIZE_INCREASE_FACTOR,
        stroke: STROKE,
        fill: FILL,
        touchAreaDilation: TOUCH_AREA_DILATION
      },
      stepForwardOptions: {
        listener: () => { stepFunction( SOMConstants.NOMINAL_TIME_STEP ); },
        radius: 12,
        stroke: STROKE,
        fill: FILL,
        touchAreaDilation: TOUCH_AREA_DILATION
      }
    }, options );

    super( playingProperty, options );
  }

}

statesOfMatter.register( 'SOMPlayPauseStepControl', SOMPlayPauseStepControl );
export default SOMPlayPauseStepControl;