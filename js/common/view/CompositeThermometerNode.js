// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class defines a node that has a liquid thermometer and a numerical readout that can display the temperature in
 * degrees Kelvin or degrees Celsius.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const ComboBox = require( 'SUN/ComboBox' );
  const ComboBoxItem = require( 'SUN/ComboBoxItem' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const SOMQueryParameters = require( 'STATES_OF_MATTER/common/SOMQueryParameters' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Text = require( 'SCENERY/nodes/Text' );
  const ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const celsiusUnitsString = require( 'string!STATES_OF_MATTER/celsiusUnits' );
  const kelvinUnitsString = require( 'string!STATES_OF_MATTER/kelvinUnits' );

  // constants
  var MAX_LENGTH_TEMPERATURE_TEXT = '99999 ' + celsiusUnitsString;
  var MAX_TEMPERATURE_TEXT_WIDTH = 35; // empirically determined
  var TEMPERATURE_READOUT_FONT = new PhetFont( 11 );

  // clamping the red mercury display at 1000
  var MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY = 1000;

  /**
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform The model view transform for transforming particle position.
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function CompositeThermometerNode( multipleParticleModel, modelViewTransform, options ) {

    Node.call( this );
    var self = this;

    // @private
    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;

    // @private property that will be used by the thermometer node to control how high the liquid is
    this.temperatureInKelvinProperty = new Property( multipleParticleModel.getTemperatureInKelvin() );

    // add thermometer
    var thermometer = new ThermometerNode( 0, MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY, this.temperatureInKelvinProperty, {
      outlineStroke: 'black',
      backgroundFill: 'white',
      tickSpacing: 8,
      majorTickLength: 8,
      minorTickLength: 4,
      bulbDiameter: 23,
      lineWidth: 1.4,
      tubeWidth: 13,
      tubeHeight: 65
    } );

    // @private temperature nodes combo box
    this.temperatureKelvinText = new Text( '', {
      font: TEMPERATURE_READOUT_FONT,
      maxWidth: MAX_TEMPERATURE_TEXT_WIDTH
    } );
    this.temperatureCelsiusText = new Text( MAX_LENGTH_TEMPERATURE_TEXT, {
      font: TEMPERATURE_READOUT_FONT,
      maxWidth: MAX_TEMPERATURE_TEXT_WIDTH
    } );

    // @private
    this.temperatureProperty = new Property( SOMQueryParameters.defaultCelsius ? 'celsius' : 'kelvin' );
    var temperatureComboBox = new ComboBox(
      [
        new ComboBoxItem( this.temperatureKelvinText, 'kelvin' ),
        new ComboBoxItem( this.temperatureCelsiusText, 'celsius' )
      ],
      this.temperatureProperty,
      this,
      {
        xMargin: 6,
        yMargin: 6,
        cornerRadius: 5,
        buttonLineWidth: 0.4
      }
    );

    var contentNode = new VBox( {
      spacing: 10,
      children: [ temperatureComboBox, thermometer ]
    } );

    var panel = new Panel( contentNode, {
      xMargin: 0,
      yMargin: 0,
      fill: null,
      stroke: null,
      lineWidth: 0,
      resize: false
    } );

    this.addChild( panel );

    // Define a function that will update the various properties and textual values.
    function updateTemperatureValues() {
      var tempInKelvin = self.multipleParticleModel.getTemperatureInKelvin();
      if ( tempInKelvin !== null ) {
        var tempInKelvinRounded = Util.roundSymmetric( tempInKelvin );
        self.temperatureKelvinText.setText( tempInKelvinRounded + ' ' + kelvinUnitsString );
        self.temperatureCelsiusText.setText( Util.roundSymmetric( tempInKelvin - 273.15 ) + ' ' + celsiusUnitsString );
        self.temperatureInKelvinProperty.value = tempInKelvinRounded > MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY ?
                                                 MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY : tempInKelvinRounded;
      }
      else {
        self.temperatureKelvinText.setText( '--' );
        self.temperatureCelsiusText.setText( '--' );
        self.temperatureInKelvinProperty.value = 0;
      }
    }

    // Call the update when any of several properties change value.
    Property.multilink(
      [ multipleParticleModel.temperatureSetPointProperty, multipleParticleModel.substanceProperty ],
      updateTemperatureValues
    );

    this.mutate( options );
  }

  statesOfMatter.register( 'CompositeThermometerNode', CompositeThermometerNode );

  return inherit( Panel, CompositeThermometerNode, {

    // @public
    reset: function() {
      this.temperatureProperty.reset();
    }
  } );
} );