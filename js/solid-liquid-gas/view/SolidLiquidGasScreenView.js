// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * View for the solid-liquid-gas screen
 *
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );
  var StoveNode = require( 'STATES_OF_MATTER/common/view/StoveNode' );
  var AtomsAndMoleculesControlPanel = require( 'STATES_OF_MATTER/solid-liquid-gas/view/AtomsAndMoleculesControlPanel' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var SolidLiquidGasPhaseControlNode = require( 'STATES_OF_MATTER/solid-liquid-gas/view/SolidLiquidGasPhaseControlNode' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // constants
  var inset = 10;

  /**
   * @param {MultipleParticleModel} model of the sim
   * @constructor
   */
  function SolidLiquidGasScreenView( model ) {

    ScreenView.call( this, { renderer: 'svg' } );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ), new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );

    var particleContainerNode = new ParticleContainerNode( model, modelViewTransform,
      {
        centerX: this.layoutBounds.centerX + 150,
        top: this.layoutBounds.top + 50, canvasBounds: new Bounds2( 0, 0, 600, 1000 )
      } );

    this.addChild( particleContainerNode );
    this.particlesLayer = particleContainerNode;
    // add temperature text
    var temperatureTextNode = new Text( 0, { font: new PhetFont( 20 ), fill: 'white', right: particleContainerNode.right, bottom: particleContainerNode.top } );
    model.temperatureSetPointProperty.link( function( temperature ) {

      temperatureTextNode.setText( Math.round( model.getTemperatureInKelvin() ) );
    } );
    this.addChild( temperatureTextNode );

    this.addChild( new StoveNode( model, { centerX: this.layoutBounds.centerX, bottom: this.layoutBounds.bottom } ) );
    var atomsAndMoleculesControlPanel = new AtomsAndMoleculesControlPanel( model.atomsProperty, { right: this.layoutBounds.right + 5, top: this.layoutBounds.top + 10} );
    this.addChild( atomsAndMoleculesControlPanel );

    var solidLiquidGasPhaseControlNode = new SolidLiquidGasPhaseControlNode( model, { right: this.layoutBounds.right + 5, top: atomsAndMoleculesControlPanel.bottom + 10} );
    this.addChild( solidLiquidGasPhaseControlNode );

    // Add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() { model.reset(); },
        bottom: this.layoutBounds.bottom - 5,
        right: this.layoutBounds.right + 5,
        radius: 18
      } );

    // add play pause button and step button
    var stepButton = new StepButton(
      function() {
        model.stepInternal( 0.016 );
      },
      model.isPlayingProperty,
      {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        right: resetAllButton.left - 200,
        bottom: this.layoutBounds.bottom - 14
      }
    );

    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( model.isPlayingProperty,
      { radius: 18, stroke: 'black', fill: '#005566', y: stepButton.centerY, right: stepButton.left - inset } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    // add thermometer
    var thermometer = new ThermometerNode( 0, 1000, model.temperatureSetPointProperty, {outlineStroke: 'white', tickSpacing: 3, bulbDiameter: 25, lineWidth: 2, tubeWidth: 15, tubeHeight: 50, centerX: particleContainerNode.centerX, bottom: particleContainerNode.top + 90 } );
    this.addChild( thermometer );

  }

  return inherit( ScreenView, SolidLiquidGasScreenView, {
    step: function() {
      this.particlesLayer.step();
    }
  } );
} );
