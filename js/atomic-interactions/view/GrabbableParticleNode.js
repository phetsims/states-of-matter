// Copyright 2015-2020, University of Colorado Boulder

/**
 * This extension of the ParticleNode class allows users to grab the node and move it, thus changing the position
 * within the underlying model.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import inherit from '../../../../phet-core/js/inherit.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import statesOfMatter from '../../statesOfMatter.js';
import ParticleForceNode from './ParticleForceNode.js';

/**
 * @param {DualAtomModel} dualAtomModel - model of the simulation
 * @param {ScaledAtom} particle
 * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
 * @param {boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
 * @param {number} minX - grabbable particle  min x position
 * @param {Tandem} tandem - support for exporting instances from the sim
 * @constructor
 */
function GrabbableParticleNode( dualAtomModel, particle, modelViewTransform, enableOverlap, minX, tandem ) {

  ParticleForceNode.call( this, particle, modelViewTransform, enableOverlap, tandem );
  const self = this;

  // @private
  this.minX = minX;

  // This node will need to be pickable so the user can grab it.
  this.setPickable( true );

  // Put a cursor handler into place.
  this.cursor = 'pointer';

  let startDragX;
  let endDragX;
  let initialStartX = this.x;

  const inputListener = new DragListener( {
    allowTouchSnag: true,

    start: event => {

      // Stop the model from moving the particle at the same time the user is moving it.
      dualAtomModel.setMotionPaused( true );
      initialStartX = self.x;
      startDragX = self.globalToParentPoint( event.pointer.point ).x;
    },

    drag: event => {

      endDragX = self.globalToParentPoint( event.pointer.point ).x;
      const d = endDragX - startDragX;

      // Make sure we don't exceed the positional limits.
      const newPosX = Math.max( initialStartX + d, self.minX );

      // Move the particle based on the amount of mouse movement.
      self.particle.setPosition( modelViewTransform.viewToModelX( newPosX ), particle.positionProperty.value.y );
    },

    end: event => {

      // Let the model move the particles again.  Note that this happens even if the motion was paused by some other
      // means.
      dualAtomModel.setMotionPaused( false );
      dualAtomModel.movementHintVisibleProperty.set( false );
    },

    tandem: tandem.createTandem( 'dragListener' )
  } );

  this.addInputListener( inputListener );

  // dispose function
  this.disposeGrabbableParticleNode = function() {
    self.removeInputListener( inputListener );
  };
}

statesOfMatter.register( 'GrabbableParticleNode', GrabbableParticleNode );

export default inherit( ParticleForceNode, GrabbableParticleNode, {

  /**
   * @public
   */
  dispose: function() {
    this.disposeGrabbableParticleNode();
    ParticleForceNode.prototype.dispose.call( this );
  },

  /**
   * @returns {number}
   * @public
   */
  getMinX: function() {
    return this.minX;
  },

  /**
   * @param {number} minX - min x position
   * @public
   */
  setMinX: function( minX ) {
    this.minX = minX;
  }
} );