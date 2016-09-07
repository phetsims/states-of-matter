// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class is the "view" for the particle container.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var DialGaugeNode = require( 'STATES_OF_MATTER/common/view/DialGaugeNode' );
  var PointingHandNode = require( 'STATES_OF_MATTER/common/view/PointingHandNode' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var HandleNode = require( 'STATES_OF_MATTER/common/view/HandleNode' );

  // constants
  var LID_POSITION_TWEAK_FACTOR = 65; // Empirically determined value for aligning lid and container body.
  var PRESSURE_METER_ELBOW_OFFSET = 30;
  var X_MARGIN = 5; // size in x direction beyond nominal container width

  // constants the control the positioning of non-container portions of this node.
  var PRESSURE_GAUGE_Y_OFFSET = -PRESSURE_METER_ELBOW_OFFSET;

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform The model view transform for transforming particle position.
   * @param {boolean} volumeControlEnabled - set true to enable volume control by pushing the lid using a finger from above
   * @param {boolean} pressureGaugeEnabled - set true to show a barometer
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function ParticleContainerNode( multipleParticleModel, modelViewTransform, volumeControlEnabled, pressureGaugeEnabled, options ) {

    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;
    this.pressureGaugeEnabled = pressureGaugeEnabled;
    this.containmentAreaWidth = StatesOfMatterConstants.CONTAINER_BOUNDS.width;
    this.containmentAreaHeight = StatesOfMatterConstants.CONTAINER_BOUNDS.height;
    Node.call( this );
    this.containerWidthWithMargin = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH + 2 * X_MARGIN;
    var preParticleLayer = new Node();
    var postParticleLayer = new Node( { opacity: 0.9 } );
    this.containerLid = new Node( { opacity: 0.9 } );
    this.addChild( preParticleLayer );
    var openEllipseRadiusX = 25;
    var ellipseCenterY = 2;
    var openEllipse = new Path( new Shape()
      .ellipticalArc( this.containerWidthWithMargin / 2, ellipseCenterY,
        openEllipseRadiusX, this.containerWidthWithMargin / 2, Math.PI / 2, 0, 2 * Math.PI,
        false ).close(), {
      lineWidth: 1,
      fill: '#7E7E7E'
    } );
    var openInnerEllipseRadiusY = 125;
    var openInnerEllipseRadiusX = 20;
    var openInnerEllipse = new Path( new Shape()
      .ellipticalArc( this.containerWidthWithMargin / 2, ellipseCenterY,
        openInnerEllipseRadiusX, openInnerEllipseRadiusY, Math.PI / 2, 0, 2 * Math.PI,
        false ).close(), {
      lineWidth: 1,
      stroke: '#B3B3B3',
      fill: '#B3B3B3',
      centerX: openEllipse.centerX,
      centerY: openEllipse.centerY
    } );

    // container back node
    this.openNode = new Path( new Shape()
      .ellipticalArc(
        this.containerWidthWithMargin / 2,
        ellipseCenterY,
        openEllipseRadiusX,
        this.containerWidthWithMargin / 2,
        Math.PI / 2,
        0,
        2 * Math.PI,
        false
      ).close(),
      {
        lineWidth: 1,
        stroke: '#606262',
        centerX: openEllipse.centerX,
        centerY: openEllipse.centerY
      }
    );
    var containerLeftShapeWidth = 25;
    var distanceFromTopInnerTop = 0;

    // add container outer shape
    var outerShape = new Path( new Shape()
      .moveTo( 0, distanceFromTopInnerTop )

      // top curve, y-component of control points made to match up with lower edge of the lid
      .cubicCurveTo( 0, 35, this.containerWidthWithMargin, 35, this.containerWidthWithMargin, distanceFromTopInnerTop )

      // line from outer top right to outer bottom right
      .lineTo( this.containerWidthWithMargin, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )

      .quadraticCurveTo( this.containerWidthWithMargin - 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 5,
        this.containerWidthWithMargin - 10,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 8 ) //outer-bottom-curve -1

      .quadraticCurveTo( this.containerWidthWithMargin / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 35,
        20, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 10 ) //outer-bottom-curve -2
      .quadraticCurveTo( 2, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 5, 0,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )//outer-bottom-curve -3

      // line from  outer-bottom left to inner-bottom left
      .lineTo( containerLeftShapeWidth, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )

      .quadraticCurveTo( this.containerWidthWithMargin / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + containerLeftShapeWidth,
        this.containerWidthWithMargin - 25,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )// inner-bottom -curve(left t0 right )

      // line from inner-bottom right to inner top-right
      .lineTo( this.containerWidthWithMargin - containerLeftShapeWidth, 30 )

      .quadraticCurveTo( this.containerWidthWithMargin / 2, 60,
        containerLeftShapeWidth, 30 ) // curve from inner-top right to inner-top left

      // line from inner-top left to inner-bottom left
      .lineTo( containerLeftShapeWidth, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .lineTo( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )//line from inner-bottom left to outer-bottom left
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, this.containerWidthWithMargin, 0 )
        .addColorStop( 0, '#6D6D6D' )
        .addColorStop( 0.1, '#8B8B8B' )
        .addColorStop( 0.2, '#AEAFAF' )
        .addColorStop( 0.4, '#BABABA' )
        .addColorStop( 0.7, '#A3A4A4' )
        .addColorStop( 0.75, '#8E8E8E' )
        .addColorStop( 0.8, '#737373' )
        .addColorStop( 0.9, '#646565' )
    } );
    postParticleLayer.addChild( outerShape );

    // add container inner left shape
    var leftShape = new Path( new Shape()
      .moveTo( containerLeftShapeWidth, 30 ) //move to inner-top  left
      .lineTo( 36, 45 )//line from  inner-top  left to inner-top right
      //line from  inner-top  right to inner-bottom right
      .lineTo( 36, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      //line from  inner-top right to  inner-bottom  left
      .lineTo( containerLeftShapeWidth, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( containerLeftShapeWidth, 30 ) //line from  inner-bottom  left to inner-top left
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 40 )
        .addColorStop( 0, '#525252' )
        .addColorStop( 0.3, '#515151' )
        .addColorStop( 0.4, '#4E4E4E' )
        .addColorStop( 0.5, '#424242' )
        .addColorStop( 0.6, '#353535' )
        .addColorStop( 0.7, '#2a2a2a' )
        .addColorStop( 0.8, '#292929' )
    } );
    postParticleLayer.addChild( leftShape );

    // add container inner right
    var rightShape = new Path( new Shape()
      .moveTo( this.containerWidthWithMargin - 26, 30 )
      .lineTo( this.containerWidthWithMargin - 35, 45 )
      .lineTo( this.containerWidthWithMargin - 35, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .lineTo( this.containerWidthWithMargin - 24, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( this.containerWidthWithMargin - 24, 30 )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 40 )
        .addColorStop( 0, '#8A8A8A' )
        .addColorStop( 0.2, '#747474' )
        .addColorStop( 0.3, '#525252' )
        .addColorStop( 0.6, '#8A8A8A' )
        .addColorStop( 0.9, '#A2A2A2' )
        .addColorStop( 0.95, '#616161' )
    } );
    postParticleLayer.addChild( rightShape );

    // add container inner top
    var topShape = new Path( new Shape()
      .moveTo( containerLeftShapeWidth, 30 )
      .quadraticCurveTo( this.containerWidthWithMargin / 2, 45,
        this.containerWidthWithMargin - containerLeftShapeWidth, 30 )
      .lineTo( this.containerWidthWithMargin - 35, 45 )
      .quadraticCurveTo( this.containerWidthWithMargin / 2, 55, 35, 45 )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, this.containerWidthWithMargin - containerLeftShapeWidth - 30, 0 )
        .addColorStop( 0, '#2E2E2E' )
        .addColorStop( 0.2, '#323232' )
        .addColorStop( 0.3, '# 363636' )
        .addColorStop( 0.4, '#3E3E3E' )
        .addColorStop( 0.5, '#4B4B4B' )
        .addColorStop( 0.5, '# 515151' )
        .addColorStop( 0.9, '#525252' )
    } );
    postParticleLayer.addChild( topShape );

    // add container inner bottom
    var bottomShape = new Path( new Shape()
      .moveTo( containerLeftShapeWidth, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .quadraticCurveTo( this.containerWidthWithMargin / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + containerLeftShapeWidth + 1,
        this.containerWidthWithMargin - containerLeftShapeWidth,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( this.containerWidthWithMargin - 35, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .quadraticCurveTo( this.containerWidthWithMargin / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 10,
        35, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, this.containerWidthWithMargin - 45, 0 )
        .addColorStop( 0, '#5D5D5D' )
        .addColorStop( 0.2, '#717171' )
        .addColorStop( 0.3, '#7C7C7C' )
        .addColorStop( 0.4, '#8D8D8D' )
        .addColorStop( 0.5, '#9E9E9E' )
        .addColorStop( 0.5, '#A2A2A2' )
        .addColorStop( 0.9, '#A3A3A3' )
    } );
    postParticleLayer.addChild( bottomShape );

    this.containerLid.addChild( openEllipse );
    preParticleLayer.addChild( this.containerLid );

    this.middleContainerLayer = new Node();
    this.addChild( this.middleContainerLayer );

    if ( volumeControlEnabled ) {

      // Add the finger for pressing down on the top of the container.
      this.fingerNode = new PointingHandNode( multipleParticleModel, modelViewTransform );

      // responsible for positioning itself later based on user interaction.
      this.addChild( this.fingerNode );
      this.fingerNode.bottom = this.containerLid.top;
      this.fingerNode.setTranslation( this.fingerNode.x + openEllipse.width / 2.4,
        Math.abs( this.modelViewTransform.modelToViewDeltaY(
          StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
          this.multipleParticleModel.getParticleContainerHeight() ) ) +
        this.containerLid.y - this.fingerNode.height + 20 );

      // Add the handle to the lid.
      this.containerLid.addChild( openInnerEllipse );
      var handleNode = new HandleNode();
      handleNode.centerX = openInnerEllipse.centerX;
      handleNode.centerY = openInnerEllipse.centerY;
      this.containerLid.addChild( handleNode );
    }

    if ( pressureGaugeEnabled ) {

      // Add the pressure meter.
      this.pressureMeter = new DialGaugeNode( multipleParticleModel );
      this.pressureMeter.setElbowEnabled( true );
      this.middleContainerLayer.addChild( this.pressureMeter );
      var pressureMeterXOffset = 60;
      this.pressureMeter.setTranslation(
        this.containerLid.x - pressureMeterXOffset,
        this.containerLid.y - PRESSURE_METER_ELBOW_OFFSET
      );
    }
    this.addChild( postParticleLayer );
    this.mutate( options );
  }

  statesOfMatter.register( 'ParticleContainerNode', ParticleContainerNode );

  return inherit( Node, ParticleContainerNode, {

    /**
     * step
     * @param dt
     */
    step: function( dt ) {
      this.pressureMeter.step( dt );
    },

    /**
     * @public
     */
    reset: function() {
      this.handleContainerSizeChanged();
      if ( this.fingerNode ) {
        this.fingerNode.handleContainerSizeChanged();
      }
    },

    /**
     * Update the position and other aspects of the gauge so that it stays
     * connected to the lid or moves as it should when the container
     * explodes.
     * @private
     */
    updatePressureGauge: function() {
      if ( this.pressureMeter ) {
        var containerHeight = this.multipleParticleModel.getParticleContainerHeight();
        if ( !this.multipleParticleModel.getContainerExploded() ) {
          if ( this.pressureMeter.getRotation() !== 0 ) {
            this.pressureMeter.setRotation( 0 );
          }
          this.pressureMeter.y = PRESSURE_GAUGE_Y_OFFSET;
          this.pressureMeter.setElbowHeight( PRESSURE_METER_ELBOW_OFFSET +
                                             Math.abs( this.modelViewTransform.modelToViewDeltaY( StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                                                                                  containerHeight ) ) );
        }
        else {
          // The container is exploding, so spin and move the gauge.
          this.pressureMeter.rotate( -Math.PI / 20 );
          this.pressureMeter.y = this.y + this.modelViewTransform.modelToViewDeltaY( containerHeight );
        }
      }
    },

    /**
     * Handle a notification that the container size has changed.
     * @public
     */
    handleContainerSizeChanged: function() {

      // IMPORTANT NOTE: This method assumes that only the height of the container can change, since this was true when
      // this method was created and it isn't worth the effort to make it more general.  If this assumption is ever
      // invalidated, this routine will need to be changed.

      var containerHeight = this.multipleParticleModel.getParticleContainerHeight(); // convenience variable
      if ( !this.multipleParticleModel.getContainerExploded() ) {
        if ( this.containerLid.getRotation() !== 0 ) {
          this.containerLid.setRotation( 0 );
        }
        this.containerLid.x = ( this.containerWidthWithMargin - this.containerLid.width ) / 2;
        this.containerLid.y = -this.modelViewTransform.modelToViewDeltaY( this.containmentAreaHeight - containerHeight );
      }
      else {

        // the container has exploded, so rotate the lid as it goes up so that it looks like it have been blown off
        var newCenterY = -this.modelViewTransform.modelToViewDeltaY( this.containmentAreaHeight - containerHeight );
        var deltaY = newCenterY - this.centerY;
        var rotationAmount = deltaY * Math.PI * 0.00013;
        this.containerLid.centerX = this.modelViewTransform.modelToViewDeltaX( this.containmentAreaWidth / 2 );
        this.containerLid.centerY = newCenterY;
        this.containerLid.rotateAround( this.containerLid.center, rotationAmount );
      }
      if ( this.pressureGaugeEnabled ) {
        this.updatePressureGauge();
      }
    }
  } );
} );