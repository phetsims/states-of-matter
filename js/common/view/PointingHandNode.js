// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class represents a node that looks like a large finger, which can be
 * used to push down on things.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var Node = require( 'SCENERY/nodes/Node' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // images
  var pointingHandImage = require( 'mipmap!STATES_OF_MATTER/pointing-hand.png' );

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
    this.downArrowNode = new ArrowNode( 0, 0, 0, 25, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true,
      top: this.upArrowNode.bottom + 5
    } );

    // Load and scale the image.  Scale was empirically determined.
    this.pointingHandImageNode = new Image( pointingHandImage, {
      cursor: 'ns-resize',
      pickable: true
    } );
    this.pointingHandImageNode.scale( WIDTH / this.pointingHandImageNode.width );

    this.hintNode = new Node( {
      children: [ this.upArrowNode, this.downArrowNode ],
      visible: false,
      top: this.pointingHandImageNode.bottom - 50, // adjusted a bit for better look
      left: this.pointingHandImageNode.right - 20 // adjusted a bit for better look
    } );

    // Set ourself up to listen for and handle mouse dragging events.
    var startY;
    var endY;

    // add a listener to handle drag events
    this.pointingHandImageNode.addInputListener( new SimpleDragHandler( {
      allowTouchSnag: true,
      start: function( event ) {
        startY = self.globalToParentPoint( event.pointer.point ).y;
        self.beingDragged = true;
        self.containerSizeAtDragStart = multipleParticleModel.getParticleContainerHeight();
        self.updateHintVisibility();

      },
      drag: function( event ) {
        endY = self.globalToParentPoint( event.pointer.point ).y;

        // Resize the container based on the amount that the node has moved.
        multipleParticleModel.setTargetParticleContainerHeight(
          self.containerSizeAtDragStart + modelViewTransform.viewToModelDeltaY( endY - startY )
        );
        self.updateHintVisibility();
      },
      end: function() {

        // Set the target size to the current size, which will stop any change in size that is currently underway.
        multipleParticleModel.setTargetParticleContainerHeight( multipleParticleModel.getParticleContainerHeight() );
        self.beingDragged = false;
        self.updateHintVisibility();
      }
    } ) );

    // add the listener that will show and hide the hint
    this.pointingHandImageNode.addInputListener( {
      enter: function() {
        self.mouseOver = true;
        self.updateHintVisibility();
      },
      exit: function() {
        self.mouseOver = false;
        self.updateHintVisibility();
      }
    } );

    // Add the image node as a child.
    this.addChild( this.pointingHandImageNode );
    this.addChild( this.hintNode );
    this.touchArea = this.localBounds.dilatedXY( 10, 10 );

    // Add a listener to update the individual arrow visibility.
    multipleParticleModel.particleContainerHeightProperty.link( function( particleContainerHeight ) {
      if ( particleContainerHeight === MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT ) {

        // At the height limit, so only show the down arrow.
        self.upArrowNode.setVisible( false );
        self.downArrowNode.setVisible( true );
      }
      else if ( particleContainerHeight === MultipleParticleModel.PARTICLE_CONTAINER_MIN_HEIGHT ) {

        // Particle container all the way down, so show only the up arrow.
        self.upArrowNode.setVisible( true );
        self.downArrowNode.setVisible( false );
      }
      else {
        self.upArrowNode.setVisible( true );
        self.downArrowNode.setVisible( true );
      }
    } );

    this.mutate( options );
  }

  statesOfMatter.register( 'PointingHandNode', PointingHandNode );

  return inherit( Node, PointingHandNode, {

    /**
     * Set the position of this node such that the tip of the finger is at the provided Y location.
     * @param {number} fingerYPos
     * @public
     */
    setFingertipYPosition: function( fingertipYPos ) {
      this.bottom = fingertipYPos + ( this.hintNode.bottom - this.pointingHandImageNode.bottom );
    },

    /**
     * @public
     */
    updateHintVisibility: function() {
      this.hintNode.setVisible( this.mouseOver || this.beingDragged );
    }
  } );
} );

