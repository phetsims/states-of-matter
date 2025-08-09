// Copyright 2015-2025, University of Colorado Boulder

/**
 * Arrow node for attractive, repulsive, and total forces.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import Path, { PathOptions } from '../../../../scenery/js/nodes/Path.js';
import statesOfMatter from '../../statesOfMatter.js';

type SelfOptions = {
  headHeight?: number;
  headWidth?: number;
  tailWidth?: number;
  doubleHead?: boolean; // true puts heads on both ends of the arrow, false puts a head at the tip
};

type ResolvedSelfOptions = Required<SelfOptions>;

type DimensionalArrowNodeOptions = SelfOptions & PathOptions;

class DimensionalArrowNode extends Path {

  // arrowNode tail position
  private readonly tailPosition: Vector2;

  // arrowNode tip position
  private readonly tipPosition: Vector2;

  // options
  private options: ResolvedSelfOptions & PathOptions;

  /**
   * @param tailX - arrowNode tail X position
   * @param tailY - arrowNode tail Y position
   * @param tipX - arrowNode tip X position
   * @param tipY - arrowNode tip Y position
   * @param providedOptions - that can be passed on to the underlying node
   */
  public constructor( tailX: number, tailY: number, tipX: number, tipY: number, providedOptions?: DimensionalArrowNodeOptions ) {

    // default options
    const options = optionize<DimensionalArrowNodeOptions, SelfOptions, PathOptions>()( {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 5,
      doubleHead: false, // true puts heads on both ends of the arrow, false puts a head at the tip
      fill: 'black',
      stroke: 'black',
      lineWidth: 1
    }, providedOptions );

    // things you're likely to mess up, add more as needed
    assert && assert( options.headWidth > options.tailWidth );

    super( new ArrowShape( tailX, tailY, tipX, tipY, options ), options );

    this.tailPosition = new Vector2( 0, 0 );
    this.tipPosition = new Vector2( 0, 0 );
    this.options = options;
  }

  /**
   * @param tailX - tail X position
   * @param tailY - tail Y position
   * @param tipX - tip X position
   * @param tipY - tip Y position
   */
  public setTailAndTip( tailX: number, tailY: number, tipX: number, tipY: number ): void {
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