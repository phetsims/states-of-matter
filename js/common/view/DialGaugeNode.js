// Copyright 2014-2018, University of Colorado Boulder

/**
 * This class represents a node that displays a dial gauge, which is a circular instrument that can be used to portray
 * measurements of temperature, pressure, etc.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var GaugeNode = require( 'SCENERY_PHET/GaugeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Text = require( 'SCENERY/nodes/Text' );
  var timer = require( 'AXON/timer' );
  var Util = require( 'DOT/Util' );

  // strings
  var pressureOverloadString = require( 'string!STATES_OF_MATTER/pressureOverload' );
  var pressureString = require( 'string!STATES_OF_MATTER/pressure' );
  var pressureUnitsInAtmString = require( 'string!STATES_OF_MATTER/pressureUnitsInAtm' );

  // constants
  var CONNECTOR_LENGTH_PROPORTION = 1; // Length of non-elbowed connector wrt overall diameter.
  var CONNECTOR_WIDTH_PROPORTION = 0.2; // Width of connector wrt overall diameter.
  var MAX_PRESSURE = 200; // in atm units
  var ELBOW_WIDTH = ( CONNECTOR_WIDTH_PROPORTION * 30 );
  var ELBOW_LENGTH = ( CONNECTOR_LENGTH_PROPORTION * 60 );
  var PRESSURE_UPDATE_PERIOD = 100; // in milliseconds

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @constructor
   */
  function DialGaugeNode( multipleParticleModel ) {

    Node.call( this );
    this.elbowHeight = 0; // @private, set through accessor methods

    var gaugeNode = new GaugeNode(
      multipleParticleModel.pressureProperty,
      pressureString,
      new Range( 0, MAX_PRESSURE ),
      { scale: 0.5, radius: 80, backgroundLineWidth: 3 }
    );

    // Add the textual readout display.
    var textualReadoutBackground = new Rectangle( 0, 0, 80, 15, 2, 2, {
      fill: 'white',
      stroke: 'black',
      centerX: gaugeNode.centerX,
      top: gaugeNode.bottom - 15
    } );

    var textualReadout = new Text( '', {
      font: new PhetFont( 12 ),
      fill: 'black',
      maxWidth: textualReadoutBackground.width * 0.9,
      center: textualReadoutBackground.center
    } );

    // To accurately reproduce the previous version (which consisted of a path stroked with lineWidth 10), we need to
    // include the stroke width effects (where it had a default lineCap of butt). We have a part that doesn't change
    // shape (the connector) which includes the left part and the curve, and then an overlapping dynamic rectangle
    // (the connectorExtension) whose height is adjusted to be the elbowHeight. This reduces the overhead significantly.
    var halfStroke = 5;
    var connector = new Path(
      new Shape().moveTo( 0, -halfStroke )
        .lineTo( ELBOW_LENGTH + ELBOW_WIDTH / 2, -halfStroke )
        .quadraticCurveTo( ELBOW_LENGTH + ELBOW_WIDTH + halfStroke, -halfStroke, ELBOW_LENGTH + ELBOW_WIDTH + halfStroke, ELBOW_WIDTH / 2 )
        .lineTo( ELBOW_LENGTH - halfStroke, ELBOW_WIDTH + halfStroke )
        .lineTo( 0, ELBOW_WIDTH + halfStroke )
        .close(),
      { fill: '#ddd' }
    );
    this.connectorExtension = new Rectangle( ELBOW_LENGTH - halfStroke, ELBOW_WIDTH / 2, ELBOW_WIDTH + 2 * halfStroke, 0, {
      fill: '#ddd'
    } );
    connector.addChild( this.connectorExtension );

    var connectorCollar = new Rectangle( 0, 0, 30, 25, 2, 2, {
      fill: new LinearGradient( 0, 0, 0, 25 )
        .addColorStop( 0, 'rgb( 120, 120, 120 )' )
        .addColorStop( 0.3, 'rgb( 220, 220, 220 )' )
        .addColorStop( 0.5, 'rgb( 220, 220, 220 )' )
        .addColorStop( 1, 'rgb( 100, 100, 100 )' )
    } );

    connectorCollar.centerY = gaugeNode.centerY;
    connectorCollar.left = gaugeNode.right - 10;
    var dialComponentsNode = new Node( {
        children: [ connector, connectorCollar, gaugeNode, textualReadoutBackground, textualReadout ]
      }
    );

    // Update the pressure readout at regular intervals.  This was done rather than listening to the pressure property
    // because the readout changes too quickly in that case.
    var previousPressure = -1;
    timer.setInterval( function() {
      var pressure = multipleParticleModel.pressureProperty.get();
      if ( pressure !== previousPressure ) {
        if ( pressure < MAX_PRESSURE ) {
          textualReadout.setText( Util.toFixed( pressure, 1 ) + ' ' + pressureUnitsInAtmString );
          textualReadout.fill = 'black';
        }
        else {
          textualReadout.setText( pressureOverloadString );
          textualReadout.fill = PhetColorScheme.RED_COLORBLIND;
        }
        previousPressure = pressure;
      }
      textualReadout.center = textualReadoutBackground.center;
    }, PRESSURE_UPDATE_PERIOD );

    // position the connector
    connector.setTranslation(
      connectorCollar.centerX + connectorCollar.width / 2,
      connectorCollar.centerY - CONNECTOR_WIDTH_PROPORTION * 30 / 2
    );

    // Do the initial update of the connector.
    this.updateConnector();

    // Add the dial as a child of the main node.
    this.addChild( dialComponentsNode );
  }

  statesOfMatter.register( 'DialGaugeNode', DialGaugeNode );

  return inherit( Node, DialGaugeNode, {

    /**
     * Set the height of the elbow.  Height is specified with respect to the vertical center of the node.
     * @param {number} height
     * @public
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