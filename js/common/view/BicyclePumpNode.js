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
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PaintColorProperty = require( 'SCENERY/util/PaintColorProperty' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SegmentedBarGraphNode = require( 'STATES_OF_MATTER/common/view/SegmentedBarGraphNode' );
  const Shape = require( 'KITE/Shape' );
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
  const CONE_HEIGHT_PROPORTION = 0.09;
  const HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
  const HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
  const SHAFT_OPENING_TILT_FACTOR = 0.33;
  const BODY_TO_HOSE_ATTACH_POINT_X = 13;
  const BODY_TO_HOSE_ATTACH_POINT_Y = -15;

  //TODO: This file is currently under development by @chrisklus and @SaurabhTotey to be generalized and moved to
  // scenery-phet, see https://github.com/phetsims/states-of-matter/issues/217.

  class BicyclePumpNode extends Node {

    /**
     * @param {NumberProperty} numberProperty - number of particles in the simulation
     * @param {Property.<Range>} rangeProperty - allowed range
     * @param {Object} [options]
     */
    constructor( numberProperty, rangeProperty, options ) {

      options = _.extend( {

        // {number} sizing
        width: 200,
        height: 250,

        // {ColorDef} various colors used by the pump
        handleFill: '#adafb1',
        shaftFill: '#cacaca',
        bodyFill: '#d50000',
        bodyTopFill: '#997677',
        indicatorBackgroundFill: '#443333',
        indicatorRemainingFill: '#999999',
        hoseFill: '#b3b3b3',
        baseFill: '#aaaaaa', // this color is also used for the cone shape and hose connectors

        // {number} number of particles released by the pump during one pumping action
        numberOfParticlesPerPumpAction: 8,

        // {Vector2} where the hose will attach externally relative to the center of the pump
        hoseAttachmentOffset: new Vector2( 100, 100 ),

        // {BooleanProperty} Determines whether the pump will be updated when its number changes. If the pump's range
        // changes, the pumps indicator will update regardless of enabledProperty.
        enabledProperty: new BooleanProperty( true )
      }, options );

      const width = options.width;
      const height = options.height;

      super( options );

      // @private
      this.hoseAttachmentOffset = options.hoseAttachmentOffset;

      // create the base of the pump
      const baseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
      const baseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;
      const baseFillColorProperty = new PaintColorProperty( options.baseFill );
      const pumpBaseNode = createPumpBaseNode( baseWidth, baseHeight, baseFillColorProperty );

      // sizing for the body of the pump
      const pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
      const pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;

      // create the cone
      const coneHeight = height * CONE_HEIGHT_PROPORTION;
      const coneNode = createConeNode( pumpBodyWidth, coneHeight, baseFillColorProperty );
      coneNode.bottom = pumpBaseNode.top + 8;

      // use PaintColorProperty so that colors can be updated dynamically via ColorProfile
      const bodyFillColorProperty = new PaintColorProperty( options.bodyFill );
      const bodyFillBrighterColorProperty = new PaintColorProperty( bodyFillColorProperty, { luminanceFactor: 0.2 } );
      const bodyFillDarkerColorProperty = new PaintColorProperty( bodyFillColorProperty, { luminanceFactor: -0.2 } );

      // create the body of the pump
      const pumpBodyNode = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 0, 0, {
        fill: new LinearGradient( 0, 0, pumpBodyWidth, 0 )
          .addColorStop( 0, bodyFillBrighterColorProperty )
          .addColorStop( 0.4, bodyFillColorProperty )
          .addColorStop( 0.7, bodyFillDarkerColorProperty )
      } );
      pumpBodyNode.centerX = coneNode.centerX;
      pumpBodyNode.bottom = coneNode.top + 18;

      // use PaintColorProperty so that colors can be updated dynamically via ColorProfile
      const bodyTopFillColorProperty = new PaintColorProperty( options.bodyTopFill );
      const bodyTopStrokeColorProperty = new PaintColorProperty( bodyTopFillColorProperty, { luminanceFactor: -0.3 } );

      // create the back part of the top of the body
      const bodyTopBackNode = createBodyTopHalfNode( pumpBodyWidth, -1, bodyTopFillColorProperty, bodyTopStrokeColorProperty );
      bodyTopBackNode.centerX = pumpBodyNode.centerX;
      bodyTopBackNode.bottom = pumpBodyNode.top;

      // create the front part of the top of the body
      const bodyTopFrontNode = createBodyTopHalfNode( pumpBodyWidth, 1, bodyTopFillColorProperty, bodyTopStrokeColorProperty );
      bodyTopFrontNode.centerX = pumpBodyNode.centerX;
      bodyTopFrontNode.top = bodyTopBackNode.bottom - 0.4; // tweak slightly to prevent pump body from showing through

      // create the node that will be used to indicate the remaining capacity
      const remainingCapacityIndicator = new SegmentedBarGraphNode(
        numberProperty,
        rangeProperty,
        {
          width: pumpBodyWidth * 0.6,
          height: pumpBodyHeight * 0.7,
          centerX: pumpBodyNode.centerX,
          centerY: ( pumpBodyNode.top + coneNode.top ) / 2,
          numSegments: 36,
          backgroundColor: options.indicatorBackgroundFill,
          fullyLitIndicatorColor: options.indicatorRemainingFill,
          indicatorHeightProportion: 0.7
        }
      );

      // create the hose
      const hoseNode = new Path( new Shape()
        .moveTo( 0, BODY_TO_HOSE_ATTACH_POINT_Y )
        .cubicCurveTo( 1.5 * ( options.hoseAttachmentOffset.x - BODY_TO_HOSE_ATTACH_POINT_X ), BODY_TO_HOSE_ATTACH_POINT_Y,
          0, options.hoseAttachmentOffset.y,
          options.hoseAttachmentOffset.x, options.hoseAttachmentOffset.y ), {
        lineWidth: 4,
        stroke: options.hoseFill
      } );

      const hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
      const hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;

      // create the external hose connector, which connects the hose to an external point
      const externalHoseConnector = createHoseConnectorNode( hoseConnectorWidth, hoseConnectorHeight, baseFillColorProperty );
      externalHoseConnector.setTranslation(
        options.hoseAttachmentOffset.x - externalHoseConnector.width,
        options.hoseAttachmentOffset.y - externalHoseConnector.height / 2
      );

      // create the local hose connector, which connects the hose to the cone
      const localHoseConnector = createHoseConnectorNode( hoseConnectorWidth, hoseConnectorHeight, baseFillColorProperty );
      const localHoseOffsetX = options.hoseAttachmentOffset.x > 0 ? BODY_TO_HOSE_ATTACH_POINT_X : -BODY_TO_HOSE_ATTACH_POINT_X;
      localHoseConnector.setTranslation(
        localHoseOffsetX - hoseConnectorWidth / 2,
        BODY_TO_HOSE_ATTACH_POINT_Y - localHoseConnector.height / 2
      );

      // create the handle of the pump
      const pumpHandleNode = createPumpHandleNode( options.handleFill );
      const pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
      pumpHandleNode.touchArea = pumpHandleNode.localBounds.dilatedXY( 100, 100 );
      pumpHandleNode.scale( pumpHandleHeight / pumpHandleNode.height );
      pumpHandleNode.setTranslation(
        0,
        -( ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) + pumpHandleNode.height )
      );

      // sizing for the pump shaft
      const pumpShaftWidth = width * PUMP_SHAFT_WIDTH_PROPORTION;
      const pumpShaftHeight = height * PUMP_SHAFT_HEIGHT_PROPORTION;

      // use PaintColorProperty so that colors can be updated dynamically via ColorProfile
      const shaftFillColorProperty = new PaintColorProperty( options.shaftFill );
      const shaftStrokeColorProperty = new PaintColorProperty( shaftFillColorProperty, { luminanceFactor: -0.38 } );

      // create the pump shaft, which is the part below the handle and inside the body
      const pumpShaftNode = new Rectangle( 0, 0, pumpShaftWidth, pumpShaftHeight, {
        fill: shaftFillColorProperty,
        stroke: shaftStrokeColorProperty,
        pickable: false
      } );
      pumpShaftNode.x = -pumpShaftWidth / 2;
      pumpShaftNode.top = pumpHandleNode.bottom;

      const maxHandleYOffset = pumpHandleNode.centerY;
      const minHandleYOffset = maxHandleYOffset + ( -PUMP_SHAFT_HEIGHT_PROPORTION * height / 2 );

      pumpHandleNode.addInputListener(
        new HandleNodeDragListener( numberProperty, rangeProperty, options.enabledProperty,
          minHandleYOffset, maxHandleYOffset, pumpHandleNode, pumpShaftNode, options.numberOfParticlesPerPumpAction )
      );

      // add the pieces with the correct layering
      this.addChild( hoseNode );
      this.addChild( pumpBaseNode );
      this.addChild( bodyTopBackNode );
      this.addChild( pumpShaftNode );
      this.addChild( pumpHandleNode );
      this.addChild( pumpBodyNode );
      this.addChild( remainingCapacityIndicator );
      this.addChild( bodyTopFrontNode );
      this.addChild( coneNode );
      this.addChild( externalHoseConnector );
      this.addChild( localHoseConnector );
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

  /**
   * Draws the base of the pump. Many of the multipliers and point positions were arrived at empirically.
   *
   * @param {number} width - the width of the base
   * @param {number} height - the height of the base
   * @param {PaintColorProperty} baseFillColorProperty
   */
  function createPumpBaseNode( width, height, baseFillColorProperty ) {

    // 3D effect is being used, so most of the height makes up the surface
    const topOfBaseHeight = height * 0.7;
    const halfOfBaseWidth = width / 2;

    const baseFillBrighterColorProperty = new PaintColorProperty( baseFillColorProperty, { luminanceFactor: 0.05 } );
    const baseFillDarkerColorProperty = new PaintColorProperty( baseFillColorProperty, { luminanceFactor: -0.2 } );
    const baseFillDarkestColorProperty = new PaintColorProperty( baseFillColorProperty, { luminanceFactor: -0.4 } );

    // rounded rectangle that is the top of the base
    const topOfBaseNode = new Rectangle( -halfOfBaseWidth, -topOfBaseHeight / 2, width, topOfBaseHeight, 20, 20, {
      fill: new LinearGradient( -halfOfBaseWidth, 0, halfOfBaseWidth, 0 )
        .addColorStop( 0, baseFillBrighterColorProperty )
        .addColorStop( 0.5, baseFillColorProperty )
        .addColorStop( 1, baseFillDarkerColorProperty )
    } );

    const pumpBaseEdgeHeight = height * 0.65;
    const pumpBaseSideEdgeYControlPoint = pumpBaseEdgeHeight * 1.05;
    const pumpBaseBottomEdgeXCurveStart = width * 0.35;

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
        .addColorStop( 0, baseFillDarkestColorProperty )
        .addColorStop( 0.85, baseFillDarkerColorProperty )
        .addColorStop( 1, baseFillDarkestColorProperty )
    } );

    return new Node( { children: [ pumpEdgeNode, topOfBaseNode ] } );
  }

  /**
   * Creates half of the opening at the top of the pump body. Passing in -1 for the sign creates the back half, and
   * passing in 1 creates the front.
   *
   * @param pumpBodyWidth
   * @param sign
   * @param fill
   * @param stroke
   */
  function createBodyTopHalfNode( pumpBodyWidth, sign, fill, stroke ) {
    const bodyTopShape = new Shape()
      .moveTo( 0, 0 )
      .cubicCurveTo(
        0,
        sign * pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
        pumpBodyWidth,
        sign * pumpBodyWidth * SHAFT_OPENING_TILT_FACTOR,
        pumpBodyWidth,
        0
      );

    return new Path( bodyTopShape, {
      fill: fill,
      stroke: stroke
    } );
  }

  /**
   * Creates a hose connector. The hose has one on each of its ends.
   *
   * @param {number} hoseConnectorWidth
   * @param {number} hoseConnectorHeight
   * @param {PaintColorProperty} fillColorProperty
   */
  function createHoseConnectorNode( hoseConnectorWidth, hoseConnectorHeight, fillColorProperty ) {

    const fillBrighterColorProperty = new PaintColorProperty( fillColorProperty, { luminanceFactor: 0.1 } );
    const fillDarkerColorProperty = new PaintColorProperty( fillColorProperty, { luminanceFactor: -0.2 } );

    return new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2, {
      fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
        .addColorStop( 0, fillDarkerColorProperty )
        .addColorStop( 0.3, fillColorProperty )
        .addColorStop( 0.35, fillBrighterColorProperty )
        .addColorStop( 0.4, fillBrighterColorProperty )
        .addColorStop( 1, fillDarkerColorProperty )
    } );
  }

  /**
   * Creates the cone, which connects the pump base to the pump body.
   *
   * @param {number} pumpBodyWidth - the width of the pump body (and therefore the width of the top of the cone)
   * @param {number} height - the height of the cone
   * @param {PaintColorProperty} fillColorProperty
   */
  function createConeNode( pumpBodyWidth, height, fillColorProperty ) {
    const coneTopWidth = pumpBodyWidth * 1.2;
    const coneTopRadiusY = 3;
    const coneTopRadiusX = coneTopWidth / 2;
    const coneBottomWidth = pumpBodyWidth * 2;
    const coneBottomRadiusY = 4;
    const coneBottomRadiusX = coneBottomWidth / 2;

    const coneShape = new Shape()

      // start in upper right corner of shape, draw top ellipse right to left
      .ellipticalArc( 0, 0, coneTopRadiusX, coneTopRadiusY, 0, 0, Math.PI, false )
      .lineTo( -coneBottomRadiusX, height ) // line to bottom left corner of shape

      // draw bottom ellipse left to right
      .ellipticalArc( 0, height, coneBottomRadiusX, coneBottomRadiusY, 0, Math.PI, 0, true )
      .lineTo( coneTopRadiusX, 0 ); // line to upper right corner of shape

    // use PaintColorProperty so that colors can be updated dynamically via ColorProfile
    const fillBrighterColorProperty = new PaintColorProperty( fillColorProperty, { luminanceFactor: 0.1 } );
    const fillDarkerColorProperty = new PaintColorProperty( fillColorProperty, { luminanceFactor: -0.4 } );
    const fillDarkestColorProperty = new PaintColorProperty( fillColorProperty, { luminanceFactor: -0.5 } );

    const coneGradient = new LinearGradient( -coneBottomWidth / 2, 0, coneBottomWidth / 2, 0 )
      .addColorStop( 0, fillDarkerColorProperty )
      .addColorStop( 0.3, fillColorProperty )
      .addColorStop( 0.35, fillBrighterColorProperty )
      .addColorStop( 0.45, fillBrighterColorProperty )
      .addColorStop( 0.5, fillColorProperty )
      .addColorStop( 1, fillDarkestColorProperty );

    return new Path( coneShape, {
      fill: coneGradient
    } );
  }

  /**
   * Create the handle of the pump. This is the node that the user will interact with in order to use the pump.
   *
   * @param fill
   */
  function createPumpHandleNode( fill ) {

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

    // used to track where the current position is on the handle when drawing its gradient
    let handleGradientPosition = 0;

    /**
     * Adds a color stop to the given gradient at
     *
     * @param gradient - the gradient being appended to
     * @param deltaDistance - the distance of this added color stop
     * @param totalDistance - the total width of the gradient
     * @param color - the color of this color stop
     */
    const addRelativeColorStop = ( gradient, deltaDistance, totalDistance, color ) => {
      const newPosition = handleGradientPosition + deltaDistance;
      let ratio = newPosition / totalDistance;
      ratio = ratio > 1 ? 1 : ratio;

      gradient.addColorStop( ratio, color );
      handleGradientPosition = newPosition;
    };

    // set up the gradient for the handle
    const pumpHandleWidth = pumpHandleShape.bounds.width;
    const pumpHandleGradient = new LinearGradient( -pumpHandleWidth / 2, 0, pumpHandleWidth / 2, 0 );

    // use PaintColorProperty so that colors can be updated dynamically via ColorProfile
    const handleFillColorProperty = new PaintColorProperty( fill );
    const handleFillDarkerColorProperty = new PaintColorProperty( handleFillColorProperty, { luminanceFactor: -0.35 } );

    // fill the left side handle gradient
    for ( let i = 0; i < numberOfGripBumps; i++ ) {
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillColorProperty );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarkerColorProperty );
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty );
      addRelativeColorStop( pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarkerColorProperty );
    }

    // fill the center section handle gradient
    addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty );
    addRelativeColorStop( pumpHandleGradient, centerCurveWidth + centerSectionWidth, pumpHandleWidth, handleFillColorProperty );
    addRelativeColorStop( pumpHandleGradient, centerCurveWidth, pumpHandleWidth, handleFillDarkerColorProperty );

    // fill the right side handle gradient
    for ( let i = 0; i < numberOfGripBumps; i++ ) {
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty );
      addRelativeColorStop( pumpHandleGradient, gripInterBumpWidth, pumpHandleWidth, handleFillDarkerColorProperty );
      addRelativeColorStop( pumpHandleGradient, 0, pumpHandleWidth, handleFillColorProperty );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillColorProperty );
      addRelativeColorStop( pumpHandleGradient, gripSingleBumpHalfWidth, pumpHandleWidth, handleFillDarkerColorProperty );
    }

    return new Path( pumpHandleShape, {
      lineWidth: 2,
      stroke: 'black ',
      fill: pumpHandleGradient,
      cursor: 'ns-resize'
    } );
  }

  /**
   * Drag listener for the pump's handle.
   */
  class HandleNodeDragListener extends DragListener {

    /**
     *
     * @param numberProperty
     * @param rangeProperty
     * @param enabledProperty
     * @param minHandleYOffset
     * @param maxHandleYOffset
     * @param pumpHandleNode
     * @param pumpShaftNode
     * @param numberOfParticlesPerPumpAction
     */
    constructor( numberProperty,
                 rangeProperty,
                 enabledProperty,
                 minHandleYOffset,
                 maxHandleYOffset,
                 pumpHandleNode,
                 pumpShaftNode,
                 numberOfParticlesPerPumpAction
    ) {

      assert && assert( maxHandleYOffset > minHandleYOffset, 'bogus offsets' );

      let handlePosition = null;
      let lastHandlePosition = null;
      let pumpingDistanceAccumulation = 0;

      // How far the pump shaft needs to travel before the pump releases a particle. -1 is added to account for minor drag
      // listener and floating-point errors.
      const pumpingDistanceRequiredToAddParticle = ( maxHandleYOffset - minHandleYOffset ) / numberOfParticlesPerPumpAction;

      super( {
        drag: ( event, listener ) => {

          // update the handle and shaft position based on the user's pointer position
          const dragPositionY = pumpHandleNode.globalToParentPoint( event.pointer.point ).y;
          handlePosition = Util.clamp( dragPositionY, minHandleYOffset, maxHandleYOffset );
          pumpHandleNode.centerY = handlePosition;
          pumpShaftNode.top = pumpHandleNode.bottom;

          if ( lastHandlePosition !== null ) {
            const travelDistance = handlePosition - lastHandlePosition;
            if ( travelDistance > 0 ) {

              // This motion is in the downward direction, so add its distance to the pumping distance.
              pumpingDistanceAccumulation += travelDistance;
              while ( pumpingDistanceAccumulation >= pumpingDistanceRequiredToAddParticle ) {

                // inject a particle
                if ( rangeProperty.value.max - numberProperty.value > 0 && enabledProperty.get() ) {
                  numberProperty.value++;
                }
                pumpingDistanceAccumulation -= pumpingDistanceRequiredToAddParticle;
              }
            }
            else {
              pumpingDistanceAccumulation = 0;
            }
          }

          lastHandlePosition = handlePosition;
        }
      } );
    }
  }

  return statesOfMatter.register( 'BicyclePumpNode', BicyclePumpNode );
} );