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
  // constants
  var inset = 10;

  /**
   * @param {MultipleParticleModel} model of the sim
   * @constructor
   */
  function PhaseChangesScreenView( model ) {

    ScreenView.call( this, { renderer: 'svg' } );
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    // model-view transform
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );


    var stoveNode = new StoveNode( model, {
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom
    } );
    this.addChild( stoveNode );

    var particleContainerNode = new ParticleContainerNode( model, modelViewTransform,
      {
        centerX: stoveNode.centerX,
        bottom: stoveNode.top //, canvasBounds: new Bounds2( -1000, -1000, 1000, 1000 )

      }, true, true );


    this.particlesLayer = new ParticleCanvasNode( model.particles, modelViewTransform, {
      centerX: stoveNode.centerX - 100,
      bottom: stoveNode.top + 700,
      canvasBounds: new Bounds2( -1000, -1000, 1000, 1000 )
    } );
    this.addChild( this.particlesLayer );
    this.addChild( particleContainerNode );
    /*new ParticleCanvasNode( model.particles, modelViewTransform, {
     canvasBounds: new Bounds2( -1000, -1000, 1000, 1000 )
     } );
     this.addChild( this.particlesLayer );
     */


    // add temperature node
    var temperatureNode = new TemperatureNode( model, {
      font: new PhetFont( 20 ),
      fill: 'white',
      left: stoveNode.right,
      top: stoveNode.top - 350
    } );
    this.addChild( temperatureNode );


    var phaseChangesMoleculesControlPanel = new PhaseChangesMoleculesControlPanel( model, model.atomsProperty,
      { right: this.layoutBounds.right + 5,
        top: this.layoutBounds.top + 10
      } );
    this.addChild( phaseChangesMoleculesControlPanel );

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
      { radius: 18, stroke: 'black',
        fill: '#005566',
        y: stepButton.centerY,
        right: stepButton.left - inset
      } );
    this.addChild( playPauseButton );
    this.addChild( resetAllButton );

    this.addChild( new BicyclePumpNode( 250, 300, model, {
      //  x: particleContainerNode.centerX,
      bottom: particleContainerNode.bottom,
      right: particleContainerNode.left
    } ) );
    var phaseDiagram = new PhaseDiagram( model.expandedProperty );

    var test = this;

    model.temperatureSetPointProperty.link( function( temperatureSetPoint ) {
      phaseDiagram.setStateMarkerPos( temperatureSetPoint, temperatureSetPoint );
      model.temperatureInKelvin = Math.round( model.getTemperatureInKelvin() );
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
        if ( test.indexOfChild( phaseDiagram ) >= 0 ) {
          test.removeChild( phaseDiagram );
        }
        epsilonControlInteractionPotentialDiagram.top = phaseChangesMoleculesControlPanel.bottom + 5;
      }
      else {
        if ( test.indexOfChild( phaseDiagram ) < 0 ) {
          test.addChild( phaseDiagram );
          phaseDiagram.right = test.layoutBounds.right + 5,
            phaseDiagram.top = phaseChangesMoleculesControlPanel.bottom + 5;
          epsilonControlInteractionPotentialDiagram.top = phaseDiagram.bottom + 5;
        }
      }
    } );
  }

  return inherit( ScreenView, PhaseChangesScreenView, {
    step: function() {
      this.particlesLayer.step();
    }
  } );
} );

