// Copyright 2015-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * Scenery Node that represents a particle
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import RadialGradient from '../../../../scenery/js/util/RadialGradient.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import MotionAtom from '../model/MotionAtom.js';

// constants
const MVT_SCALE = 0.25;
const OVERLAP_ENLARGEMENT_FACTOR = 1.25;

class ParticleNode extends Node {

  private readonly particle: MotionAtom;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly overlapEnabled: boolean;
  private position: Vector2;
  // node that will represent this particle, initialized arbitrarily, updated below
  private readonly circle: Circle;

  /**
   * @param particle - The particle in the model that this node will represent in the view.
   * @param modelViewTransform - to convert between model and view co-ordinates
   * The gradient is computationally intensive to create, so use only when needed.
   * @param enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @param tandem - support for exporting instances from the sim
   */
  public constructor( particle: MotionAtom, modelViewTransform: ModelViewTransform2, enableOverlap: boolean, tandem: Tandem ) {
    assert && assert( particle && modelViewTransform );

    super( {
      tandem: tandem,
      phetioInputEnabledPropertyInstrumented: true
    } );

    this.particle = particle;
    this.modelViewTransform = modelViewTransform;
    this.overlapEnabled = enableOverlap;
    this.position = new Vector2( 0, 0 );

    this.circle = new Circle( 1 );
    this.addChild( this.circle );

    // update the appearance when the particle configuration changes
    const updateAppearance = () => {

      // calculate the scaled radius of the circle
      let radiusInView = particle.radiusProperty.value * MVT_SCALE;
      if ( this.overlapEnabled ) {

        // Overlap is enabled, so make the shape slightly larger than the radius of the circle so that overlap will occur
        // during inter-particle collisions.
        radiusInView = radiusInView * OVERLAP_ENLARGEMENT_FACTOR;
      }

      this.circle.setRadius( radiusInView );
      this.circle.fill = this.createFill( particle.color, particle.radiusProperty.value );
    };
    particle.radiusProperty.link( updateAppearance );
    particle.configurationChanged.addListener( updateAppearance );

    // Set ourself to be initially non-pickable so that we don't get mouse events.
    this.setPickable( false );

    this.updatePosition();
  }

  public updatePosition(): void {
    if ( this.particle !== null ) {
      this.position = this.modelViewTransform.modelToViewPosition( this.particle.positionProperty.value );
      this.setTranslation( this.position );
    }
  }

  /**
   * Create the gradient fill for this particle.
   * @returns paint to use for this particle
   */
  private createFill( baseColor: Color, atomRadius: number ): RadialGradient {
    const darkenedBaseColor = baseColor.colorUtilsDarker( 0.5 );
    const transparentDarkenedBasedColor = new Color(
      darkenedBaseColor.getRed(),
      darkenedBaseColor.getGreen(),
      darkenedBaseColor.getBlue(),
      0.3
    );

    const radius = ( this.overlapEnabled ? ( atomRadius * OVERLAP_ENLARGEMENT_FACTOR ) : atomRadius ) * MVT_SCALE;

    return new RadialGradient( 0, 0, 0, 0, 0, radius )
      .addColorStop( 0, baseColor )
      .addColorStop( 0.95, transparentDarkenedBasedColor );
  }
}

statesOfMatter.register( 'ParticleNode', ParticleNode );
export default ParticleNode;