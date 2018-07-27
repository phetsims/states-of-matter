// Copyright 2015-2017, University of Colorado Boulder

/**
 * This extension of the ParticleNode class allows users to grab the node and move it, thus changing the position
 * within the underlying model.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ParticleForceNode = require( 'STATES_OF_MATTER/atomic-interactions/view/ParticleForceNode' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {SOMAtom} particle
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @param {number} minX - grabbable particle  min x position
   * @constructor
   */
  function GrabbableParticleNode( dualAtomModel, particle, modelViewTransform, enableOverlap, minX ) {

    ParticleForceNode.call( this, particle, modelViewTransform, enableOverlap );
    var self = this;

    // @private
    this.minX = minX;
    this.dualAtomModel = dualAtomModel;

    // This node will need to be pickable so the user can grab it.
    this.setPickable( true );

    // Put a cursor handler into place.
    this.cursor = 'pointer';

    var startDragX;
    var endDragX;
    var initialStartX = this.x;

    this.addInputListener( new SimpleDragHandler( {

      start: function( event ) {

        // Stop the model from moving the particle at the same time the user is moving it.
        dualAtomModel.setMotionPaused( true );
        initialStartX = self.x;
        startDragX = self.globalToParentPoint( event.pointer.point ).x;
      },

      drag: function( event ) {

        endDragX = self.globalToParentPoint( event.pointer.point ).x;
        var d = endDragX - startDragX;

        // Make sure we don't exceed the positional limits.
        var newPosX = Math.max( initialStartX + d, self.minX );

        // Move the particle based on the amount of mouse movement.
        self.particle.setPosition( modelViewTransform.viewToModelX( newPosX ), particle.positionProperty.value.y );
      },

      end: function() {
        // Let the model move the particles again.  Note that this happens even if the motion was paused by some other
        // means.
        dualAtomModel.setMotionPaused( false );
        dualAtomModel.movementHintVisibleProperty.set( false );
      }
    } ) );

    this.positionChanged = false;
    particle.positionProperty.link( function() {
      self.positionChanged = true;
    } );
  }

  statesOfMatter.register( 'GrabbableParticleNode', GrabbableParticleNode );

  return inherit( ParticleForceNode, GrabbableParticleNode, {

    /**
     * @public
     */
    step: function(){
      if( this.positionChanged ){
        if ( !this.dualAtomModel.isPlayingProperty.get() ) {
          this.dualAtomModel.positionChanged();
        }
        this.positionChanged = false;
      }
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
} );
