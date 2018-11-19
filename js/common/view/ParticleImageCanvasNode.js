// Copyright 2016-2018, University of Colorado Boulder

/**
 * A particle layer rendered on canvas that uses images rather than calling context.arc for improved performance.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants
  var PARTICLE_IMAGE_CANVAS_LENGTH = 32; // amount of canvas used to create a particle image, will be squared 

  // set up the association between atom types and the colors used to represent them
  var PARTICLE_COLOR_TABLE = {};
  PARTICLE_COLOR_TABLE[ AtomType.ARGON ] = SOMConstants.ARGON_COLOR;
  PARTICLE_COLOR_TABLE[ AtomType.NEON ] = SOMConstants.NEON_COLOR;
  PARTICLE_COLOR_TABLE[ AtomType.OXYGEN ] = SOMConstants.OXYGEN_COLOR;
  PARTICLE_COLOR_TABLE[ AtomType.HYDROGEN ] = SOMConstants.HYDROGEN_COLOR;
  PARTICLE_COLOR_TABLE[ AtomType.ADJUSTABLE ] = SOMConstants.ADJUSTABLE_ATTRACTION_COLOR;

  // set up the association between atom types and their radii in the model
  var PARTICLE_RADIUS_TABLE = {};
  PARTICLE_RADIUS_TABLE[ AtomType.ARGON ] = ArgonAtom.RADIUS;
  PARTICLE_RADIUS_TABLE[ AtomType.NEON ] = NeonAtom.RADIUS;
  PARTICLE_RADIUS_TABLE[ AtomType.OXYGEN ] = OxygenAtom.RADIUS;
  PARTICLE_RADIUS_TABLE[ AtomType.HYDROGEN ] = HydrogenAtom.RADIUS;
  PARTICLE_RADIUS_TABLE[ AtomType.ADJUSTABLE ] = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS;

  /**
   * @param {ObservableArray<Particle>} particles that need to be rendered on the canvas
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view coordinate frames
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function ParticleImageCanvasNode( particles, modelViewTransform, options ) {

    var self = this;
    CanvasNode.call( this, options );

    // @private
    this.particles = particles;
    this.modelViewTransform = modelViewTransform;

    // @private canvas where particle images will reside, one row with strokes and one row without
    this.particleImageCanvas = document.createElement( 'canvas' );
    this.particleImageCanvas.width = Object.getOwnPropertyNames( AtomType ).length * PARTICLE_IMAGE_CANVAS_LENGTH;
    this.particleImageCanvas.height = PARTICLE_IMAGE_CANVAS_LENGTH * 2;

    // @private create a map of particle types to position in the particle image canvas, will be populated below
    this.mapAtomTypeToImageXPosition = {};

    // @private create a table of particle view radii so they don't have to keep being recalculated, populated below
    this.particleRadii = {};

    // Draw the particles on the canvas, top row is without black stroke, the bottom row is with black stroke (for
    // projector mode).
    var context = this.particleImageCanvas.getContext( '2d' );
    var index = 0;
    for ( var atomType in AtomType ) {

      if ( !AtomType.hasOwnProperty( atomType ) ) {
        // skip prototype properties
        continue;
      }

      // draw particle with stroke that matches the fill
      context.strokeStyle = PARTICLE_COLOR_TABLE[ atomType ];
      context.fillStyle = PARTICLE_COLOR_TABLE[ atomType ];
      context.lineWidth = 1;
      context.beginPath();
      context.arc(
        PARTICLE_IMAGE_CANVAS_LENGTH * index + PARTICLE_IMAGE_CANVAS_LENGTH / 2,
        PARTICLE_IMAGE_CANVAS_LENGTH / 2,
        PARTICLE_IMAGE_CANVAS_LENGTH / 2 * 0.95,
        0,
        Math.PI * 2
      );
      context.fill();
      context.stroke();

      // draw particle with dark stroke
      context.strokeStyle = 'black';
      context.beginPath();
      context.arc(
        PARTICLE_IMAGE_CANVAS_LENGTH * index + PARTICLE_IMAGE_CANVAS_LENGTH / 2,
        PARTICLE_IMAGE_CANVAS_LENGTH * 1.5,
        PARTICLE_IMAGE_CANVAS_LENGTH / 2 * 0.95,
        0,
        Math.PI * 2
      );
      context.fill();
      context.stroke();

      // populate the map for this atom type
      self.mapAtomTypeToImageXPosition[ atomType ] = index * PARTICLE_IMAGE_CANVAS_LENGTH;

      // set the radius for this atom type
      self.particleRadii[ atomType ] = modelViewTransform.modelToViewDeltaX( PARTICLE_RADIUS_TABLE[ atomType ] );

      index++;
    }

    // initiate the first paint
    this.invalidatePaint();

    SOMColorProfile.particleStrokeProperty.link( function( color ) {
      self.useStrokedParticles = color.toCSS() !== 'rgb(255,255,255)';
    } );
    this.mutate( options );
  }

  statesOfMatter.register( 'ParticleImageCanvasNode', ParticleImageCanvasNode );

  return inherit( CanvasNode, ParticleImageCanvasNode, {

    /**
     * @private
     */
    renderParticle: function( context, particle ) {
      var particleViewRadius = this.particleRadii[ particle.getType() ];
      context.drawImage(
        this.particleImageCanvas,
        this.mapAtomTypeToImageXPosition[ particle.getType() ],
        this.useStrokedParticles ? PARTICLE_IMAGE_CANVAS_LENGTH : 0,
        PARTICLE_IMAGE_CANVAS_LENGTH,
        PARTICLE_IMAGE_CANVAS_LENGTH,
        this.modelViewTransform.modelToViewX( particle.positionProperty.value.x ) - particleViewRadius,
        this.modelViewTransform.modelToViewY( particle.positionProperty.value.y ) - particleViewRadius,
        particleViewRadius * 2,
        particleViewRadius * 2
      );
    },

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @public
     */
    paintCanvas: function( context ) {
      var particle;
      var i;

      // Paint all atoms with a flag indicating that they should be in back first first.  This is done so that when
      // water is rendered, some of the hydrogen ends up in the back and some ends up in front so that there is
      // variation in the appearance of the molecules.  OPTIMIZATION NOTE: At the time of this writing, it is only
      // hydrogen atoms that will ever have this flag set, so several context values are set prior to the loop rather
      // than inside of it.
      for ( i = 0; i < this.particles.length; i++ ) {
        particle = this.particles.get( i );
        if ( particle.renderBelowOxygen ) {
          this.renderParticle( context, particle );
        }
      }

      // Paint the non-flagged particles.
      for ( i = 0; i < this.particles.length; i++ ) {
        particle = this.particles.get( i );
        if ( !particle.renderBelowOxygen ) {
          this.renderParticle( context, particle );
        }
      }
    },

    /**
     * @public
     */
    step: function() {
      this.invalidatePaint();
    }

  } );
} );