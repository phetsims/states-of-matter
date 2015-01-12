// Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the bicycle pump
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  // The follow constants define the size and positions of the various
  // components of the pump as proportions of the overall width and height
  // of the node.
  var PUMP_BASE_WIDTH_PROPORTION = 0.2;
  var PUMP_BASE_HEIGHT_PROPORTION = 0.1;
  var PUMP_BODY_HEIGHT_PROPORTION = 0.7;
  var PUMP_BODY_WIDTH_PROPORTION = 0.06;
  var PUMP_SHAFT_WIDTH_PROPORTION = PUMP_BODY_WIDTH_PROPORTION * 0.25;
  var PUMP_SHAFT_HEIGHT_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION;
  var PUMP_HANDLE_HEIGHT_PROPORTION = 0.05;
  var PUMP_HANDLE_INIT_VERT_POS_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION * 1.4;
  var PIPE_CONNECTOR_HEIGHT_PROPORTION = 0.09;
  var HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
  var HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
  var HOSE_CONNECTOR_VERT_POS_PROPORTION = 0.8;
  var HOSE_ATTACH_VERT_POS_PROPORTION = 0.15;
//  var HOSE_WIDTH_PROPORTION = 0.03;
  var PUMPING_REQUIRED_TO_INJECT_PROPORTION = PUMP_SHAFT_HEIGHT_PROPORTION / 10;

  /**
   *
   * @param {Number} width
   * @param {Number} height
   * @param {MultipleParticleModel}model
   * @param {Object} options that can be passed on to the underlying node
   * @constructor
   */
  function BicyclePumpNode( width, height, model, options ) {


    Node.call( this );

    var pumpShaft;
    var pumpingRequiredToInject = height * PUMPING_REQUIRED_TO_INJECT_PROPORTION;
    var currentPumpingAmount = 0;

    // Add the base of the pump.
    var pumpBaseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
    var pumpBaseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;

    var pumpBaseSupportShape = new Shape()
      .moveTo( pumpBaseWidth * 0.54, 0 )
      .quadraticCurveTo( pumpBaseWidth * 0.4, height * 0.1, pumpBaseWidth * 0.5, height * 0.1334 )
      .moveTo( pumpBaseWidth * 0.82, 0 )
      .quadraticCurveTo( pumpBaseWidth * 0.98, 0.116 * height, pumpBaseWidth * 0.84, height * 0.1334 )
      .quadraticCurveTo( pumpBaseWidth * 0.7, height * 0.1666, pumpBaseWidth * 0.5, height * 0.1334 )
      .lineTo( pumpBaseWidth * 0.54, 0 )
      .close();

    var pumpBaseSupportLeftLower = new Path( pumpBaseSupportShape, {
      fill: '#3C2712', rotation: Math.PI / 3
    } );
    var pumpBaseSupportLeftUpper = new Path( pumpBaseSupportShape, {
      fill: '#6A4521', rotation: Math.PI / 3
    } );

    var pumpBaseSupportRightLower = new Path( pumpBaseSupportShape, {
      fill: '#3C2712', rotation: -Math.PI / 3
    } );
    var pumpBaseSupportRightUpper = new Path( pumpBaseSupportShape, {
      fill: '#6A4521', rotation: -Math.PI / 3
    } );
    pumpBaseSupportLeftUpper.right = pumpBaseSupportRightLower.left + 6;
    pumpBaseSupportLeftUpper.top = pumpBaseSupportRightLower.top;
    var pumpBaseSupportYOffset = 3;
    var pumpBaseSupportXOffset = 2;
    pumpBaseSupportLeftLower.centerY = pumpBaseSupportLeftUpper.centerY + pumpBaseSupportYOffset;
    pumpBaseSupportLeftLower.centerX = pumpBaseSupportLeftUpper.centerX + pumpBaseSupportXOffset;
    pumpBaseSupportRightLower.centerY = pumpBaseSupportRightUpper.centerY + pumpBaseSupportYOffset;
    pumpBaseSupportRightLower.centerX = pumpBaseSupportRightUpper.centerX + pumpBaseSupportXOffset;

    var pumpBase = new Node( {
      children: [pumpBaseSupportLeftLower, pumpBaseSupportLeftUpper,
                 pumpBaseSupportRightLower, pumpBaseSupportRightUpper]
    } );
    pumpBase.setTranslation( pumpBase.width / 9, height - pumpBaseHeight + pumpBase.height / 2 );
    this.addChild( pumpBase );

    // Add the handle of the pump.  This is the node that the user will
    // interact with in order to use the pump.
    var pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;

    //todo: factor out the constants and use a for loop?
    var pumpHandleNode = new Path( new Shape()
      .moveTo( 0, 12 )
      .quadraticCurveTo( 5, 0, 24, 9 )//1
      .lineTo( 30, 9 )
      .quadraticCurveTo( 39, 0, 48, 9 )//2
      .lineTo( 54, 9 )
      .quadraticCurveTo( 63, 0, 72, 9 ) //3
      .lineTo( 78, 9 )
      .quadraticCurveTo( 87, 0, 96, 9 ) //4
      .lineTo( 102, 9 )
      .quadraticCurveTo( 111, 2, 120, 2 )//5-1
      .lineTo( 154, 2 )
      .quadraticCurveTo( 163, 2, 172, 9 )//5-2
      .lineTo( 178, 9 )
      .quadraticCurveTo( 187, 0, 196, 9 )//6
      .lineTo( 202, 9 )
      .quadraticCurveTo( 211, 0, 220, 9 )//7
      .lineTo( 226, 9 )
      .quadraticCurveTo( 235, 0, 244, 9 )//8
      .lineTo( 250, 9 )
      .quadraticCurveTo( 261, 0, 265, 12 ) //9
      .lineTo( 265, 33 )
      .quadraticCurveTo( 261, 45, 250, 36 ) //9
      .lineTo( 244, 36 )
      .quadraticCurveTo( 234, 45, 226, 36 )//8
      .lineTo( 220, 36 )
      .quadraticCurveTo( 211, 45, 202, 36 )//7
      .lineTo( 196, 36 )
      .quadraticCurveTo( 187, 45, 178, 36 )//6
      .lineTo( 172, 36 )
      .quadraticCurveTo( 163, 43, 154, 43 )//5-1
      .lineTo( 120, 43 )
      .quadraticCurveTo( 111, 43, 102, 36 )//5-2
      .lineTo( 96, 36 )
      .quadraticCurveTo( 87, 45, 78, 36 )//4
      .lineTo( 72, 36 )
      .quadraticCurveTo( 63, 45, 54, 36 )//3
      .lineTo( 48, 36 )
      .quadraticCurveTo( 39, 45, 30, 36 )//2
      .lineTo( 24, 36 )
      .quadraticCurveTo( 5, 45, 0, 33 )//1
      .lineTo( 0, 12 )
      .close(), {
      lineWidth: 1,
      stroke: 'black',
      fill: new LinearGradient( 0, 0, 265, 0 )

        .addColorStop( 0, '#727374' )//1
        .addColorStop( 0.0377, '#AFB1B2' )
        .addColorStop( 0.0904, '#B5B7B9' )
        .addColorStop( 0.0905, '#858687' )
        .addColorStop( 0.1131, '#B5B7B9' )
        .addColorStop( 0.1132, '#727374' )//2
        .addColorStop( 0.1471, '#AFB1B2' )
        .addColorStop( 0.1810, '#B5B7B9' )
        .addColorStop( 0.1811, '#858687' )
        .addColorStop( 0.2036, '#B5B7B9' )
        .addColorStop( 0.2037, '#727374' ) //3
        .addColorStop( 0.2377, '#AFB1B2' )
        .addColorStop( 0.2715, '#B5B7B9' )
        .addColorStop( 0.2716, '#858687' )
        .addColorStop( 0.2942, '#B5B7B9' )
        .addColorStop( 0.2943, '#727374' )//4
        .addColorStop( 0.3283, '#AFB1B2' )
        .addColorStop( 0.3621, '#B5B7B9' )
        .addColorStop( 0.3622, '#858687' )
        .addColorStop( 0.3848, '#B5B7B9' )
        .addColorStop( 0.3849, '#727374' )//5
        .addColorStop( 0.4188, '#AAACAE' )
        .addColorStop( 0.6150, '#B1B3B4' )
        .addColorStop( 0.6489, '#B1B3B4' )
        .addColorStop( 0.6490, '#858687' )
        .addColorStop( 0.6715, '#B5B7B9' )
        .addColorStop( 0.6716, '#727374' )//6
        .addColorStop( 0.7056, '#AFB1B2' )
        .addColorStop( 0.7395, '#B5B7B9' )
        .addColorStop( 0.7396, '#858687' )
        .addColorStop( 0.7621, '#B5B7B9' )
        .addColorStop( 0.7622, '#727374' )//7
        .addColorStop( 0.7962, '#AFB1B2' )
        .addColorStop( 0.8300, '#B5B7B9' )
        .addColorStop( 0.8301, '#858687' )
        .addColorStop( 0.8527, '#B5B7B9' )
        .addColorStop( 0.8528, '#727374' )//8
        .addColorStop( 0.8867, '#AFB1B2' )
        .addColorStop( 0.9206, '#B5B7B9' )
        .addColorStop( 0.9207, '#858687' )
        .addColorStop( 0.9432, '#B5B7B9' )
        .addColorStop( 0.9433, '#727374' )//9
        .addColorStop( 0.9773, '#AFB1B2' )
        .addColorStop( 0.9999, '#B5B7B9' ),
      cursor: 'ns-resize'
    } );

    pumpHandleNode.scale( pumpHandleHeight / pumpHandleNode.height );
    pumpHandleNode.setTranslation( (pumpBaseWidth - pumpHandleNode.width) / 2,
        height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) - pumpHandleHeight );

    var currentHandleOffset = 0;
    var maxHandleOffset = -PUMP_SHAFT_HEIGHT_PROPORTION * height / 2;

    // Set ourself up to listen for and handle mouse dragging events on
    // the handle.
    var startY;
    var endY;
    pumpHandleNode.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          startY = pumpHandleNode.globalToParentPoint( event.pointer.point ).y;
        },
        drag: function( event ) {
          endY = pumpHandleNode.globalToParentPoint( event.pointer.point ).y;
          var yDiff = endY - startY;
          if ( ( currentHandleOffset + yDiff >= maxHandleOffset ) &&
               ( currentHandleOffset + yDiff <= 0 ) ) {
            pumpHandleNode.setTranslation( (pumpBaseWidth - pumpHandleNode.width) / 2, yDiff );
            pumpShaft.setTranslation( (pumpBaseWidth - pumpShaftWidth) / 2, yDiff );
            pumpShaft.top = pumpHandleNode.bottom;
            currentHandleOffset += yDiff;
            if ( yDiff > 0 ) {
              // This motion is in the pumping direction, so accumulate it.
              currentPumpingAmount += yDiff;
              if ( currentPumpingAmount >= pumpingRequiredToInject ) {
                // Enough pumping has been done to inject a new particle.
                model.injectMolecule();
                currentPumpingAmount = 0;
              }
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
      stroke: '#CFCFCF',
      pickable: false
    } );
    pumpShaft.setTranslation( (pumpBaseWidth - pumpShaftWidth) / 2,
        height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) );
    this.addChild( pumpShaft );
    this.addChild( pumpHandleNode );

    // Add the body of the pump
    var pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
    var pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
    var pumpBody = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 3, 3,
      {
        fill: new LinearGradient( 0, 0, pumpBodyWidth, 0 )
          .addColorStop( 0, '#DA0000' )
          .addColorStop( 0.4, '#D50000' )
          .addColorStop( 0.7, '#B30000' )
      } );
    pumpBody.setTranslation( (pumpBaseWidth - pumpBodyWidth) / 2, height - pumpBodyHeight - pumpBaseHeight );

    // add pump body shape opening
    var pumpBodyOpening = new Path( new Shape()
      .ellipse( 0, 0, pumpBodyWidth / 2, pumpBodyWidth / 3 - 2, 0, 2 * Math.PI, true ), {
      fill: 'white'
    } );
    pumpBodyOpening.setTranslation( (pumpBaseWidth - pumpBodyWidth) / 2 + pumpBodyOpening.width / 2,
        height - pumpBodyHeight - pumpBaseHeight );

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
      fill: new LinearGradient( 0, 0, pipeConnectorBottomWidth, 0 )
        .addColorStop( 0, '#77797B' )
        .addColorStop( 0.04, '#A2A4A7' )
        .addColorStop( 0.05, '#B9BBBD' )
        .addColorStop( 0.14, '#B5B7B9' )
        .addColorStop( 0.15, '#A2A4A7' )
        .addColorStop( 0.3, '#77797B' )
    } );
    pipeConnectorPath.setTranslation( pumpBaseWidth / 2, height - pumpBaseHeight - pipeConnectorHeight - 3 );

    var pipeConnectorOpening = new Path( new Shape()
      .ellipse( 0, 0, pipeConnectorTopWidth / 2, 3, 0, 0, true ), {
      fill: new LinearGradient( 0, 0, pipeConnectorTopWidth, 0 )
        .addColorStop( 0, '#727375' )
        .addColorStop( 1, '#575859' ),
      stroke: 'black'
    } );
    pipeConnectorOpening.setTranslation( pumpBaseWidth / 2, height - pumpBaseHeight - pipeConnectorHeight - 3 );
    this.addChild( pipeConnectorOpening );
    this.addChild( pumpBody );
    this.addChild( pumpBodyOpening );
    this.addChild( pipeConnectorPath );


    // Add the hose connector.
    var hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
    var hoseConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2,
      {
        fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
          .addColorStop( 0, '#818181' )
          .addColorStop( 0.4, '#868686' )
          .addColorStop( 0.6, '#ACADAE' )
          .addColorStop( 0.8, '#A3A4A5' )
          .addColorStop( 0.9, '#919191' )
      } );
    hoseConnector.setTranslation( width - hoseConnectorWidth,
        height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) - hoseConnectorHeight / 2 );
    this.addChild( hoseConnector );
    var hoseBottomConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2,
      {
        fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
          .addColorStop( 0, '#868686' )
          .addColorStop( 0.7, '#A3A4A5' )
          .addColorStop( 0.9, '#919191' )
      } );
    this.addChild( hoseBottomConnector );
    hoseBottomConnector.setTranslation( hoseToPumpAttachPtX + 2, hoseToPumpAttachPtY - hoseBottomConnector.height / 2 );

    this.mutate( options );
  }

  return inherit( Node, BicyclePumpNode );
} );
