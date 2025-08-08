// Copyright 2015-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * this type adds the ability to display force arrows to a particle node
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import MotionAtom from '../model/MotionAtom.js';
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

class ParticleForceNode extends ParticleNode {

  private attractiveForce: number;
  private repulsiveForce: number;

  // attractive force node
  private readonly attractiveForceVectorNode: DimensionalArrowNode;

  // repulsive force node
  private readonly repulsiveForceVectorNode: DimensionalArrowNode;

  // total force node
  private readonly totalForceVectorNode: DimensionalArrowNode;

  // dispose function
  private readonly disposeParticleForceNode: () => void;

  /**
   * @param particle - The particle in the model that this node will represent in the view.
   * @param modelViewTransform to convert between model and view co-ordinates
   * The gradient is computationally intensive to create, so use only when needed.
   * @param enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @param tandem - support for exporting instances from the sim
   */
  public constructor( particle: MotionAtom, modelViewTransform: ModelViewTransform2, enableOverlap: boolean, tandem: Tandem ) {

    super( particle, modelViewTransform, enableOverlap, tandem );

    this.attractiveForce = 0;
    this.repulsiveForce = 0;

    const commonForceArrowNodeOptions = {
      pickable: false,
      headHeight: FORCE_ARROW_HEAD_LENGTH,
      headWidth: FORCE_ARROW_HEAD_WIDTH,
      tailWidth: FORCE_ARROW_TAIL_WIDTH,
      opacity: 0.7 // empirically determined
    };

    this.attractiveForceVectorNode = new DimensionalArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, merge( {
      fill: ATTRACTIVE_FORCE_COLOR
    }, commonForceArrowNodeOptions ) );
    this.addChild( this.attractiveForceVectorNode );
    this.attractiveForceVectorNode.setVisible( false );

    this.repulsiveForceVectorNode = new DimensionalArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, merge( {
      fill: REPULSIVE_FORCE_COLOR
    }, commonForceArrowNodeOptions ) );
    this.addChild( this.repulsiveForceVectorNode );
    this.repulsiveForceVectorNode.setVisible( false );

    this.totalForceVectorNode = new DimensionalArrowNode( 0, 0, TOTAL_FORCE_ARROW_REFERENCE_LENGTH, 0, merge( {
      fill: TOTAL_FORCE_COLOR
    }, commonForceArrowNodeOptions ) );
    this.addChild( this.totalForceVectorNode );
    this.totalForceVectorNode.setVisible( false );

    const handlePositionChanged = position => {
      this.setTranslation(
        modelViewTransform.modelToViewX( position.x ),
        modelViewTransform.modelToViewY( position.y )
      );
    };

    particle.positionProperty.link( handlePositionChanged );

    this.disposeParticleForceNode = () => {
      particle.positionProperty.unlink( handlePositionChanged );
    };
  }

  public dispose(): void {
    this.disposeParticleForceNode();
    super.dispose();
  }

  /**
   * Set the levels of attractive and repulsive forces being experienced by the particle in the model so that they may
   * be represented as force vectors.
   */
  public setForces( attractiveForce: number, repulsiveForce: number ): void {
    this.attractiveForce = attractiveForce;
    this.repulsiveForce = repulsiveForce;
    this.updateForceVectors();
  }

  /**
   * @param showAttractiveForces - true to show attractive force, false to hide
   */
  public setShowAttractiveForces( showAttractiveForces: boolean ): void {
    this.attractiveForceVectorNode.setVisible( showAttractiveForces );
  }

  /**
   * @param showRepulsiveForces - true to show repulsive force, false to hide
   */
  public setShowRepulsiveForces( showRepulsiveForces: boolean ): void {
    this.repulsiveForceVectorNode.setVisible( showRepulsiveForces );
  }

  /**
   * @param showTotalForce - true to show total force, false to hide
   */
  public setShowTotalForces( showTotalForce: boolean ): void {
    this.totalForceVectorNode.setVisible( showTotalForce );
  }

  /**
   * Update the force vectors to reflect the forces being experienced by the atom.
   */
  private updateForceVectors(): void {
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
}

statesOfMatter.register( 'ParticleForceNode', ParticleForceNode );
export default ParticleForceNode;