// Copyright 2002-2014, University of Colorado Boulder

/**
 * Copied from GraphingLines.
 * Base type for all line manipulators.
 * A pseudo-3D sphere with a halo that appears during interactions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {number} radius radius of the sphere
   * @param {Color|String} color base color used to shade the sphere
   * @param {Object} [options]
   * @constructor
   */
  function PositionMarker( radius, color, options ) {
    var positionMarker = this;
    var mainColor = Color.toColor( color );
    options = _.extend( {
      mainColor: mainColor,
      highlightColor: Color.WHITE,
      shadowColor: mainColor.darkerColor(),
      haloAlpha: 0.5, // alpha channel of the halo, 0.0 - 1.0
      cursor: 'pointer',  // all manipulators are interactive
      lineWidth: 1,
      stroke: mainColor.darkerColor()
    }, options );
    this.radius = radius;
    this.haloNode = new Circle( 1.75 * radius,
      { fill: mainColor.withAlpha( options.haloAlpha ), pickable: false, visible: false } );
    this.sphereNode = new ShadedSphereNode( 2 * radius, options );

    Node.call( this, { children: [ this.haloNode, this.sphereNode ] } );

    // halo visibility
    this.sphereNode.addInputListener( new ButtonListener( {
        up: function( event ) { positionMarker.haloNode.visible = false; },
        down: function( event ) { positionMarker.haloNode.visible = true; },
        over: function( event ) { positionMarker.haloNode.visible = true; }
      } )
    );

    // expand pointer areas
    this.mouseArea = this.touchArea = Shape.circle( 0, 0, 1.5 * radius );
  }

  return inherit( Node, PositionMarker, {
    changeColor: function( color ) {
      this.haloNode.fill = Color.toColor( color ).withAlpha( 0.5 );
      var mainColor = Color.toColor( color );
      var highlightColor = Color.WHITE;
      var shadowColor = mainColor.darkerColor();
      this.sphereNode.fill = new RadialGradient( this.radius * -0.4, this.radius * -0.4, 0, this.radius * -0.4,
        this.radius * -0.4, 2 * this.radius )
        .addColorStop( 0, highlightColor )
        .addColorStop( 0.5, mainColor )
        .addColorStop( 1, shadowColor );
      this.sphereNode.stroke = shadowColor;
    }
  } );
} );