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
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var StoveNode = require( 'STATES_OF_MATTER/common/view/StoveNode' );
  var CompositeThermometerNode = require( 'STATES_OF_MATTER/common/view/CompositeThermometerNode' );
  var AtomsAndMoleculesControlPanel = require( 'STATES_OF_MATTER/solid-liquid-gas/view/AtomsAndMoleculesControlPanel' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var SolidLiquidGasPhaseControlNode = require( 'STATES_OF_MATTER/solid-liquid-gas/view/SolidLiquidGasPhaseControlNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ParticleCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleCanvasNode' );

  // constants
  var inset = 10;

  /**
   * @param {MultipleParticleModel} model of the sim
   * @constructor
   */
  function SolidLiquidGasScreenView( model ) {

    ScreenView.call( this, StatesOfMatterConstants.SCREEN_VIEW_OPTIONS );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );

    var stoveNode = new StoveNode( model, {scale: 0.8,
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - inset
    } );
    var particleContainerNode = new ParticleContainerNode( model, modelViewTransform,
      {
        centerX: stoveNode.centerX - 10,
        bottom: stoveNode.top - inset

      } );


    this.particlesLayer = new ParticleCanvasNode( model.particles, modelViewTransform, {
      centerX: stoveNode.centerX - 130,
      bottom: stoveNode.top + 720,
      canvasBounds: new Bounds2( -1000, -1000, 1000, 1000 )
    } );

    this.addChild( this.particlesLayer );
    this.addChild( particleContainerNode );

    this.addChild( stoveNode );

    var compositeThermometerNode = new CompositeThermometerNode( model, {
      font: new PhetFont( 20 ),
      fill: 'white',
      right: particleContainerNode.left + 100,
      centerY: particleContainerNode.top + 50
    } );

    this.addChild( compositeThermometerNode );

    var atomsAndMoleculesControlPanel = new AtomsAndMoleculesControlPanel( model.moleculeTypeProperty, {
      right: this.layoutBounds.right + 5,
      top: this.layoutBounds.top + 10
    } );
    this.addChild( atomsAndMoleculesControlPanel );

    var solidLiquidGasPhaseControlNode = new SolidLiquidGasPhaseControlNode( model, {
      right: this.layoutBounds.right + 5,
      top: atomsAndMoleculesControlPanel.bottom + 10
    } );
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
        right: stoveNode.left - 50,
        bottom: stoveNode.bottom - 20
      }
    );

    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( model.isPlayingProperty,
      {
        radius: 18,
        stroke: 'black',
        fill: '#005566',
        y: stepButton.centerY,
        right: stepButton.left - inset
      } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );
  }

  return inherit( ScreenView, SolidLiquidGasScreenView, {
    step: function() {
      this.particlesLayer.step();
    }
  } );
} );
