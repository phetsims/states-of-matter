// Copyright 2015-2018, University of Colorado Boulder

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
    var Image = require( 'SCENERY/nodes/Image' );
    var inherit = require( 'PHET_CORE/inherit' );
    var Node = require( 'SCENERY/nodes/Node' );
    var Rectangle = require( 'SCENERY/nodes/Rectangle' );
    var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
    var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

    // constants
    var PARTICLE_COLOR = SOMConstants.NEON_COLOR;
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

      // create a node that will contain all particles and the arrow so that it can be turned into an image at the end
      var particlesAndArrowNode = new Node();

      // particles on left side in solid form
      var cubeStartX = size.width * 0.15;
      var cubeStartY = size.height * 0.35;
      _.times( CUBE_HEIGHT, function( row ) {
        _.times( CUBE_WIDTH, function( column ) {
          particlesAndArrowNode.addChild( new Circle( particleRadius, {
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
      particlesAndArrowNode.addChild( arrow );

      // particles on right side in gaseous form
      var gasCloudNode = new Node();
      var gasCloudRadius = size.height * 0.3;

      function createGasParticle( angle, radius ) {
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
      particlesAndArrowNode.addChild( gasCloudNode );

      // for faster rendering, turn the collection of particles and the arrow into an image node
      particlesAndArrowNode.toImage(
        function( image ) { self.addChild( new Image( image ) ); },
        0,
        0,
        size.width,
        size.height
      );
    }

    statesOfMatter.register( 'PhaseChangesIcon', PhaseChangesIcon );

    return inherit( Node, PhaseChangesIcon );
  }
);
