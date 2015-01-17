// Copyright 2002-2014, University of Colorado
/**
 * This class represents a node that displays a dial gauge, which is a
 * circular instrument that can be used to portray measurements of temperature,
 * pressure, etc.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';


  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var GaugeNode = require( 'SCENERY_PHET/GaugeNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // strings
  var pressureString = require( 'string!STATES_OF_MATTER/pressure' );
  var pressureUnitsInAtm = require( 'string!STATES_OF_MATTER/pressureUnitsInAtm' );

  // Length of non-elbowed connector wrt overall diameter.
  var CONNECTOR_LENGTH_PROPORTION = 1;

  // Width of connector wrt overall diameter.
  var CONNECTOR_WIDTH_PROPORTION = 0.2;

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model  of the simulation
   * @constructor
   */
  function DialGaugeNode( multipleParticleModel ) {

    var dialGaugeNode = this;
    Node.call( this );

    this.elbowEnabled = false;
    this.elbowHeight = 0;


    var gaugeNode = new GaugeNode( multipleParticleModel.pressureProperty, pressureString,
      { min: 0, max: 200 }, { scale: 0.5, radius: 80 } );

    // Add the textual readout display.
    this.textualReadoutBoxShape = new Rectangle( 0, 0, 80, 15, 2, 2, { fill: 'white', stroke: 'black' } );
    this.textualReadoutBoxShape.centerX = gaugeNode.centerX;
    this.textualReadoutBoxShape.top = gaugeNode.bottom - 15;
    this.textualReadout = new Text( '', { font: new PhetFont( 12 ), fill: 'black' } );
    this.textualReadout.center = this.textualReadoutBoxShape.center;

    this.connector = new Path( null, {
      lineWidth: 10,
      stroke: new LinearGradient( 0, 0, 60, 60 )
        .addColorStop( 0, '#D8D7D8' )
        .addColorStop( 0.4, '#E1E2E3' )
        .addColorStop( 0.8, '#D5D7D8' )
        .addColorStop( 0.9, '#E2E3E4' )
    } );
    this.roundedRectangle = new Rectangle( 0, 0, 30, 25, 2, 2, {
      fill: new LinearGradient( 0, 0, 0, 25 )
        .addColorStop( 0, '#5F6973' )
        .addColorStop( 0.6, '#F0F1F2' )
    } );

    this.roundedRectangle.centerY = gaugeNode.centerY;
    this.roundedRectangle.left = gaugeNode.right - 10;
    var dialComponentsNode = new Node( {
      children: [ this.connector, this.roundedRectangle, gaugeNode,
        this.textualReadoutBoxShape, this.textualReadout ]
    } );

    // Set the initial value.
    multipleParticleModel.pressure = multipleParticleModel.getPressureInAtmospheres();
    multipleParticleModel.pressureProperty.link( function() {
      dialGaugeNode.textualReadout.setText( multipleParticleModel.getPressureInAtmospheres().toFixed( 2 ) + ' ' + pressureUnitsInAtm );
      dialGaugeNode.textualReadout.center = dialGaugeNode.textualReadoutBoxShape.center;
    } );

    this.updateConnector();

    // Now add the dial as a child of the main node.
    this.addChild( dialComponentsNode );

  }

  return inherit( Node, DialGaugeNode, {

    /**
     * This turns on/off the "elbow" portion of the connector, which allows
     * the pressure gauge to connect to something above or below it.
     *
     * @param elbowEnabled
     */
    setElbowEnabled: function( elbowEnabled ) {
      this.elbowEnabled = elbowEnabled;
      this.updateConnector();
    },
    /**
     * Set the height of the elbow.  Height is specified with respect to the
     * vertical center of the node.
     */
    setElbowHeight: function( height ) {
      this.elbowHeight = height;
      this.updateConnector();
    },

    updateConnector: function() {
      var width = (CONNECTOR_WIDTH_PROPORTION * 30);
      var length = (CONNECTOR_LENGTH_PROPORTION * 60);
      this.connectorPath = new Shape();
      if ( !this.elbowEnabled ) {
        var connectorShape = new Shape.rect( 0, 0, length, width );
        this.connector.setShape( connectorShape );
        this.connector.setTranslation( this.roundedRectangle.centerX + this.roundedRectangle.width / 2,
          ( this.roundedRectangle.centerY - width / 2) );
      }
      else {
        this.connectorPath.moveTo( 0, 0 );
        if ( Math.abs( this.elbowHeight ) < width / 2 ) {
          // width.
          this.connectorPath.lineTo( length + width, 0 );
          this.connectorPath.lineTo( (length + width), width );
          this.connectorPath.lineTo( 0, width );
          this.connectorPath.close();
          this.connector.setShape( this.connectorPath );
        }
        else if ( this.elbowHeight < 0 ) {
          // Connector is pointing upwards.
          this.connectorPath.lineTo( length, 0 );
          this.connectorPath.lineTo( length, (this.elbowHeight + width / 2) );
          this.connectorPath.lineTo( (length + width), (this.elbowHeight + width / 2) );
          this.connectorPath.lineTo( (length + width), width / 2 );
          this.connectorPath.quadraticCurveTo( length + width, width, (length + (width / 2)), width );
          this.connectorPath.lineTo( 0, width );
          this.connectorPath.close();
          this.connector.setShape( this.connectorPath );
        }
        else {

          // Connector is pointing downwards.
          this.connectorPath.lineTo( (length + (width / 2)), 0 );
          this.connectorPath.quadraticCurveTo( length + width, 0, (length + width), width / 2 );
          this.connectorPath.lineTo( (length + width), (this.elbowHeight + width / 2) );
          this.connectorPath.lineTo( length, (this.elbowHeight + width / 2) );
          this.connectorPath.lineTo( length, width );
          this.connectorPath.lineTo( 0, width );
          this.connectorPath.close();
          this.connector.setShape( this.connectorPath );
        }
      }
    }
  } );
} );