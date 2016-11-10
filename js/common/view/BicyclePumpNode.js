// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class represents creates a graphical display that is meant to look like a bicycle pump.  It allows the user to
 * interact with it to move the handle up and down.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SegmentedBarGraphNode = require( 'STATES_OF_MATTER/common/view/SegmentedBarGraphNode' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

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
  var HOSE_CONNECTOR_VERT_POS_PROPORTION = 0.68; // empirically determined to line up with injection point in model
  var HOSE_ATTACH_VERT_POS_PROPORTION = 0.11;
  var PUMPING_REQUIRED_TO_INJECT_PROPORTION = PUMP_SHAFT_HEIGHT_PROPORTION / 6;
  var SHAFT_OPENING_TILT_FACTOR = 0.33;

  // color constants
  var SHAFT_OPENING_FILL = '#997777';
  var SHAFT_OPENING_STROKE = '#775555';

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
    this.multipleParticleModel = multipleParticleModel; // @private
    this.containerAtomCapacity = 0; // @private

    // Update the container capacity when the substance changes.
    multipleParticleModel.substanceProperty.link( function() {
      var apm = multipleParticleModel.moleculeDataSet.atomsPerMolecule;
      self.containerAtomCapacity = Math.floor( StatesOfMatterConstants.MAX_NUM_ATOMS / apm ) * apm;
    } );

    var pumpShaft;
    var pumpingRequiredToInject = height * PUMPING_REQUIRED_TO_INJECT_PROPORTION;
    var currentPumpingAmount = 0;

    // Add the base of the pump.  Many of the multipliers and point positions were arrived at empirically in the process
    // of trying to make the base look good.
    var pumpBaseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
    var pumpBaseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;

    var topOfBaseHeight = pumpBaseHeight * 0.7;
    var topOfBaseNode = new Rectangle( -pumpBaseWidth / 2, -topOfBaseHeight / 2, pumpBaseWidth, topOfBaseHeight, 20, 20, {
      fill: new LinearGradient( -pumpBaseWidth / 2, 0, pumpBaseWidth / 2, 0 )
        .addColorStop( 0, '#bbbbbb' )
        .addColorStop( 1, '#888888' )
    } );

    var pumpBaseEdgeHeight = pumpBaseHeight * 0.65;
    var pumpEdgeShape = new Shape()
      .moveTo( -pumpBaseWidth / 2, 0 )
      .lineTo( -pumpBaseWidth / 2, pumpBaseEdgeHeight / 2 )
      .quadraticCurveTo( -pumpBaseWidth * 0.5, pumpBaseEdgeHeight * 1.05, -pumpBaseWidth * 0.35, pumpBaseEdgeHeight )
      .lineTo( pumpBaseWidth * 0.35, pumpBaseEdgeHeight )
      .quadraticCurveTo( pumpBaseWidth * 0.5, pumpBaseEdgeHeight * 1.05, pumpBaseWidth / 2, pumpBaseEdgeHeight / 2 )
      .lineTo( pumpBaseWidth / 2, 0 )
      .close();

    var pumpEdgeNode = new Path( pumpEdgeShape, {
      fill: new LinearGradient( -pumpBaseWidth / 2, 0, pumpBaseWidth / 2, 0 )
        .addColorStop( 0, '#666666' )
        .addColorStop( 0.85, '#888888' )
        .addColorStop( 1, '#555555' )
    } );

    var pumpBase = new Node( {
      children: [ pumpEdgeNode, topOfBaseNode ],
      left: 0,
      bottom: height
    } );
    this.addChild( pumpBase );

    // Add the handle of the pump.  This is the node that the user will interact with in order to use the pump.
    var pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;

    var pumpHandleNodeShape = new Shape();
    var currentX = 0;
    var inset = 9;
    var maxY = 45;
    pumpHandleNodeShape.moveTo( currentX, inset );
    for ( var i = 0; i < 4; i++ ) {
      pumpHandleNodeShape.quadraticCurveTo( currentX += inset, 0, currentX += inset, inset );
      pumpHandleNodeShape.lineTo( currentX += 6, inset );
    }
    pumpHandleNodeShape.quadraticCurveTo( currentX += inset, 0, currentX += inset, 0 );
    pumpHandleNodeShape.lineTo( currentX += 34, 0 );
    pumpHandleNodeShape.quadraticCurveTo( currentX += inset, 0, currentX += inset, inset );
    for ( i = 0; i < 4; i++ ) {
      pumpHandleNodeShape.lineTo( currentX += 6, inset );
      pumpHandleNodeShape.quadraticCurveTo( currentX += inset, 0, currentX += inset, inset );
    }
    pumpHandleNodeShape.lineTo( currentX, maxY - inset );
    for ( i = 0; i < 4; i++ ) {
      pumpHandleNodeShape.quadraticCurveTo( currentX -= inset, maxY, currentX -= inset, maxY - inset );
      pumpHandleNodeShape.lineTo( currentX -= 6, maxY - inset );
    }
    pumpHandleNodeShape.quadraticCurveTo( currentX -= inset, maxY, currentX -= inset, maxY );
    pumpHandleNodeShape.lineTo( currentX -= 34, maxY );
    pumpHandleNodeShape.quadraticCurveTo( currentX -= inset, maxY, currentX -= inset, maxY - inset );
    for ( i = 0; i < 4; i++ ) {
      pumpHandleNodeShape.lineTo( currentX -= 6, maxY - inset );
      pumpHandleNodeShape.quadraticCurveTo( currentX -= inset, maxY, currentX -= inset, maxY - inset );
    }
    pumpHandleNodeShape.close();
    var pumpHandleNode = new Path( pumpHandleNodeShape, {
      lineWidth: 2,
      stroke: 'black',
      fill: new LinearGradient( 0, 0, 262, 0 )
        .addColorStop( 0, '#727374' )//1
        .addColorStop( 9 / 262, '#AFB1B2' )
        .addColorStop( 18 / 262, '#B5B7B9' )
        .addColorStop( 18 / 262, '#858687' )
        .addColorStop( 24 / 262, '#B5B7B9' )
        .addColorStop( 24 / 262, '#727374' )//2
        .addColorStop( 33 / 262, '#AFB1B2' )
        .addColorStop( 42 / 262, '#B5B7B9' )
        .addColorStop( 42 / 262, '#858687' )
        .addColorStop( 48 / 262, '#B5B7B9' )
        .addColorStop( 48 / 262, '#727374' ) //3
        .addColorStop( 57 / 262, '#AFB1B2' )
        .addColorStop( 66 / 262, '#B5B7B9' )
        .addColorStop( 66 / 262, '#858687' )
        .addColorStop( 72 / 262, '#B5B7B9' )
        .addColorStop( 72 / 262, '#727374' )//4
        .addColorStop( 81 / 262, '#AFB1B2' )
        .addColorStop( 90 / 262, '#B5B7B9' )
        .addColorStop( 90 / 262, '#858687' )
        .addColorStop( 96 / 262, '#B5B7B9' )
        .addColorStop( 96 / 262, '#727374' )//5
        .addColorStop( 105 / 262, '#AAACAE' )
        .addColorStop( 157 / 262, '#B1B3B4' )
        .addColorStop( 166 / 262, '#B1B3B4' )
        .addColorStop( 166 / 262, '#858687' )
        .addColorStop( 172 / 262, '#B5B7B9' )
        .addColorStop( 172 / 262, '#727374' )//6
        .addColorStop( 181 / 262, '#AFB1B2' )
        .addColorStop( 190 / 262, '#B5B7B9' )
        .addColorStop( 190 / 262, '#858687' )
        .addColorStop( 196 / 262, '#B5B7B9' )
        .addColorStop( 196 / 262, '#727374' )//7
        .addColorStop( 205 / 262, '#AFB1B2' )
        .addColorStop( 214 / 262, '#B5B7B9' )
        .addColorStop( 214 / 262, '#858687' )
        .addColorStop( 220 / 262, '#B5B7B9' )
        .addColorStop( 220 / 262, '#727374' )//8
        .addColorStop( 229 / 262, '#AFB1B2' )
        .addColorStop( 238 / 262, '#B5B7B9' )
        .addColorStop( 238 / 262, '#858687' )
        .addColorStop( 244 / 262, '#B5B7B9' )
        .addColorStop( 244 / 262, '#727374' )//9
        .addColorStop( 253 / 262, '#AFB1B2' )
        .addColorStop( 262 / 262, '#B5B7B9' ),
      cursor: 'ns-resize'
    } );

    pumpHandleNode.touchArea = pumpHandleNode.localBounds.dilatedXY( 100, 100 );
    pumpHandleNode.scale( pumpHandleHeight / pumpHandleNode.height );
    pumpHandleNode.setTranslation(
      ( pumpBaseWidth - pumpHandleNode.width ) / 2,
      height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) - pumpHandleHeight - pumpBaseHeight
    );

    var maxHandleYOffset = -PUMP_SHAFT_HEIGHT_PROPORTION * height / 2;
    var minHandleYOffset = pumpHandleNode.centerY;

    // Set ourself up to listen for and handle mouse dragging events on the handle.
    pumpHandleNode.addInputListener( new SimpleDragHandler( {

      drag: function( event ) {

        // update the handle and shaft position
        var handleStartYPos = pumpHandleNode.centerY;
        var dragPositionY = pumpHandleNode.globalToParentPoint( event.pointer.point ).y;
        dragPositionY = Math.max( dragPositionY, maxHandleYOffset );
        dragPositionY = Math.min( dragPositionY, minHandleYOffset );
        pumpHandleNode.centerY = dragPositionY;
        pumpShaft.top = pumpHandleNode.bottom;

        // accumulate pumping
        var travel = handleStartYPos - pumpHandleNode.centerY;
        if ( travel < 0 ) {

          // This motion is in the pumping direction, so accumulate it.
          currentPumpingAmount += Math.abs( travel );
          if ( currentPumpingAmount >= pumpingRequiredToInject ) {

            // Enough pumping has been done to inject a new particle.
            multipleParticleModel.injectMolecule();
            currentPumpingAmount = 0;
          }
        }
      }
    } ) );

    // Add the shaft for the pump.
    var pumpShaftWidth = width * PUMP_SHAFT_WIDTH_PROPORTION;
    var pumpShaftHeight = height * PUMP_SHAFT_HEIGHT_PROPORTION;
    pumpShaft = new Rectangle( 0, 0, pumpShaftWidth, pumpShaftHeight, {
      fill: new LinearGradient( 0, 0, pumpShaftHeight, 0 )
        .addColorStop( 0, '#CBCBCB' )
        .addColorStop( 0.2, '#CACACA' ),
      stroke: '#888888',
      pickable: false
    } );
    pumpShaft.setTranslation( (pumpBaseWidth - pumpShaftWidth) / 2,
      height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) - pumpBaseHeight );

    // Add the body of the pump
    var pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
    var pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
    var pumpBody = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 0, 0, {
      fill: new LinearGradient( 0, 0, pumpBodyWidth, 0 )
        .addColorStop( 0, '#DA0000' )
        .addColorStop( 0.4, '#D50000' )
        .addColorStop( 0.7, '#B30000' )
    } );
    pumpBody.setTranslation( ( pumpBaseWidth - pumpBodyWidth ) / 2, height - pumpBodyHeight - pumpBaseHeight );

    // add the back portion of the opening at the top of the pump body
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

    var pumpOpeningBack = new Path( pumpOpeningBackShape, {
      fill: SHAFT_OPENING_FILL,
      stroke: SHAFT_OPENING_STROKE,
      centerX: pumpBody.centerX,
      bottom: pumpBody.top
    } );

    // add the front portion of the opening at the top of the pump body
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
      fill: SHAFT_OPENING_FILL,
      stroke: SHAFT_OPENING_STROKE,
      centerX: pumpBody.centerX,
      top: pumpOpeningBack.bottom - 0.1 // tweak the position very slightly to prevent pump body from showing through
    } );

    // Add the hose.
    var hoseToPumpAttachPtX = (pumpBaseWidth + pumpBodyWidth) / 2;
    var hoseToPumpAttachPtY = height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION );
    var hoseExternalAttachPtX = width - width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseExternalAttachPtY = height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION );
    var hosePath = new Path( new Shape()
      .moveTo( hoseToPumpAttachPtX, hoseToPumpAttachPtY )
      .cubicCurveTo( width, height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION ),
        0, height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ),
        hoseExternalAttachPtX, hoseExternalAttachPtY ), {
      lineWidth: 4, stroke: '#B3B3B3'
    } );
    this.addChild( hosePath );

    var pipeConnectorTopWidth = pumpBodyWidth * 1.2;
    var pipeConnectorBottomWidth = pumpBodyWidth * 2;
    var pipeConnectorHeight = height * PIPE_CONNECTOR_HEIGHT_PROPORTION;
    var pipeConnectorPath = new Path( new Shape()
      .moveTo( pipeConnectorTopWidth / 2, 0 )
      .ellipticalArc( 0, 0, pipeConnectorTopWidth / 2, 3, 0, 0, Math.PI, false )
      .moveTo( -pipeConnectorTopWidth / 2, 0 )
      .lineTo( ( -pipeConnectorBottomWidth / 2), pipeConnectorHeight )
      .ellipticalArc( 0, pipeConnectorHeight, pipeConnectorBottomWidth / 2, 4, 0, Math.PI, 0, true )
      .lineTo( pipeConnectorTopWidth / 2, 0 ), {
      fill: new LinearGradient( -pipeConnectorBottomWidth / 2, 0, pipeConnectorBottomWidth / 2, 0 )
        .addColorStop( 0, '#5A5B5D' )
        .addColorStop( 0.50, '#A1A3A6' )
        .addColorStop( 0.55, '#B9BBBD' )
        .addColorStop( 0.65, '#B9BBBD' )
        .addColorStop( 0.7, '#A0A2A5' )
        .addColorStop( 1, '#727375' )
    } );
    pipeConnectorPath.setTranslation( pumpBaseWidth / 2, height - pumpBaseHeight * 0.65 - pipeConnectorHeight - 3 );

    var pipeConnectorOpening = new Path( new Shape()
      .ellipse( 0, 0, pipeConnectorTopWidth / 2, 3, 0, 0, true ), {
      fill: new LinearGradient( 0, 0, pipeConnectorTopWidth, 0 )
        .addColorStop( 0, '#727375' )
        .addColorStop( 1, '#575859' ),
      stroke: 'black',
      centerX: pumpBaseWidth / 2,
      centerY: height - pumpBaseHeight - pipeConnectorHeight + 4
    } );

    // Add the hose connector.
    var hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
    var hoseConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2, {
      fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
        .addColorStop( 0, '#828282' )
        .addColorStop( 0.3, '#A2A3A4' )
        .addColorStop( 0.35, '#C6C8CA' )
        .addColorStop( 0.4, '#BFC1C3' )
        .addColorStop( 1, '#808080' )
    } );
    hoseConnector.setTranslation( width - hoseConnectorWidth,
      height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) - hoseConnectorHeight / 2 );
    var hoseBottomConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2, {
      fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
        .addColorStop( 0, '#828282' )
        .addColorStop( 0.3, '#A2A3A4' )
        .addColorStop( 0.35, '#C6C8CA' )
        .addColorStop( 0.4, '#BFC1C3' )
        .addColorStop( 1, '#808080' )
    } );
    hoseBottomConnector.setTranslation( hoseToPumpAttachPtX + 1, hoseToPumpAttachPtY - hoseBottomConnector.height / 2 );

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
        backgroundColor: '#443333',
        fullyLitIndicatorColor: '#999999',
        indicatorHeightProportion: 0.7
      }
    );

    // add the pieces with the correct layering
    this.addChild( pumpOpeningBack );
    this.addChild( pumpShaft );
    this.addChild( pumpHandleNode );
    this.addChild( pipeConnectorOpening );
    this.addChild( pumpBody );
    this.addChild( remainingCapacityIndicator );
    this.addChild( pumpOpeningFront );
    this.addChild( pipeConnectorPath );
    this.addChild( hoseConnector );
    this.addChild( hoseBottomConnector );

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
    }
  } );
} );