// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class represents a node that looks like a large finger, which can be
 * used to push down on things.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  //images
  var pointingHandImage = require( 'image!STATES_OF_MATTER/pointing-hand.png' );

  /**
   *
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinate frames
   * @constructor
   */
  function PointingHandNode( multipleParticleModel, modelViewTransform ) {

    var pointingHandNode = this;
    Node.call( this );
    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;
    this.mouseOver = false;
    this.beingDragged = false;

    // Add the up arrow.
    this.upArrowNode = new ArrowNode( 0, 0, 0, 25, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true,
      rotation: 2 * Math.PI / 2
    } );

    // Add the down arrow.
    this.downArrow = new ArrowNode( 0, 0, 0, 25, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true,
      top: this.upArrowNode.bottom + 5
    } );

    // Load and scale the image.  Scale was empirically determined.
    this.fingerImageNode = new Image( pointingHandImage, { scale: 0.5, cursor: 'ns-resize', pickable: true } );

    this.hintNode = new Node( {
      children: [ this.upArrowNode, this.downArrow ],
      visible: false,
      top: this.fingerImageNode.bottom - 50,
      left: this.fingerImageNode.right
    } );

    // Set ourself up to listen for and handle mouse dragging events.
    var startY;
    var endY;

    this.fingerImageNode.addInputListener( new SimpleDragHandler(
      {
        allowTouchSnag: true,
        start: function( event ) {
          startY = pointingHandNode.globalToParentPoint( event.pointer.point ).y;
          pointingHandNode.beingDragged = true;
          pointingHandNode.containerSizeAtDragStart = multipleParticleModel.getParticleContainerHeight();
          pointingHandNode.updateHintVisibility();

        },
        drag: function( event ) {
          endY = pointingHandNode.globalToParentPoint( event.pointer.point ).y;

          // Resize the container based on the amount that the node has moved.
          multipleParticleModel.setTargetParticleContainerHeight(
            pointingHandNode.containerSizeAtDragStart + modelViewTransform.viewToModelDeltaY( endY - startY ) );
          pointingHandNode.updateHintVisibility();
        },
        end: function() {

          // Set the target size to the current size, which will stop any change
          // in size that is currently underway.
          multipleParticleModel.setTargetParticleContainerHeight( multipleParticleModel.getParticleContainerHeight() );
          pointingHandNode.beingDragged = false;
          pointingHandNode.updateHintVisibility();
        }
      } ) );
    this.fingerImageNode.addInputListener( {
      enter: function() {
        pointingHandNode.mouseOver = true;
        pointingHandNode.updateHintVisibility();
      },
      exit: function() {
        pointingHandNode.mouseOver = false;
        pointingHandNode.updateHintVisibility();
      }
    } );
    // Add the finger node as a child.
    this.addChild( this.fingerImageNode );
    this.addChild( this.hintNode );
    //multipleParticleModel.particleContainerHeightProperty.link( function() {
    //  pointingHandNode.handleContainerSizeChanged();
    //  pointingHandNode.updateArrowVisibility();
    //} );
    this.touchArea = this.localBounds.dilatedXY( 10, 10 );
  }

  statesOfMatter.register( 'PointingHandNode', PointingHandNode );

  return inherit( Node, PointingHandNode, {

    /**
     * @public
     */
    updateArrowVisibility: function() {

      if ( this.multipleParticleModel.getParticleContainerHeight() === StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT ) {

        // At the height limit, so only show the down arrow.
        this.upArrowNode.setVisible( false );
      }
      else if ( this.multipleParticleModel.getParticleContainerHeight() === 0 ) {

        // Particle container all the way down, so show only the up arrow.
        this.upArrowNode.setVisible( false );
      }
      else {
        this.upArrowNode.setVisible( true );
      }
    },

    /**
     * @public
     */
    handleContainerSizeChanged: function() {
      var containerHeight = this.multipleParticleModel.getParticleContainerHeight();
      if ( !this.multipleParticleModel.getContainerExploded() ) {
        this.y = Math.abs( this.modelViewTransform.modelToViewDeltaY( StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                 containerHeight ) ) - this.height + 20;
      }
      else {

        // If the container is exploding that hand is retracted more
        // quickly.
        this.y = -this.modelViewTransform.modelToViewDeltaY( StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                 ( containerHeight * 2 ) ) - this.height;
      }
    },

    /**
     * @public
     */
    updateHintVisibility: function() {
      this.hintNode.setVisible( this.mouseOver || this.beingDragged );
    }
  } );
} );

