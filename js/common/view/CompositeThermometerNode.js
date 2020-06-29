// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class defines a node that has a liquid thermometer and a numerical readout that can display the temperature in
 * degrees Kelvin or degrees Celsius.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import merge from '../../../../phet-core/js/merge.js';
import ComboBoxDisplay from '../../../../scenery-phet/js/ComboBoxDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import statesOfMatter from '../../statesOfMatter.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
import SOMQueryParameters from '../SOMQueryParameters.js';

// strings
const celsiusUnitsString = statesOfMatterStrings.celsiusUnits;
const kelvinUnitsString = statesOfMatterStrings.kelvinUnits;

// helper function
const kelvinToCelsius = temperatureInKelvin => Utils.roundSymmetric( temperatureInKelvin - 273.15 );

// constants
const KELVIN_TEMPERATURE_RANGE = new Range( 0, 5000 ); // this is an upper bound based on experimenting with the sim
const CELSIUS_TEMPERATURE_RANGE = new Range(
  kelvinToCelsius( KELVIN_TEMPERATURE_RANGE.min ),
  kelvinToCelsius( KELVIN_TEMPERATURE_RANGE.max )
);
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

    // @private
    this.temperatureUnitsProperty = new EnumerationProperty(
      TemperatureUnits,
      SOMQueryParameters.defaultCelsius ? TemperatureUnits.CELSIUS : TemperatureUnits.KELVIN,
      { tandem: options.tandem.createTandem( 'temperatureUnitsProperty' ) }
    );

    // Property that contains the temperature in degrees Celsius
    const temperatureInCelsiusProperty = new DerivedProperty(
      [ multipleParticleModel.temperatureInKelvinProperty ],
      temperatureInKelvin => temperatureInKelvin === null ? null : kelvinToCelsius( temperatureInKelvin )
    );

    const comboBoxDisplayItems = [
      {
        choice: TemperatureUnits.KELVIN,
        numberProperty: multipleParticleModel.temperatureInKelvinProperty,
        range: KELVIN_TEMPERATURE_RANGE,
        units: kelvinUnitsString
      },
      {
        choice: TemperatureUnits.CELSIUS,
        numberProperty: temperatureInCelsiusProperty,
        range: CELSIUS_TEMPERATURE_RANGE,
        units: celsiusUnitsString
      }
    ];

    // layer where the combo box list will go, added later to keep it on top of z-order
    const comboBoxListParent = new Node();

    // Create the combo box that will display the temperature in either Kelvin or Celsius.
    const temperatureComboBoxDisplay = new ComboBoxDisplay(
      comboBoxDisplayItems,
      this.temperatureUnitsProperty,
      comboBoxListParent,
      {
        xMargin: 6,
        yMargin: 4,
        cornerRadius: 5,
        buttonLineWidth: 0.4,
        align: 'right',
        numberDisplayOptions: {
          textOptions: { font: TEMPERATURE_READOUT_FONT }
        },
        tandem: options.tandem.createTandem( 'temperatureComboBox' )
      }
    );

    this.addChild( new VBox( {
      spacing: 10,
      children: [ temperatureComboBoxDisplay, thermometerNode ],
      resize: false
    } ) );
    this.addChild( comboBoxListParent );

    // apply the options
    this.mutate( options );

    // Create a link to temperatureInKelvinProperty so it's easier to find in phet-io Studio.
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