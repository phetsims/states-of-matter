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

  // constants
  //var MVT_SCALE = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;


  // The follow constants define the size and positions of the various
  // components of the pump as proportions of the overall width and height
  // of the node.
  var PUMP_HORIZ_POSITION_PROPORTION = 0.85;
  var PUMP_BASE_WIDTH_PROPORTION = 0.4;
  var PUMP_BASE_HEIGHT_PROPORTION = 0.02;
  var PUMP_BODY_HEIGHT_PROPORTION = 0.75;
  var PUMP_BODY_WIDTH_PROPORTION = 0.1;
  var PUMP_SHAFT_WIDTH_PROPORTION = PUMP_BODY_WIDTH_PROPORTION * 0.25;
  var PUMP_SHAFT_HEIGHT_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION;
  var PUMP_HANDLE_WIDTH_PROPORTION = 0.35;
  var PUMP_HANDLE_HEIGHT_PROPORTION = 0.02;
  var PUMP_HANDLE_INIT_VERT_POS_PROPORTION = PUMP_BODY_HEIGHT_PROPORTION * 1.1;
  var HOSE_CONNECTOR_HEIGHT_PROPORTION = 0.04;
  var HOSE_CONNECTOR_WIDTH_PROPORTION = 0.05;
  var HOSE_CONNECTOR_VERT_POS_PROPORTION = 0.5;
  var HOSE_ATTACH_VERT_POS_PROPORTION = 0.075;
  var HOSE_WIDTH_PROPORTION = 0.03;
  var PUMPING_REQUIRED_TO_INJECT_PROPORTION = PUMP_SHAFT_HEIGHT_PROPORTION / 10;

