// Copyright 2015-2020, University of Colorado Boulder

/**
 * A pseudo-3D sphere with a halo that appears during interactions.  This was highly leveraged from Manipulator.js
 * in the Graphing Lins simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import ButtonListener from '../../../../scenery/js/input/ButtonListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import RadialGradient from '../../../../scenery/js/util/RadialGradient.js';
import statesOfMatter from '../../statesOfMatter.js';

/**
 * @param {number} radius radius of the sphere
 * @param {Color|String} color base color used to shade the sphere
 * @param {Object} [options]
 * @constructor
 */
function PositionMarker( radius, color, options ) {
  const self = this;
  const mainColor = Color.toColor( color );
  options = merge( {
    mainColor: mainColor,
    highlightColor: Color.WHITE,
    shadowColor: mainColor.darkerColor(),
    haloAlpha: 0.5, // alpha channel of the halo, 0.0 - 1.0
    cursor: 'pointer',  // all manipulators are interactive
    lineWidth: 1,
    stroke: mainColor.darkerColor()
  }, options );

  // @private
  this.radius = radius;
  this.haloNode = new Circle( 1.75 * radius,
    { fill: mainColor.withAlpha( options.haloAlpha ), pickable: false, visible: false } );
  this.sphereNode = new ShadedSphereNode( 2 * radius, options );

  Node.call( this, { children: [ this.haloNode, this.sphereNode ] } );

  // halo visibility
  this.sphereNode.addInputListener( new ButtonListener( {
      up: function() { self.haloNode.visible = false; },
      down: function() { self.haloNode.visible = true; },
      over: function() { self.haloNode.visible = true; }
    } )
  );

  // expand pointer areas
  this.mouseArea = this.touchArea = Shape.circle( 0, 0, 1.5 * radius );
}

statesOfMatter.register( 'PositionMarker', PositionMarker );

export default inherit( Node, PositionMarker, {

  /**
   * @param color
   * @public
   */
  changeColor: function( color ) {
    this.haloNode.fill = Color.toColor( color ).withAlpha( 0.5 );
    const mainColor = Color.toColor( color );
    const highlightColor = Color.WHITE;
    const shadowColor = mainColor.darkerColor();
    this.sphereNode.fill = new RadialGradient( this.radius * -0.4, this.radius * -0.4, 0, this.radius * -0.4,
      this.radius * -0.4, 2 * this.radius )
      .addColorStop( 0, highlightColor )
      .addColorStop( 0.5, mainColor )
      .addColorStop( 1, shadowColor );
    this.sphereNode.stroke = shadowColor;
  }
} );