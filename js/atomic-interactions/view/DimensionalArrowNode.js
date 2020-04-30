// Copyright 2015-2020, University of Colorado Boulder

/**
 * Arrow node for attractive, repulsive, and total forces.
 *
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import statesOfMatter from '../../statesOfMatter.js';

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
  options = merge( {
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

inherit( Path, DimensionalArrowNode, {

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
    let tempHeadHeight;
    let tempHeadWidth;
    let tempTailWidth;
    if ( this.tailLocation.distance( this.tipLocation ) !== 0 ) {

      tempHeadHeight = this.options.headHeight;
      tempHeadWidth = this.options.headWidth;
      tempTailWidth = this.options.tailWidth;
      const length = this.tipLocation.distance( this.tailLocation );

      const fractionalHeadHeight = 0.5;
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

export default DimensionalArrowNode;