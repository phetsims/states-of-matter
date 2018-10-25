// Copyright 2017, University of Colorado Boulder

/**
 * combination of Play/Pause and step buttons
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );

  // constants
  var TOUCH_AREA_DILATION = 4;
  var STROKE = 'black';
  var FILL = '#005566';
  var PAUSE_SIZE_INCREASE_FACTOR = 1.25;

  /**
   * @param {Property.<boolean>} playingProperty
   * @param {function} stepFunction
   * @param {Object} options
   * @constructor
   */
  function SOMPlayPauseStepControl( playingProperty, stepFunction, options ) {

    Node.call( this );

    var playPauseButton = new PlayPauseButton( playingProperty, {
      radius: 18,
      stroke: STROKE,
      fill: FILL,
      touchAreaDilation: TOUCH_AREA_DILATION
    } );
    this.addChild( playPauseButton );

    var stepButton = new StepForwardButton( {
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

    // Blow up the play/pause button slightly when paused.  The PhET convention is to do this for sims where interaction
    // does NOT unpause the sim, which is true for all usages in this sim.
    playingProperty.lazyLink( function( isPlaying ) {
      playPauseButton.scale( isPlaying ? ( 1 / PAUSE_SIZE_INCREASE_FACTOR ) : PAUSE_SIZE_INCREASE_FACTOR );
    } );

    this.mutate( options );
  }

  statesOfMatter.register( 'SOMPlayPauseStepControl', SOMPlayPauseStepControl );

  return inherit( Node, SOMPlayPauseStepControl );
} );