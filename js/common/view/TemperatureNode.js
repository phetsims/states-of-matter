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
    var temperatureInKelVinProperty = new Property( model.getTemperatureInKelvin() );
    var thermometer = new ThermometerNode( 0, 1000, temperatureInKelVinProperty, {
      outlineStroke: 'white',
      tickSpacing: 3,
      bulbDiameter: 25,
      lineWidth: 2,
      tubeWidth: 15,
      tubeHeight: 50
    } );
    this.addChild( thermometer );

    // add temperature combo box
    var temperatureKelvinText = new Text( '', {   font: new PhetFont( 10 )  } );
    var temperatureCelsiusText = new Text( '', {  font: new PhetFont( 10 ) } );
    model.temperatureSetPointProperty.link( function( temperature ) {
      temperatureKelvinText.setText( Math.round( model.getTemperatureInKelvin() ) + " " + kelvinUnits );
      temperatureCelsiusText.setText( Math.round( model.getTemperatureInKelvin() - 273.15 ) + " " + celsiusUnits );
      temperatureInKelVinProperty.value = Math.round( model.getTemperatureInKelvin() ) > 1000 ? 1000 :
                                          Math.round( model.getTemperatureInKelvin() );
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