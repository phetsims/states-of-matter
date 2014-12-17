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
  var Vector2 = require( 'DOT/Vector2' );
  var ParticleForceNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/ParticleForceNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * Constructor.
   *
   * @param particle      - The particle within the model.
   * @param mvt           - Model-view transform.
   * @param enableOverlap TODO
   * @param minX          - Minimum value in the X direction to which the particle can be moved.
   * @param maxX          - Maximum value in the X direction to which the particle can be moved.
   */
  function GrabbableParticleNode( model, particle, mvt, useGradient, enableOverlap, minX, maxX ) {


    ParticleForceNode.call( this, particle, mvt, useGradient, enableOverlap );
    this.model = model;
    this.minX = minX;
    this.maxX = maxX;
    var grabbableParticleNode = this;

    // This node will need to be pickable so the user can grab it.
    this.setPickable( true );
    //this.setChildrenPickable( true );

    // Put a cursor handler into place.
    this.cursor = 'pointer';
    var startDragX, endDragX;
    this.addInputListener( new SimpleDragHandler( {
      start: function( event ) {
        // Stop the model from moving the particle at the same time the user
        // is moving it.
        model.setMotionPaused( true );
        startDragX = grabbableParticleNode.globalToParentPoint( event.pointer.point ).x;
      },
      drag: function( event ) {
        // Only allow the user to move unbonded atoms.
        if ( model.getBondingState() != model.BONDING_STATE_UNBONDED ) {
          // Need to release the bond before we can move the atom.
          model.releaseBond();
        }
        endDragX = grabbableParticleNode.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;
        // Make sure we don't exceed the positional limits.
        var newPosX = mvt.modelToViewX( grabbableParticleNode.particle.positionProperty.value.x ) + d;
        if ( newPosX > maxX ) {
          newPosX = maxX;
        }
        else if ( newPosX < minX ) {
          newPosX = minX;
        }
        particle.positionProperty.value = new Vector2( mvt.viewToModelX( newPosX ),
          mvt.viewToModelY( grabbableParticleNode.y ) );
        // Move the particle based on the amount of mouse movement.
        //grabbableParticleNode.particle.setPosition( mvt.viewToModelX(newPosX), grabbableParticleNode.particle.positionProperty.get().y );
        grabbableParticleNode.setTranslation( newPosX, grabbableParticleNode.y );
      },
      end: function() {
        // Let the model move the particles again.  Note that this happens
        // even if the motion was paused by some other means.
        model.setMotionPaused( false );
      }
    } ) );
    grabbableParticleNode.particle.positionProperty.link( function( position ) {
      //  grabbableParticleNode.setTranslation(position.x,grabbableParticleNode.y );
    } );
  }

  return inherit( ParticleForceNode, GrabbableParticleNode, {

    getMinX: function() {
      return this.minX;
    },


    setMinX: function( minX ) {
      this.minX = minX;
    },


    getMaxX: function() {
      return this.maxX;
    },


    setMaxX: function( maxX ) {
      this.maxX = maxX;
    }
  } );
} );
