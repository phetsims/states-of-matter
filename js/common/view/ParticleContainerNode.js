// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class is the "view" for the particle container.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import HandleNode from '../../../../scenery-phet/js/HandleNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import statesOfMatter from '../../statesOfMatter.js';
import MultipleParticleModel from '../model/MultipleParticleModel.js';
import SOMConstants from '../SOMConstants.js';
import DialGaugeNode from './DialGaugeNode.js';
import ParticleImageCanvasNode from './ParticleImageCanvasNode.js';
import PointingHandNode from './PointingHandNode.js';

// constants
const PRESSURE_GAUGE_ELBOW_OFFSET = 30;
const CONTAINER_X_MARGIN = 5; // additional size in x direction beyond nominal container width
const PERSPECTIVE_TILT_FACTOR = 0.15; // can be varied to get more or less tilt, but only works in a fairly narrow range
const CONTAINER_CUTOUT_X_MARGIN = 25;
const CONTAINER_CUTOUT_Y_MARGIN = 20;
const BEVEL_WIDTH = 9;

/**
 * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
 * @param {ModelViewTransform2} modelViewTransform
 * @param {boolean} volumeControlEnabled - set true to enable volume control by pushing the lid using a finger from above
 * @param {boolean} pressureGaugeEnabled - set true to show the pressure gauge
 * @param {Tandem} tandem
 * @constructor
 */
