// Copyright 2014-2015, University of Colorado Boulder

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
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Util = require( 'DOT/Util' );

  // strings
  var pressureString = require( 'string!STATES_OF_MATTER/pressure' );
  var pressureOverloadString = require( 'string!STATES_OF_MATTER/pressureOverload' );
  var pressureUnitsInAtmString = require( 'string!STATES_OF_MATTER/pressureUnitsInAtm' );

  // constants
  var CONNECTOR_LENGTH_PROPORTION = 1; // Length of non-elbowed connector wrt overall diameter.
  var CONNECTOR_WIDTH_PROPORTION = 0.2; // Width of connector wrt overall diameter.
  var MAX_PRESSURE = 200; // in atm units
  var TIME_BETWEEN_UPDATES = 0.5; // in seconds

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model  of the simulation
   * @constructor
   */
  function DialGaugeNode( multipleParticleModel ) {

    var self = this;
    Node.call( this );
    this.multipleParticleModel = multipleParticleModel;

    this.elbowEnabled = false;
    this.elbowHeight = 0;
    this.timeSinceLastUpdate = Number.POSITIVE_INFINITY;

    var gaugeNode = new GaugeNode( multipleParticleModel.pressureProperty, pressureString,
      { min: 0, max: MAX_PRESSURE }, { scale: 0.5, radius: 80, backgroundLineWidth: 3 } );

    // Add the textual readout display.
    this.textualReadoutBoxShape = new Rectangle( 0, 0, 80, 15, 2, 2, { fill: 'white', stroke: 'black' } );
    this.textualReadoutBoxShape.centerX = gaugeNode.centerX;
    this.textualReadoutBoxShape.top = gaugeNode.bottom - 15;
    this.textualReadout = new Text( '', {
      font: new PhetFont( 12 ),
      fill: 'black',
      maxWidth: this.textualReadoutBoxShape.width * 0.9
    } );
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
    this.pressureChanged = false;
    multipleParticleModel.pressureProperty.link( function() {
      self.pressureChanged = true;
    } );

    this.updateConnector();

    // Now add the dial as a child of the main node.
    this.addChild( dialComponentsNode );

  }

  statesOfMatter.register( 'DialGaugeNode', DialGaugeNode );

  return inherit( Node, DialGaugeNode, {

    step: function( dt ){

      this.timeSinceLastUpdate += dt;

      if ( this.timeSinceLastUpdate > TIME_BETWEEN_UPDATES ) {

        if ( this.pressureChanged ) {
          if ( this.multipleParticleModel.getPressureInAtmospheres() < MAX_PRESSURE ) {
            this.textualReadout.setText( Util.toFixed( this.multipleParticleModel.getPressureInAtmospheres(), 2 ) + ' ' + pressureUnitsInAtmString );
            this.textualReadout.fill = 'black';
          }
          else {
            this.textualReadout.setText( pressureOverloadString );
            this.textualReadout.fill = PhetColorScheme.RED_COLORBLIND;
          }
          this.textualReadout.center = this.textualReadoutBoxShape.center;
          this.pressureChanged = false;
        }

        this.timeSinceLastUpdate = 0;
      }
    },

    /**
     * This turns on/off the "elbow" portion of the connector, which allows
     * the pressure gauge to connect to something above or below it.
     * @public
     * @param {boolean} elbowEnabled
     */
    setElbowEnabled: function( elbowEnabled ) {
      this.elbowEnabled = elbowEnabled;
      this.updateConnector();
    },

    /**
     * @public
     * Set the height of the elbow.  Height is specified with respect to the
     * vertical center of the node.
     * @param {number} height
     */
    setElbowHeight: function( height ) {
      this.elbowHeight = height;
      this.updateConnector();
    },

    /**
     * @public
     */
    updateConnector: function() {
      var width = ( CONNECTOR_WIDTH_PROPORTION * 30 );
      var length = ( CONNECTOR_LENGTH_PROPORTION * 60 );
      this.connectorPath = new Shape();
      if ( !this.elbowEnabled ) {
        var connectorShape = Shape.rect( 0, 0, length, width );
        this.connector.setShape( connectorShape );
        this.connector.setTranslation(
          this.roundedRectangle.centerX + this.roundedRectangle.width / 2,
          this.roundedRectangle.centerY - width / 2
        );
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