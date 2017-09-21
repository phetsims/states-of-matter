// Copyright 2015-2017, University of Colorado Boulder

/**
 * Arrow node for attractive, repulsive, and total forces.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Vector2 = require( 'DOT/Vector2' );

  /*
   * @param {number} tailX - arrowNode tail X position
   * @param {number} tailY - arrowNode tail Y position
   * @param {number} tipX - arrowNode tip X position
   * @param {number} tipY - arrowNode tip Y position
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function DimensionalArrowNode( tailX, tailY, tipX, tipY, options ) {

    // default options
    options = _.extend( {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 5,
      doubleHead: false, // true puts heads on both ends of the arrow, false puts a head at the tip
      fill: 'black',
      stroke: 'black',
      lineWidth: 1
    }, options );

    // @private arrowNode tip and tail locations
    this.tailLocation = new Vector2( 0, 0 );
    this.tipLocation = new Vector2( 0, 0 );

    // things you're likely to mess up, add more as needed
    assert && assert( options.headWidth > options.tailWidth );

    Path.call( this, new ArrowShape( tailX, tailY, tipX, tipY, options ), options );
    this.options = options;
  }

  statesOfMatter.register( 'DimensionalArrowNode', DimensionalArrowNode );

  return inherit( Path, DimensionalArrowNode, {

    /**
     * @param {number} tailX - tail X position
     * @param {number} tailY - tail Y position
     * @param {number} tipX - tip X position
     * @param {number} tipY - tip Y position
     * @public
     */
    setTailAndTip: function( tailX, tailY, tipX, tipY ) {
      this.tailLocation.setXY( tailX, tailY );
      this.tipLocation.setXY( tipX, tipY );
      var tempHeadHeight;
      var tempHeadWidth;
      var tempTailWidth;
      if ( this.tailLocation.distance( this.tipLocation ) !== 0 ) {

        tempHeadHeight = this.options.headHeight;
        tempHeadWidth = this.options.headWidth;
        tempTailWidth = this.options.tailWidth;
        var length = this.tipLocation.distance( this.tailLocation );

        var fractionalHeadHeight = 0.5;
        if ( length < this.options.headHeight / fractionalHeadHeight ) {
          tempHeadHeight = length * fractionalHeadHeight;

          tempTailWidth = this.options.tailWidth * tempHeadHeight / this.options.headHeight;
          tempHeadWidth = this.options.headWidth * tempHeadHeight / this.options.headHeight;

        }
      }
      this.shape = new ArrowShape( tailX, tailY, tipX, tipY, {
        headHeight: tempHeadHeight,
        headWidth: tempHeadWidth,
        tailWidth: tempTailWidth
      } );
    }
  } );
} );
