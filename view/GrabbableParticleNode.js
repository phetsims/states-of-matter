// Copyright 2002-2011, University of Colorado
/**
 * This extension of the ParticleNode class allows users to grab the node and
 * move it, thus changing the position within the underlying model.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ParticleForceNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/ParticleForceNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * Default constructor
   * @param {HandNode} handNode - view for the hand node
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {StatesOfMatterAtom} particle
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {Boolean} useGradient - true to use a gradient when displaying the node, false if not.
   * @param {Boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @param {Number} minX - grabbable particle  min x position
   * @param {Number} maxX - grabbable particle  max x position
   * @constructor
   */
  function GrabbableParticleNode( handNode, dualAtomModel, particle, modelViewTransform, useGradient, enableOverlap, minX, maxX ) {


    ParticleForceNode.call( this, particle, modelViewTransform, useGradient, enableOverlap );

    this.minX = minX;
    this.maxX = maxX;
    var grabbableParticleNode = this;

    // This node will need to be pickable so the user can grab it.
    this.setPickable( true );

    // Put a cursor handler into place.
    this.cursor = 'pointer';
    var startDragX;
    var endDragX;
    var initialStartX = this.x;
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        // Stop the model from moving the particle at the same time the user
        // is moving it.
        dualAtomModel.setMotionPaused( true );
        initialStartX = grabbableParticleNode.x;
        startDragX = grabbableParticleNode.globalToParentPoint( event.pointer.point ).x;
      },
      drag: function( event ) {
        // Only allow the user to move unbonded atoms.
        if ( dualAtomModel.getBondingState() !== dualAtomModel.BONDING_STATE_UNBONDED ) {
          // Need to release the bond before we can move the atom.
          dualAtomModel.releaseBond();
        }
        endDragX = grabbableParticleNode.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        // Make sure we don't exceed the positional limits.
        var newPosX = initialStartX + d;
        if ( newPosX > grabbableParticleNode.maxX ) {
          newPosX = grabbableParticleNode.maxX;
        }
        else if ( newPosX < grabbableParticleNode.minX ) {
          newPosX = grabbableParticleNode.minX;
        }
        // Move the particle based on the amount of mouse movement.
        grabbableParticleNode.particle.setPosition( modelViewTransform.viewToModelX( newPosX ),
          particle.positionProperty.value.y );
      },
      end: function() {
        // Let the model move the particles again.  Note that this happens
        // even if the motion was paused by some other means.
        dualAtomModel.setMotionPaused( false );
        handNode.setVisible( false );
      }
    } ) );
  }

  return inherit( ParticleForceNode, GrabbableParticleNode, {

    getMinX: function() {
      return this.minX;
    },

    /**
     *
     * @param {Number} minX - min x position
     */
    setMinX: function( minX ) {
      this.minX = minX;
    },


    getMaxX: function() {
      return this.maxX;
    },

    /**
     *
     * @param {Number} maxX - grabbable particle  max x position
     */
    setMaxX: function( maxX ) {
      this.maxX = maxX;
    }
  } );
} );
