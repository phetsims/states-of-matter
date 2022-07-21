// Copyright 2015-2022, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'Interaction' screen.
 *
 * @author John Blanco
 */

// modules
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import { Circle, Color, Node, RadialGradient, Rectangle } from '../../../scenery/js/imports.js';
import SOMConstants from '../common/SOMConstants.js';
import statesOfMatter from '../statesOfMatter.js';

// constants
const PARTICLE_COLOR = new Color( SOMConstants.ADJUSTABLE_ATTRACTION_COLOR );

class AtomicInteractionsIcon extends ScreenIcon {
  /**
   * {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      size: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE,
      maxIconWidthProportion: 0.9,
      maxIconHeightProportion: 0.9,
      fill: Color.BLACK
    }, options );

    // convenience var
    const size = options.size;

    // background
    const iconRootNode = new Rectangle( 0, 0, size.width, size.height, 0, 0, {
      fill: 'black'
    } );

    // create the two atoms
    const atomRadius = size.width * 0.2;
    const gradient = new RadialGradient( 0, 0, 0, 0, 0, atomRadius )
      .addColorStop( 0, PARTICLE_COLOR )
      .addColorStop( 1, PARTICLE_COLOR.darkerColor( 0.5 ) );

    const atomsNode = new Node();
    iconRootNode.addChild( new Circle( atomRadius, {
      fill: gradient,
      opacity: 0.85,
      centerX: size.width / 2 - atomRadius * 0.7,
      centerY: size.height / 2
    } ) );
    iconRootNode.addChild( new Circle( atomRadius, {
      fill: gradient,
      opacity: 0.85,
      centerX: size.width / 2 + atomRadius * 0.7,
      centerY: size.height / 2
    } ) );

    // add the two interacting atoms
    iconRootNode.addChild( atomsNode );

    super( iconRootNode, options );
  }
}

statesOfMatter.register( 'AtomicInteractionsIcon', AtomicInteractionsIcon );
export default AtomicInteractionsIcon;