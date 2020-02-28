// Copyright 2015-2020, University of Colorado Boulder

/**
 * View for Atom
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import RadialGradient from '../../../../scenery/js/util/RadialGradient.js';
import ArgonAtom from '../../common/model/particle/ArgonAtom.js';
import ConfigurableStatesOfMatterAtom from '../../common/model/particle/ConfigurableStatesOfMatterAtom.js';
import HydrogenAtom from '../../common/model/particle/HydrogenAtom.js';
import NeonAtom from '../../common/model/particle/NeonAtom.js';
import OxygenAtom from '../../common/model/particle/OxygenAtom.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const MVT_SCALE = 0.25;
const OVERLAP_ENLARGEMENT_FACTOR = 1.25;

/**
 * @param {Particle} particle  - The particle in the model that this node will represent in the view.
 * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
 * The gradient is computationally intensive to create, so use only when needed.
 * @param {boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
 * @constructor
 */
function ParticleNode( particle, modelViewTransform, enableOverlap ) {
  assert && assert( particle && modelViewTransform );

  Node.call( this );

  // @private
  this.particle = particle;
  this.modelViewTransform = modelViewTransform;
  this.overlapEnabled = enableOverlap;
  this.position = new Vector2( 0, 0 );

  // Calculate the diameter of the circle.
  let circleDiameter = particle.radius * 2 * MVT_SCALE;
  if ( this.overlapEnabled ) {
    // Overlap is enabled, so make the shape slightly larger than the radius of the circle so that overlap will occur
    // during inter-particle collisions.
    circleDiameter = circleDiameter * OVERLAP_ENLARGEMENT_FACTOR;
  }

  // @private node that will represent this particle
  this.circle = new Path( new Shape().circle( 0, 0, circleDiameter / 2 ), { fill: this.createFill( particle ) } );
  this.addChild( this.circle );

  // Set ourself to be initially non-pickable so that we don't get mouse events.
  this.setPickable( false );

  this.updatePosition();
}

statesOfMatter.register( 'ParticleNode', ParticleNode );

export default inherit( Node, ParticleNode, {

  /**
   * @public
   */
  updatePosition: function() {
    if ( this.particle !== null ) {
      this.position = this.modelViewTransform.modelToViewPosition( this.particle.getPositionReference() );
      this.setTranslation( this.position );
    }
  },

  /**
   * If the radius of the particle changes, we need to redraw ourself to correspond.
   * @public
   */
  handleParticleRadiusChanged: function() {

    // If the size changes, the gradient must also change to match.
    this.circle.fill = this.createFill( this.particle );

    let circleDiameter = this.particle.getRadius() * 2 * MVT_SCALE;
    if ( this.overlapEnabled ) {
      // Make node larger than particle so that overlap appears to happen when the particles collide.
      circleDiameter = circleDiameter * OVERLAP_ENLARGEMENT_FACTOR;
    }
    this.circle.setShape( new Shape().circle( 0, 0, circleDiameter / 2 ) );
  },

  /**
   * Select the color and create the gradient fill for this particle.
   * @returns {RadialGradint} - paint to use for this particle
   * @private
   */
  createFill: function( atom ) {

    const baseColor = this.chooseColor( atom );
    const darkenedBaseColor = baseColor.colorUtilsDarker( 0.5 );
    const transparentDarkenedBasedColor = new Color(
      darkenedBaseColor.getRed(),
      darkenedBaseColor.getGreen(),
      darkenedBaseColor.getBlue(),
      0.3
    );

    const radius = ( this.overlapEnabled ? ( atom.getRadius() * OVERLAP_ENLARGEMENT_FACTOR ) :
                     atom.getRadius() ) * MVT_SCALE;

    return new RadialGradient( 0, 0, 0, 0, 0, radius )
      .addColorStop( 0, baseColor )
      .addColorStop( 0.95, transparentDarkenedBasedColor );
  },

  /**
   * Choose the base color for the node based on the type of atom.
   * @param atom
   * @return
   * @private
   */
  chooseColor: function( atom ) {
    let baseColor;

    if ( atom instanceof ArgonAtom ) {
      baseColor = new Color( SOMConstants.ARGON_COLOR );
    }
    else if ( atom instanceof NeonAtom ) {
      baseColor = new Color( SOMConstants.NEON_COLOR );
    }
    else if ( atom instanceof OxygenAtom ) {
      baseColor = new Color( SOMConstants.OXYGEN_COLOR );
    }
    else if ( atom instanceof HydrogenAtom ) {
      baseColor = new Color( SOMConstants.HYDROGEN_COLOR );
    }
    else if ( atom instanceof ConfigurableStatesOfMatterAtom ) {
      baseColor = new Color( SOMConstants.ADJUSTABLE_ATTRACTION_COLOR );
    }
    else {
      assert && assert( false, 'unrecognized atom type, unable to assign a color' );
      baseColor = new Color( 'black' );
    }
    return baseColor;
  }
} );