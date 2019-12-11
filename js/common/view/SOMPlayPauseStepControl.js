// Copyright 2017-2019, University of Colorado Boulder

/**
 * combination of Play/Pause and step buttons
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );

  // constants
  const TOUCH_AREA_DILATION = 2.5;
  const STROKE = 'black';
  const FILL = '#005566';
  const PAUSE_SIZE_INCREASE_FACTOR = 1.25;

  /**
   * @param {Property.<boolean>} playingProperty
   * @param {function} stepFunction
   * @param {Object} options
   * @constructor
   */
  function SOMPlayPauseStepControl( playingProperty, stepFunction, options ) {

    Node.call( this );

    const playPauseButton = new PlayPauseButton( playingProperty, {
      radius: 18,
      playButtonScaleFactor: PAUSE_SIZE_INCREASE_FACTOR,
      stroke: STROKE,
      fill: FILL,
      touchAreaDilation: TOUCH_AREA_DILATION
    } );
    this.addChild( playPauseButton );

    const stepButton = new StepForwardButton( {
      isPlayingProperty: playingProperty,
      listener: function() { stepFunction( SOMConstants.NOMINAL_TIME_STEP ); },
      radius: 12,
      stroke: STROKE,
      fill: FILL,
      touchAreaDilation: TOUCH_AREA_DILATION,
      y: playPauseButton.centerY,
      left: playPauseButton.right + 10
    } );
    this.addChild( stepButton );

    this.mutate( options );
  }

  statesOfMatter.register( 'SOMPlayPauseStepControl', SOMPlayPauseStepControl );

  return inherit( Node, SOMPlayPauseStepControl );
} );