function ParticleContainerNode(
  multipleParticleModel,
  modelViewTransform,
  volumeControlEnabled,
  pressureGaugeEnabled,
  tandem ) {

  Node.call( this, { preventFit: true } );
  const self = this;

  // @private, view bounds for the particle area, everything is basically constructed and positioned based on this
  this.particleAreaViewBounds = new Bounds2(
    modelViewTransform.modelToViewX( 0 ),
    modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( multipleParticleModel.getInitialContainerHeight() ),
    modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( multipleParticleModel.getContainerWidth() ),
    modelViewTransform.modelToViewY( 0 )
  );

  // @private
  this.multipleParticleModel = multipleParticleModel;
  this.modelViewTransform = modelViewTransform;
  this.previousContainerViewSize = this.particleAreaViewBounds.height;

  // add nodes for the various layers
  const preParticleLayer = new Node();
  this.addChild( preParticleLayer );
  this.particlesCanvasNode = new ParticleImageCanvasNode( multipleParticleModel.scaledAtoms, modelViewTransform, {
    canvasBounds: SOMConstants.SCREEN_VIEW_OPTIONS.layoutBounds.dilated( 500, 500 ) // dilation amount empirically determined
  } );
  this.addChild( this.particlesCanvasNode );
  const postParticleLayer = new Node();
  this.addChild( postParticleLayer );

  // set up variables used to create and position the various parts of the container
  const containerWidthWithMargin = modelViewTransform.modelToViewDeltaX( multipleParticleModel.getContainerWidth() ) +
                                   2 * CONTAINER_X_MARGIN;
  const topEllipseRadiusX = containerWidthWithMargin / 2;
  const topEllipseRadiusY = topEllipseRadiusX * PERSPECTIVE_TILT_FACTOR;

  // shape of the ellipse at the top of the container
  const topEllipseShape = new Shape().ellipticalArc(
    topEllipseRadiusX,
    0,
    topEllipseRadiusX,
    topEllipseRadiusY,
    0,
    0,
    2 * Math.PI,
    false
  );

  // add the elliptical opening at the top of the container, must be behind particles in z-order
  preParticleLayer.addChild( new Path( topEllipseShape, {
    lineWidth: 1,
    stroke: '#444444',
    centerX: this.particleAreaViewBounds.centerX,
    centerY: this.particleAreaViewBounds.minY
  } ) );

  // create and add the node that will act as the elliptical background for the lid, other nodes may be added later
  const containerLid = new Path( topEllipseShape, {
    fill: 'rgba( 126, 126, 126, 0.8 )',
    centerX: this.particleAreaViewBounds.centerX
  } );
  postParticleLayer.addChild( containerLid );

  if ( volumeControlEnabled ) {

    // Add the pointing hand, the finger of which can push down on the top of the container.
    var pointingHandNode = new PointingHandNode( multipleParticleModel, modelViewTransform, {
      centerX: this.particleAreaViewBounds.centerX + 30, // offset empirically determined
      tandem: tandem.createTandem( 'pointingHandNode' )
    } );
    postParticleLayer.addChild( pointingHandNode );

    // Add the handle to the lid.
    const handleAreaEllipseShape = topEllipseShape.transformed( Matrix3.scale( 0.8 ) ); // scale empirically determined
    const handleAreaEllipse = new Path( handleAreaEllipseShape, {
      lineWidth: 1,
      stroke: '#888888',
      fill: 'rgba( 200, 200, 200, 0.5 )',
      centerX: containerLid.width / 2,
      centerY: 0,
      cursor: 'ns-resize'
    } );
    containerLid.addChild( handleAreaEllipse );
    const handleNode = new HandleNode( { scale: 0.28, attachmentFill: 'black', gripLineWidth: 4 } );
    handleNode.centerX = containerLid.width / 2;
    handleNode.bottom = handleAreaEllipse.centerY + 5; // position tweaked a bit to look better
    containerLid.addChild( handleNode );

    // add a drag handler to the lid
    let dragStartY;
    let draggedToY;
    let containerSizeAtDragStart;
    handleAreaEllipse.addInputListener( new DragListener( {

      start: event => {
        dragStartY = this.globalToParentPoint( event.pointer.point ).y;
        containerSizeAtDragStart = multipleParticleModel.containerHeightProperty.get();
      },

      drag: event => {
        draggedToY = this.globalToParentPoint( event.pointer.point ).y;

        // Resize the container based on the drag distance.
        multipleParticleModel.setTargetContainerHeight(
          containerSizeAtDragStart + modelViewTransform.viewToModelDeltaY( draggedToY - dragStartY )
        );
      },

      end: () => {

        // Set the target size to the current size, which will stop any change in size that is currently underway.
        multipleParticleModel.setTargetContainerHeight(
          multipleParticleModel.containerHeightProperty.get()
        );
      },

      tandem: tandem.createTandem( 'lidDragListener' )
    } ) );
  }

  let pressureGaugeNode;
  if ( pressureGaugeEnabled ) {

    // Add the pressure gauge.
    pressureGaugeNode = new DialGaugeNode( multipleParticleModel, tandem.createTandem( 'pressureGaugeNode' ) );
    pressureGaugeNode.right = this.particleAreaViewBounds.minX + this.particleAreaViewBounds.width * 0.2;
    postParticleLayer.addChild( pressureGaugeNode );
  }

  // define a function to evaluate the bottom edge of the ellipse at the top, used for relative positioning
  function getEllipseLowerEdgeYPos( distanceFromLeftEdge ) {
    const x = distanceFromLeftEdge - topEllipseRadiusX;
    return topEllipseRadiusY * Math.sqrt( 1 - Math.pow( x, 2 ) / ( Math.pow( topEllipseRadiusX, 2 ) ) );
  }

  // define a bunch of variable that will be used in the process of drawing the main container
  const outerShapeTiltFactor = topEllipseRadiusY * 1.28; // empirically determined multiplier that makes curve match lid
  const cutoutShapeTiltFactor = outerShapeTiltFactor * 0.55; // empirically determined multiplier that looks good
  const cutoutHeight = this.particleAreaViewBounds.getHeight() - 2 * CONTAINER_CUTOUT_Y_MARGIN;
  const cutoutTopY = getEllipseLowerEdgeYPos( CONTAINER_CUTOUT_X_MARGIN ) + CONTAINER_CUTOUT_Y_MARGIN;
  const cutoutBottomY = cutoutTopY + cutoutHeight;
  const cutoutWidth = containerWidthWithMargin - 2 * CONTAINER_CUTOUT_X_MARGIN;

  // create and add the main container node, excluding the bevel
  const mainContainer = new Path( new Shape()
      .moveTo( 0, 0 )

      // top curve, y-component of control points made to match up with lower edge of the lid
      .cubicCurveTo(
        0,
        outerShapeTiltFactor,
        containerWidthWithMargin,
        outerShapeTiltFactor,
        containerWidthWithMargin,
        0
      )

      // line from outer top right to outer bottom right
      .lineTo( containerWidthWithMargin, this.particleAreaViewBounds.height )

      // bottom outer curve
      .cubicCurveTo(
        containerWidthWithMargin,
        this.particleAreaViewBounds.height + outerShapeTiltFactor,
        0,
        this.particleAreaViewBounds.height + outerShapeTiltFactor,
        0,
        this.particleAreaViewBounds.height
      )

      // left outer side
      .lineTo( 0, 0 )

      // start drawing the cutout, must be drawn in opposite direction from outer shape to make the hole appear
      .moveTo( CONTAINER_CUTOUT_X_MARGIN, cutoutTopY )

      // left inner line
      .lineTo( CONTAINER_CUTOUT_X_MARGIN, cutoutBottomY )

      // bottom inner curve
      .quadraticCurveTo(
        containerWidthWithMargin / 2,
        cutoutBottomY + cutoutShapeTiltFactor,
        containerWidthWithMargin - CONTAINER_CUTOUT_X_MARGIN,
        cutoutBottomY
      )

      // line from inner bottom right to inner top right
      .lineTo( containerWidthWithMargin - CONTAINER_CUTOUT_X_MARGIN, cutoutTopY )

      // top inner curve
      .quadraticCurveTo(
        containerWidthWithMargin / 2,
        cutoutTopY + cutoutShapeTiltFactor,
        CONTAINER_CUTOUT_X_MARGIN,
        cutoutTopY
      )

      .close(),
    {
      fill: new LinearGradient( 0, 0, containerWidthWithMargin, 0 )
        .addColorStop( 0, '#6D6D6D' )
        .addColorStop( 0.1, '#8B8B8B' )
        .addColorStop( 0.2, '#AEAFAF' )
        .addColorStop( 0.4, '#BABABA' )
        .addColorStop( 0.7, '#A3A4A4' )
        .addColorStop( 0.75, '#8E8E8E' )
        .addColorStop( 0.8, '#737373' )
        .addColorStop( 0.9, '#646565' ),
      opacity: 0.9,
      centerX: this.particleAreaViewBounds.centerX,
      top: this.particleAreaViewBounds.minY
    }
  );
  postParticleLayer.addChild( mainContainer );

  const bevel = new Node( { opacity: 0.9 } );

  const leftBevelEdge = new Path(
    new Shape()
      .moveTo( 0, 0 )
      .lineTo( 0, cutoutHeight )
      .lineTo( BEVEL_WIDTH, cutoutHeight - BEVEL_WIDTH )
      .lineTo( BEVEL_WIDTH, BEVEL_WIDTH )
      .lineTo( 0, 0 )
      .close(),
    {
      fill: new LinearGradient( 0, 0, 0, cutoutHeight )
        .addColorStop( 0, '#525252' )
        .addColorStop( 0.3, '#515151' )
        .addColorStop( 0.4, '#4E4E4E' )
        .addColorStop( 0.5, '#424242' )
        .addColorStop( 0.6, '#353535' )
        .addColorStop( 0.7, '#2a2a2a' )
        .addColorStop( 0.8, '#292929' )
    }
  );
  bevel.addChild( leftBevelEdge );

  const rightBevelEdge = new Path(
    new Shape()
      .moveTo( 0, BEVEL_WIDTH )
      .lineTo( 0, cutoutHeight - BEVEL_WIDTH )
      .lineTo( BEVEL_WIDTH, cutoutHeight )
      .lineTo( BEVEL_WIDTH, 0 )
      .lineTo( 0, BEVEL_WIDTH )
      .close(),
    {
      left: cutoutWidth - BEVEL_WIDTH,
      fill: new LinearGradient( 0, 0, 0, cutoutHeight )
        .addColorStop( 0, '#8A8A8A' )
        .addColorStop( 0.2, '#747474' )
        .addColorStop( 0.3, '#525252' )
        .addColorStop( 0.6, '#8A8A8A' )
        .addColorStop( 0.9, '#A2A2A2' )
        .addColorStop( 0.95, '#616161' )
    }
  );
  bevel.addChild( rightBevelEdge );

  const topBevelEdge = new Path(
    new Shape()
      .moveTo( 0, 0 )
      .quadraticCurveTo( cutoutWidth / 2, cutoutShapeTiltFactor, cutoutWidth, 0 )
      .lineTo( cutoutWidth - BEVEL_WIDTH, BEVEL_WIDTH )
      .quadraticCurveTo( cutoutWidth / 2, cutoutShapeTiltFactor + BEVEL_WIDTH, BEVEL_WIDTH, BEVEL_WIDTH )
      .lineTo( 0, 0 )
      .close(),
    {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, cutoutWidth, 0 )
        .addColorStop( 0, '#2E2E2E' )
        .addColorStop( 0.2, '#323232' )
        .addColorStop( 0.3, '#363636' )
        .addColorStop( 0.4, '#3E3E3E' )
        .addColorStop( 0.5, '#4B4B4B' )
        .addColorStop( 0.9, '#525252' )
    }
  );
  bevel.addChild( topBevelEdge );

  const bottomBevelEdge = new Path(
    new Shape()
      .moveTo( BEVEL_WIDTH, 0 )
      .quadraticCurveTo( cutoutWidth / 2, cutoutShapeTiltFactor, cutoutWidth - BEVEL_WIDTH, 0 )
      .lineTo( cutoutWidth, BEVEL_WIDTH )
      .quadraticCurveTo( cutoutWidth / 2, cutoutShapeTiltFactor + BEVEL_WIDTH, 0, BEVEL_WIDTH )
      .lineTo( BEVEL_WIDTH, 0 )
      .close(),
    {
      top: cutoutHeight - BEVEL_WIDTH,
      fill: new LinearGradient( 0, 0, cutoutWidth, 0 )
        .addColorStop( 0, '#5D5D5D' )
        .addColorStop( 0.2, '#717171' )
        .addColorStop( 0.3, '#7C7C7C' )
        .addColorStop( 0.4, '#8D8D8D' )
        .addColorStop( 0.5, '#9E9E9E' )
        .addColorStop( 0.5, '#A2A2A2' )
        .addColorStop( 0.9, '#A3A3A3' )
    }
  );
  bevel.addChild( bottomBevelEdge );

  // Position and add the bevel.
  bevel.centerX = this.particleAreaViewBounds.centerX;
  bevel.top = this.particleAreaViewBounds.minY + cutoutTopY;
  postParticleLayer.addChild( bevel );

  // Define a function for updating the position and appearance of the pressure gauge.
  function updatePressureGaugePosition() {

    if ( !pressureGaugeNode ) {
      // nothing to update, so bail out
      return;
    }

    const containerHeight = self.multipleParticleModel.containerHeightProperty.get();

    if ( !self.multipleParticleModel.isExplodedProperty.get() ) {
      if ( pressureGaugeNode.getRotation() !== 0 ) {
        pressureGaugeNode.setRotation( 0 );
      }
      pressureGaugeNode.top = self.particleAreaViewBounds.top - 75; // empirical position adjustment to connect to lid
      pressureGaugeNode.setElbowHeight(
        PRESSURE_GAUGE_ELBOW_OFFSET + Math.abs( self.modelViewTransform.modelToViewDeltaY(
        MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT - containerHeight
                                    ) )
      );
    }
    else {

      // The container is exploding, so move the gauge up and spin it.
      const deltaHeight = self.modelViewTransform.modelToViewDeltaY( containerHeight ) - self.previousContainerViewSize;
      pressureGaugeNode.rotate( deltaHeight * 0.01 * Math.PI );
      pressureGaugeNode.centerY = pressureGaugeNode.centerY + deltaHeight * 2;
    }
  }

  // Monitor the height of the container in the model and adjust the view when changes occur.
  multipleParticleModel.containerHeightProperty.link( function( containerHeight, oldContainerHeight ) {

    if ( oldContainerHeight ) {
      self.previousContainerViewSize = modelViewTransform.modelToViewDeltaY( oldContainerHeight );
    }

    const lidYPosition = modelViewTransform.modelToViewY( containerHeight );

    containerLid.centerY = lidYPosition;

    if ( multipleParticleModel.isExplodedProperty.get() ) {

      // the container has exploded, so rotate the lid as it goes up so that it looks like it has been blown off.
      const deltaY = oldContainerHeight - containerHeight;
      const rotationAmount = deltaY * Math.PI * 0.00008; // multiplier empirically determined
      containerLid.rotateAround( containerLid.center, rotationAmount );
    }

    // update the position of the pointing hand
    pointingHandNode && pointingHandNode.setFingertipYPosition( lidYPosition );

    // update the pressure gauge position (if present)
    updatePressureGaugePosition();
  } );

  // Monitor the model for changes in the exploded state of the container and update the view as needed.
  multipleParticleModel.isExplodedProperty.link( function( isExploded, wasExploded ) {

    if ( !isExploded && wasExploded ) {

      // return the lid to the top of the container
      containerLid.setRotation( 0 );
      containerLid.centerX = modelViewTransform.modelToViewX( multipleParticleModel.getContainerWidth() / 2 );
      containerLid.centerY = modelViewTransform.modelToViewY(
        multipleParticleModel.containerHeightProperty.get()
      );

      // return the pressure gauge to its original position
      updatePressureGaugePosition();
    }
  } );
}

statesOfMatter.register( 'ParticleContainerNode', ParticleContainerNode );

export default inherit( Node, ParticleContainerNode, {

  /**
   * step
   * @param {number} dt - delta time
   * @public
   */
  step: function( dt ) {
    this.particlesCanvasNode.step( dt );
  }
} );