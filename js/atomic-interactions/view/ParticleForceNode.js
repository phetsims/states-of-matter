// Copyright 2015-2020, University of Colorado Boulder

/**
 * this type adds the ability to display force arrows to a particle node
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import Color from '../../../../scenery/js/util/Color.js';
import statesOfMatter from '../../statesOfMatter.js';
import DimensionalArrowNode from './DimensionalArrowNode.js';
import ParticleNode from './ParticleNode.js';

// The following constants control some of the aspects of the appearance of the force arrows.  The values were
// empirically chosen to look good in this particular sim.
const ATTRACTIVE_FORCE_COLOR = '#FC9732';
const REPULSIVE_FORCE_COLOR = new Color( 255, 0, 255, 175 ); // Magenta.
const TOTAL_FORCE_COLOR = '#49B649';
const COMPONENT_FORCE_ARROW_REFERENCE_LENGTH = 150;
const COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE = 1E-22;
const TOTAL_FORCE_ARROW_REFERENCE_LENGTH = 200;
const TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE = 1E-22;
const FORCE_ARROW_TAIL_WIDTH = 30;
const FORCE_ARROW_HEAD_WIDTH = 50;
const FORCE_ARROW_HEAD_LENGTH = 50;

/**
 * @param {Particle} particle - The particle in the model that this node will represent in the view.
 * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
 * The gradient is computationally intensive to create, so use only when needed.
 * @param {boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
 * @constructor
 */
function ParticleForceNode( particle, modelViewTransform, enableOverlap ) {

  ParticleNode.call( this, particle, modelViewTransform, enableOverlap );

  this.attractiveForce = 0;
  this.repulsiveForce = 0;
  const self = this;
  const commonForceArrowNodeOptions = {
    headHeight: FORCE_ARROW_HEAD_LENGTH,
    headWidth: FORCE_ARROW_HEAD_WIDTH,
    tailWidth: FORCE_ARROW_TAIL_WIDTH,
    opacity: 0.7 // empirically determined
  };

  // @private attractive force node
  this.attractiveForceVectorNode = new DimensionalArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, merge( {
    fill: ATTRACTIVE_FORCE_COLOR
  }, commonForceArrowNodeOptions ) );
  this.addChild( this.attractiveForceVectorNode );
  this.attractiveForceVectorNode.setVisible( false );

  // @private repulsive force node
  this.repulsiveForceVectorNode = new DimensionalArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, merge( {
    fill: REPULSIVE_FORCE_COLOR
  }, commonForceArrowNodeOptions ) );
  this.addChild( this.repulsiveForceVectorNode );
  this.repulsiveForceVectorNode.setVisible( false );

  // @private total force node
  this.totalForceVectorNode = new DimensionalArrowNode( 0, 0, TOTAL_FORCE_ARROW_REFERENCE_LENGTH, 0, merge( {
    fill: TOTAL_FORCE_COLOR
  }, commonForceArrowNodeOptions ) );
  this.addChild( this.totalForceVectorNode );
  this.totalForceVectorNode.setVisible( false );

  function handlePositionChanged( position ) {
    self.setTranslation(
      modelViewTransform.modelToViewX( position.x ),
      modelViewTransform.modelToViewY( position.y )
    );
  }

  particle.positionProperty.link( handlePositionChanged );

  // dispose function
  this.disposeParticleForceNode = function() {
    particle.positionProperty.unlink( handlePositionChanged );
  };
}

statesOfMatter.register( 'ParticleForceNode', ParticleForceNode );

export default inherit( ParticleNode, ParticleForceNode, {

  /**
   * @public
   */
  dispose: function() {
    this.disposeParticleForceNode();
    ParticleNode.prototype.dispose.call( this );
  },

  /**
   * Set the levels of attractive and repulsive forces being experienced by the particle in the model so that they may
   * be represented as force vectors.
   * @param {number}attractiveForce
   * @param {number}repulsiveForce
   * @public
   */
  setForces: function( attractiveForce, repulsiveForce ) {
    this.attractiveForce = attractiveForce;
    this.repulsiveForce = repulsiveForce;
    this.updateForceVectors();
  },

  /**
   * @param {boolean} showAttractiveForces - true to show attractive force, false to hide
   * @public
   */
  setShowAttractiveForces: function( showAttractiveForces ) {
    this.attractiveForceVectorNode.setVisible( showAttractiveForces );
  },

  /**
   * @param {boolean} showRepulsiveForces - true to show repulsive force, false to hide
   * @public
   */
  setShowRepulsiveForces: function( showRepulsiveForces ) {
    this.repulsiveForceVectorNode.setVisible( showRepulsiveForces );
  },

  /**
   * @param {boolean} showTotalForce - true to show total force, false to hide
   * @public
   */
  setShowTotalForces: function( showTotalForce ) {
    this.totalForceVectorNode.setVisible( showTotalForce );
  },

  /**
   * Update the force vectors to reflect the forces being experienced by the atom.
   * @private
   */
  updateForceVectors: function() {
    const angle = 0;
    const attractiveY = this.attractiveForce * Math.sin( angle ) *
                        ( COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE );
    const attractiveX = this.attractiveForce * Math.cos( angle ) *
                        ( COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE );
    this.attractiveForceVectorNode.setTailAndTip( 0, 0, attractiveX, attractiveY );

    const repulsiveY = this.repulsiveForce * Math.sin( angle ) *
                       ( COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE );
    const repulsiveX = this.repulsiveForce * Math.cos( angle ) *
                       ( COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE );
    this.repulsiveForceVectorNode.setTailAndTip( 0, 0, repulsiveX, repulsiveY );

    const totalForceY = ( this.attractiveForce + this.repulsiveForce ) * Math.sin( angle ) *
                        ( TOTAL_FORCE_ARROW_REFERENCE_LENGTH / TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE );
    const totalForceX = ( this.attractiveForce + this.repulsiveForce ) * Math.cos( angle ) *
                        ( TOTAL_FORCE_ARROW_REFERENCE_LENGTH / TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE );
    this.totalForceVectorNode.setTailAndTip( 0, 0, totalForceX, totalForceY );
  }
} );