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
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // strings
  var kelvinUnits = require( 'string!STATES_OF_MATTER/kelvinUnits' );
  var celsiusUnits = require( 'string!STATES_OF_MATTER/celsiusUnits' );

  // constants
  var inset = 10;
  var LID_POSITION_TWEAK_FACTOR = 65; // Empirically determined value for aligning lid and container body.

  // clamping the red mercury display at 1000
  var MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY = 1000;

  /**
   *
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform The model view transform for transforming particle position.
   * @param {Object} options that can be passed on to the underlying node
   * @constructor
   */
  function CompositeThermometerNode( multipleParticleModel, modelViewTransform, options ) {

    Node.call( this );
    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;

    // add thermometer
    var temperatureInKelvinProperty = new Property( multipleParticleModel.getTemperatureInKelvin() );
    var thermometer = new ThermometerNode( 0, MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY, temperatureInKelvinProperty, {
      outlineStroke: 'black',
      backgroundColor: 'white',
      tickSpacing: 8,
      majorTickLength: 8,
      minorTickLength: 4,
      bulbDiameter: 23,
      lineWidth: 1.4,
      tubeWidth: 13,
      tubeHeight: 65
    } );
    this.addChild( thermometer );

    // add temperature combo box
    var temperatureKelvinText = new Text( '', { font: new PhetFont( 10 ) } );
    var temperatureCelsiusText = new Text( '', { font: new PhetFont( 10 ) } );
    multipleParticleModel.temperatureSetPointProperty.link( function() {
      var tempInKelvin = multipleParticleModel.getTemperatureInKelvin();
      var tempInKelvinRounded = Math.round( multipleParticleModel.getTemperatureInKelvin() );
      temperatureKelvinText.setText( tempInKelvinRounded + " " + kelvinUnits );
      temperatureCelsiusText.setText( Math.round( tempInKelvin - 273.15 ) + " " + celsiusUnits );


      temperatureInKelvinProperty.value = tempInKelvinRounded > MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY ?
                                          MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY : tempInKelvinRounded;
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
      buttonLineWidth: 0.4,
      bottom: thermometer.top - 10,
      centerX: thermometer.centerX
    } );
    this.addChild( temperatureComboBox );
    this.mutate( options );
  }

  return inherit( Node, CompositeThermometerNode, {
    /**
     * Updates the thermometers position and rotation.
     * When the container explodes, the thermometer rotates in anti-clockwise director and moves up in the air.
     */
    updatePositionAndOrientation: function() {

      var containerHeight = this.multipleParticleModel.getParticleContainerHeight();
      if ( !this.multipleParticleModel.getContainerExploded() ) {
        if ( this.getRotation() !== 0 ) {
          this.setRotation( 0 );
        }
        this.setTranslation( this.x,
          -this.modelViewTransform.modelToViewDeltaY(
            StatesOfMatterConstants.CONTAINER_BOUNDS.width - containerHeight
          ) + this.height - inset );
      }
      else {
        var rotationAmount = -(Math.PI / 100 + ( Math.random() * Math.PI / 50 ));
        var centerPosY = -this.modelViewTransform.modelToViewDeltaY(
            StatesOfMatterConstants.CONTAINER_BOUNDS.height - containerHeight ) +
                         LID_POSITION_TWEAK_FACTOR;
        var currentPosY = this.y;
        var newPosY;
        if ( currentPosY > centerPosY ) {
          newPosY = centerPosY;
        }
        else {
          newPosY = currentPosY;
        }
        this.setY( newPosY );
        this.rotate( rotationAmount );
      }

    }
  } );
} );