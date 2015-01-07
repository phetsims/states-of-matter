// Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the thermometer
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var ComboBox = require( 'SUN/ComboBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var kelvinUnits = require( 'string!STATES_OF_MATTER/kelvinUnits' );
  var celsiusUnits = require( 'string!STATES_OF_MATTER/celsiusUnits' );

  function TemperatureNode( model, options ) {

    Node.call( this );

    // add thermometer
    var temperatureInKelvinProperty = new Property( model.getTemperatureInKelvin() );
    var thermometer = new ThermometerNode( 0, 1000, temperatureInKelvinProperty, {
      outlineStroke: 'black',
      backgroundColor: 'white',
      tickSpacing: 3,
      bulbDiameter: 25,
      lineWidth: 2,
      tubeWidth: 15,
      tubeHeight: 65
    } );
    this.addChild( thermometer );

    // add temperature combo box
    var temperatureKelvinText = new Text( '', {   font: new PhetFont( 10 )  } );
    var temperatureCelsiusText = new Text( '', {  font: new PhetFont( 10 ) } );
    model.temperatureSetPointProperty.link( function() {
      var tempInKelvin = model.getTemperatureInKelvin();
      var tempInKelvinRounded = Math.round( model.getTemperatureInKelvin() );
      temperatureKelvinText.setText( tempInKelvinRounded + " " + kelvinUnits );
      temperatureCelsiusText.setText( Math.round( tempInKelvin - 273.15 ) + " " + celsiusUnits );

      // clamping the red mercury display at 1000
      temperatureInKelvinProperty.value = tempInKelvinRounded > 1000 ? 1000 : tempInKelvinRounded;
    } );

    var temperatureProperty = new Property( 0 );
    var temperatureComboBox = new ComboBox( [
      ComboBox.createItem( temperatureKelvinText, 0 ),
      ComboBox.createItem( temperatureCelsiusText, 1 )
    ], temperatureProperty, this, {
      buttonXMargin: 5,
      buttonYMargin: 2,
      buttonCornerRadius: 5,
      itemXMargin: 2,
      itemYMargin: 2,
      buttonLineWidth: 0,
      bottom: thermometer.top - 10,
      centerX: thermometer.centerX
    } );
    this.addChild( temperatureComboBox );
    this.mutate( options );
  }

  return inherit( Node, TemperatureNode );
} );