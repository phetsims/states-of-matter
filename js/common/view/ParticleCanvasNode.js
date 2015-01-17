// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * A particle layer rendered on canvas
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom' );

  /**
   * A particle layer rendered on canvas
   * @param {ObservableArray<Particle>} particles that need to be rendered on the canvas
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinate frames
   * @param {Property<Boolean>} projectorColorsProperty - true to use apply black stroke to particle, false to particle color stroke
   * @param {Object} options that can be passed on to the underlying node
   * @constructor
   */
  function ParticleCanvasNode( particles, modelViewTransform, projectorColorsProperty, options ) {

    this.particles = particles;
    this.modelViewTransform = modelViewTransform;
    CanvasNode.call( this, options );
    this.invalidatePaint();

    var particleCanvasNode = this;
    projectorColorsProperty.link( function( projectorColors ) {
      particleCanvasNode.projectorColors = projectorColors;
    } )
  }

  return inherit( CanvasNode, ParticleCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasContextWrapper} wrapper
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var particle, i;
      // paint the hydrogen particles
      for ( i = 0; i < this.particles.length; i++ ) {
        particle = this.particles.get( i );
        if ( particle instanceof HydrogenAtom ) {
          context.fillStyle = particle.color;
          context.strokeStyle = this.projectorColors ? '#000000' : particle.color;
          context.lineWidth = 0.4;
          context.beginPath();
          context.arc( this.modelViewTransform.modelToViewX( particle.positionProperty.get().x ),
            this.modelViewTransform.modelToViewY( particle.positionProperty.get().y ),
            this.modelViewTransform.modelToViewDeltaX( particle.radius ), 0, 2 * Math.PI, true );
          context.fill();
          context.stroke();
        }
      }

      // paint the regular particles
      for ( i = 0; i < this.particles.length; i++ ) {
        particle = this.particles.get( i );
        if ( !( particle instanceof HydrogenAtom ) ) {
          context.fillStyle = particle.color;
          context.strokeStyle = this.projectorColors ? '#000000' : particle.color;
          context.lineWidth = 0.4;
          context.beginPath();
          context.arc( this.modelViewTransform.modelToViewX( particle.positionProperty.get().x ),
            this.modelViewTransform.modelToViewY( particle.positionProperty.get().y ),
            this.modelViewTransform.modelToViewDeltaX( particle.radius ), 0, 2 * Math.PI, true );
          context.fill();
          context.stroke();
        }
      }

    },

    step: function() {
      this.invalidatePaint();
    }

  } );
} );