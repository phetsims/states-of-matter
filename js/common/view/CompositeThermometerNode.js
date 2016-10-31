// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class defines a node that has a liquid thermometer and a numerical readout that can display the temperature in
 * degrees Kelvin or degrees Celsius.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var ComboBox = require( 'SUN/ComboBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var kelvinUnitsString = require( 'string!STATES_OF_MATTER/kelvinUnits' );
  var celsiusUnitsString = require( 'string!STATES_OF_MATTER/celsiusUnits' );

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
    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;

    // Create the property that will be used by the thermometer node to control how high the liquid is.
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

    // add temperature combo box
    this.temperatureKelvinText = new Text( '', {
      font: TEMPERATURE_READOUT_FONT,
      maxWidth: MAX_TEMPERATURE_TEXT_WIDTH
    } );
    this.temperatureCelsiusText = new Text( MAX_LENGTH_TEMPERATURE_TEXT, {
      font: TEMPERATURE_READOUT_FONT,
      maxWidth: MAX_TEMPERATURE_TEXT_WIDTH
    } );

    this.temperatureProperty = new Property( 'kelvin' );
    var temperatureComboBox = new ComboBox(
      [
        ComboBox.createItem( this.temperatureKelvinText, 'kelvin' ),
        ComboBox.createItem( this.temperatureCelsiusText, 'celsius' )
      ],
      this.temperatureProperty,
      this,
      {
        buttonXMargin: 5,
        buttonYMargin: 2,
        buttonCornerRadius: 5,
        itemXMargin: 2,
        itemYMargin: 2,
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
      [ multipleParticleModel.temperatureSetPointProperty, multipleParticleModel.moleculeTypeProperty ],
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