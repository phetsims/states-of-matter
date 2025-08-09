// Copyright 2016-2025, University of Colorado Boulder

/**
 * A particle layer rendered on canvas that uses images rather than calling context.arc for improved performance.
 *
 * @author John Blanco
 */

import type { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import type ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import type { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import statesOfMatter from '../../statesOfMatter.js';
import AtomType from '../model/AtomType.js';
import type ScaledAtom from '../model/particle/ScaledAtom.js';
import SOMConstants from '../SOMConstants.js';
import SOMColors from './SOMColors.js';

// constants
const PARTICLE_IMAGE_CANVAS_LENGTH = 32; // amount of canvas used to create a particle image, will be squared 

// set up the association between atom types and the colors used to represent them
const PARTICLE_COLOR_TABLE = {
  ARGON: SOMConstants.ARGON_COLOR.toCSS(),
  NEON: SOMConstants.NEON_COLOR.toCSS(),
  OXYGEN: SOMConstants.OXYGEN_COLOR.toCSS(),
  HYDROGEN: SOMConstants.HYDROGEN_COLOR.toCSS(),
  ADJUSTABLE: SOMConstants.ADJUSTABLE_ATTRACTION_COLOR.toCSS()
};

// set up the association between atom types and their radii in the model
const PARTICLE_RADIUS_TABLE = {
  ARGON: SOMConstants.ARGON_RADIUS,
  NEON: SOMConstants.NEON_RADIUS,
  OXYGEN: SOMConstants.OXYGEN_RADIUS,
  HYDROGEN: SOMConstants.HYDROGEN_RADIUS,
  ADJUSTABLE: SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS
};

type SelfOptions = EmptySelfOptions;

type ParticleImageCanvasNodeOptions = SelfOptions & NodeOptions;

class ParticleImageCanvasNode extends CanvasNode {

  private readonly particles: ObservableArray<ScaledAtom>;
  private readonly modelViewTransform: ModelViewTransform2;
  // canvas where particle images will reside, one row with strokes and one row without
  private readonly particleImageCanvas: HTMLCanvasElement;
  // create a map of particle types to position in the particle image canvas, will be populated below
  private readonly mapAtomTypeToImageXPosition: Record<string, number>;
  // create a table of particle view radii so they don't have to keep being recalculated, populated below
  private readonly particleRadii: Record<string, number>;

  // @ts-expect-error
  private useStrokedParticles: boolean;

  /**
   * @param particles - that need to be rendered on the canvas
   * @param modelViewTransform - to convert between model and view coordinate frames
   * @param providedOptions - that can be passed on to the underlying node
   */
  public constructor( particles: ObservableArray<ScaledAtom>, modelViewTransform: ModelViewTransform2, providedOptions?: ParticleImageCanvasNodeOptions ) {

    const options = optionize<ParticleImageCanvasNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    this.particles = particles;
    this.modelViewTransform = modelViewTransform;

    this.particleImageCanvas = document.createElement( 'canvas' );
    this.particleImageCanvas.width = Object.getOwnPropertyNames( AtomType ).length * PARTICLE_IMAGE_CANVAS_LENGTH;
    this.particleImageCanvas.height = PARTICLE_IMAGE_CANVAS_LENGTH * 2;

    this.mapAtomTypeToImageXPosition = {};

    this.particleRadii = {};

    // Draw the particles on the canvas, top row is without black stroke, the bottom row is with black stroke (for
    // projector mode).
    const context = this.particleImageCanvas.getContext( '2d' )!;
    let index = 0;
    for ( const atomType in AtomType ) {

      if ( !AtomType.hasOwnProperty( atomType ) ) {
        // skip prototype properties
        continue;
      }

      // draw particle with stroke that matches the fill
      // @ts-expect-error
      context.strokeStyle = PARTICLE_COLOR_TABLE[ atomType ];
      // @ts-expect-error
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
      this.mapAtomTypeToImageXPosition[ atomType ] = index * PARTICLE_IMAGE_CANVAS_LENGTH;

      // set the radius for this atom type
      // @ts-expect-error
      this.particleRadii[ atomType ] = modelViewTransform.modelToViewDeltaX( PARTICLE_RADIUS_TABLE[ atomType ] );

      index++;
    }

    // initiate the first paint
    this.invalidatePaint();

    SOMColors.particleStrokeProperty.link( color => {
      this.useStrokedParticles = color.toCSS() !== 'rgb(255,255,255)';
    } );
    this.mutate( options );
  }

  private renderParticle( context: CanvasRenderingContext2D, particle: ScaledAtom ): void {
    const particleViewRadius = this.particleRadii[ particle.getType() ];
    context.drawImage(
      this.particleImageCanvas,
      this.mapAtomTypeToImageXPosition[ particle.getType() ],
      this.useStrokedParticles ? PARTICLE_IMAGE_CANVAS_LENGTH : 0,
      PARTICLE_IMAGE_CANVAS_LENGTH,
      PARTICLE_IMAGE_CANVAS_LENGTH,
      this.modelViewTransform.modelToViewX( particle.getX() ) - particleViewRadius,
      this.modelViewTransform.modelToViewY( particle.getY() ) - particleViewRadius,
      particleViewRadius * 2,
      particleViewRadius * 2
    );
  }

  /**
   * Paints the particles on the canvas node.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    let particle;
    let i;

    // Paint all atoms with a flag indicating that they should be in back first first.  This is done so that when
    // water is rendered, some of the hydrogen ends up in the back and some ends up in front so that there is
    // variation in the appearance of the molecules.  OPTIMIZATION NOTE: At the time of this writing, it is only
    // hydrogen atoms that will ever have this flag set, so several context values are set prior to the loop rather
    // than inside of it.
    for ( i = 0; i < this.particles.length; i++ ) {
      particle = this.particles.get( i );
      // @ts-expect-error
      if ( particle.renderBelowOxygen ) {
        this.renderParticle( context, particle );
      }
    }

    // Paint the non-flagged particles.
    for ( i = 0; i < this.particles.length; i++ ) {
      particle = this.particles.get( i );

      // @ts-expect-error
      if ( !particle.renderBelowOxygen ) {
        this.renderParticle( context, particle );
      }
    }
  }

  public step( dt: number ): void {
    this.invalidatePaint();
  }
}

statesOfMatter.register( 'ParticleImageCanvasNode', ParticleImageCanvasNode );
export default ParticleImageCanvasNode;