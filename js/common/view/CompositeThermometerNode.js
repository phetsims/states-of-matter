// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class defines  Node that has a liquid thermometer and a numerical
 * readout that can display the temperature in degrees Kelvin or degrees
 * Celsius.
 *
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
  var Panel = require( 'SUN/Panel' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var kelvinUnitsString = require( 'string!STATES_OF_MATTER/kelvinUnits' );
  var celsiusUnitsString = require( 'string!STATES_OF_MATTER/celsiusUnits' );

  // constants
  var inset = 147; // empirically determined for positioning the thermometer on the lid
  var LID_POSITION_TWEAK_FACTOR = 65; // Empirically determined value for aligning lid and container body.

  // clamping the red mercury display at 1000
  var MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY = 1000;

  /**
   *
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {ModelViewTransform2} modelViewTransform The model view transform for transforming particle position.
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function CompositeThermometerNode( multipleParticleModel, modelViewTransform, options ) {

    Node.call( this );

    this.multipleParticleModel = multipleParticleModel;
    this.modelViewTransform = modelViewTransform;
    var self = this;

    // add thermometer
    this.temperatureInKelvinProperty = new Property( multipleParticleModel.getTemperatureInKelvin() );
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
    //this.addChild( thermometer );

    // add temperature combo box
    this.temperatureKelvinText = new Text( '', { font: new PhetFont( 10 ), maxWidth: 30 } );
    this.temperatureCelsiusText = new Text( '', { font: new PhetFont( 10 ), maxWidth: 30 } );
    this.temperatureSetPointChanged = false;

    multipleParticleModel.temperatureSetPointProperty.link( function() {
      self.temperatureSetPointChanged = true;
    } );

    this.step();
    this.temperatureProperty = new Property( 0 );
    var temperatureComboBox = new ComboBox( [
      ComboBox.createItem( this.temperatureKelvinText, 0 ),
      ComboBox.createItem( this.temperatureCelsiusText, 1 )
    ], this.temperatureProperty, this, {
      buttonXMargin: 5,
      buttonYMargin: 2,
      buttonCornerRadius: 5,
      itemXMargin: 2,
      itemYMargin: 2,
      buttonLineWidth: 0.4
      //bottom: thermometer.top - 10,
      //centerX: thermometer.centerX
    } );
    //this.addChild( temperatureComboBox );
    var contentNode = new VBox( {
      spacing: 10,
      children: [
        temperatureComboBox,
        thermometer
      ]
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

    this.mutate( options );
  }

  statesOfMatter.register( 'CompositeThermometerNode', CompositeThermometerNode );

  return inherit( Panel, CompositeThermometerNode, {

    reset: function(){
      this.temperatureProperty.reset();
    },

    step: function(){
      if( this.temperatureSetPointChanged ){
        var tempInKelvin = this.multipleParticleModel.getTemperatureInKelvin();
        var tempInKelvinRounded = Util.roundSymmetric( tempInKelvin );
        this.temperatureKelvinText.setText( tempInKelvinRounded + ' ' + kelvinUnitsString );
        this.temperatureCelsiusText.setText( Util.roundSymmetric( tempInKelvin - 273.15 ) + ' ' + celsiusUnitsString );
        this.temperatureInKelvinProperty.value = tempInKelvinRounded > MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY ?
                                            MAX_TEMPERATURE_TO_CLAMP_RED_MERCURY : tempInKelvinRounded;
        this.temperatureSetPointChanged = false;
      }
    },

    /**
     * @public
     * Updates the thermometers position and rotation.
     * When the container explodes, the thermometer rotates in anti-clockwise director and moves up in the air.
     */
    updatePositionAndOrientation: function() {
      var containerHeight = this.multipleParticleModel.getParticleContainerHeight();
      if ( !this.multipleParticleModel.getContainerExploded() ) {
        if ( this.getRotation() !== 0 ) {
          this.setRotation( 0 );
        }
        this.bottom = -this.modelViewTransform.modelToViewDeltaY(
          StatesOfMatterConstants.CONTAINER_BOUNDS.width - containerHeight ) + inset;
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
        this.y = newPosY;
        this.rotate( rotationAmount );
      }
    }
  } );
} );