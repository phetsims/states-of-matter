// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class is the "view" for the particle container.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var DialGaugeNode = require( 'STATES_OF_MATTER/common/view/DialGaugeNode' );
  var HandleNode = require( 'STATES_OF_MATTER/common/view/HandleNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ParticleImageCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleImageCanvasNode' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PointingHandNode = require( 'STATES_OF_MATTER/common/view/PointingHandNode' );
  var Shape = require( 'KITE/Shape' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // constants
  var PRESSURE_METER_ELBOW_OFFSET = 30;
  var CONTAINER_X_MARGIN = 5; // additional size in x direction beyond nominal container width
  var PERSPECTIVE_TILT_FACTOR = 0.15; // can be varied to get more or less tilt, but only works in a fairly narrow range
  var CONTAINER_CUTOUT_X_MARGIN = 25;
  var CONTAINER_CUTOUT_Y_MARGIN = 20;
  var BEVEL_WIDTH = 9;

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform
   * @param {boolean} volumeControlEnabled - set true to enable volume control by pushing the lid using a finger from above
   * @param {boolean} pressureGaugeEnabled - set true to show the pressure gauge
   * @constructor
   */
  function ParticleContainerNode( multipleParticleModel, modelViewTransform, volumeControlEnabled, pressureGaugeEnabled ) {

    Node.call( this, { preventFit: true } );

    // @private, view bounds for the particle area, everything is basically constructed and positioned based on this
    this.particleAreaViewBounds = new Bounds2(
      modelViewTransform.modelToViewX( 0 ),
      modelViewTransform.modelToViewY( 0 ) + modelViewTransform.modelToViewDeltaY( multipleParticleModel.getInitialParticleContainerHeight() ),
      modelViewTransform.modelToViewX( 0 ) + modelViewTransform.modelToViewDeltaX( multipleParticleModel.getParticleContainerWidth() ),
      modelViewTransform.modelToViewY( 0 )
    );

    // @private
    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;
    this.pressureGaugeEnabled = pressureGaugeEnabled;
    this.previousContainerViewSize = this.particleAreaViewBounds.height;

    // add nodes for the various layers
    var preParticleLayer = new Node();
    this.addChild( preParticleLayer );
    this.particlesLayer = new ParticleImageCanvasNode( multipleParticleModel.particles, modelViewTransform, {
      canvasBounds: StatesOfMatterConstants.SCREEN_VIEW_OPTIONS.layoutBounds.dilated( 500, 500 ) // dilation amount empirically determined
    } );
    this.addChild( this.particlesLayer );
    var postParticleLayer = new Node();
    this.addChild( postParticleLayer );

    // set up variables used to create and position the various parts of the container
    this.containerWidthWithMargin = modelViewTransform.modelToViewDeltaX(
        multipleParticleModel.getParticleContainerWidth()
      ) + 2 * CONTAINER_X_MARGIN;
    this.containerViewCenterX = this.particleAreaViewBounds.centerX;

    var topEllipseRadiusX = this.containerWidthWithMargin / 2;
    var topEllipseRadiusY = topEllipseRadiusX * PERSPECTIVE_TILT_FACTOR;

    // shape of the ellipse at the top of the container
    var topEllipseShape = new Shape().ellipticalArc(
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
    this.containerLid = new Path( topEllipseShape, {
      fill: 'rgba( 126, 126, 126, 0.8 )',
      centerX: this.particleAreaViewBounds.centerX
    } );
    postParticleLayer.addChild( this.containerLid );

    if ( volumeControlEnabled ) {

      // Add the pointing hand, the finger of which can push down on the top of the container.
      this.pointingHandNode = new PointingHandNode( multipleParticleModel, modelViewTransform, {
        centerX: this.particleAreaViewBounds.centerX + 30 // offset empirically determined
      } );
      postParticleLayer.addChild( this.pointingHandNode );

      // Add the handle to the lid.
      var handleAreaEllipseShape = topEllipseShape.transformed( Matrix3.scale( 0.8 ) ); // scale empirically determined
      var handleAreaEllipse = new Path( handleAreaEllipseShape, {
        lineWidth: 1,
        stroke: '#888888',
        fill: 'rgba( 200, 200, 200, 0.5 )',
        centerX: this.containerLid.width / 2,
        centerY: 0
      } );
      this.containerLid.addChild( handleAreaEllipse );
      var handleNode = new HandleNode();
      handleNode.centerX = this.containerLid.width / 2;
      handleNode.bottom = handleAreaEllipse.centerY + 5; // position tweaked a bit to look better
      this.containerLid.addChild( handleNode );
    }

    if ( pressureGaugeEnabled ) {

      // Add the pressure meter.
      this.pressureMeter = new DialGaugeNode( multipleParticleModel );
      this.pressureMeter.updateConnector();
      this.pressureMeter.right = this.particleAreaViewBounds.minX + this.particleAreaViewBounds.width * 0.2;
      postParticleLayer.addChild( this.pressureMeter );
    }

    // define a function to evaluate the bottom edge of the ellipse at the top, used for relative positioning
    function getEllipseLowerEdgeYPos( distanceFromLeftEdge ) {
      var x = distanceFromLeftEdge - topEllipseRadiusX;
      return topEllipseRadiusY * Math.sqrt( 1 - Math.pow( x, 2 ) / ( Math.pow( topEllipseRadiusX, 2 ) ) );
    }

    // define a bunch of variable that will be used in the process of drawing the main container
    var outerShapeTiltFactor = topEllipseRadiusY * 1.28; // empirically determined multiplier that makes curve match lid
    var cutoutShapeTiltFactor = outerShapeTiltFactor * 0.55; // empirically determined multiplier that looks good
    var cutoutHeight = this.particleAreaViewBounds.getHeight() - 2 * CONTAINER_CUTOUT_Y_MARGIN;
    var cutoutTopY = getEllipseLowerEdgeYPos( CONTAINER_CUTOUT_X_MARGIN ) + CONTAINER_CUTOUT_Y_MARGIN;
    var cutoutBottomY = cutoutTopY + cutoutHeight;
    var cutoutWidth = this.containerWidthWithMargin - 2 * CONTAINER_CUTOUT_X_MARGIN;

    // create and add the main container node, excluding the bevel
    var mainContainer = new Path( new Shape()
      .moveTo( 0, 0 )

      // top curve, y-component of control points made to match up with lower edge of the lid
      .cubicCurveTo(
        0,
        outerShapeTiltFactor,
        this.containerWidthWithMargin,
        outerShapeTiltFactor,
        this.containerWidthWithMargin,
        0
      )

      // line from outer top right to outer bottom right
      .lineTo( this.containerWidthWithMargin, this.particleAreaViewBounds.height )

      // bottom outer curve
      .cubicCurveTo(
        this.containerWidthWithMargin,
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
        this.containerWidthWithMargin / 2,
        cutoutBottomY + cutoutShapeTiltFactor,
        this.containerWidthWithMargin - CONTAINER_CUTOUT_X_MARGIN,
        cutoutBottomY
      )

      // line from inner bottom right to inner top right
      .lineTo( this.containerWidthWithMargin - CONTAINER_CUTOUT_X_MARGIN, cutoutTopY )

      // top inner curve
      .quadraticCurveTo(
        this.containerWidthWithMargin / 2,
        cutoutTopY + cutoutShapeTiltFactor,
        CONTAINER_CUTOUT_X_MARGIN,
        cutoutTopY
      )

      .close(),
      {
        fill: new LinearGradient( 0, 0, this.containerWidthWithMargin, 0 )
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

    var bevel = new Node( { opacity: 0.9 } );

    var leftBevelEdge = new Path(
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

    var rightBevelEdge = new Path(
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

    var topBevelEdge = new Path(
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

    var bottomBevelEdge = new Path(
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
  }

  statesOfMatter.register( 'ParticleContainerNode', ParticleContainerNode );

  return inherit( Node, ParticleContainerNode, {

    /**
     * step
     * @param dt
     */
    step: function( dt ) {
      this.particlesLayer.step( dt );
      this.pressureMeter && this.pressureMeter.step( dt );
    },

    /**
     * @public
     */
    reset: function() {
      this.handleContainerSizeChanged();
    },

    /**
     * Update the position and other aspects of the gauge so that it stays
     * connected to the lid or moves as it should when the container
     * explodes.
     * @private
     */
    updatePressureGauge: function() {

      var containerHeight = this.multipleParticleModel.getParticleContainerHeight();

      if ( this.pressureMeter ) {
        if ( !this.multipleParticleModel.getContainerExploded() ) {
          if ( this.pressureMeter.getRotation() !== 0 ) {
            this.pressureMeter.setRotation( 0 );
          }
          this.pressureMeter.top = this.particleAreaViewBounds.top - 75; // position adjust to connect to lid
          this.pressureMeter.setElbowHeight(
            PRESSURE_METER_ELBOW_OFFSET + Math.abs( this.modelViewTransform.modelToViewDeltaY(
              MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT - containerHeight
            ) )
          );
        }
        else {

          // The container is exploding, so move the gauge up and spin it.
          var deltaHeight = this.modelViewTransform.modelToViewDeltaY( containerHeight ) - this.previousContainerViewSize;
          this.pressureMeter.rotate( deltaHeight * 0.01 * Math.PI );
          this.pressureMeter.centerY = this.pressureMeter.centerY + deltaHeight;
        }
      }
    },

    /**
     * Handle a notification that the container size has changed.
     * @public
     */
    handleContainerSizeChanged: function() {

      var containerHeight = this.multipleParticleModel.getParticleContainerHeight(); // convenience variable
      var containerLid = this.containerLid; // optimization
      var lidYPosition = this.particleAreaViewBounds.maxY + this.modelViewTransform.modelToViewDeltaY( containerHeight );

      if ( !this.multipleParticleModel.getContainerExploded() ) {
        if ( containerLid.getRotation() !== 0 ) {
          containerLid.setRotation( 0 );
        }
        containerLid.setTranslation( this.containerViewCenterX - containerLid.width / 2, lidYPosition );
      }
      else {

        // the container has exploded, so rotate the lid as it goes up so that it looks like it has been blown off.
        var deltaY = lidYPosition - this.containerLid.centerY;
        var rotationAmount = deltaY * Math.PI * 0.002; // multiplier empirically determined
        containerLid.centerX = this.containerViewCenterX;
        containerLid.centerY = lidYPosition;
        containerLid.rotateAround( containerLid.center, rotationAmount );
      }

      // update the position of the pointing hand
      this.pointingHandNode && this.pointingHandNode.setFingertipYPosition( lidYPosition );

      // update the pressure gauge
      this.pressureGaugeEnabled && this.updatePressureGauge();

      // track the previous size so that deltas can be calculated on the next update
      this.previousContainerViewSize = this.modelViewTransform.modelToViewDeltaY( containerHeight );
    }

  } );
} );