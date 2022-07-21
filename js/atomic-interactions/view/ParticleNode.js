// Copyright 2015-2022, University of Colorado Boulder

/**
 * Scenery Node that represents a particle
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Circle, Color, Node, RadialGradient } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const MVT_SCALE = 0.25;
const OVERLAP_ENLARGEMENT_FACTOR = 1.25;

class ParticleNode extends Node {

  /**
   * @param {MotionAtom} particle  - The particle in the model that this node will represent in the view.
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * The gradient is computationally intensive to create, so use only when needed.
   * @param {boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @param {Tandem} tandem - support for exporting instances from the sim
   */
  constructor( particle, modelViewTransform, enableOverlap, tandem ) {
    assert && assert( particle && modelViewTransform );

    super( {
      tandem: tandem,
      phetioInputEnabledPropertyInstrumented: true
    } );

    // @private
    this.particle = particle;
    this.modelViewTransform = modelViewTransform;
    this.overlapEnabled = enableOverlap;
    this.position = new Vector2( 0, 0 );

    // @private - node that will represent this particle, initialized arbitrarily, updated below
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

  /**
   * @public
   */
  updatePosition() {
    if ( this.particle !== null ) {
      this.position = this.modelViewTransform.modelToViewPosition( this.particle.positionProperty.value );
      this.setTranslation( this.position );
    }
  }

  /**
   * Create the gradient fill for this particle.
   * @returns {RadialGradient} - paint to use for this particle
   * @private
   */
  createFill( baseColor, atomRadius ) {
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