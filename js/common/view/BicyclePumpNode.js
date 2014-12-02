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
  //var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
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
  var HOSE_WIDTH_PROPORTION = 0.03;
  var PUMPING_REQUIRED_TO_INJECT_PROPORTION = PUMP_SHAFT_HEIGHT_PROPORTION / 10;


// Instance Data


  function BicyclePumpNode( width, height, model, options ) {

    // Initialize local variables.
    Node.call( this );

    var pumpShaft;
    var pumpingRequiredToInject = height * PUMPING_REQUIRED_TO_INJECT_PROPORTION;
    var currentPumpingAmount = 0;
    //var hoseHeight = (HOSE_ATTACH_VERT_POS_PROPORTION * height);

    // Add the base of the pump.
    var pumpBaseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
    var pumpBaseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;
    var pumpBaseRectangle = new Rectangle( 0, 0, pumpBaseWidth, pumpBaseHeight, {
      fill: '#B9BBBD', pickable: false } );

    var pumpBase = new Node( {children: [ pumpBaseRectangle ], pickable: 'false'} );
    pumpBase.setTranslation( 0, height - pumpBaseHeight );
    this.addChild( pumpBase );

    // Add the handle of the pump.  This is the node that the user will
    // interact with in order to use the pump.
    var pumpHandleWidth = width * PUMP_HANDLE_WIDTH_PROPORTION;
    var pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
    var pumpHandleRectangle = new Rectangle( 0, 0, pumpHandleWidth, pumpHandleHeight, 5, 5, {
      fill: 'white' } );
    var pumpHandle = new Node( {children: [ pumpHandleRectangle ], cursor: 'ns-resize'} );
    pumpHandle.setTranslation( (pumpBaseWidth - pumpHandleWidth) / 2,
        height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) - pumpHandleHeight );
    this.addChild( pumpHandle );

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
          //  pumpHandle.localToParent( d );
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
        .addColorStop( 0.2, '#CACACA' )
        .addColorStop( 0.2, '#CDCDCD' )
        .addColorStop( 0.2, '#CFCFCF' )
        .addColorStop( 0.2, '#C2C2C2' ),
      stroke: '#CFCFCF', pickable: false} );
    pumpShaft = new Node( {children: [pumpShaftRectangle]} );
    pumpShaft.setTranslation( (pumpBaseWidth - pumpShaftWidth) / 2,
        height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) );
    this.addChild( pumpShaft );

    // Add the body of the pump
    var pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
    var pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
    var pumpBody = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 5, 5, {fill: '#DA0000' } );
    pumpBody.setTranslation( (pumpBaseWidth - pumpBodyWidth) / 2, height - pumpBodyHeight - pumpBaseHeight );
    this.addChild( pumpBody );

    // Add the hose.
    var hoseToPumpAttachPtX = (pumpBaseWidth + pumpBodyWidth) / 2;
    var hoseToPumpAttachPtY = height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION );
    var hoseExternalAttachPtX = width - width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseExternalAttachPtY = height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION );

    var hosePath = new Path( null, {lineWidth: 4, stroke: 'white'} );
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
        .addColorStop( 0, '#5F6973' )
        .addColorStop( 1, '#F0F1F2' ),
      stroke: '#F0F1F2'} );
    this.addChild( pipeConnectorPath );
    var pipeConnectorShape = new Shape()
      .ellipticalArc( pumpBaseWidth / 2, height - pumpBaseHeight - pipeConnectorHeight, pumpBodyWidth / 2 + 1, 3, 0,
        -Math.PI / 8, 9 * Math.PI / 8, false )
      .lineTo( (pumpBaseWidth - pipeConnectorBottomWidth) / 2, height - pumpBaseHeight )
      .ellipticalArc( pumpBaseWidth / 2, height - pumpBaseHeight, pipeConnectorBottomWidth / 2, 2, 0, Math.PI, 0, true )
      .close();
    pipeConnectorPath.setShape( pipeConnectorShape );

    // todo: Add the pump base support

    // Add the hose connector.
    var hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
    var hoseConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, {fill: "white"} );
    hoseConnector.setTranslation( width - hoseConnectorWidth,
        height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) - hoseConnectorHeight / 2 );
    this.addChild( hoseConnector );

    this.mutate( options );
  }

  return inherit( Node, BicyclePumpNode );
} );
