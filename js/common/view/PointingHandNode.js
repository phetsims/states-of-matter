// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class represents a node that looks like a large finger, which can be
 * used to push down on things.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  const Node = require( 'SCENERY/nodes/Node' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // images
  const pointingHandImage = require( 'mipmap!STATES_OF_MATTER/pointing-hand.png' );

  // constants
  var WIDTH = 150; // in screen coords

  /**
   *
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinate frames
   * @constructor
   */
  function PointingHandNode( multipleParticleModel, modelViewTransform, options ) {

    var self = this;
    Node.call( this );

    // Add the up arrow.
    var upArrowNode = new ArrowNode( 0, 0, 0, 25, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true,
      rotation: 2 * Math.PI / 2
    } );

    // Add the down arrow.
    var downArrowNode = new ArrowNode( 0, 0, 0, 25, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true,
      top: upArrowNode.bottom + 5
    } );

    // Load and scale the image.  Scale was empirically determined.
    var pointingHandImageNode = new Image( pointingHandImage, {
      cursor: 'ns-resize',
      pickable: true
    } );
    pointingHandImageNode.scale( WIDTH / pointingHandImageNode.width );

    var hintNode = new Node( {
      children: [ upArrowNode, downArrowNode ],
      visible: false,
      top: pointingHandImageNode.bottom - 50, // adjusted a bit for better look
      left: pointingHandImageNode.right - 20 // adjusted a bit for better look
    } );

    var mouseOver = false;
    var beingDragged = false;

    function updateHintVisibility() {
      hintNode.setVisible( mouseOver || beingDragged );
    }

    // Set ourself up to listen for and handle mouse dragging events.
    var startY;
    var endY;
    var containerSizeAtDragStart;

    // add a listener to handle drag events
    pointingHandImageNode.addInputListener( new SimpleDragHandler( {

      allowTouchSnag: true,

      start: function( event ) {
        startY = self.globalToParentPoint( event.pointer.point ).y;
        beingDragged = true;
        containerSizeAtDragStart = multipleParticleModel.particleContainerHeightProperty.get();
        updateHintVisibility();

      },

      drag: function( event ) {
        endY = self.globalToParentPoint( event.pointer.point ).y;

        // Resize the container based on the amount that the node has moved.
        multipleParticleModel.setTargetParticleContainerHeight(
          containerSizeAtDragStart + modelViewTransform.viewToModelDeltaY( endY - startY )
        );
        updateHintVisibility();
      },

      end: function() {

        // Set the target size to the current size, which will stop any change in size that is currently underway.
        multipleParticleModel.setTargetParticleContainerHeight(
          multipleParticleModel.particleContainerHeightProperty.get()
        );
        beingDragged = false;
        updateHintVisibility();
      }
    } ) );

    // add the listener that will show and hide the hint
    this.addInputListener( {
      enter: function() {
        mouseOver = true;
        updateHintVisibility();
      },
      exit: function() {
        mouseOver = false;
        updateHintVisibility();
      }
    } );

    // Add the child nodes.
    this.addChild( pointingHandImageNode );
    this.addChild( hintNode );

    // Expand the touch area.
    this.touchArea = this.localBounds.dilatedXY( 10, 10 );

    // Add a listener to update the individual arrow visibility.
    multipleParticleModel.particleContainerHeightProperty.link( function( particleContainerHeight ) {
      if ( particleContainerHeight === MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT ) {

        // At the height limit, so only show the down arrow.
        upArrowNode.setVisible( false );
        downArrowNode.setVisible( true );
      }
      else if ( particleContainerHeight === MultipleParticleModel.PARTICLE_CONTAINER_MIN_HEIGHT ) {

        // Particle container all the way down, so show only the up arrow.
        upArrowNode.setVisible( true );
        downArrowNode.setVisible( false );
      }
      else {
        upArrowNode.setVisible( true );
        downArrowNode.setVisible( true );
      }
    } );

    // Set a value that will be used to position the fingertip.
    this.fingertipToBottomDistanceY = hintNode.bottom - pointingHandImageNode.bottom;

    this.mutate( options );
  }

  statesOfMatter.register( 'PointingHandNode', PointingHandNode );

  return inherit( Node, PointingHandNode, {

    /**
     * Set the position of this node such that the tip of the finger is at the provided Y location.  The x position
     * remains unchanged.
     * @param {number} fingertipYPos
     * @public
     */
    setFingertipYPosition: function( fingertipYPos ) {
      this.bottom = fingertipYPos + this.fingertipToBottomDistanceY;
    }
  } );
} );

