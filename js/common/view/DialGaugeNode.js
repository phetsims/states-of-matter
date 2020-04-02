// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class represents a node that displays a dial gauge, which is a circular instrument that can be used to portray
 * measurements of temperature, pressure, etc.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import timer from '../../../../axon/js/timer.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import GaugeNode from '../../../../scenery-phet/js/GaugeNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
import statesOfMatter from '../../statesOfMatter.js';

const pressureOverloadString = statesOfMatterStrings.pressureOverload;
const pressureString = statesOfMatterStrings.pressure;
const pressureUnitsInAtmString = statesOfMatterStrings.pressureUnitsInAtm;

// constants
const CONNECTOR_LENGTH_PROPORTION = 1; // Length of non-elbowed connector wrt overall diameter.
const CONNECTOR_WIDTH_PROPORTION = 0.2; // Width of connector wrt overall diameter.
const MAX_PRESSURE = 200; // in atm units
const ELBOW_WIDTH = ( CONNECTOR_WIDTH_PROPORTION * 30 );
const ELBOW_LENGTH = ( CONNECTOR_LENGTH_PROPORTION * 60 );
const PRESSURE_UPDATE_PERIOD = 100; // in milliseconds

/**
 * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
 * @param {Tandem} tandem
 * @constructor
 */
function DialGaugeNode( multipleParticleModel, tandem ) {

  Node.call( this, { tandem: tandem } );
  this.elbowHeight = 0; // @private, set through accessor methods

  const gaugeNode = new GaugeNode(
    multipleParticleModel.pressureProperty,
    pressureString,
    new Range( 0, MAX_PRESSURE ),
    {
      scale: 0.5,
      radius: 80,
      backgroundLineWidth: 3,
      tandem: tandem.createTandem( 'gaugeNode' )
    }
  );

  // Add the textual readout display.
  const readoutNodeTandem = tandem.createTandem( 'readoutNode' );
  const readoutNode = new Rectangle( 0, 0, 80, 15, 2, 2, {
    fill: 'white',
    stroke: 'black',
    centerX: gaugeNode.centerX,
    top: gaugeNode.bottom - 15,
    tandem: readoutNodeTandem
  } );

  const readoutText = new Text( '0', {
    font: new PhetFont( 12 ),
    fill: 'black',
    maxWidth: readoutNode.width * 0.9,
    centerX: readoutNode.width / 2,
    centerY: readoutNode.height / 2
  } );
  readoutNode.addChild( readoutText );

  // Create a link to pressureProperty so it's easier to find in Studio.
  this.addLinkedElement( multipleParticleModel.pressureProperty, {
    tandem: readoutNodeTandem.createTandem( 'pressureProperty' )
  } );

  // To accurately reproduce the previous version (which consisted of a path stroked with lineWidth 10), we need to
  // include the stroke width effects (where it had a default lineCap of butt). We have a part that doesn't change
  // shape (the connector) which includes the left part and the curve, and then an overlapping dynamic rectangle
  // (the connectorExtension) whose height is adjusted to be the elbowHeight. This reduces the overhead significantly.
  const halfStroke = 5;
  const connector = new Path(
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

  const connectorCollar = new Rectangle( 0, 0, 30, 25, 2, 2, {
    fill: new LinearGradient( 0, 0, 0, 25 )
      .addColorStop( 0, 'rgb( 120, 120, 120 )' )
      .addColorStop( 0.3, 'rgb( 220, 220, 220 )' )
      .addColorStop( 0.5, 'rgb( 220, 220, 220 )' )
      .addColorStop( 1, 'rgb( 100, 100, 100 )' )
  } );

  connectorCollar.centerY = gaugeNode.centerY;
  connectorCollar.left = gaugeNode.right - 10;
  const dialComponentsNode = new Node( {
    children: [ connector, connectorCollar, gaugeNode, readoutNode ]
    }
  );

  // Update the pressure readout at regular intervals.  This was done rather than listening to the pressure property
  // because the readout changes too quickly in that case.
  let previousPressure = -1;
  timer.setInterval( function() {
    const pressure = multipleParticleModel.pressureProperty.get();
    if ( pressure !== previousPressure ) {
      if ( pressure < MAX_PRESSURE ) {
        readoutText.setText( Utils.toFixed( pressure, 1 ) + ' ' + pressureUnitsInAtmString );
        readoutText.fill = 'black';
      }
      else {
        readoutText.setText( pressureOverloadString );
        readoutText.fill = PhetColorScheme.RED_COLORBLIND;
      }
      previousPressure = pressure;
    }
    readoutText.centerX = readoutNode.width / 2;
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

export default inherit( Node, DialGaugeNode, {

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