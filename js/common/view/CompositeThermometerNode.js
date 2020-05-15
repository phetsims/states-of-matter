// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class defines a node that has a liquid thermometer and a numerical readout that can display the temperature in
 * degrees Kelvin or degrees Celsius.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
import statesOfMatter from '../../statesOfMatter.js';
import SOMQueryParameters from '../SOMQueryParameters.js';

// strings
const celsiusUnitsString = statesOfMatterStrings.celsiusUnits;
const kelvinUnitsString = statesOfMatterStrings.kelvinUnits;

// constants
const MAX_LENGTH_TEMPERATURE_TEXT = '99999 ' + celsiusUnitsString;
const MAX_TEMPERATURE_TEXT_WIDTH = 35; // empirically determined
const TEMPERATURE_READOUT_FONT = new PhetFont( 11 );

// local enum
const TemperatureUnits = Enumeration.byKeys( [ 'KELVIN', 'CELSIUS' ] );

// clamping the red mercury display at 1000
const MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY = 1000;

class CompositeThermometerNode extends Node {

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  constructor( multipleParticleModel, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super();

    // add thermometer node
    const thermometerNode = new ThermometerNode(
      0,
      MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY,
      multipleParticleModel.temperatureInKelvinProperty,
      {
        outlineStroke: 'black',
        backgroundFill: 'white',
        tickSpacing: 8,
        majorTickLength: 8,
        minorTickLength: 4,
        bulbDiameter: 23,
        glassThickness: 2.5,
        lineWidth: 1.4,
        tubeWidth: 13,
        tubeHeight: 65,
        tandem: options.tandem.createTandem( 'thermometerNode' )
      }
    );

    // @private temperature nodes combo box
    const temperatureKelvinText = new Text( '', {
      font: TEMPERATURE_READOUT_FONT,
      maxWidth: MAX_TEMPERATURE_TEXT_WIDTH,
      phetioReadOnly: true
    } );
    const temperatureCelsiusText = new Text( MAX_LENGTH_TEMPERATURE_TEXT, {
      font: TEMPERATURE_READOUT_FONT,
      maxWidth: MAX_TEMPERATURE_TEXT_WIDTH,
      phetioReadOnly: true
    } );

    // @private
    this.temperatureUnitsProperty = new EnumerationProperty(
      TemperatureUnits,
      SOMQueryParameters.defaultCelsius ? TemperatureUnits.CELSIUS : TemperatureUnits.KELVIN,
      { tandem: options.tandem.createTandem( 'temperatureUnitsProperty' ) }
    );
    const temperatureComboBox = new ComboBox(
      [
        new ComboBoxItem( temperatureKelvinText, TemperatureUnits.KELVIN, { tandemName: 'kelvin' } ),
        new ComboBoxItem( temperatureCelsiusText, TemperatureUnits.CELSIUS, { tandemName: 'celsius' } )
      ],
      this.temperatureUnitsProperty,
      this,
      {
        xMargin: 6,
        yMargin: 6,
        cornerRadius: 5,
        buttonLineWidth: 0.4,
        align: 'right',
        tandem: options.tandem.createTandem( 'temperatureComboBox' )
      }
    );

    const contentNode = new VBox( {
      spacing: 10,
      children: [ temperatureComboBox, thermometerNode ],
      resize: false
    } );

    const panel = new Panel( contentNode, {
      xMargin: 0,
      yMargin: 0,
      fill: null,
      stroke: null,
      lineWidth: 0,
      resize: false
    } );

    this.addChild( panel );

    // update the temperature readouts when the value changes in the model
    multipleParticleModel.temperatureInKelvinProperty.link( temperatureInKelvin => {
      if ( temperatureInKelvin !== null ) {
        const temperatureInKelvinRounded = Utils.roundSymmetric( temperatureInKelvin );
        temperatureKelvinText.setText( temperatureInKelvinRounded + ' ' + kelvinUnitsString );
        temperatureCelsiusText.setText( Utils.roundSymmetric( temperatureInKelvin - 273.15 ) + ' ' + celsiusUnitsString );
      }
      else {
        temperatureKelvinText.setText( '--' );
        temperatureCelsiusText.setText( '--' );
      }
    } );

    this.mutate( options );

    // Create a link to temperatureInKelvinProperty so it's easier to find in Studio.
    this.addLinkedElement( multipleParticleModel.temperatureInKelvinProperty, {
      tandem: options.tandem.createTandem( 'temperatureInKelvinProperty' )
    } );
  }

  // @public
  reset() {
    this.temperatureUnitsProperty.reset();
  }
}

statesOfMatter.register( 'CompositeThermometerNode', CompositeThermometerNode );
export default CompositeThermometerNode;