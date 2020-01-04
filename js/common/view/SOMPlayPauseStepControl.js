// Copyright 2017-2019, University of Colorado Boulder

/**
 * combination of Play/Pause and step buttons
 */
define( require => {
  'use strict';

  // modules
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const merge = require( 'PHET_CORE/merge' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const TimeControlNode = require( 'SCENERY_PHET/TimeControlNode' );

  // constants
  const TOUCH_AREA_DILATION = 2.5;
  const STROKE = 'black';
  const FILL = '#005566';
  const PAUSE_SIZE_INCREASE_FACTOR = 1.25;

  class SOMPlayPauseStepControl extends TimeControlNode {

    /**
     * @param {Property.<boolean>} playingProperty
     * @param {function} stepFunction
     * @param {Object} options
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

  return statesOfMatter.register( 'SOMPlayPauseStepControl', SOMPlayPauseStepControl );
} );
