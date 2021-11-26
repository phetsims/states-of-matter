// Copyright 2015-2021, University of Colorado Boulder

/**
 * Arrow node for attractive, repulsive, and total forces.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import { Path } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';

class DimensionalArrowNode extends Path {

  /**
   * @param {number} tailX - arrowNode tail X position
   * @param {number} tailY - arrowNode tail Y position
   * @param {number} tipX - arrowNode tip X position
   * @param {number} tipY - arrowNode tip Y position
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( tailX, tailY, tipX, tipY, options ) {

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

    // things you're likely to mess up, add more as needed
    assert && assert( options.headWidth > options.tailWidth );

    super( new ArrowShape( tailX, tailY, tipX, tipY, options ), options );

    // @private arrowNode tip and tail positions, options
    this.tailPosition = new Vector2( 0, 0 );
    this.tipPosition = new Vector2( 0, 0 );
    this.options = options;
  }

  /**
   * @param {number} tailX - tail X position
   * @param {number} tailY - tail Y position
   * @param {number} tipX - tip X position
   * @param {number} tipY - tip Y position
   * @public
   */
  setTailAndTip( tailX, tailY, tipX, tipY ) {
    this.tailPosition.setXY( tailX, tailY );
    this.tipPosition.setXY( tipX, tipY );
    let tempHeadHeight;
    let tempHeadWidth;
    let tempTailWidth;
    if ( this.tailPosition.distance( this.tipPosition ) !== 0 ) {

      tempHeadHeight = this.options.headHeight;
      tempHeadWidth = this.options.headWidth;
      tempTailWidth = this.options.tailWidth;
      const length = this.tipPosition.distance( this.tailPosition );

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
}

statesOfMatter.register( 'DimensionalArrowNode', DimensionalArrowNode );
export default DimensionalArrowNode;
