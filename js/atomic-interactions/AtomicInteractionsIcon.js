// Copyright 2015-2020, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'Interaction' screen.
 *
 * @author John Blanco
 */


import inherit from '../../../phet-core/js/inherit.js';
// modules
import Circle from '../../../scenery/js/nodes/Circle.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../scenery/js/util/Color.js';
import RadialGradient from '../../../scenery/js/util/RadialGradient.js';
import SOMConstants from '../common/SOMConstants.js';
import statesOfMatter from '../statesOfMatter.js';

// constants
const PARTICLE_COLOR = new Color( SOMConstants.ADJUSTABLE_ATTRACTION_COLOR );

/**
 * {Dimension2} size
 * @constructor
 */
function AtomicInteractionsIcon( size ) {
  Node.call( this );

  // background
  const backgroundRect = new Rectangle( 0, 0, size.width, size.height, 0, 0, {
    fill: 'black'
  } );
  this.addChild( backgroundRect );

  // create the two atoms under a parent node
  const atomRadius = size.width * 0.2;
  const gradient = new RadialGradient( 0, 0, 0, 0, 0, atomRadius )
    .addColorStop( 0, PARTICLE_COLOR )
    .addColorStop( 1, PARTICLE_COLOR.darkerColor( 0.5 ) );

  const atomsNode = new Node();
  atomsNode.addChild( new Circle( atomRadius, {
    fill: gradient,
    opacity: 0.85,
    centerX: -atomRadius * 0.7
  } ) );
  atomsNode.addChild( new Circle( atomRadius, {
    fill: gradient,
    opacity: 0.85,
    centerX: atomRadius * 0.7
  } ) );

  // position and add the two interacting atoms
  atomsNode.centerX = backgroundRect.width / 2;
  atomsNode.centerY = backgroundRect.height / 2;
  this.addChild( atomsNode );
}

statesOfMatter.register( 'AtomicInteractionsIcon', AtomicInteractionsIcon );

export default inherit( Node, AtomicInteractionsIcon );