// Instance Data

  var pumpHandle;
  var currentHandleOffset;
  var maxHandleOffset;
  var pumpingRequiredToInject;
  var currentPumpingAmount;
  var pumpShaft;

  function BicyclePumpNode( width, height, model, options ) {

    // Initialize local variables.
    //  model = model;
    Node.call( this );
    pumpingRequiredToInject = height * PUMPING_REQUIRED_TO_INJECT_PROPORTION;
    currentPumpingAmount = 0;
    //var hoseHeight = (HOSE_ATTACH_VERT_POS_PROPORTION * height);

    // Add the base of the pump.
    var pumpBaseWidth = width * PUMP_BASE_WIDTH_PROPORTION;
    var pumpBaseHeight = height * PUMP_BASE_HEIGHT_PROPORTION;
    var pumpBaseRectangle = new Rectangle( 0, 0, pumpBaseWidth, pumpBaseHeight, {fill: '#B9BBBD'/*PUMP_BASE_COLOR*/, pickable: false } );
    var pumpBase = new Node( {children: [ pumpBaseRectangle ]} );
    pumpBase.setTranslation( width * PUMP_HORIZ_POSITION_PROPORTION - ( pumpBaseWidth / 2 ), height - pumpBaseHeight );
    // pumpBase.setPickable( false );
    this.addChild( pumpBase );

    // Add the handle of the pump.  This is the node that the user will
    // interact with in order to use the pump.
    var pumpHandleWidth = width * PUMP_HANDLE_WIDTH_PROPORTION;
    var pumpHandleHeight = height * PUMP_HANDLE_HEIGHT_PROPORTION;
    var pumpHandleRectangle = new Rectangle( 0, 0, pumpHandleWidth, pumpHandleHeight, 5, 5, { fill: 'white'/*PUMP_HANDLE_COLOR*/ } );
    pumpHandle = new Node( {children: [ pumpHandleRectangle ], pickable: true} );
    pumpHandle.setTranslation( width * PUMP_HORIZ_POSITION_PROPORTION - ( pumpHandleWidth / 2 ), height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) - pumpHandleHeight );
    currentHandleOffset = 0;
    maxHandleOffset = -PUMP_SHAFT_HEIGHT_PROPORTION * height / 2;
    this.addChild( pumpHandle );

    // Set ourself up to listen for and handle mouse dragging events on
    // the handle.
    pumpHandle.addInputListener( new SimpleDragHandler(
      {
        start: function( event ) {

        },
        drag: function( event ) {
          /*var d = pumpHandle.globalToParentPoint( event.pointer.point );
                //  pumpHandle.localToParent( d );
           if ( ( currentHandleOffset + d.getHeight() >= maxHandleOffset ) &&
           ( currentHandleOffset + d.getHeight() <= 0 ) ) {
           pumpHandle.offset( 0, d.getHeight() );
           pumpShaft.offset( 0, d.getHeight() );
           currentHandleOffset += d.getHeight();
           if ( d.getHeight() > 0 ) {
           // This motion is in the pumping direction, so accumulate it.
           currentPumpingAmount += d.getHeight();
           if ( currentPumpingAmount >= pumpingRequiredToInject ) {
           // Enough pumping has been done to inject a new particle.
           model.injectMolecule();
           currentPumpingAmount = 0;
           }
           }
           }*/
          console.log( "inject module" );
        }
      } ) );
    // Add the shaft for the pump.
    var pumpShaftWidth = width * PUMP_SHAFT_WIDTH_PROPORTION;
    var pumpShaftHeight = height * PUMP_SHAFT_HEIGHT_PROPORTION;
    var pumpShaftRectangle = new Rectangle( 0, 0, pumpShaftWidth, pumpShaftHeight, {fill: 'blue'/*PUMP_SHAFT_COLOR*/, pickable: false} );
    pumpShaft = new Node( {children: [pumpShaftRectangle]} );
    pumpShaft.setTranslation( width * PUMP_HORIZ_POSITION_PROPORTION - ( pumpShaftWidth / 2 ), height - ( height * PUMP_HANDLE_INIT_VERT_POS_PROPORTION ) );
    this.addChild( pumpShaft );

    // Add the hose.
    //var hoseExternalAttachPtX = 1;
    var hoseExternalAttachPtY = height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) + ( height * HOSE_CONNECTOR_HEIGHT_PROPORTION / 2 );
    //var hoseToPumpAttachPtX = width * PUMP_HORIZ_POSITION_PROPORTION + 2 * pumpHandle.width - 20;
    //var hoseToPumpAttachPtY = height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION );
    var hosePath = new Path( null, {lineWidth: 4, stroke: 'white'} );
    var hoseWidth = HOSE_WIDTH_PROPORTION * width;
    this.addChild( hosePath );
    var testX = 115;
    var nWidth = height * PUMP_BODY_HEIGHT_PROPORTION / 2;
    var newHoseShape = new Shape()
        .moveTo( testX, height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION ) + hoseWidth / 2 )
        // .lineTo( 2*nWidth, height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION ) + hoseWidth / 2+1 )
        .cubicCurveTo( 2 * nWidth, height - ( height * HOSE_ATTACH_VERT_POS_PROPORTION ) + hoseWidth / 2,
        nWidth, hoseExternalAttachPtY + hoseWidth / 2,
          2 * nWidth, height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) + hoseWidth / 2 )
    // .lineTo( 230, height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) + hoseWidth / 2 -5)

      ;
    hosePath.setShape( newHoseShape );

    // Add the hose connector.
    var hoseConnectorWidth = width * HOSE_CONNECTOR_WIDTH_PROPORTION;
    var hoseConnectorHeight = height * HOSE_CONNECTOR_HEIGHT_PROPORTION;
    var hoseConnector = new Rectangle( 0, 0, hoseConnectorWidth, hoseConnectorHeight, {fill: "white"} );
    hoseConnector.setTranslation( 230, height - ( height * HOSE_CONNECTOR_VERT_POS_PROPORTION ) + hoseWidth / 2 - 5 );
    this.addChild( hoseConnector );

    // Add the body of the pump
    var pumpBodyWidth = width * PUMP_BODY_WIDTH_PROPORTION;
    var pumpBodyHeight = height * PUMP_BODY_HEIGHT_PROPORTION;
    var pumpBody = new Rectangle( 0, 0, pumpBodyWidth, pumpBodyHeight, 5, 5, {fill: 'red' } );
    pumpBody.setTranslation( width * PUMP_HORIZ_POSITION_PROPORTION - ( pumpBodyWidth / 2 ), height - pumpBodyHeight - pumpBaseHeight );
    this.addChild( pumpBody );
    this.mutate( options );

  }

  return inherit( Node, BicyclePumpNode );
} );
