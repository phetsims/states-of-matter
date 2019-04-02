// Copyright 2014-2019, University of Colorado Boulder

/**
 * This is a graphical representation of a bicycle pump. A user can move the handle up and down.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Saurabh Totey
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SegmentedBarGraphNode = require( 'STATES_OF_MATTER/common/view/SegmentedBarGraphNode' );
  const Shape = require( 'KITE/Shape' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // The follow constants define the size and positions of the various components of the pump as proportions of the
  // overall width and height of the node.
  const PUMP_BASE_WIDTH_PROPORTION = 0.35;
  const PUMP_BASE_HEIGHT_PROPORTION = 0.075;
  const PUMP_BODY_HEIGHT_PROPORTION = 0.7;
  const PUMP_BODY_WIDTH_PROPORTION = 0.07;
  const PUMP_SHAFT_WIDTH_PROPORTION = PUMP_BODY_WIDTH_PROPORTION * 0.25;
  const PUMP_SHAFT_HEIGHT_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION;
  const PUMP_HANDLE_HEIGHT_PROPORTION = 0.05;
  const PUMP_HANDLE_INIT_VERT_POS_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION * 1.1;
  const PIPE_CONNECTOR_HEIGHT_PROPORTION = 0.09;
  const HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
  const HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
  const SHAFT_OPENING_TILT_FACTOR = 0.33;
  const BODY_TO_HOSE_ATTACH_POINT_X = 13;
  const BODY_TO_HOSE_ATTACH_POINT_Y = -15;

  //TODO: This file is currently under development by @chrisklus and @SaurabhTotey to be generalized and moved to
  // scenery-phet, see https://github.com/phetsims/states-of-matter/issues/217.

  class BicyclePumpNode extends Node {

    /**
     * @param {number} width  - width of the BicyclePump
     * @param {number} height - height of the BicyclePump
     * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
     * @param {Object} [options]
     */
    constructor( width, height, multipleParticleModel, options ) {

      options = _.extend( {

        // {string|Color} - various colors used by the pump
        handleFill: '#adafb1',
        shaftFill: '#cacaca',
        bodyFill: '#d50000',
        bodyTopFill: '#997777',
        indicatorBackgroundFill: '#443333',
        indicatorRemainingFill: '#999999',
        baseFill: '#aaaaaa',
        hoseFill: '#B3B3B3',
        numberOfParticlesPerPumpAction: 4,

        // {Vector2} where the hose will attach externally relative to the center of the pump
        hoseAttachmentOffset: new Vector2( 100, 100 )
      }, options );

      super( options );

      // @private
      this.multipleParticleModel = multipleParticleModel;
      this.containerAtomCapacity = 0;
      this.hoseAttachmentOffset = options.hoseAttachmentOffset;

      // @private - used to track where the current position is on the handle when drawing its gradient
      this.handleGradientPosition = 0;

      // Update the container capacity when the substance changes.
      multipleParticleModel.substanceProperty.link( () => {
        const apm = multipleParticleModel.moleculeDataSet.atomsPerMolecule;
        this.containerAtomCapacity = Math.floor( SOMConstants.MAX_NUM_ATOMS / apm ) * apm;
      } );

      let currentPumpingDistance = 0;

      // Add the base of the pump.  Many of the multipliers and point positions were arrived at empirically in the process
      // of trying to make the base look good.
      const baseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
      const baseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;

      // 3D effect is being used, so most of the height makes up the surface
      const topOfBaseHeight = baseHeight * 0.7;
      const halfOfBaseWidth = baseWidth / 2;
      const baseFill = Color.toColor( options.baseFill );

      // rounded rectangle that is the top of the base
      const topOfBaseNode = new Rectangle( -halfOfBaseWidth, -topOfBaseHeight / 2, baseWidth, topOfBaseHeight, 20, 20, {
        fill: new LinearGradient( -halfOfBaseWidth, 0, halfOfBaseWidth, 0 )
          .addColorStop( 0, baseFill.brighterColor( 0.8 ) )
          .addColorStop( 0.5, baseFill )
          .addColorStop( 1, baseFill.darkerColor( 0.8 ) )
      } );

      const pumpBaseEdgeHeight = baseHeight * 0.65;
      const pumpBaseSideEdgeYControlPoint = pumpBaseEdgeHeight * 1.05;
      const pumpBaseBottomEdgeXCurveStart = baseWidth * 0.35;

      // the front edge of the pump base, draw counter-clockwise starting at left edge
      const pumpEdgeShape = new Shape()
        .lineTo( -halfOfBaseWidth, 0 )
        .lineTo( -halfOfBaseWidth, pumpBaseEdgeHeight / 2 )
        .quadraticCurveTo( -halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, -pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight )
        .lineTo( pumpBaseBottomEdgeXCurveStart, pumpBaseEdgeHeight )
        .quadraticCurveTo( halfOfBaseWidth, pumpBaseSideEdgeYControlPoint, halfOfBaseWidth, pumpBaseEdgeHeight / 2 )
        .lineTo( halfOfBaseWidth, 0 )
        .close();

      // color the front edge of the pump base
      const pumpEdgeNode = new Path( pumpEdgeShape, {
        fill: new LinearGradient( -halfOfBaseWidth, 0, halfOfBaseWidth, 0 )
          .addColorStop( 0, baseFill.darkerColor( 0.6 ) )
          .addColorStop( 0.85, baseFill.darkerColor( 0.8 ) )
          .addColorStop( 1, baseFill.darkerColor( 0.6 ) )
      } );

      const pumpBase = new Node( {
        children: [ pumpEdgeNode, topOfBaseNode ]
      } );
      this.addChild( pumpBase );

      // Add the handle of the pump. This is the node that the user will interact with in order to use the pump.
      const centerSectionWidth = 35;
      const centerCurveWidth = 14;
      const centerCurveHeight = 8;

      const gripSingleBumpWidth = 16;
      const gripSingleBumpHalfWidth = gripSingleBumpWidth / 2;
      const gripInterBumpWidth = gripSingleBumpWidth * 0.31;
      const numberOfGripBumps = 4;

      const gripEndHeight = 23;

      // start the handle from the center bottom, drawing around counterclockwise
      const pumpHandleShape = new Shape().moveTo( 0, 0 );

      /**
       * Add a "bump" to the top or bottom of the grip
       * @param {Shape} shape - the shape to append to
       * @param {number} sign - +1 for bottom side of grip, -1 for top side of grip
       */
      const addGripBump = ( shape, sign ) => {

        // control points for quadratic curve shape on grip
        const controlPointX = gripSingleBumpWidth / 2;
        const controlPointY = gripSingleBumpWidth / 2;

        // this is a grip bump
        shape.quadraticCurveToRelative(
          sign * controlPointX,
          sign * controlPointY,
          sign * gripSingleBumpWidth,
          0 );
      };

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
       * Adds a color stop to the given gradient at
       *
       * @param gradient - the gradient being appended to
       * @param deltaDistance - the distance of this added color stop
       * @param totalDistance - the total width of the gradient
       * @param color - the color of this color stop
       */
      const addRelativeColorStop = ( gradient, deltaDistance, totalDistance, color ) => {
        const newPosition = this.handleGradientPosition + deltaDistance;
        let ratio = newPosition / totalDistance;
        ratio = ratio > 1 ? 1 : ratio;

        gradient.addColorStop( ratio, color );
        this.handleGradientPosition = newPosition;
      };

      // setup the gradient for the handle
      const pumpHandleWidth = pumpHandleShape.bounds.width;
      const handleFill = Color.toColor( options.handleFill );
      const handleFillDarker = handleFill.darkerColor( 0.6 );
      const pumpHandleGradient = new LinearGradient( -pumpHandleWidth / 2, 0, pumpHandleWidth / 2, 0 );

      // fill the left side handle gradient
      for ( let i = 0; i < numberOfGripBumps; i++ ) {
        addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFill );
        addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFill );
        addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarker );
        addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFill );
        addRelativeColorStop( pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarker );
      }

      // fill the center section handle gradient
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFill );
      addRelativeColorStop( pumpHandleGradient, centerCurveWidth + centerSectionWidth, pumpHandleWidth, handleFill );
      addRelativeColorStop( pumpHandleGradient, centerCurveWidth, pumpHandleWidth, handleFillDarker );

      // fill the right side handle gradient
      for ( let i = 0; i < numberOfGripBumps; i++ ) {
        addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFill );
        addRelativeColorStop( pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarker );
        addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFill );
        addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFill );
        addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarker );
      }

      const pumpHandleNode = new Path( pumpHandleShape, {
        lineWidth: 2,
        stroke: 'black ',
        fill: pumpHandleGradient
      } );

      const pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
      pumpHandleNode.touchArea = pumpHandleNode.localBounds.dilatedXY( 100, 100 );
      pumpHandleNode.scale( pumpHandleHeight / pumpHandleNode.height );
      pumpHandleNode.setTranslation(
        0,
        -( ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) + pumpHandleNode.height )
      );

      const maxHandleYOffset = pumpHandleNode.centerY;
      const minHandleYOffset = maxHandleYOffset + ( -PUMP_SHAFT_HEIGHT_PROPORTION * height / 2 );

      // How far the pump shaft needs to travel before the pump releases a particle. -1 is added to account for minor drag
      // listener and floating-point errors.
      const pumpingDistanceRequiredToAddParticle = ( -minHandleYOffset + maxHandleYOffset ) /
                                                 options.numberOfParticlesPerPumpAction - 1;

      pumpHandleNode.addInputListener( new SimpleDragHandler( {

        drag: event => {

          // the position at the start of the drag event
          const handleStartYPos = pumpHandleNode.centerY;

          // update the handle and shaft position based on the user's pointer position
          const dragPositionY = pumpHandleNode.globalToParentPoint( event.pointer.point ).y;
          pumpHandleNode.centerY = Util.clamp( dragPositionY, minHandleYOffset, maxHandleYOffset );
          pumpShaft.top = pumpHandleNode.bottom;

          const travelDistance = handleStartYPos - pumpHandleNode.centerY;
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

      // Create the shaft for the pump, which is the part below the handle and inside the body
      const pumpShaftWidth = width * PUMP_SHAFT_WIDTH_PROPORTION;
      const pumpShaftHeight = height * PUMP_SHAFT_HEIGHT_PROPORTION;
      const shaftFill = Color.toColor( options.shaftFill );

      const pumpShaft = new Rectangle( 0, 0, pumpShaftWidth, pumpShaftHeight, {
        fill: new LinearGradient( 0, 0, pumpShaftHeight, 0 )
          .addColorStop( 0, shaftFill.darkerColor( 0.8 ) )
          .addColorStop( 0.2, shaftFill ),
        stroke: shaftFill.darkerColor( 0.6 ),
        pickable: false
      } );
      pumpShaft.x = -pumpShaftWidth / 2;
      pumpShaft.top = pumpHandleNode.bottom;

      // Create the body of the pump
      const pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
      const pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
      const bodyFill = Color.toColor( options.bodyFill );

      const pumpBody = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 0, 0, {
        fill: new LinearGradient( 0, 0, pumpBodyWidth, 0 )
          .addColorStop( 0, bodyFill.brighterColor( 0.8 ) )
          .addColorStop( 0.4, bodyFill )
          .addColorStop( 0.7, bodyFill.darkerColor( 0.8 ) )
      } );
      pumpBody.setTranslation( -pumpBodyWidth / 2, -pumpBodyHeight );

      // Create the back portion of the opening at the top of the pump body
      const bodyTopBackShape = new Shape()
        .moveTo( 0, 0 )
        .cubicCurveTo(
          0,
          -pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
          pumpBodyWidth,
          -pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
          pumpBodyWidth,
          0
        );

      const bodyTopFill = Color.toColor( options.bodyTopFill );
      const pumpOpeningStroke = bodyTopFill.darkerColor( 0.8 );

      const bodyTopBack = new Path( bodyTopBackShape, {
        fill: bodyTopFill,
        stroke: pumpOpeningStroke,
        centerX: pumpBody.centerX,
        bottom: pumpBody.top
      } );

      // Create the front portion of the opening at the top of the pump body
      const bodyTopFrontShape = new Shape()
        .moveTo( 0, 0 )
        .cubicCurveTo(
          0,
          pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
          pumpBodyWidth,
          pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
          pumpBodyWidth,
          0
        );

      const bodyTopFront = new Path( bodyTopFrontShape, {
        fill: bodyTopFill,
        stroke: pumpOpeningStroke,
        centerX: pumpBody.centerX,
        top: bodyTopBack.bottom - 0.4 // tweak the position very slightly to prevent pump body from showing through
      } );

      // Add the hose.
      const hosePath = new Path( new Shape()
        .moveTo( 0, BODY_TO_HOSE_ATTACH_POINT_Y )
        .cubicCurveTo( 1.5 * ( options.hoseAttachmentOffset.x - BODY_TO_HOSE_ATTACH_POINT_X ), BODY_TO_HOSE_ATTACH_POINT_Y,
          0, options.hoseAttachmentOffset.y,
          options.hoseAttachmentOffset.x, options.hoseAttachmentOffset.y ), {
        lineWidth: 4,
        stroke: options.hoseFill
      } );
      this.addChild( hosePath );

      // create the pipe connector, which is the cone between the base and the pump body
      const pipeConnectorTopWidth = pumpBodyWidth * 1.2;
      const pipeConnectorTopRadiusY = 3;
      const pipeConnectorTopRadiusX = pipeConnectorTopWidth / 2;
      const pipeConnectorBottomWidth = pumpBodyWidth * 2;
      const pipeConnectorBottomRadiusY = 4;
      const pipeConnectorBottomRadiusX = pipeConnectorBottomWidth / 2;
      const pipeConnectorHeight = height * PIPE_CONNECTOR_HEIGHT_PROPORTION;
      const pipeConnectorPath = new Path( new Shape()

        // start in upper right corner of shape, draw top ellipse right to left
          .ellipticalArc( 0, 0, pipeConnectorTopRadiusX, pipeConnectorTopRadiusY, 0, 0, Math.PI, false )
          .lineTo( -pipeConnectorBottomRadiusX, pipeConnectorHeight ) // line to bottom left corner of shape

          // draw bottom ellipse left to right
          .ellipticalArc( 0, pipeConnectorHeight, pipeConnectorBottomRadiusX, pipeConnectorBottomRadiusY, 0, Math.PI, 0, true )
          .lineTo( pipeConnectorTopRadiusX, 0 ), // line to upper right corner of shape
        {
          fill: new LinearGradient( -pipeConnectorBottomWidth / 2, 0, pipeConnectorBottomWidth / 2, 0 )
            .addColorStop( 0, baseFill.darkerColor( 0.5 ) )
            .addColorStop( 0.50, baseFill )
            .addColorStop( 0.55, baseFill.brighterColor( 0.9 ) )
            .addColorStop( 0.65, baseFill.brighterColor( 0.9 ) )
            .addColorStop( 0.7, baseFill )
            .addColorStop( 1, baseFill.darkerColor( 0.6 ) )
        } );
      pipeConnectorPath.setTranslation( 0, -pipeConnectorHeight - baseHeight * 0.15 );

      // Create the hose connector
      const hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
      const hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
      
      const createHoseConnectorNode = () => {
        return new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2, {
          fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
            .addColorStop( 0, baseFill.darkerColor( 0.8 ) )
            .addColorStop( 0.3, baseFill )
            .addColorStop( 0.35, baseFill.brighterColor( 0.9 ) )
            .addColorStop( 0.4, baseFill.brighterColor( 0.9 ) )
            .addColorStop( 1, baseFill.darkerColor( 0.8 ) )
        } );
      };
      
      const externalHoseConnector = createHoseConnectorNode();
      const localHoseConnector = createHoseConnectorNode();
      externalHoseConnector.setTranslation(
        options.hoseAttachmentOffset.x - externalHoseConnector.width,
        options.hoseAttachmentOffset.y - externalHoseConnector.height / 2
      );
      const localHoseOffsetX = options.hoseAttachmentOffset.x > 0 ? BODY_TO_HOSE_ATTACH_POINT_X : -BODY_TO_HOSE_ATTACH_POINT_X;
      localHoseConnector.setTranslation(
        localHoseOffsetX - hoseConnectorWidth / 2,
        BODY_TO_HOSE_ATTACH_POINT_Y - localHoseConnector.height / 2
      );

      // define a property that tracks the remaining capacity
      this.remainingPumpCapacityProportionProperty = new Property( 1 );

      // create the node that will be used to indicate the remaining capacity
      const remainingCapacityIndicator = new SegmentedBarGraphNode(
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
      this.addChild( bodyTopBack );
      this.addChild( pumpShaft );
      this.addChild( pumpHandleNode );
      this.addChild( pumpBody );
      this.addChild( remainingCapacityIndicator );
      this.addChild( bodyTopFront );
      this.addChild( pipeConnectorPath );
      this.addChild( externalHoseConnector );
      this.addChild( localHoseConnector );

      this.mutate( options );
    }

    // @public
    step() {

      // update the remaining capacity proportion, which is reflected on the indicator on the pump shaft
      let remainingCapacityProportion;
      if ( this.multipleParticleModel.isExplodedProperty.get() ) {
        remainingCapacityProportion = 0;
      }
      else {
        remainingCapacityProportion =
          1 - this.multipleParticleModel.moleculeDataSet.numberOfAtoms / this.containerAtomCapacity;
      }
      this.remainingPumpCapacityProportionProperty.set( remainingCapacityProportion );
    }

    /**
     * This function sets the position of this whole node by translating itself so that the external end of the hose
     * is at the provided screen coordinates.
     *
     * @param {number} x
     * @param {number} y
     * @public
     */
    setHoseAttachmentPosition( x, y ) {
      this.x = x - this.hoseAttachmentOffset.x;
      this.y = y - this.hoseAttachmentOffset.y;
    }
  }

  return statesOfMatter.register( 'BicyclePumpNode', BicyclePumpNode );
} );