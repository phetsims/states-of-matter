// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class defines a node that has a liquid thermometer and a numerical readout that can display the temperature in
 * degrees Kelvin or degrees Celsius.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../../sun/js/ComboBoxItem.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
import SOMQueryParameters from '../SOMQueryParameters.js';

// strings
const celsiusUnitsString = statesOfMatterStrings.celsiusUnits;
const kelvinUnitsString = statesOfMatterStrings.kelvinUnits;
const temperatureReadoutPattern = statesOfMatterStrings.temperatureReadoutPattern;

// constants
const KELVIN_TEMPERATURE_RANGE = new Range( 0, 5000 ); // this is an upper bound based on experimenting with the sim
const MAX_TEMPERATURE_TEXT_WIDTH = 40; // empirically determined to look decent
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

    // Create the longest possible strings for the temperatures and use them to create the combo box items so that the
    // combo box will be wide enough.
    const minTemperatureCelsiusString = StringUtils.fillIn( temperatureReadoutPattern, {
      value: kelvinToCelsius( KELVIN_TEMPERATURE_RANGE.min ),
      units: celsiusUnitsString
    } );
    const maxTemperatureCelsiusString = StringUtils.fillIn( temperatureReadoutPattern, {
      value: kelvinToCelsius( KELVIN_TEMPERATURE_RANGE.max ),
      units: celsiusUnitsString
    } );
    const longestCelsiusString = minTemperatureCelsiusString.length > maxTemperatureCelsiusString.length ?
                                 minTemperatureCelsiusString :
                                 maxTemperatureCelsiusString;
    const minTemperatureKelvinString = StringUtils.fillIn( temperatureReadoutPattern, {
      value: KELVIN_TEMPERATURE_RANGE.min,
      units: kelvinUnitsString
    } );
    const maxTemperatureKelvinString = StringUtils.fillIn( temperatureReadoutPattern, {
      value: KELVIN_TEMPERATURE_RANGE.max,
      units: kelvinUnitsString
    } );
    const longestKelvinString = minTemperatureKelvinString.length > maxTemperatureKelvinString.length ?
                                minTemperatureKelvinString :
                                maxTemperatureKelvinString;

    // temperature text nodes
    const temperatureKelvinText = new Text( longestKelvinString, {
      font: TEMPERATURE_READOUT_FONT,
      maxWidth: MAX_TEMPERATURE_TEXT_WIDTH,
      phetioReadOnly: true
    } );
    const temperatureCelsiusText = new Text( longestCelsiusString, {
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
        yMargin: 4,
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
        temperatureKelvinText.setText( StringUtils.fillIn( temperatureReadoutPattern, {
          value: Utils.roundSymmetric( temperatureInKelvin ),
          units: kelvinUnitsString
        } ) );
        temperatureCelsiusText.setText( StringUtils.fillIn( temperatureReadoutPattern, {
          value: kelvinToCelsius( temperatureInKelvin ),
          units: celsiusUnitsString
        } ) );
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

// helper function
const kelvinToCelsius = temperatureInKelvin => Utils.roundSymmetric( temperatureInKelvin - 273.15 );

statesOfMatter.register( 'CompositeThermometerNode', CompositeThermometerNode );
export default CompositeThermometerNode;