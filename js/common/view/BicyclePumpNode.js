// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class represents creates a graphical display that is meant to look like a bicycle pump.  It allows the user to
 * interact with it to move the handle up and down.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Saurabh Totey
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SegmentedBarGraphNode = require( 'STATES_OF_MATTER/common/view/SegmentedBarGraphNode' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // The follow constants define the size and positions of the various components of the pump as proportions of the
  // overall width and height of the node.
  var PUMP_BASE_WIDTH_PROPORTION = 0.35;
  var PUMP_BASE_HEIGHT_PROPORTION = 0.075;
  var PUMP_BODY_HEIGHT_PROPORTION = 0.7;
  var PUMP_BODY_WIDTH_PROPORTION = 0.07;
  var PUMP_SHAFT_WIDTH_PROPORTION = PUMP_BODY_WIDTH_PROPORTION * 0.25;
  var PUMP_SHAFT_HEIGHT_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION;
  var PUMP_HANDLE_HEIGHT_PROPORTION = 0.05;
  var PUMP_HANDLE_INIT_VERT_POS_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION * 1.1;
  var PIPE_CONNECTOR_HEIGHT_PROPORTION = 0.09;
  var HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
  var HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
  var SHAFT_OPENING_TILT_FACTOR = 0.33;
  var BODY_TO_HOSE_ATTACH_POINT_X = 13;
  var BODY_TO_HOSE_ATTACH_POINT_Y = -15;

  /**
   * @param {number} width  - width of the BicyclePump
   * @param {number} height - height of the BicyclePump
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function BicyclePumpNode( width, height, multipleParticleModel, options ) {

    Node.call( this );
    var self = this;

    //TODO: This file is currently under development by @chrisklus and @SaurabhTotey to be generalized and moved to
    // scenery-phet, see https://github.com/phetsims/states-of-matter/issues/217. Some things may be in a weird state
    // while we do this, e.g. most of the options below currently don't do anything yet.
    options = _.extend( {
      handleFill: new Color( 173, 175, 177 ),
      shaftFill: new Color( 202, 202, 202 ),
      shaftOpeningFill: new Color( 153, 119, 119 ),
      bodyFill: new Color( 213, 0, 0 ),
      indicatorBackgroundFill: '#443333',
      indicatorRemainingFill: '#999999',
      baseFill: new Color( 170, 170, 170 ),
      hoseFill: '#B3B3B3',
      numberOfParticlesPerPumpAction: 4,

      // {Vector2} where the hose will attach externally relative to the center of the pump
      hoseAttachmentOffset: new Vector2( 100, 100 )
    }, options );

    // @private
    this.multipleParticleModel = multipleParticleModel;
    this.containerAtomCapacity = 0;
    this.hoseAttachmentOffset = options.hoseAttachmentOffset;

    // @private - used to track where the current position is on the handle when drawing its gradient
    this.handleGradientPosition = 0;

    // Update the container capacity when the substance changes.
    multipleParticleModel.substanceProperty.link( function() {
      var apm = multipleParticleModel.moleculeDataSet.atomsPerMolecule;
      self.containerAtomCapacity = Math.floor( SOMConstants.MAX_NUM_ATOMS / apm ) * apm;
    } );

    var pumpShaft;
    var currentPumpingDistance = 0;

    // Add the base of the pump.  Many of the multipliers and point positions were arrived at empirically in the process
    // of trying to make the base look good.
    var baseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
    var baseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;

    // 3D effect is being used, so most of the height makes up the surface
    var topOfBaseHeight = baseHeight * 0.7;
    var halfOfBaseWidth = baseWidth / 2;

    // rounded rectangle that is the top of the base
    var topOfBaseNode = new Rectangle( -halfOfBaseWidth, -topOfBaseHeight / 2, baseWidth, topOfBaseHeight, 20, 20, {
      fill: new LinearGradient( -halfOfBaseWidth, 0, halfOfBaseWidth, 0 )
        .addColorStop( 0, options.baseFill.brighterColor( 0.8 ) )
        .addColorStop( 0.5, options.baseFill )
        .addColorStop( 1, options.baseFill.darkerColor( 0.8 ) )
    } );

    var pumpBaseEdgeHeight = baseHeight * 0.65;
    var pumpBaseSideEdgeYControlPoint = pumpBaseEdgeHeight * 1.05;
    var pumpBaseBottomEdgeXCurveStart = baseWidth * 0.35;

    // the front edge of the pump base, draw counter-clockwise starting at left edge
    var pumpEdgeShape = new Shape()
      .lineTo( -halfOfBaseWidth, 0 )
      .lineTo( -halfOfBaseWidth, pumpBaseEdgeHeight / 2 )
      .quadraticCurveTo( -halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, -pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight )
      .lineTo( pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight )
      .quadraticCurveTo( halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, halfOfBaseWidth, pumpBaseEdgeHeight / 2 )
      .lineTo( halfOfBaseWidth, 0 )
      .close();

    // color the front edge of the pump base
    var pumpEdgeNode = new Path( pumpEdgeShape, {
      fill: new LinearGradient( -halfOfBaseWidth, 0, halfOfBaseWidth, 0 )
        .addColorStop( 0, options.baseFill.darkerColor( 0.6 ) )
        .addColorStop( 0.85, options.baseFill.darkerColor( 0.8 ) )
        .addColorStop( 1, options.baseFill.darkerColor( 0.6 ) )
    } );

    var pumpBase = new Node( {
      children: [ pumpEdgeNode, topOfBaseNode ]
    } );
    this.addChild( pumpBase );

    // Add the handle of the pump. This is the node that the user will interact with in order to use the pump.
    var centerSectionWidth = 35;
    var centerCurveWidth = 14;
    var centerCurveHeight = 8;

    var gripSingleBumpWidth = 16;
    var gripSingleBumpHalfWidth = gripSingleBumpWidth / 2;
    var gripInterBumpWidth = gripSingleBumpWidth * 0.31;
    var numberOfGripBumps = 4;

    var gripEndHeight = 23;

    // start the handle from the center bottom, drawing around counterclockwise
    var pumpHandleShape = new Shape().moveTo( 0, 0 );

    /**
     * Add a "bump" to the top or bottom of the grip
     * @param {Shape} shape - the shape to append to
     * @param {number} sign - +1 for bottom side of grip, -1 for top side of grip
     */
    function addGripBump( shape, sign ) {

      // control points for quadratic curve shape on grip
      var controlPointX = gripSingleBumpWidth / 2;
      var controlPointY = gripSingleBumpWidth / 2;

      // this is a grip bump
      shape.quadraticCurveToRelative(
        sign * controlPointX,
        sign * controlPointY,
        sign * gripSingleBumpWidth,
        0 );
    }

    // this is the lower right part of the handle, including half of the middle section and the grip bumps
    pumpHandleShape.lineToRelative( centerSectionWidth / 2, 0 );
    pumpHandleShape.quadraticCurveToRelative( centerCurveWidth / 2, 0, centerCurveWidth, -centerCurveHeight );
    pumpHandleShape.lineToRelative( gripInterBumpWidth, 0 );
    for ( let i = 0; i < numberOfGripBumps - 1; i++ ) {
      addGripBump( pumpHandleShape, 1 );
      pumpHandleShape.lineToRelative( gripInterBumpWidth, 0 );
    }
    addGripBump( pumpHandleShape, 1 );

    // this is the right edge of the handle
    pumpHandleShape.lineToRelative( 0, -gripEndHeight );

    // this is the upper right part of the handle, including only the grip bumps
    for ( let i = 0; i < numberOfGripBumps; i++ ) {
      addGripBump( pumpHandleShape, -1 );
      pumpHandleShape.lineToRelative( -gripInterBumpWidth, 0 );
    }

    // this is the upper middle section of the handle
    pumpHandleShape.quadraticCurveToRelative( -centerCurveWidth / 2, -centerCurveHeight, -centerCurveWidth, -centerCurveHeight );
    pumpHandleShape.lineToRelative( -centerSectionWidth, 0 );
    pumpHandleShape.quadraticCurveToRelative( -centerCurveWidth / 2, 0, -centerCurveWidth, centerCurveHeight );
    pumpHandleShape.lineToRelative( -gripInterBumpWidth, 0 );

    // this is the upper left part of the handle, including only the grip bumps
    for ( let i = 0; i < numberOfGripBumps - 1; i++ ) {
      addGripBump( pumpHandleShape, -1 );
      pumpHandleShape.lineToRelative( -gripInterBumpWidth, 0 );
    }
    addGripBump( pumpHandleShape, -1 );

    // this is the left edge of the handle
    pumpHandleShape.lineToRelative( 0, gripEndHeight );

    // this is the lower left part of the handle, including the grip bumps and half of the middle section
    for ( let i = 0; i < numberOfGripBumps; i++ ) {
      addGripBump( pumpHandleShape, 1 );
      pumpHandleShape.lineToRelative( gripInterBumpWidth, 0 );
    }
    pumpHandleShape.quadraticCurveToRelative( centerCurveWidth / 2, centerCurveHeight, centerCurveWidth, centerCurveHeight );
    pumpHandleShape.lineToRelative( centerSectionWidth / 2, 0 );
    pumpHandleShape.close();

    /**
     *
     * @param gradient - the gradient being appended to
     * @param deltaDistance - the distance of this added color stop
     * @param totalDistance - the total width of the gradient
     * @param color - the color of this color stop
     */
    function addRelativeColorStop( gradient, deltaDistance, totalDistance, color ) {
      var newPosition = self.handleGradientPosition + deltaDistance;
      var ratio = newPosition / totalDistance;
      ratio = ratio > 1 ? 1 : ratio;

      gradient.addColorStop( ratio, color );
      self.handleGradientPosition = newPosition;
    }

    // setup the gradient for the handle
    var pumpHandleWidth = pumpHandleShape.bounds.width;
    var handleBaseColor = options.handleFill;
    var handleBaseColorDarker = handleBaseColor.darkerColor( 0.6 );
    var pumpHandleGradient = new LinearGradient( -pumpHandleWidth / 2, 0, pumpHandleWidth / 2, 0 );

    // fill the left side handle gradient
    for ( let i = 0; i < numberOfGripBumps; i++ ) {
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleBaseColor );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleBaseColor );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleBaseColorDarker );
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleBaseColor );
      addRelativeColorStop( pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleBaseColorDarker );
    }

    // fill the center section handle gradient
    addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleBaseColor );
    addRelativeColorStop( pumpHandleGradient, centerCurveWidth + centerSectionWidth, pumpHandleWidth, handleBaseColor );
    addRelativeColorStop( pumpHandleGradient, centerCurveWidth, pumpHandleWidth, handleBaseColorDarker );

    // fill the right side handle gradient
    for ( let i = 0; i < numberOfGripBumps; i++ ) {
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleBaseColor );
      addRelativeColorStop( pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleBaseColorDarker );
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleBaseColor );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleBaseColor );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleBaseColorDarker );
    }

    var pumpHandleNode = new Path( pumpHandleShape, {
      lineWidth: 2,
      stroke: 'black ',
      fill: pumpHandleGradient
    } );

    var pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
    pumpHandleNode.touchArea = pumpHandleNode.localBounds.dilatedXY( 100, 100 );
    pumpHandleNode.scale( pumpHandleHeight / pumpHandleNode.height );
    pumpHandleNode.setTranslation(
      0,
      -( ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) + pumpHandleNode.height )
    );

    var maxHandleYOffset = pumpHandleNode.centerY;
    var minHandleYOffset = maxHandleYOffset + ( -PUMP_SHAFT_HEIGHT_PROPORTION * height / 2 );

    // How far the pump shaft needs to travel before the pump releases a particle. -1 is added to account for minor drag
    // listener and floating-point errors.
    var pumpingDistanceRequiredToAddParticle = ( -minHandleYOffset + maxHandleYOffset ) /
                                               options.numberOfParticlesPerPumpAction - 1;

    // Set ourself up to listen for and handle mouse dragging events on the handle.
    pumpHandleNode.addInputListener( new SimpleDragHandler( {

      drag: function( event ) {

        // the position at the start of the drag event
        var handleStartYPos = pumpHandleNode.centerY;

        // update the handle and shaft position based on the user's pointer position
        var dragPositionY = pumpHandleNode.globalToParentPoint( event.pointer.point ).y;
        pumpHandleNode.centerY = Util.clamp( dragPositionY, minHandleYOffset, maxHandleYOffset );
        pumpShaft.top = pumpHandleNode.bottom;

        var travelDistance = handleStartYPos - pumpHandleNode.centerY;
        if ( travelDistance < 0 ) {

          // This motion is in the downward direction, so add its distance to the pumping distance.
          currentPumpingDistance += Math.abs( travelDistance );
          while ( currentPumpingDistance >= pumpingDistanceRequiredToAddParticle ) {

            // Enough distance has been travelled to inject a new particle.
            multipleParticleModel.injectMolecule();
            currentPumpingDistance -= pumpingDistanceRequiredToAddParticle;
          }
        }
        else if ( travelDistance > 0 ) {

          // This motion is in the upward direction, so reset any accumulated pumping distance.
          currentPumpingDistance = 0;
        }
      }
    } ) );

    // Create the shaft for the pump.
    // The shaft of the pump is the part which is under the handle and inside the body
    var pumpShaftWidth = width * PUMP_SHAFT_WIDTH_PROPORTION;
    var pumpShaftHeight = height * PUMP_SHAFT_HEIGHT_PROPORTION;
    pumpShaft = new Rectangle( 0, 0, pumpShaftWidth, pumpShaftHeight, {
      fill: new LinearGradient( 0, 0, pumpShaftHeight, 0 )
        .addColorStop( 0, options.shaftFill.darkerColor( 0.8 ) )
        .addColorStop( 0.2, options.shaftFill ),
      stroke: options.shaftFill.darkerColor( 0.6 ),
      pickable: false
    } );
    pumpShaft.x = -pumpShaftWidth / 2;
    pumpShaft.top = pumpHandleNode.bottom;

    // Create the body of the pump
    var pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
    var pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
    var pumpBody = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 0, 0, {
      fill: new LinearGradient( 0, 0, pumpBodyWidth, 0 )
        .addColorStop( 0, options.bodyFill.brighterColor( 0.8 ) )
        .addColorStop( 0.4, options.bodyFill )
        .addColorStop( 0.7, options.bodyFill.darkerColor( 0.8 ) )
    } );
    pumpBody.setTranslation( -pumpBodyWidth / 2, -pumpBodyHeight );

    // Create the back portion of the opening at the top of the pump body
    var pumpOpeningBackShape = new Shape()
      .moveTo( 0, 0 )
      .cubicCurveTo(
        0,
        -pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
        pumpBodyWidth,
        -pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
        pumpBodyWidth,
        0
      );

    var pumpOpeningFillColor = options.shaftOpeningFill;
    var pumpOpeningStrokeColor = options.shaftOpeningFill.darkerColor( 0.8 );

    var pumpOpeningBack = new Path( pumpOpeningBackShape, {
      fill: pumpOpeningFillColor,
      stroke: pumpOpeningStrokeColor,
      centerX: pumpBody.centerX,
      bottom: pumpBody.top
    } );

    // Create the front portion of the opening at the top of the pump body
    var pumpOpeningFrontShape = new Shape()
      .moveTo( 0, 0 )
      .cubicCurveTo(
        0,
        pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
        pumpBodyWidth,
        pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
        pumpBodyWidth,
        0
      );

    var pumpOpeningFront = new Path( pumpOpeningFrontShape, {
      fill: pumpOpeningFillColor,
      stroke: pumpOpeningStrokeColor,
      centerX: pumpBody.centerX,
      top: pumpOpeningBack.bottom - 0.4 // tweak the position very slightly to prevent pump body from showing through
    } );

    // Add the hose.
    var hosePath = new Path( new Shape()
      .moveTo( 0, BODY_TO_HOSE_ATTACH_POINT_Y )
      .cubicCurveTo( 1.5 * ( options.hoseAttachmentOffset.x - BODY_TO_HOSE_ATTACH_POINT_X ), BODY_TO_HOSE_ATTACH_POINT_Y,
        0, options.hoseAttachmentOffset.y,
        options.hoseAttachmentOffset.x, options.hoseAttachmentOffset.y ), {
      lineWidth: 4,
      stroke: options.hoseFill
    } );
    this.addChild( hosePath );

    // create the pipe connector, which is the cone between the base and the pump body
    var pipeConnectorTopWidth = pumpBodyWidth * 1.2;
    var pipeConnectorTopRadiusY = 3;
    var pipeConnectorTopRadiusX = pipeConnectorTopWidth / 2;
    var pipeConnectorBottomWidth = pumpBodyWidth * 2;
    var pipeConnectorBottomRadiusY = 4;
    var pipeConnectorBottomRadiusX = pipeConnectorBottomWidth / 2;
    var pipeConnectorHeight = height * PIPE_CONNECTOR_HEIGHT_PROPORTION;
    var pipeConnectorPath = new Path( new Shape()

      // start in upper right corner of shape, draw top ellipse right to left
        .ellipticalArc( 0, 0, pipeConnectorTopRadiusX, pipeConnectorTopRadiusY, 0, 0, Math.PI, false )
        .lineTo( -pipeConnectorBottomRadiusX, pipeConnectorHeight ) // line to bottom left corner of shape

        // draw bottom ellipse left to right
        .ellipticalArc( 0, pipeConnectorHeight, pipeConnectorBottomRadiusX, pipeConnectorBottomRadiusY, 0, Math.PI, 0, true )
        .lineTo( pipeConnectorTopRadiusX, 0 ), // line to upper right corner of shape
      {
        fill: new LinearGradient( -pipeConnectorBottomWidth / 2, 0, pipeConnectorBottomWidth / 2, 0 )
          .addColorStop( 0, options.baseFill.darkerColor( 0.5 ) )
          .addColorStop( 0.50, options.baseFill )
          .addColorStop( 0.55, options.baseFill.brighterColor( 0.9 ) )
          .addColorStop( 0.65, options.baseFill.brighterColor( 0.9 ) )
          .addColorStop( 0.7, options.baseFill )
          .addColorStop( 1, options.baseFill.darkerColor( 0.6 ) )
      } );
    pipeConnectorPath.setTranslation( 0, -pipeConnectorHeight - baseHeight * 0.15 );

    // Create the hose connector
    var hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
    var createHoseConnectorNode = function() {
      return new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2, {
        fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
          .addColorStop( 0, options.baseFill.darkerColor( 0.8 ) )
          .addColorStop( 0.3, options.baseFill )
          .addColorStop( 0.35, options.baseFill.brighterColor( 0.9 ) )
          .addColorStop( 0.4, options.baseFill.brighterColor( 0.9 ) )
          .addColorStop( 1, options.baseFill.darkerColor( 0.8 ) )
      } );
    };
    var externalHoseConnector = createHoseConnectorNode();
    var localHoseConnector = createHoseConnectorNode();
    externalHoseConnector.setTranslation(
      options.hoseAttachmentOffset.x - externalHoseConnector.width,
      options.hoseAttachmentOffset.y - externalHoseConnector.height / 2
    );
    var localHoseOffsetX = options.hoseAttachmentOffset.x > 0 ? BODY_TO_HOSE_ATTACH_POINT_X : -BODY_TO_HOSE_ATTACH_POINT_X;
    localHoseConnector.setTranslation(
      localHoseOffsetX - hoseConnectorWidth / 2,
      BODY_TO_HOSE_ATTACH_POINT_Y - localHoseConnector.height / 2
    );

    // define a property that tracks the remaining capacity
    this.remainingPumpCapacityProportionProperty = new Property( 1 );

    // create the node that will be used to indicate the remaining capacity
    var remainingCapacityIndicator = new SegmentedBarGraphNode(
      pumpBodyWidth * 0.6,
      pumpBodyHeight * 0.7,
      this.remainingPumpCapacityProportionProperty,
      {
        centerX: pumpShaft.centerX,
        centerY: ( pumpBody.top + pipeConnectorPath.top ) / 2,
        numSegments: 36,
        backgroundColor: options.indicatorBackgroundFill,
        fullyLitIndicatorColor: options.indicatorRemainingFill,
        indicatorHeightProportion: 0.7
      }
    );

    // add the pieces with the correct layering
    this.addChild( pumpOpeningBack );
    this.addChild( pumpShaft );
    this.addChild( pumpHandleNode );
    this.addChild( pumpBody );
    this.addChild( remainingCapacityIndicator );
    this.addChild( pumpOpeningFront );
    this.addChild( pipeConnectorPath );
    this.addChild( externalHoseConnector );
    this.addChild( localHoseConnector );

    this.mutate( options );
  }

  statesOfMatter.register( 'BicyclePumpNode', BicyclePumpNode );

  return inherit( Node, BicyclePumpNode, {

    // @public
    step: function() {

      // update the remaining capacity proportion, which is reflected on the indicator on the pump shaft
      var remainingCapacityProportion;
      if ( this.multipleParticleModel.isExplodedProperty.get() ) {
        remainingCapacityProportion = 0;
      }
      else {
        remainingCapacityProportion =
          1 - this.multipleParticleModel.moleculeDataSet.numberOfAtoms / this.containerAtomCapacity;
      }
      this.remainingPumpCapacityProportionProperty.set( remainingCapacityProportion );
    },

    /**
     * This function sets the position of this whole node by translating itself so that the external end of the hose
     * is at the provided screen coordinates.
     *
     * @param {number} x
     * @param {number} y
     * @public
     */
    setHoseAttachmentPosition: function( x, y ) {
      this.x = x - this.hoseAttachmentOffset.x;
      this.y = y - this.hoseAttachmentOffset.y;
    }
  } );
} );