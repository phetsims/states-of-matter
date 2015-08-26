// Copyright 2002-2015, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'Phase Changes' screen.
 *
 * @author John Blanco
 */
define( function( require ) {
    'use strict';

    // modules
    var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
    var Circle = require( 'SCENERY/nodes/Circle' );
    var HBox = require( 'SCENERY/nodes/HBox' );
    var Image = require( 'SCENERY/nodes/Image' );
    var inherit = require( 'PHET_CORE/inherit' );
    var Node = require( 'SCENERY/nodes/Node' );
    var Rectangle = require( 'SCENERY/nodes/Rectangle' );
    var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

    // images
    var gasIconImage = require( 'image!STATES_OF_MATTER/gas-icon.png' );
    var liquidIconImage = require( 'image!STATES_OF_MATTER/liquid-icon.png' );
    var solidIconImage = require( 'image!STATES_OF_MATTER/solid-icon.png' );

    // constants
    var PARTICLE_COLOR = StatesOfMatterConstants.NEON_COLOR;
    var CUBE_WIDTH = 5; // particles
    var CUBE_HEIGHT = 5; // particles

    /**
     * {Dimension2} size
     * @constructor
     */
    function PhaseChangesIcon( size ) {
      var self = this;
      Node.call( this );

      // background
      var backgroundRect = new Rectangle( 0, 0, size.width, size.height, 0, 0, {
        fill: 'black'
      } );
      this.addChild( backgroundRect );

      var particleRadius = size.width * 0.02;

      // particles on left side in solid form
      var cubeStartX = size.width * 0.15;
      var cubeStartY = size.height * 0.35;
      _.times( CUBE_HEIGHT, function( row ) {
        _.times( CUBE_WIDTH, function( column ) {
          self.addChild( new Circle( particleRadius, {
            fill: PARTICLE_COLOR,
            centerX: cubeStartX + column * particleRadius * 2.1 + ( row % 2 === 0 ? particleRadius * 1.05 : 0 ),
            centerY: cubeStartY + row * particleRadius * 2.1
          } ) );
        } );
      } );

      // arrow in center, the multipliers are empirically determined
      var arrow = new ArrowNode( 0, 0, size.width * 0.12, 0, {
          headWidth: size.height * 0.12,
          tailWidth: size.height * 0.05,
          headHeight: size.width * 0.05,
          fill: 'yellow',
          centerX: backgroundRect.width * 0.45,
          centerY: backgroundRect.height * 0.45
        }
      );
      this.addChild( arrow );

      // particles on right side in gaseous form
      var gasCloudNode = new Node();
      var gasCloudRadius = size.height * 0.3;
      function createGasParticle( angle, radius ){
        return new Circle( particleRadius, {
          fill: PARTICLE_COLOR,
          centerX: radius * Math.cos( angle ),
          centerY: radius * Math.sin( angle )
        } );
      }
      // for the sake of getting this done quickly, the particles have simply been hand positioned
      gasCloudNode.addChild( createGasParticle( 0, 0 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.08, gasCloudRadius * 0.8 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.16, gasCloudRadius * 0.25 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.24, gasCloudRadius * 0.65 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.32, gasCloudRadius * 0.4 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.40, gasCloudRadius * 0.9 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.48, gasCloudRadius * 0.55 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.56, gasCloudRadius * 0.8 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.64, gasCloudRadius * 0.6 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.72, gasCloudRadius * 0.4 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.80, gasCloudRadius * 0.99 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.88, gasCloudRadius * 0.5 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 0.96, gasCloudRadius * 0.99 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.04, gasCloudRadius * 0.6 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.12, gasCloudRadius * 0.3 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.20, gasCloudRadius * 0.9 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.28, gasCloudRadius * 0.65 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.36, gasCloudRadius * 0.37 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.44, gasCloudRadius * 0.65 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.52, gasCloudRadius * 0.8 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.60, gasCloudRadius * 0.4 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.68, gasCloudRadius * 0.7 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.76, gasCloudRadius * 0.50 ) );
      gasCloudNode.addChild( createGasParticle( Math.PI * 1.94, gasCloudRadius * 0.7 ) );
      gasCloudNode.centerX = size.width * 0.75;
      gasCloudNode.centerY = size.height * 0.5;
      this.addChild( gasCloudNode );
    }

    return inherit( Node, PhaseChangesIcon );
  }
);
