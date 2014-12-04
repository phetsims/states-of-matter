// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * View for the phase changes screen
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
  var TemperatureNode = require( 'STATES_OF_MATTER/common/view/TemperatureNode' );
  var StoveNode = require( 'STATES_OF_MATTER/common/view/StoveNode' );
  var PhaseChangesMoleculesControlPanel = require( 'STATES_OF_MATTER/phase-changes/view/PhaseChangesMoleculesControlPanel' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var ParticleContainerNode = require( 'STATES_OF_MATTER/common/view/ParticleContainerNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var BicyclePumpNode = require( 'STATES_OF_MATTER/common/view/BicyclePumpNode' );
  var PhaseDiagram = require( 'STATES_OF_MATTER/phase-changes/view/PhaseDiagram' );
  var EpsilonControlInteractionPotentialDiagram = require( 'STATES_OF_MATTER/phase-changes/view/EpsilonControlInteractionPotentialDiagram' );
  var ParticleCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleCanvasNode' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  // constants
  var inset = 10;

  /**
   * @param {MultipleParticleModel} model of the sim
   * @constructor
   */
  function PhaseChangesScreenView( model ) {
    var phaseChangesScreenView = this;

    ScreenView.call( this, { renderer: 'svg' } );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );

    // add stove node
    var stoveNode = new StoveNode( model, {
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom
    } );
    this.addChild( stoveNode );

    // add particle container node
    var particleContainerNode = new ParticleContainerNode( model, modelViewTransform,
      {
        centerX: stoveNode.centerX,
        bottom: stoveNode.top
      }, true, true );

    // add particle canvas layer for particle rendering
    this.particlesLayer = new ParticleCanvasNode( model.particles, modelViewTransform, {
      centerX: stoveNode.centerX - 100,
      bottom: stoveNode.top + 720,
      canvasBounds: new Bounds2( -1000, -1000, 1000, 1000 )
    } );
    this.addChild( this.particlesLayer );
    this.addChild( particleContainerNode );

    // add temperature node
    var temperatureNode = new TemperatureNode( model, {
      font: new PhetFont( 20 ),
      fill: 'white',
      left: stoveNode.right,
      top: stoveNode.top - 350
    } );
    this.addChild( temperatureNode );
    var phaseDiagram = new PhaseDiagram( model.expandedProperty );

    //add phase change control panel
    var phaseChangesMoleculesControlPanel = new PhaseChangesMoleculesControlPanel( model, model.atomsProperty,
      phaseDiagram,
      { right: this.layoutBounds.right + 5,
        top: this.layoutBounds.top + 10
      } );
    this.addChild( phaseChangesMoleculesControlPanel );

    // Add reset all button
    var resetAllButton = new ResetAllButton(
      {
        listener: function() {
          phaseChangesMoleculesControlPanel.modelTemperatureHistory.clear();
          model.reset();
          temperatureNode.setRotation( 0 );
          particleContainerNode.reset();
        },
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
        right: stoveNode.left - 20,
        bottom: this.layoutBounds.bottom - 14
      }
    );

    this.addChild( stepButton );

    var playPauseButton = new PlayPauseButton( model.isPlayingProperty,
      { radius: 18, stroke: 'black',
        fill: '#005566',
        y: stepButton.centerY,
        right: stepButton.left - inset
      } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    this.addChild( new BicyclePumpNode( 250, 300, model, {
      bottom: stoveNode.top + 100,
      right: particleContainerNode.left + 45
    } ) );

    this.returnLidButton = new TextPushButton( 'return Lid', {
      font: new PhetFont( 14 ),
      baseColor: 'yellow',
      listener: function() {
        model.returnLid();
      },
      xMargin: 10,
      right: particleContainerNode.left - 10,
      top: particleContainerNode.centerY + 120,
      visible: model.isExplodedProperty.value
    } );
    this.addChild( this.returnLidButton );
    model.isExplodedProperty.linkAttribute( this.returnLidButton, 'visible' );
    model.isExplodedProperty.link( function() {
      particleContainerNode.updatePressureGauge();
      particleContainerNode.containerLid.setRotation( 0 );
      particleContainerNode.pressureMeter.setY( particleContainerNode.containerLid.y );
    } );

    var epsilonControlInteractionPotentialDiagram = new EpsilonControlInteractionPotentialDiagram(
      StatesOfMatterConstants.MAX_SIGMA, StatesOfMatterConstants.MIN_EPSILON, false, model, {
        right: this.layoutBounds.right + 5,
        top: phaseChangesMoleculesControlPanel.bottom + 5
      } );
    this.addChild( epsilonControlInteractionPotentialDiagram );
    model.atomsProperty.link( function( moleculeId ) {
      phaseDiagram.setDepictingWater( moleculeId === StatesOfMatterConstants.WATER );
      if ( moleculeId === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        if ( phaseChangesScreenView.isChild( phaseDiagram ) ) {
          phaseChangesScreenView.removeChild( phaseDiagram );
        }
        epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + 5;
      }
      else {
        if ( !phaseChangesScreenView.isChild( phaseDiagram ) ) {
          phaseChangesScreenView.addChild( phaseDiagram );
          phaseDiagram.right = phaseChangesScreenView.layoutBounds.right + 5;
            phaseDiagram.top = phaseChangesMoleculesControlPanel.bottom + 5;
          epsilonControlInteractionPotentialDiagram.top = phaseDiagram.bottom + 5;
        }
      }
    } );
    model.particleContainerHeightProperty.link( function() {
      var rotationRate = 0;
      var containerRect = model.getParticleContainerRect();
      if ( !model.getContainerExploded() ) {
        rotationRate = 0;
        temperatureNode.setRotation( rotationRate );
        particleContainerNode.containerLid.setRotation( rotationRate );
        temperatureNode.setY( particleContainerNode.y +
                              Math.abs( particleContainerNode.modelViewTransform.modelToViewDeltaY(
                                  StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                  containerRect.getHeight() ) ) );
        particleContainerNode.containerLid.setY( particleContainerNode.y - temperatureNode.height +
                                                 Math.abs( particleContainerNode.modelViewTransform.modelToViewDeltaY(
                                                     StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                                     containerRect.getHeight() ) ) );
      }
      else {
        rotationRate = -( Math.PI / 100 + ( Math.random() * Math.PI / 50 ) );
        temperatureNode.rotate( rotationRate );
        particleContainerNode.containerLid.rotate( rotationRate );
        temperatureNode.setY( particleContainerNode.y -
                              particleContainerNode.modelViewTransform.modelToViewDeltaY(
                                  StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                  containerRect.getHeight() ) );

        particleContainerNode.containerLid.setY( particleContainerNode.y - temperatureNode.height -
                                                 Math.abs( particleContainerNode.modelViewTransform.modelToViewDeltaY(
                                                     StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                                     containerRect.getHeight() ) ) );

      }
    } );
  }

  return inherit( ScreenView, PhaseChangesScreenView, {
    step: function() {
      this.particlesLayer.step();
    }
  } );
} );

