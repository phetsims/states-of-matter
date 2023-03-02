// Copyright 2014-2023, University of Colorado Boulder

/**
 * This class represents a node that displays a dial gauge, which is a circular instrument that can be used to portray
 * measurements of temperature, pressure, etc.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import stepTimer from '../../../../axon/js/stepTimer.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import GaugeNode from '../../../../scenery-phet/js/GaugeNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { LinearGradient, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';

// strings
const pressureOverloadString = StatesOfMatterStrings.pressureOverload;
const pressureStringProperty = StatesOfMatterStrings.pressureStringProperty;
const pressureUnitsInAtmString = StatesOfMatterStrings.pressureUnitsInAtm;

// constants
const CONNECTOR_LENGTH_PROPORTION = 1; // Length of non-elbowed connector wrt overall diameter.
const CONNECTOR_WIDTH_PROPORTION = 0.2; // Width of connector wrt overall diameter.
const MAX_PRESSURE = 200; // in atm units
const ELBOW_WIDTH = ( CONNECTOR_WIDTH_PROPORTION * 30 );
const ELBOW_LENGTH = ( CONNECTOR_LENGTH_PROPORTION * 60 );
const PRESSURE_UPDATE_PERIOD = 100; // in milliseconds

class DialGaugeNode extends Node {

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Tandem} tandem
   */
  constructor( multipleParticleModel, tandem ) {

    super( { tandem: tandem } );
    this.elbowHeight = 0; // @private, set through accessor methods

    const gaugeNode = new GaugeNode(
      multipleParticleModel.pressureProperty,
      pressureStringProperty,
      new Range( 0, MAX_PRESSURE ),
      {
        scale: 0.5,
        radius: 80,
        backgroundLineWidth: 3,
        tandem: tandem.createTandem( 'gaugeNode' )
      }
    );

    // Add the textual readout display.
    const readoutNode = new Rectangle( 0, 0, 80, 15, 2, 2, {
      fill: 'white',
      stroke: 'black',
      centerX: gaugeNode.centerX,
      top: gaugeNode.bottom - 15,
      tandem: tandem.createTandem( 'readoutNode' )
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
      tandem: readoutNode.tandem.createTandem( 'pressureProperty' )
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

    // Keep track of the previous pressure value so that we can determine when changes have occurred.
    let previousPressure = -1;

    // closure to update the readout text
    const updateReadoutText = () => {
      const pressure = multipleParticleModel.pressureProperty.get();
      if ( pressure !== previousPressure ) {
        if ( pressure < MAX_PRESSURE ) {
          readoutText.setString( `${Utils.toFixed( pressure, 1 )} ${pressureUnitsInAtmString}` );
          readoutText.fill = 'black';
        }
        else {
          readoutText.setString( pressureOverloadString );
          readoutText.fill = PhetColorScheme.RED_COLORBLIND;
        }
        previousPressure = pressure;
      }
      readoutText.centerX = readoutNode.width / 2;
    };

    // Do the initial update of the readout.
    updateReadoutText();

    // Update the pressure readout at regular intervals.  This was done rather than listening to the pressure property
    // because the readout changes too quickly in that case.
    stepTimer.setInterval( updateReadoutText, PRESSURE_UPDATE_PERIOD );

    // If state is being set via phet-io, then it is necessary to update the readout when  pressureProperty changes since
    // the timer may not be running.
    multipleParticleModel.pressureProperty.link( () => {
      if ( phet.joist.sim.isSettingPhetioStateProperty.value ) {
        updateReadoutText();
      }
    } );

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

  /**
   * Set the height of the elbow.  Height is specified with respect to the vertical center of the node.
   * @param {number} height
   * @public
   */
  setElbowHeight( height ) {
    this.elbowHeight = height;
    this.updateConnector();
  }

  /**
   * @public
   */
  updateConnector() {
    this.connectorExtension.rectHeight = this.elbowHeight;
  }
}

statesOfMatter.register( 'DialGaugeNode', DialGaugeNode );
export default DialGaugeNode;