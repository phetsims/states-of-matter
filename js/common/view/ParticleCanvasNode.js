// Copyright 2014-2015, University of Colorado Boulder

/**
 * A particle layer rendered on canvas.  This exists for performance reasons.
 *
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
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view coordinate frames
   * @param {Property<boolean>} projectorModeProperty - true to use apply black stroke to particle, false to particle color stroke
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function ParticleCanvasNode( particles, modelViewTransform, projectorModeProperty, options ) {

    this.particles = particles;
    this.modelViewTransform = modelViewTransform;
    CanvasNode.call( this, options );
    this.invalidatePaint();

    var particleCanvasNode = this;
    projectorModeProperty.link( function( projectorMode ) {
      particleCanvasNode.projectorMode = projectorMode;
    } );
    this.mutate( options );
  }

  return inherit( CanvasNode, ParticleCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      var particle;
      var i;

      // Paint the regular hydrogen atoms first.  This is done so that when
      // water is rendered, some of the hydrogen ends up in the back and some
      // (the Hydrogen2) ends up in front so that there is some variation in
      // the appearance of the molecules.
      for ( i = 0; i < this.particles.length; i++ ) {
        particle = this.particles.get( i );
        if ( particle instanceof HydrogenAtom ) {
          context.fillStyle = particle.color;
          context.strokeStyle = this.projectorMode ? '#000000' : particle.color;
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
          context.strokeStyle = this.projectorMode ? '#000000' : particle.color;
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