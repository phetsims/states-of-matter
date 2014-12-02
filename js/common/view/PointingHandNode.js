// Copyright 2002-2011, University of Colorado
/**
 * This class represents a node that looks like a large finger, which can be
 * used to push down on things.
 */
define( function( require ) {
  'use strict';

  // modules
  var Vector2 = require( 'DOT/Vector2' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Mouse = require( 'SCENERY/input/Mouse' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Image = require( 'SCENERY/nodes/Image' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var HighlightListener = require( 'SCENERY_PHET/input/HighlightListener' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );


  //images
  var fingerImage = require( 'image!STATES_OF_MATTER/finger-4.png' );

// Width of the finger node as a proportion of the width of the particle
// container.

  var HAND_NODE_WIDTH_PROPORTION = 0.55;
// Horizontal position of the node as function of the container width.

  var NODE_X_POS_PROPORTION = 0.30;
// File name of the primary image.
  var PRIMARY_IMAGE = "finger-4.png";


  var ARROW_COLOR = Color.GREEN;


  var INVISIBLE_ARROW_COLOR = new Color( 0, 0, 0, 0 );


  var ARROW_LENGTH = 1000;


  var ARROW_HEAD_WIDTH = 1000;


  var ARROW_HEAD_HEIGHT = 500;


  var ARROW_TAIL_WIDTH = 500;

  var DISTANCE_BETWEEN_ARROWS = 250;


  function PointingHandNode( model ) {

    var pointingHandNode = this;
    Node.call( this );
    this.model = model;
    this.mouseMovementAmount;
    this.containerSizeAtDragStart;
    this.mouseOver = false;
    this.beingDragged = false;
    this.hintNode = new Node();

    this.model = model;

    // Add the up arrow.
    this.upArrowNode = new ArrowNode( 0, -20, 0, 20, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true
    } );
    this.upArrowNode.setRotation( 2 * Math.PI / 2 );

    this.hintNode.addChild( this.upArrowNode );

    // Add the down arrow.
    this.downArrow = new ArrowNode( 0, -20, 0, 20, {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 6,
      fill: '#33FF00',
      stroke: '#33FF00',
      pickable: true
    } );
    this.downArrow.top = this.upArrowNode.bottom + 5;
    this.hintNode.addChild( this.downArrow );
    this.hintNode.setVisible( false );
    var containerRect = model.getParticleContainerRect();
    var desiredHandWidth = containerRect.getWidth() * HAND_NODE_WIDTH_PROPORTION;
    /*// Listen to the model for notifications of changes to the container size.
     m_model.addListener(new MultipleParticleModel.Adapter().withAnonymousClassBody( {
     containerSizeChanged: function() {
     handleContainerSizeChanged();
     }
     }));*/

    // Load and scale the image.
    this.fingerImageNode = new Image( fingerImage, { scale: 0.5, cursor: 'pointer', pickable: true} )
    var scale = desiredHandWidth / this.fingerImageNode.width;
    //this.fingerImageNode.setScale( scale );
    /*  this.fingerImageNode.addInputListener( new Mouse({
     over:function( point, event){
     //   pointingHandNode.hintNode.setVisible(true);
     console.log('gdhgf call');
     },out:function( point, event){
     pointingHandNode.hintNode.setVisible(false);
     }
     })
     );*/
    /*   this.fingerImageNode.addInputListener( new SimpleDragHandler(
     {
     start: function( event ) {
     var startY = pointingHandNode.fingerImageNode.globalToParentPoint( event.pointer.point ).y;
     pointingHandNode.hintNode.setVisible( true );
     },
     drag: function( event ) {
     //  this.hintNode
     pointingHandNode.hintNode.setVisible( true );
     }, end: function( event ) {
     pointingHandNode.hintNode.setVisible( false );
     }
     } ) );*/

    /* m_fingerImageNode.addInputEventListener(new CursorHandler(Cursor.N_RESIZE_CURSOR));
     // placed the mouse over the finger.
     m_hintNode = new MovementHintNode(m_model).withAnonymousClassBody( {
     initializer:function(){
     // coded values were empirically determined.
     setOffset(m_fingerImageNode.getFullBoundsReference().getMaxX() + 150, m_fingerImageNode.getFullBoundsReference().getMaxY() - getFullBoundsReference().getHeight() - 1000);
     setVisible(false);
     }
     });*/
    //  addChild(m_hintNode);
    // Create a listener that tracks whether the user's mouse is over this node.
    /* m_fingerImageNode.addInputEventListener(new PBasicInputEventHandler().withAnonymousClassBody( {
     mouseEntered: function( event) {
     m_mouseOver = true;
     updateHintVisibility();
     },
     mouseExited: function( event) {
     m_mouseOver = false;
     updateHintVisibility();
     }
     }));*/
    // Set ourself up to listen for and handle mouse dragging events.
    var startY, endY;
    this.fingerImageNode.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          startY = pointingHandNode.fingerImageNode.globalToParentPoint( event.pointer.point ).y;
          //  this.handleMouseStartDragEvent();
          pointingHandNode.beingDragged = true;
          pointingHandNode.mouseMovementAmount = 0;
          pointingHandNode.containerSizeAtDragStart = pointingHandNode.model.getParticleContainerHeight();
          pointingHandNode.updateHintVisibility();
          console.log( 'start  y' + startY );

        },
        drag: function( event ) {
          endY = pointingHandNode.fingerImageNode.globalToParentPoint( event.pointer.point ).y
          var d = Math.abs( startY - endY );

          console.log( 'end y' + endY );
          //console.log(d);
          pointingHandNode.mouseMovementAmount += d;
          // Resize the container based on the amount that the node has moved.
          pointingHandNode.model.setTargetParticleContainerHeight( pointingHandNode.containerSizeAtDragStart -
                                                                   pointingHandNode.mouseMovementAmount );
        }, end: function( event ) {
        // this.handleMouseEndDragEvent();
        // in size that is currently underway.
        pointingHandNode.model.setTargetParticleContainerHeight( pointingHandNode.model.getParticleContainerHeight() );
        pointingHandNode.beingDragged = false;
        pointingHandNode.updateHintVisibility();
      }
      } ) );

    /*  m_fingerImageNode.addInputEventListener(new PDragEventHandler().withAnonymousClassBody( {
     startDrag: function( event) {
     super.startDrag(event);
     handleMouseStartDragEvent();
     },
     drag: function( event) {
     handleMouseDragEvent(event);
     },
     endDrag: function( event) {
     super.endDrag(event);
     handleMouseEndDragEvent();
     }
     }));*/
    // Add the finger node as a child.
    this.addChild( this.fingerImageNode );
    this.addChild( this.hintNode );
    model.targetContainerHeightProperty.link( function( containerHeight ) {
      //pointingHandNode.handleContainerSizeChanged();
    } );
    // Set our initial offset.
    //pointingHandNode.setTranslation( containerRect.getX() + containerRect.getWidth() * NODE_X_POS_PROPORTION, -this.height );
  }

  return inherit( Node, PointingHandNode, {
    updateArrowVisibility: function() {
      if ( this.model.getParticleContainerHeight() == StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT ) {
        // At the height limit, so only show the down arrow.
        this.upArrowNode.setVisible( false );
      }
      else if ( this.model.getParticleContainerHeight() == 0 ) {
        // Particle container all the way down, so show only the up arrow.
        this.upArrowNode.setVisible( false );
      }
      else {
        this.upArrowNode.setVisible( true );
        this.upArrowNode.setVisible( true );
      }
    },
    handleMouseDragEvent: function( event ) {
      /* var draggedNode = event.getPickedNode();
       var d = event.getDeltaRelativeTo(draggedNode);
       draggedNode.localToParent(d);*/
      var d = 0;
      this.mouseMovementAmount += d;
      // Resize the container based on the amount that the node has moved.
      this.model.setTargetParticleContainerHeight( this.containerSizeAtDragStart - this.mouseMovementAmount );
    },

    //private
    handleMouseStartDragEvent: function() {
      this.beingDragged = true;
      this.mouseMovementAmount = 0;
      this.containerSizeAtDragStart = this.model.getParticleContainerHeight();
      this.updateHintVisibility();
    },

    //private
    handleMouseEndDragEvent: function() {
      // in size that is currently underway.
      this.model.setTargetParticleContainerHeight( this.model.getParticleContainerHeight() );
      this.beingDragged = false;
      this.updateHintVisibility();
    },

    //private
    handleContainerSizeChanged: function() {
      var containerRect = this.model.getParticleContainerRect();
      if ( !this.model.getContainerExploded() ) {
        this.setTranslation( this.x,
            StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT - containerRect.getHeight() - this.height );
      }
      else {
        // quickly.
        this.setTranslation( this.x,
            StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT - (containerRect.getHeight() * 2) - this.height );
      }
    },

    //private
    updateHintVisibility: function() {
      this.hintNode.setVisible( this.mouseOver || this.beingDragged );
    }
  } );
} );

