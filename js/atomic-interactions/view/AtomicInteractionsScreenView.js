// Copyright 2015, University of Colorado Boulder

/**
 * Main view for the "Atomic Interactions" sim and for the "Interactions" screen in the States of Matter simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var AtomicInteractionsControlPanel = require( 'STATES_OF_MATTER/atomic-interactions/view/AtomicInteractionsControlPanel' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ForcesControlPanel = require( 'STATES_OF_MATTER/atomic-interactions/view/ForcesControlPanel' );
  var GrabbableParticleNode = require( 'STATES_OF_MATTER/atomic-interactions/view/GrabbableParticleNode' );
  var HandNode = require( 'STATES_OF_MATTER/atomic-interactions/view/HandNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InteractiveInteractionPotentialDiagram = require( 'STATES_OF_MATTER/atomic-interactions/view/InteractiveInteractionPotentialDiagram' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ParticleForceNode = require( 'STATES_OF_MATTER/atomic-interactions/view/ParticleForceNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var PushPinNode = require( 'STATES_OF_MATTER/atomic-interactions/view/PushPinNode' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColorProfile = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColorProfile' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // strings
  var normalString = require( 'string!STATES_OF_MATTER/normal' );
  var slowMotionString = require( 'string!STATES_OF_MATTER/slowMotion' );
  var returnAtomString = require( 'string!STATES_OF_MATTER/returnAtom' );

  // Constant used to control size of push pin, empirically determined.
  var PUSH_PIN_WIDTH = 20;
  var INSET = 15;
  var MAX_TEXT_WIDTH = 80;

  /**
   *
   * @param {DualAtomModel} dualAtomModel of the simulation
   * @param {boolean} enableHeterogeneousAtoms - true to use a enable heterogeneous molecules, false otherwise.
   * @constructor
   */
  function AtomicInteractionsScreenView( dualAtomModel, enableHeterogeneousAtoms ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );

    this.dualAtomModel = dualAtomModel;
    this.movableParticle = dualAtomModel.getMovableAtomRef();
    this.fixedParticle = dualAtomModel.getFixedAtomRef();
    this.showAttractiveForces = false;
    this.showRepulsiveForces = false;
    this.showTotalForces = false;

    // set up the model-view transform
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      new Vector2( 0, 0 ),
      new Vector2( 145, 360 ),
      0.25
    );

    // initialize local variables
    var self = this;
    var tickTextColor = enableHeterogeneousAtoms ? 'black' : StatesOfMatterColorProfile.controlPanelTextProperty;
    var textColor = enableHeterogeneousAtoms ? 'black' : StatesOfMatterColorProfile.controlPanelTextProperty;
    var panelFill = enableHeterogeneousAtoms ? '#D1D2FF' : StatesOfMatterColorProfile.controlPanelBackgroundProperty;
    var panelStroke = enableHeterogeneousAtoms ? '#D1D2FF' : StatesOfMatterColorProfile.controlPanelStrokeProperty;
    var panelTextFill = enableHeterogeneousAtoms ? 'black' : StatesOfMatterColorProfile.controlPanelTextProperty;
    var forceControlPanelButtonAlign = enableHeterogeneousAtoms ? 'right' : 'left';
    var atomicInteractionsControlPanel = new AtomicInteractionsControlPanel( dualAtomModel, enableHeterogeneousAtoms, {
      right: this.layoutBounds.maxX - INSET,
      top: this.layoutBounds.minY + INSET,
      tickTextColor: tickTextColor,
      textColor: textColor,
      fill: panelFill,
      stroke: panelStroke,
      panelTextFill: panelTextFill
    } );

    // add interactive potential diagram
    this.interactiveInteractionPotentialDiagram = new InteractiveInteractionPotentialDiagram( dualAtomModel, true, {
      left: this.modelViewTransform.modelToViewX( 0 ) - 43, // empirically determined such left edge of graph is at
                                                            // center of fixed atom
      top: atomicInteractionsControlPanel.top + 5 // additional offset empirically determined to look good
    } );
    this.addChild( this.interactiveInteractionPotentialDiagram );

    // add the button for returning the atom to the screen
    this.returnAtomButton = new TextPushButton( returnAtomString, {
      font: new PhetFont( 17 ),
      baseColor: '#61BEE3',
      maxWidth: MAX_TEXT_WIDTH,
      listener: function() {
        dualAtomModel.resetMovableAtomPos();
      },
      left: this.layoutBounds.minX + 6 * INSET,
      bottom: this.layoutBounds.bottom - 2 * INSET
    } );
    this.addChild( this.returnAtomButton );

    // create and add the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        dualAtomModel.reset();
        dualAtomModel.isHandNodeVisible = true;
        self.handNode.setVisible( true );
        self.interactiveInteractionPotentialDiagram.reset();
      },
      right: this.layoutBounds.maxX - INSET,
      bottom: this.layoutBounds.maxY - 5,
      radius: StatesOfMatterConstants.RESET_ALL_BUTTON_RADIUS,
      touchAreaDilation: 4
    } );
    this.addChild( resetAllButton );

    // add play/pause and step buttons
    var stepButton = new StepForwardButton( {
      playingProperty: dualAtomModel.isPlayingProperty,
      listener: function() { dualAtomModel.stepInternal( 0.016 ); },
      radius: 12,
      stroke: 'black',
      fill: '#005566',
      centerX: this.layoutBounds.centerX + 100,
      bottom: this.layoutBounds.bottom - 20, // empirically determined
      touchAreaDilation: 4
    } );
    this.addChild( stepButton );

    // add force control
    var forcesControlPanel = new ForcesControlPanel(
      dualAtomModel.forcesProperty,
      dualAtomModel.forceControlPanelExpandProperty,
      {
        tickTextColor: tickTextColor,
        textColor: textColor,
        fill: panelFill,
        stroke: panelStroke,
        textFill: panelTextFill,
        buttonAlign: forceControlPanelButtonAlign,
        showTitleWhenExpanded: !enableHeterogeneousAtoms,
        minWidth: atomicInteractionsControlPanel.width,
        maxWidth: atomicInteractionsControlPanel.width
      }
    );

    // the control panels will overlap the reset all button if fully opened, so they must be a bit to the left
    atomicInteractionsControlPanel.right = resetAllButton.left - 20; // offset empirically determined

    // add play pause
    var playPauseButton = new PlayPauseButton( dualAtomModel.isPlayingProperty, {
      radius: 18,
      stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - 2 * INSET,
      touchAreaDilation: 4
    } );
    this.addChild( playPauseButton );

    var pauseSizeIncreaseFactor = 1.25;
    dualAtomModel.isPlayingProperty.lazyLink( function( isPlaying ) {
      playPauseButton.scale( isPlaying ? ( 1 / pauseSizeIncreaseFactor ) : pauseSizeIncreaseFactor );
    } );

    // add sim speed controls
    var speedSelectionButtonOptions = {
      fill: StatesOfMatterColorProfile.controlPanelTextProperty,
      font: new PhetFont( 14 ),
      maxWidth: MAX_TEXT_WIDTH
    };
    var speedSelectionButtonRadius = 8;
    var slowText = new Text( slowMotionString, speedSelectionButtonOptions );
    var slowMotionRadioBox = new AquaRadioButton( dualAtomModel.speedProperty, 'slow', slowText, {
      radius: speedSelectionButtonRadius
    } );
    var normalText = new Text( normalString, speedSelectionButtonOptions );
    var normalMotionRadioBox = new AquaRadioButton( dualAtomModel.speedProperty, 'normal', normalText, {
      radius: speedSelectionButtonRadius
    } );

    var speedControlMaxWidth = ( slowMotionRadioBox.width > normalMotionRadioBox.width ) ? slowMotionRadioBox.width : normalMotionRadioBox.width;

    var radioButtonSpacing = 4;
    var touchAreaYDilation = radioButtonSpacing / 2;
    slowMotionRadioBox.touchArea = new Bounds2(
      slowMotionRadioBox.localBounds.minX,
      slowMotionRadioBox.localBounds.minY - touchAreaYDilation,
      slowMotionRadioBox.localBounds.minX + speedControlMaxWidth,
      slowMotionRadioBox.localBounds.maxY + touchAreaYDilation
    );

    normalMotionRadioBox.touchArea = new Bounds2(
      normalMotionRadioBox.localBounds.minX,
      normalMotionRadioBox.localBounds.minY - touchAreaYDilation,
      ( normalMotionRadioBox.localBounds.minX + speedControlMaxWidth ),
      normalMotionRadioBox.localBounds.maxY + touchAreaYDilation
    );

    var speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [ slowMotionRadioBox, normalMotionRadioBox ],
      right: playPauseButton.left - 2 * INSET,
      centerY: playPauseButton.centerY
    } );
    //this.addChild( speedControl.mutate( { right: playPauseButton.left - 2 * inset, bottom: playPauseButton.bottom } ) );
    this.addChild( speedControl );

    // Create the push pin node that will be used to convey the idea that the fixed atom is pinned to the canvas.  It
    // will be added to the scene graph when the particles appear.
    this.pushPinNode = new PushPinNode();
    this.pushPinNode.scale( PUSH_PIN_WIDTH / this.pushPinNode.width );

    // update the push pin position if the adjustable atom diamter changes
    dualAtomModel.atomDiameterProperty.link( function( atomDiameter ) {
      self.updatePushPinPosition();
    } );

    // Create the nodes that will act as layers for the fixed and movable particles. This is done so that the
    // movable particle can always appear to be on top.
    this.fixedParticleLayer = new Node();
    this.addChild( this.fixedParticleLayer );
    this.movableParticleLayer = new Node();
    this.addChild( this.movableParticleLayer );

    // Add the control panels to the screen after the atoms so that the atoms with go behind them.
    this.addChild( atomicInteractionsControlPanel );
    this.addChild( forcesControlPanel );

    // set up the default particles
    this.handleFixedParticleAdded( dualAtomModel.fixedAtom );
    this.handleMovableParticleAdded( dualAtomModel.movableAtom );
    dualAtomModel.atomPairProperty.link( function( atomPair ) {
      forcesControlPanel.top = atomicInteractionsControlPanel.bottom + INSET / 2;
      forcesControlPanel.right = atomicInteractionsControlPanel.right;
      self.handleFixedParticleRemoved( dualAtomModel.fixedAtom );
      self.handleFixedParticleAdded( dualAtomModel.fixedAtom );
      self.handleMovableParticleRemoved( dualAtomModel.movableAtom );
      self.handleMovableParticleAdded( dualAtomModel.movableAtom );
      self.handNode.setVisible( dualAtomModel.isHandNodeVisible );
    } );
    dualAtomModel.forcesProperty.link( function( forces ) {
      switch( forces ) {
        case 'hideForces':
          self.setShowAttractiveForces( false );
          self.setShowRepulsiveForces( false );
          self.setShowTotalForces( false );
          break;
        case 'totalForce':
          self.setShowAttractiveForces( false );
          self.setShowRepulsiveForces( false );
          self.setShowTotalForces( true );
          break;
        case 'componentForce':
          self.setShowAttractiveForces( true );
          self.setShowRepulsiveForces( true );
          self.setShowTotalForces( false );
      }
    } );

    dualAtomModel.atomDiameterProperty.link( function() {
      self.fixedParticleNode.handleParticleRadiusChanged();
      self.movableParticleNode.handleParticleRadiusChanged();
      self.handleParticleRadiusChanged();
      self.updateMinimumXForMovableAtom();
    } );


    self.handNode.setVisible( true );
  }

  statesOfMatter.register( 'AtomicInteractionsScreenView', AtomicInteractionsScreenView );

  return inherit( ScreenView, AtomicInteractionsScreenView, {

    /**
     * Called by the animation loop.
     */
    step: function() {
      this.handlePositionChanged();
      this.movableParticleNode.step();
    },

    /**
     * Turn on/off the displaying of the force arrows that represent the attractive force.
     * @public
     * @param {boolean} showForces
     */
    setShowAttractiveForces: function( showForces ) {
      this.movableParticleNode.setShowAttractiveForces( showForces );
      this.fixedParticleNode.setShowAttractiveForces( showForces );
      this.showAttractiveForces = showForces;
    },

    /**
     * Turn on/off the displaying of the force arrows that represent the repulsive force.
     * @public
     * @param {boolean} showForces
     */
    setShowRepulsiveForces: function( showForces ) {
      this.movableParticleNode.setShowRepulsiveForces( showForces );
      this.fixedParticleNode.setShowRepulsiveForces( showForces );
      this.showRepulsiveForces = showForces;
    },

    /**
     * Turn on/off the displaying of the force arrows that represent the
     * total force, i.e. attractive plus repulsive.
     * @public
     * @param {boolean} showForces
     */
    setShowTotalForces: function( showForces ) {
      this.movableParticleNode.setShowTotalForces( showForces );
      this.fixedParticleNode.setShowTotalForces( showForces );
      this.showTotalForces = showForces;
    },

    /**
     * @public
     * @param {StatesOfMatterAtom} particle
     */
    handleFixedParticleAdded: function( particle ) {

      this.fixedParticle = particle;
      this.fixedParticleNode = new ParticleForceNode( particle, this.modelViewTransform, true, true );
      this.fixedParticleNode.setShowAttractiveForces( this.showAttractiveForces );
      this.fixedParticleNode.setShowRepulsiveForces( this.showRepulsiveForces );
      this.fixedParticleNode.setShowTotalForces( this.showTotalForces );
      this.fixedParticleLayer.addChild( this.fixedParticleNode );

      this.updatePositionMarkerOnDiagram();
      this.updatePushPinPosition();

      // Add the push pin last so that it is on top of the fixed atom. Note that the particulars of how this is
      // positioned may need to change if a different image is used.
      this.addChild( this.pushPinNode );
    },

    /**
     * @public
     */
    handleFixedParticleRemoved: function() {
      // Get rid of the node for this guy.
      if ( this.fixedParticleLayer.hasChild( this.fixedParticleNode ) ) {

        // Remove the particle node.
        this.fixedParticleLayer.removeChild( this.fixedParticleNode );

        // Remove the pin holding the node.
        this.removeChild( this.pushPinNode );
      }
      else {
        console.error( 'Error: Problem encountered removing node from canvas.' );
      }
      this.updatePositionMarkerOnDiagram();
      this.fixedParticleNode = null;
    },
    /**
     * @public
     * @param particle
     */
    handleMovableParticleAdded: function( particle ) {

      // Add the atom node for this guy.

      this.movableParticle = particle;
      this.handNode = new HandNode(
        this.dualAtomModel,
        this.dualAtomModel.movableAtom,
        this.modelViewTransform,
        0,
        1.0 / 0.0
      );
      this.movableParticleNode = new GrabbableParticleNode(
        this.handNode,
        this.dualAtomModel,
        particle,
        this.modelViewTransform,
        true,
        true,
        0,
        1.0 / 0.0
      );
      this.movableParticleNode.setShowAttractiveForces( this.showAttractiveForces );
      this.movableParticleNode.setShowRepulsiveForces( this.showRepulsiveForces );
      this.movableParticleNode.setShowTotalForces( this.showTotalForces );
      this.movableParticleLayer.addChild( this.movableParticleNode );
      this.movableParticleLayer.addChild( this.handNode );

      // Limit the particle's motion in the X direction so that it can't
      // get to where there is too much overlap, or is on the other side
      // of the fixed particle.
      this.updateMinimumXForMovableAtom();

      // Update the position marker to represent the new particle's position.
      this.updatePositionMarkerOnDiagram();
    },
    /**
     * @private
     */
    handleMovableParticleRemoved: function() {
      // Get rid of the node for this guy.
      if ( this.movableParticleNode !== null ) {
        // Remove the particle node.
        this.movableParticleLayer.removeChild( this.movableParticleNode );
      }
      else {
        console.error( 'Error: Problem encountered removing node from canvas.' );
      }

      this.updatePositionMarkerOnDiagram();
      this.movableParticleNode = null;

      if ( this.handNode !== null ) {
        // Remove the particle node.
        this.movableParticleLayer.removeChild( this.handNode );
      }
    },

    /**
     * @public
     * Handle a notification of a change in the radius of a particle.
     * IMPORTANT NOTE: This is part of a workaround for a problem with
     * rendering the spherical nodes.  To make a long story short, there were
     * problems with resizing the nodes if they were being drawn with a
     * gradient, so this (and other) code was added to effectively turn off
     * the gradient while the particle was being resized and turn it back
     * on when it started moving again.
     */
    handleParticleRadiusChanged: function() {

      // The particles are being resized, so disable the gradients if they
      // are being used and if motion is paused.
      if ( this.dualAtomModel.getMotionPaused() ) {
        if ( this.fixedParticleNode.getGradientEnabled() ) {
          this.fixedParticleNode.setGradientEnabled( false );
        }
        if ( this.movableParticleNode.getGradientEnabled() ) {
          this.movableParticleNode.setGradientEnabled( false );
        }
      }
    },
    /**
     * @private
     */
    handlePositionChanged: function() {
      if ( !this.dualAtomModel.getMotionPaused() ) {
        if ( !this.fixedParticleNode.getGradientEnabled() ) {
          // The movable particle is moving, so turn the gradient back on.
          this.fixedParticleNode.setGradientEnabled( true );
        }

        if ( !this.movableParticleNode.getGradientEnabled() ) {
          // The movable particle is moving, so turn the gradient back on.
          this.movableParticleNode.setGradientEnabled( true );
        }
      }

      this.updatePositionMarkerOnDiagram();
      this.updateForceVectors();


      var scale = Math.min( window.innerWidth / this.layoutBounds.width, window.innerHeight / this.layoutBounds.height );
      var atomWindowPosition = scale * ( this.modelViewTransform.modelToViewX(
          this.dualAtomModel.getMovableAtomRef().getX() ) );
      // account for the view centering
      if ( scale === window.innerHeight / this.layoutBounds.height ) {
        atomWindowPosition += (window.innerWidth - this.layoutBounds.width * scale) / 2 - 50;
      }
      if ( atomWindowPosition > window.innerWidth ) {
        if ( !this.returnAtomButton.isVisible() ) {
          // The particle is off the canvas and the button is not
          // yet shown, so show it.
          this.returnAtomButton.setVisible( true );
        }
      }
      else if ( this.returnAtomButton.isVisible() ) {
        // The particle is on the canvas but the button is visible
        // (which it shouldn't be), so hide it.
        this.returnAtomButton.setVisible( false );
      }
    },

    /**
     * Update the position marker on the Lennard-Jones potential diagram.
     * This will indicate the amount of potential being experienced between
     * the two atoms in the model.
     * @private
     */
    updatePositionMarkerOnDiagram: function() {

      if ( ( this.fixedParticle !== null ) && ( this.movableParticle !== null ) ) {
        var distance = this.fixedParticle.getPositionReference().distance( this.movableParticle.getPositionReference() );

        if ( distance > 0 ) {
          this.interactiveInteractionPotentialDiagram.setMarkerEnabled( true );
          this.interactiveInteractionPotentialDiagram.setMarkerPosition( distance );
        }
        else {
          this.interactiveInteractionPotentialDiagram.setMarkerEnabled( false );
        }
      }
      else {
        this.interactiveInteractionPotentialDiagram.setMarkerEnabled( false );
      }
    },

    updatePushPinPosition: function() {
      var mvt = this.modelViewTransform;
      var pinnedAtomPosition = this.dualAtomModel.fixedAtom.positionProperty.value;
      var pinnedAtomRadius = this.dualAtomModel.fixedAtom.radius;
      this.pushPinNode.right = mvt.modelToViewX( pinnedAtomPosition.x - pinnedAtomRadius * 0.5 );
      this.pushPinNode.bottom = mvt.modelToViewY( pinnedAtomPosition.y - pinnedAtomRadius * 0.5 );
    },

    /**
     * Update the minimum X value allowed for the movable atom.  This prevents too much overlap between the atoms.
     * @public
     */
    updateMinimumXForMovableAtom: function() {
      if ( this.movableParticle !== null && this.fixedParticle !== null ) {

        // Use a minimum X value that is just a bit less than the sigma value, since the repulsive potential goes up
        // rapidly with smaller values.
        var minXInModel = this.dualAtomModel.getSigma() * 0.9;
        this.interactiveInteractionPotentialDiagram.setMinXForAtom( minXInModel );
        var minXInView = this.modelViewTransform.modelToViewX( minXInModel );
        this.movableParticleNode.setMinX( minXInView );
        this.handNode.setMinX( minXInView );
      }
    },
    /**
     * @private
     */
    updateForceVectors: function() {
      if ( ( this.fixedParticle !== null ) && ( this.movableParticle !== null ) ) {
        this.fixedParticleNode.setForces( this.dualAtomModel.getAttractiveForce(),
          -this.dualAtomModel.getRepulsiveForce() );
        this.movableParticleNode.setForces( -this.dualAtomModel.getAttractiveForce(),
          this.dualAtomModel.getRepulsiveForce() );
      }
    }
  } );
} );