// Copyright 2002-2013, University of Colorado Boulder

/**
 * This class is the "view" for the particle container.  This is where the
 * information about the nature of the image that is used to depict the
 * container is encapsulated.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * Main constructor.
   *
   * @param {MultipleParticleModel} model
   * @param {ModelViewTransform} modelViewTransform The model view transform for transforming particle position.
   * @param {Object} [options]
   * @constructor
   */
  function ParticleContainerNode( model, modelViewTransform, options ) {

    this.model = model;
    this.modelViewTransform = modelViewTransform;
    this.containmentAreaWidth = StatesOfMatterConstants.CONTAINER_BOUNDS.width;
    this.containmentAreaHeight = StatesOfMatterConstants.CONTAINER_BOUNDS.height;
    CanvasNode.call( this, options );
    this.invalidatePaint();
    var preParticleLayer = new Node();
    var particleLayer = new Node();
    var postParticleLayer = new Node( {opacity: 0.8} );

    this.addChild( preParticleLayer );
    this.addChild( particleLayer );
    this.addChild( postParticleLayer );

    var openEllipse = new Path( new Shape().ellipticalArc( 125, 2, 25, 125, Math.PI / 2, 0, 2 * Math.PI, false ).close(), {
      lineWidth: '2',
      stroke: '#7E7E7E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#7E7E7E' )
        .addColorStop( 0.3, '#6D6D6D' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#696969' )
    } );
    var closeEllipse = new Path( new Shape().ellipticalArc( 125, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT, 125,
      25, 0, 0, Math.PI, false ).close(), {
      lineWidth: '2',
      stroke: '#7E7E7E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#7E7E7E' )
        .addColorStop( 0.3, '#6D6D6D' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#696969' )
    } );


    var outerMostNode = new Path( new Shape()
      .moveTo( 0, 5 )
      .lineTo( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, 5 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 25, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 25 )
      .lineTo( 25, 25 )
      .close(), {
      lineWidth: '2',
      stroke: '#7E7E7E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#7E7E7E' )
        .addColorStop( 0.3, '#6D6D6D' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#696969' )
    } );
    postParticleLayer.addChild( outerMostNode );
    postParticleLayer.addChild( openEllipse );
    postParticleLayer.addChild( closeEllipse );
    /*var innerNode = new Path( new Shape()
      .moveTo( 50, 50 )
      .lineTo( 50, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 5 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 5 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, 50 )
      .lineTo( 50, 50 )
      .close(), {
      lineWidth: '2',
      stroke: '#7E7E7E',
      fill: 'black'
    } );*/

    var middleNode = new Path( new Shape()
      .moveTo( 25, 25 )
      .lineTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 50, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 50, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, 25 )
      .lineTo( 50, 25 )
      .lineTo( 25, 25 )
      .close(), {
      lineWidth: '2',
      stroke: '#4E4E4E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#4E4E4E' )
        .addColorStop( 0.3, '#494949' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#9E9E9E' )
    } );

    postParticleLayer.addChild( middleNode );


    model.reset();
    this.modelViewTransform = modelViewTransform;
    this.mutate( options );
  }

  return inherit( CanvasNode, ParticleContainerNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var particle, i;

      // paint the regular particles
      for ( i = 0; i < this.model.particles.length; i++ ) {
        particle = this.model.particles.get( i );
        context.fillStyle = particle.color;
        context.beginPath();
        // console.log( particle.positionProperty.x );
        context.arc( this.modelViewTransform.modelToViewX( particle.positionProperty.get().x ),
          this.modelViewTransform.modelToViewY( particle.positionProperty.get().y ),
          this.modelViewTransform.modelToViewDeltaX( particle.radius ), 0, 2 * Math.PI, true );
        context.fill();
      }


    },

    step: function() {
      this.invalidatePaint();
    }
  } );
} );
