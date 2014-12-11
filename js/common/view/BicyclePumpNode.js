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
  var PUMP_BASE_HEIGHT_PROPORTION = 0.02;
  var PUMP_BODY_HEIGHT_PROPORTION = 0.75;
  var PUMP_BODY_WIDTH_PROPORTION = 0.05;
  var PUMP_SHAFT_WIDTH_PROPORTION = PUMP_BODY_WIDTH_PROPORTION * 0.25;
  var PUMP_SHAFT_HEIGHT_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION;
  var PUMP_HANDLE_WIDTH_PROPORTION = 0.15;
  var PUMP_HANDLE_HEIGHT_PROPORTION = 0.02;
  var PUMP_HANDLE_INIT_VERT_POS_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION * 1.1;
  var HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
  var HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
  var HOSE_CONNECTOR_VERT_POS_PROPORTION = 0.8;
  var HOSE_ATTACH_VERT_POS_PROPORTION = 0.075;
//  var HOSE_WIDTH_PROPORTION = 0.03;
  var PUMPING_REQUIRED_TO_INJECT_PROPORTION = PUMP_SHAFT_HEIGHT_PROPORTION / 10;

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
      .quadraticCurveTo( pumpBaseWidth * 0.4, pumpBaseHeight * 5, pumpBaseWidth * 0.5, pumpBaseHeight * 6.67 )
      .moveTo( pumpBaseWidth * 0.82, 0 )
      .quadraticCurveTo( pumpBaseWidth * 0.98, 5.8 * pumpBaseHeight, pumpBaseWidth * 0.84, pumpBaseHeight * 6.67 )
      .quadraticCurveTo( pumpBaseWidth * 0.7, pumpBaseHeight * 8.33, pumpBaseWidth * 0.5, pumpBaseHeight * 6.67 )
      .lineTo( pumpBaseWidth * 0.54, 0 )
      .close();

    var pumpBaseSupportLeftLower = new Path( pumpBaseSupportShape, {
      fill: '#3C2712', rotation: Math.PI / 3
    } );
    var pumpBaseSupportLeftUpper = new Path( pumpBaseSupportShape, {
      fill: '#6A4521', rotation: Math.PI / 3
    } );
    pumpBaseSupportLeftLower.centerY = pumpBaseSupportLeftUpper.centerY - 5;
    pumpBaseSupportLeftLower.centerX = pumpBaseSupportLeftUpper.centerX + 2;
    var pumpBaseSupportRightLower = new Path( pumpBaseSupportShape, {
      fill: '#3C2712', rotation: -Math.PI / 3
    } );
    var pumpBaseSupportRightUpper = new Path( pumpBaseSupportShape, {
      fill: '#6A4521', rotation: -Math.PI / 3
    } );
    pumpBaseSupportLeftUpper.right = pumpBaseSupportRightLower.left + 6;
    pumpBaseSupportLeftUpper.top = pumpBaseSupportRightLower.top;
    pumpBaseSupportLeftLower.centerY = pumpBaseSupportLeftUpper.centerY + 5;
    pumpBaseSupportLeftLower.centerX = pumpBaseSupportLeftUpper.centerX + 2;
    pumpBaseSupportRightLower.centerY = pumpBaseSupportRightUpper.centerY + 5;
    pumpBaseSupportRightLower.centerX = pumpBaseSupportRightUpper.centerX + 2;


    var pumpBase = new Node( { children: [ pumpBaseSupportLeftLower, pumpBaseSupportLeftUpper,
                                           pumpBaseSupportRightLower, pumpBaseSupportRightUpper ]} );
    pumpBase.setTranslation( pumpBase.width / 9, height - pumpBaseHeight + pumpBase.height / 2 );
    this.addChild( pumpBase );

    // Add the handle of the pump.  This is the node that the user will
    // interact with in order to use the pump.
    var pumpHandleWidth = width * PUMP_HANDLE_WIDTH_PROPORTION;
    var pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
    var pumpHandleRectangle = new Rectangle( 0, 0, pumpHandleWidth, pumpHandleHeight, 5, 5, {
      fill: '#B9BBBD' } );
    var pumpHandle = new Node( {children: [ pumpHandleRectangle ], cursor: 'ns-resize'} );
    pumpHandle.setTranslation( (pumpBaseWidth - pumpHandleWidth) / 2,
        height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) - pumpHandleHeight );

    var currentHandleOffset = 0;
    var maxHandleOffset = -PUMP_SHAFT_HEIGHT_PROPORTION * height / 2;

    // Set ourself up to listen for and handle mouse dragging events on
    // the handle.
    var startY, endY;
    pumpHandle.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {
          startY = pumpHandle.globalToParentPoint( event.pointer.point ).y;
        },
        drag: function( event ) {
          endY = pumpHandle.globalToParentPoint( event.pointer.point ).y;
          var d = endY - startY;
          if ( ( currentHandleOffset + d >= maxHandleOffset ) &&
               ( currentHandleOffset + d <= 0 ) ) {
            pumpHandle.setTranslation( (pumpBaseWidth - pumpHandleWidth) / 2, d );
            pumpShaft.setTranslation( (pumpBaseWidth - pumpShaftWidth) / 2, d );
            currentHandleOffset += d;
            if ( d > 0 ) {
              // This motion is in the pumping direction, so accumulate it.
              currentPumpingAmount += d;
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
    var pumpShaftRectangle = new Rectangle( 0, 0, pumpShaftWidth, pumpShaftHeight, {
      fill: new LinearGradient( 0, 0, pumpShaftHeight, 0 )
        .addColorStop( 0, '#CBCBCB' )
        .addColorStop( 0.2, '#CACACA' ),

      stroke: '#CFCFCF', pickable: false} );
    pumpShaft = new Node( {children: [pumpShaftRectangle]} );
    pumpShaft.setTranslation( (pumpBaseWidth - pumpShaftWidth) / 2,
        height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) );
    this.addChild( pumpShaft );
    this.addChild( pumpHandle );

    // Add the body of the pump
    var pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
    var pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
    var pumpBody = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 5, 5,
      {fill: new LinearGradient( 0, 0, pumpBodyWidth, 0 )
        .addColorStop( 0, '#DA0000' )
        .addColorStop( 0.4, '#D50000' )
      .addColorStop( 0.7, '#B30000' )
    } );
    pumpBody.setTranslation( (pumpBaseWidth - pumpBodyWidth) / 2, height - pumpBodyHeight - pumpBaseHeight );
    this.addChild( pumpBody );

    // add pump body shape opening
    var pumpBodyOpening = new Path( new Shape()
      .ellipse( 0, 0, pumpBodyWidth / 2, pumpBodyWidth / 3 - 1, 0, 2 * Math.PI, true ), {
      fill: 'white'} );
    pumpBodyOpening.setTranslation( (pumpBaseWidth - pumpBodyWidth) / 2 + pumpBodyOpening.width / 2,
        height - pumpBodyHeight - pumpBaseHeight + pumpBodyOpening.height / 3 );
    this.addChild( pumpBodyOpening );

    // Add the hose.
    var hoseToPumpAttachPtX = (pumpBaseWidth + pumpBodyWidth) / 2;
    var hoseToPumpAttachPtY = height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION );
    var hoseExternalAttachPtX = width - width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseExternalAttachPtY = height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION );

    var hosePath = new Path( null, {lineWidth: 4, stroke: '#B3B3B3'
    } );
    //   var hoseWidth = HOSE_WIDTH_PROPORTION * width;
    this.addChild( hosePath );
    var newHoseShape = new Shape()
      .moveTo( hoseToPumpAttachPtX, hoseToPumpAttachPtY )
      .cubicCurveTo( width, height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION ),
      0, height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ),
      hoseExternalAttachPtX, hoseExternalAttachPtY );
    hosePath.setShape( newHoseShape );


    var pipeConnectorBottomWidth = pumpBodyWidth * 1.8;
    var pipeConnectorHeight = pumpBodyHeight * 0.125;
    var pipeConnectorPath = new Path( null, {
      fill: new LinearGradient( 0, 0, pipeConnectorBottomWidth, 0 )
        .addColorStop( 0, '#575859' )
        .addColorStop( 0.2, '#5E5F60' )
        .addColorStop( 0.5, '#838587' )
        .addColorStop( 0.6, '#5E5F60' )
        .addColorStop( 0.8, '#B9BBBD' )
        .addColorStop( 0.9, '#909194' )
    } );
    this.addChild( pipeConnectorPath );
    var pipeConnectorShape = new Shape()
      .ellipticalArc( pumpBaseWidth / 2, height - pumpBaseHeight - pipeConnectorHeight, pumpBodyWidth / 2 + 1, 3, 0, -Math.PI / 8, 9 * Math.PI / 8, false )
      .lineTo( (pumpBaseWidth - pipeConnectorBottomWidth) / 2, height - pumpBaseHeight )
      .ellipticalArc( pumpBaseWidth / 2, height - pumpBaseHeight, pipeConnectorBottomWidth / 2, 2, 0, Math.PI, 0, true )
      .close();
    pipeConnectorPath.setShape( pipeConnectorShape );


    // Add the hose connector.
    var hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
    var hoseConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2,
      {fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
        .addColorStop( 0, '#818181' )
        .addColorStop( 0.4, '#868686' )
        .addColorStop( 0.6, '#ACADAE' )
        .addColorStop( 0.8, '#A3A4A5' )
      .addColorStop( 0.9, '#919191' )} );
    hoseConnector.setTranslation( width - hoseConnectorWidth,
        height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) - hoseConnectorHeight / 2 );
    this.addChild( hoseConnector );
    var hoseBottomConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, 2, 2,
      {fill: new LinearGradient( 0, 0, 0, hoseConnectorHeight )
        .addColorStop( 0, '#868686' )
        .addColorStop( 0.7, '#A3A4A5' )
        .addColorStop( 0.9, '#919191' )} );
    this.addChild( hoseBottomConnector );
    hoseBottomConnector.setTranslation( hoseToPumpAttachPtX + 2, hoseToPumpAttachPtY - hoseBottomConnector.height / 2 );

    this.mutate( options );
  }

  return inherit( Node, BicyclePumpNode );
} );
