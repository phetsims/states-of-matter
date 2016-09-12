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

  var ELBOW_WIDTH = ( CONNECTOR_WIDTH_PROPORTION * 30 );
  var ELBOW_LENGTH = ( CONNECTOR_LENGTH_PROPORTION * 60 );

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model  of the simulation
   * @constructor
   */
  function DialGaugeNode( multipleParticleModel ) {

    var self = this;
    Node.call( this );
    this.multipleParticleModel = multipleParticleModel;

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

    // To accurately reproduce the previous version (which consisted of a path stroked with lineWidth 10), we need to
    // include the stroke width effects (where it had a default lineCap of butt). We have a part that doesn't change
    // shape (the connector) which includes the left part and the curve, and then an overlapping dynamic rectangle
    // (the connectorExtension) whos height is adjusted to be the elbowHeight. This reduces the overhead significantly.
    var halfStroke = 5;
    this.connector = new Path( new Shape().moveTo( 0, -halfStroke )
                               .lineTo( ELBOW_LENGTH + ELBOW_WIDTH / 2, -halfStroke )
                               .quadraticCurveTo( ELBOW_LENGTH + ELBOW_WIDTH + halfStroke, -halfStroke, ELBOW_LENGTH + ELBOW_WIDTH + halfStroke, ELBOW_WIDTH / 2 )
                               .lineTo( ELBOW_LENGTH - halfStroke, ELBOW_WIDTH + halfStroke )
                               .lineTo( 0, ELBOW_WIDTH + halfStroke )
                               .close(), {
      fill: '#ddd'
    } );
    this.connectorExtension = new Rectangle( ELBOW_LENGTH - halfStroke, ELBOW_WIDTH / 2, ELBOW_WIDTH + 2 * halfStroke, 0, {
      fill: '#ddd'
    } );
    this.connector.addChild( this.connectorExtension );

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

    // TODO: was buggy before, where we had to update the connector once with the elbow disabled to position things properly.
    this.connector.setTranslation( this.roundedRectangle.centerX + this.roundedRectangle.width / 2,
                                   this.roundedRectangle.centerY - CONNECTOR_WIDTH_PROPORTION * 30 / 2 );

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
      this.connectorExtension.rectHeight = this.elbowHeight;
    }
  } );
} );