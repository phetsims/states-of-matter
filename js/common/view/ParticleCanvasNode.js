// Copyright 2014-2018, University of Colorado Boulder

/**
 * A particle layer rendered on canvas.  This exists for performance reasons.
 *
 * !!!!!!!!!!!!! NOTE !!!!!!!!!!!!!!!!!!!
 * This was replaced in August 2016 with ParticleImageCanvasNode because using images instead for drawing shapes using
 * context.arc, context.fill, and so forth, improved the performance significantly on devices like iPad 2s.  See
 * https://github.com/phetsims/states-of-matter/issues/71 for details.  I am keeping this file around, however, in
 * case we ever run into issues where the images are not clear enough, and we decide that we'd rather draw them.  If
 * the sim has been out for years and no complaints have ever arisen, this can probably be removed.
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const HydrogenAtom = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom' );
  const inherit = require( 'PHET_CORE/inherit' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants
  const TWO_PI_RADIANS = Math.PI * 2;

  /**
   * A particle layer rendered on canvas
   * @param {ObservableArray<Particle>} particles that need to be rendered on the canvas
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view coordinate frames
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function ParticleCanvasNode( particles, modelViewTransform, options ) {

    const self = this;
    this.particles = particles;
    this.modelViewTransform = modelViewTransform;
    CanvasNode.call( this, options );

    // pre-calculate a couple of values so that they don't need to be recalculated on each paint
    this.hydrogenViewRadius = this.modelViewTransform.modelToViewDeltaX( HydrogenAtom.RADIUS );

    // initiate the first paint
    this.invalidatePaint();

    SOMColorProfile.particleStrokeProperty.link( function( color ) {
      self.strokeColor = color.toCSS();
    } );
    this.mutate( options );
  }

  statesOfMatter.register( 'ParticleCanvasNode', ParticleCanvasNode );

  return inherit( CanvasNode, ParticleCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      let particle;
      let i;
      let xPos;
      let yPos;
      const isParticleStrokeWhite = this.strokeColor === 'rgb(255,255,255)';

      // the same line width is used for all rendering, so set it once here
      context.lineWidth = 0.4;

      // Paint the atoms with a flag indicating that they should be in back first first.  This is done so that when
      // water is rendered, some of the hydrogen ends up in the back and some ends up in front so that there is
      // variation in the appearance of the molecules.  OPTIMIZATION NOTE: At the time of this writing, it is only
      // hydrogen atoms that will ever have this flag set, so several context values are set prior to the loop rather
      // than inside of it.
      context.fillStyle = SOMConstants.HYDROGEN_COLOR;
      context.strokeStyle = isParticleStrokeWhite ? SOMConstants.HYDROGEN_COLOR : this.strokeColor;
      context.beginPath();
      let fillAndStrokeNeeded = false;
      for ( i = 0; i < this.particles.length; i++ ) {
        particle = this.particles.get( i );
        if ( particle.renderBelowOxygen ) {
          xPos = this.modelViewTransform.modelToViewX( particle.positionProperty.value.x );
          yPos = this.modelViewTransform.modelToViewY( particle.positionProperty.value.y );
          context.moveTo( xPos, yPos );
          context.arc( xPos, yPos, this.hydrogenViewRadius, 0, TWO_PI_RADIANS, true );
          fillAndStrokeNeeded = true;
        }
      }
      if ( fillAndStrokeNeeded ){
        context.fill();
        context.stroke();
      }

      // paint the non-flagged particles
      for ( i = 0; i < this.particles.length; i++ ) {
        particle = this.particles.get( i );
        if ( !particle.renderBelowOxygen ) {
          context.fillStyle = particle.color;
          context.strokeStyle = isParticleStrokeWhite ? particle.color : this.strokeColor;
          context.beginPath();
          context.arc(
            this.modelViewTransform.modelToViewX( particle.positionProperty.value.x ),
            this.modelViewTransform.modelToViewY( particle.positionProperty.value.y ),
            this.modelViewTransform.modelToViewDeltaX( particle.radius ),
            0,
            TWO_PI_RADIANS,
            true
          );
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