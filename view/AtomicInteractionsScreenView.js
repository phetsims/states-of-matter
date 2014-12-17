//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var InteractiveInteractionPotentialDiagram = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/InteractiveInteractionPotentialDiagram' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ForcesControlNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/ForcesControlPanel' );
  var AtomicInteractionsControlPanel = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/AtomicInteractionsControlPanel' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var ParticleForceNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/ParticleForceNode' );
  var GrabbableParticleNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/GrabbableParticleNode' );
  var PushpinNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/PushpinNode' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );


  // strings
  var normalString = require( 'string!ATOMIC_INTERACTIONS/normal' );
  var slowMotionString = require( 'string!ATOMIC_INTERACTIONS/slowMotion' );
  var inset = 10;


  // Canvas size in pico meters, since this is a reasonable scale at which
  // to display molecules.  Assumes a 4:3 aspect ratio.
  var CANVAS_WIDTH = 2000;
  var CANVAS_HEIGHT = CANVAS_WIDTH * ( 3.0 / 4.0 );

  // Translation factors, used to set origin of canvas area.
  var WIDTH_TRANSLATION_FACTOR = 0.3;   // 0 puts the vertical origin all the way left, 1
  // is all the way to the right.
  //var HEIGHT_TRANSLATION_FACTOR = 0.78; // 0 puts the horizontal origin at the top of the
  // window, 1 puts it at the bottom.

  // Constant used to control size of button.
  var BUTTON_HEIGHT = CANVAS_WIDTH * 0.06;

  // Constant used to control size of wiggle me.
  var WIGGLE_ME_HEIGHT = CANVAS_HEIGHT * 0.06;

  // Constant used to control size of push pin.
  var PUSH_PIN_WIDTH = CANVAS_WIDTH * 0.10;

  // The following constant controls whether the wiggle me appears.  This
  // was requested in the original specification, but after being reviewed
  // on 9/4/2008, it was requested that it be removed.  Then, after
  // interviews conducted in late 2009, it was decide that it should be
  // added back.  The constant is being kept in case this decision is
  // reversed (again) at some point in the future.
  var ENABLE_WIGGLE_ME = true;


  var particle;

  var NEON_NEON = 'NEON_NEON';
  var ARGON_ARGON = 'ARGON_ARGON';
  var OXYGEN_OXYGEN = 'OXYGEN_OXYGEN';
  var NEON_ARGON = 'NEON_ARGON';
  var NEON_OXYGEN = 'NEON_OXYGEN';
  var ARGON_OXYGEN = 'ARGON_OXYGEN';
  var ADJUSTABLE = 'ADJUSTABLE';

  // Constant to turn on/off a set of vertical lines that can be used to
  // check the alignment between the graph and the atoms.
  // var SHOW_ALIGNMENT_LINES = false;

  /**
   *
   * @param dualAtomModel
   * @constructor
   */
  function AtomicInteractionsScreenView( dualAtomModel ) {

    ScreenView.call( this );

    this.atomicInteractionsModel = dualAtomModel;
    this.movableParticle = dualAtomModel.getMovableAtomRef();
    this.fixedParticle = dualAtomModel.getFixedAtomRef();
    this.showAttractiveForces = false;
    this.showRepulsiveForces = false;
    this.showTotalForces = false;
    this.wiggleMeShown = false;
    var atomicInteractionsScreenView = this;

    // model-view transform
    var mvtScale = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH /
                   StatesOfMatterConstants.CONTAINER_BOUNDS.width;

    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( new Vector2( 0, 0 ),
      new Vector2( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT ), mvtScale );

    var atomicInteractionsControlPanel = new AtomicInteractionsControlPanel( dualAtomModel, true, {
      right: this.layoutBounds.maxX - 10,
      top: this.layoutBounds.minY + 10
    } );
    this.addChild( atomicInteractionsControlPanel );

    // add interactive potential diagram
    this.interactiveInteractionPotentialDiagram = new InteractiveInteractionPotentialDiagram(
      dualAtomModel.getSigma(), dualAtomModel.getEpsilon(), true, dualAtomModel,
      {left: this.layoutBounds.minX + 10, top: atomicInteractionsControlPanel.top + 5} );
    /* var desiredWidth = this.interactiveInteractionPotentialDiagram.getXAxisRange() /
     this.interactiveInteractionPotentialDiagram.getXAxisGraphProportion();
     var diagramScaleFactor = desiredWidth / this.interactiveInteractionPotentialDiagram.width;
     interactiveInteractionPotentialDiagram.scale( diagramScaleFactor );*/
    this.addChild( this.interactiveInteractionPotentialDiagram );

    // Add the button for retrieving the atom to the canvas.
    this.retrieveAtomButtonNode = new TextPushButton( 'Return Atom', {
      font: new PhetFont( 16 ),
      baseColor: '#ffcc66',
      listener: function() {
        dualAtomModel.resetMovableAtomPos();
      },
      xMargin: 10
    } );
    this.retrieveAtomButtonNode.setTranslation(
        this.interactiveInteractionPotentialDiagram.maxX - this.retrieveAtomButtonNode.width,
        StatesOfMatterConstants.MAX_SIGMA / 3 * 1.1 );  // Almost fully below the largest atom.
    this.retrieveAtomButtonNode.scale( BUTTON_HEIGHT / this.retrieveAtomButtonNode.height );
    this.retrieveAtomButtonNode.setVisible( false );
    this.addChild( this.retrieveAtomButtonNode );

    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        dualAtomModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    // add play pause button and step button
    var stepButton = new StepButton(
      function() {
        dualAtomModel.stepInternal( 0.016 );
      },
      dualAtomModel.isPlayingProperty,
      {
        radius: 12,
        stroke: 'black',
        fill: '#005566',
        centerX: this.layoutBounds.centerX,
        bottom: this.layoutBounds.bottom - 14
      } );
    this.addChild( stepButton );


    // add force control
    var forceControlNode = new ForcesControlNode( dualAtomModel.forcesProperty );


    // add play pause
    var playPauseButton = new PlayPauseButton( dualAtomModel.isPlayingProperty, {
      radius: 18,
      stroke: 'black',
      fill: '#005566',
      y: stepButton.centerY,
      right: stepButton.left - inset
    } );
    this.addChild( playPauseButton );

    // add sim speed controls
    var slowMotionRadioBox = new AquaRadioButton( dualAtomModel.speedProperty, 'slow',
      new Text( slowMotionString, {fill: 'white', font: new PhetFont( 14 ) } ), { radius: 10 } );
    var normalMotionRadioBox = new AquaRadioButton( dualAtomModel.speedProperty, 'normal',
      new Text( normalString, { fill: 'white', font: new PhetFont( 14 ) } ), { radius: 10 } );

    var speedControlMaxWidth = ( slowMotionRadioBox.width > normalMotionRadioBox.width ) ? slowMotionRadioBox.width :
                               normalMotionRadioBox.width;

    var radioButtonSpacing = 5;
    var touchAreaHeightExpansion = radioButtonSpacing / 2;
    slowMotionRadioBox.touchArea = new Bounds2(
      slowMotionRadioBox.localBounds.minX,
        slowMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
        slowMotionRadioBox.localBounds.minX + speedControlMaxWidth,
        slowMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    normalMotionRadioBox.touchArea = new Bounds2(
      normalMotionRadioBox.localBounds.minX,
        normalMotionRadioBox.localBounds.minY - touchAreaHeightExpansion,
      ( normalMotionRadioBox.localBounds.minX + speedControlMaxWidth ),
        normalMotionRadioBox.localBounds.maxY + touchAreaHeightExpansion
    );

    var speedControl = new VBox( {
      align: 'left',
      spacing: radioButtonSpacing,
      children: [ slowMotionRadioBox, normalMotionRadioBox ]
    } );
    this.addChild( speedControl.mutate( { right: playPauseButton.left - 8, bottom: playPauseButton.bottom } ) );

    // Create the push pin node that will be used to convey the idea that
    // the fixed atom is pinned to the canvas.  It will be added to the
    // canvas when the particles appear.
    this.pushPinNode = new PushpinNode();
    this.pushPinNode.scale( PUSH_PIN_WIDTH / this.pushPinNode.width );

    // Create the nodes that will act as layers for the fixed and movable
    // particles.  This is done so that the fixed particle can always
    // appear to be on top.
    this.fixedParticleLayer = new Node();
    this.addChild( this.fixedParticleLayer );
    this.movableParticleLayer = new Node();
    this.addChild( this.movableParticleLayer );

    this.addChild( forceControlNode );

    // default molecule is neon
    atomicInteractionsScreenView.handleFixedParticleAdded( new NeonAtom( 0, 0 ) );
    atomicInteractionsScreenView.handleMovableParticleAdded( new NeonAtom( 0, 0 ) );
    dualAtomModel.moleculeTypeProperty.link( function( moleculeType ) {
      forceControlNode.top = atomicInteractionsControlPanel.bottom + 5;
      forceControlNode.right = atomicInteractionsControlPanel.right;
    } );

    dualAtomModel.moleculeTypeProperty.link( function( moleculeType ) {

      var fixedParticle;
      var movableParticle;

      switch( moleculeType ) {
        case NEON_NEON:
          particle = new NeonAtom( 0, 0 );
          fixedParticle = particle;
          movableParticle = particle;
          break;

        case ARGON_ARGON:
          particle = new ArgonAtom( 0, 0 );
          fixedParticle = particle;
          movableParticle = particle;
          break;

        case ADJUSTABLE:
          particle = new ConfigurableStatesOfMatterAtom( 0, 0 );
          fixedParticle = particle;
          movableParticle = particle;
          break;

        case OXYGEN_OXYGEN:
          fixedParticle = new OxygenAtom( 0, 0 );
          movableParticle = new OxygenAtom( 0, 0 );
          break;

        case NEON_ARGON:
          fixedParticle = new NeonAtom( 0, 0 );
          movableParticle = new ArgonAtom( 0, 0 );
          break;

        case NEON_OXYGEN:
          fixedParticle = new NeonAtom( 0, 0 );
          movableParticle = new OxygenAtom( 0, 0 );
          break;

        case ARGON_OXYGEN:
          fixedParticle = new ArgonAtom( 0, 0 );
          movableParticle = new OxygenAtom( 0, 0 );
          break;
      }

      atomicInteractionsScreenView.handleFixedParticleRemoved( fixedParticle );
      atomicInteractionsScreenView.handleFixedParticleAdded( fixedParticle );
      atomicInteractionsScreenView.handleMovableParticleRemoved( movableParticle );
      atomicInteractionsScreenView.handleMovableParticleAdded( movableParticle );
      dualAtomModel.setBothAtomTypes( atoms );
    } );
    this.movableParticle.positionProperty.link( function() {
      atomicInteractionsScreenView.handlePositionChanged();
    } );
    dualAtomModel.atomDiameterProperty.link( function() {
      //atomicInteractionsScreenView.handleParticleRadiusChanged();
    } );
    /*  this.movableParticle.link(function() {
     atomicInteractionsScreenView.updateMinimumXForMovableAtom();
     atomicInteractionsScreenView.updateMinimumXForMovableAtom();
     });
     // Create the listener for monitoring particle motion.
     this.atomListener = new StatesOfMatterAtom.Adapter() {
     positionChanged() {
     this.handlePositionChanged();
     }
     radiusChanged() {
     this.handleParticleRadiusChanged();
     }
     };*/
    dualAtomModel.forcesProperty.link( function( forces ) {
      switch( forces ) {
        case 'hideForces':
          atomicInteractionsScreenView.setShowAttractiveForces( false );
          atomicInteractionsScreenView.setShowRepulsiveForces( false );
          atomicInteractionsScreenView.setShowTotalForces( false );
          break;
        case 'totalForce':
          atomicInteractionsScreenView.setShowAttractiveForces( false );
          atomicInteractionsScreenView.setShowRepulsiveForces( false );
          atomicInteractionsScreenView.setShowTotalForces( true );
          break;
        case 'componentForce':
          atomicInteractionsScreenView.setShowAttractiveForces( true );
          atomicInteractionsScreenView.setShowRepulsiveForces( true );
          atomicInteractionsScreenView.setShowTotalForces( false );
      }

    } );
    dualAtomModel.atomDiameterProperty.link( function( diameter ) {
      atomicInteractionsScreenView.fixedParticleNode.particle.setRadius( diameter / 2 );
      atomicInteractionsScreenView.fixedParticleNode.handleParticleRadiusChanged();
      atomicInteractionsScreenView.movableParticleNode.particle.setRadius( diameter / 2 );
      atomicInteractionsScreenView.movableParticleNode.handleParticleRadiusChanged();
    } );


    /*  var fixedAtomVerticalCenterMarker = new Path( new Shape().moveTo( 0, 0).lineTo( 0, 500 ),{fill: 'pink', stroke: 'pink'});
     fixedAtomVerticalCenterMarker.setTranslation( 0, 0 );
     this.addChild( fixedAtomVerticalCenterMarker );

     var movableAtomVerticalCenterMarker = new Path( new Shape().moveTo( 0, 0).lineTo( 0, 500 ),{fill: 'orange', stroke: 'orange'});
     movableAtomVerticalCenterMarker.setTranslation( atomicInteractionsModel.getMovableAtomRef().positionProperty.value.x, 0 );
     this.addChild( movableAtomVerticalCenterMarker );

     var rightSideOfChartMarker = new Path(new Shape().moveTo( 0, 0).lineTo(  0, 500 ),{fill: 'green', stroke: 'green'});
     rightSideOfChartMarker.setTranslation( 1100, 0 );
     this.addChild( rightSideOfChartMarker );*/
    this.dualAtomModel = dualAtomModel;
  }

  return inherit( ScreenView, AtomicInteractionsScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
      //  console.log("inside step func")
      if ( this.dualAtomModel.isPlaying ) {
        //  particle.positionProperty.value = new Vector2( 300 + Math.random() * 100, 67 );
      }

    },
    /**
     * Turn on/off the displaying of the force arrows that represent the
     * attractive force.
     */
    setShowAttractiveForces: function( showForces ) {
      this.movableParticleNode.setShowAttractiveForces( showForces );
      this.fixedParticleNode.setShowAttractiveForces( showForces );
      this.showAttractiveForces = showForces;
    },

    /**
     * Turn on/off the displaying of the force arrows that represent the
     * repulsive force.
     */
    setShowRepulsiveForces: function( showForces ) {
      this.movableParticleNode.setShowRepulsiveForces( showForces );
      this.fixedParticleNode.setShowRepulsiveForces( showForces );
      this.showRepulsiveForces = showForces;
    },

    /**
     * Turn on/off the displaying of the force arrows that represent the
     * total force, i.e. attractive plus repulsive.
     */
    setShowTotalForces: function( showForces ) {
      this.movableParticleNode.setShowTotalForces( showForces );
      this.fixedParticleNode.setShowTotalForces( showForces );
      this.showTotalForces = showForces;
    },
    handleFixedParticleAdded: function( particle ) {

      this.fixedParticle = particle;
      this.fixedParticleNode = new ParticleForceNode( particle, this.modelViewTransform, true, true );
      this.fixedParticleNode.top = this.interactiveInteractionPotentialDiagram.bottom;
      this.fixedParticleNode.left = this.layoutBounds.minX + 10;
      this.fixedParticleNode.setShowAttractiveForces( this.showAttractiveForces );
      this.fixedParticleNode.setShowRepulsiveForces( this.showRepulsiveForces );
      this.fixedParticleNode.setShowTotalForces( this.showTotalForces );
      this.fixedParticleLayer.addChild( this.fixedParticleNode );


      this.updatePositionMarkerOnDiagram();

      // Add the push pin last so that it is on top of the fixed atom.
      // Note that the particulars of how this is positioned will need to
      // change if a different image is used.
      //this.addChild( this.pushPinNode );
      this.pushPinNode.setTranslation( this.fixedParticle.getRadius() * 0.25, this.fixedParticle.getRadius() * 0.1 );
    },

    handleFixedParticleRemoved: function( particle ) {
      // Get rid of the node for this guy.
      if ( this.fixedParticleLayer.isChild( this.fixedParticleNode ) ) {

        // Remove the particle node.
        this.fixedParticleLayer.removeChild( this.fixedParticleNode );

        // Remove the pin holding the node.
        //this.removeChild( this.pushPinNode );
      }
      else {
        console.error( "Error: Problem encountered removing node from canvas." );
      }
      this.updatePositionMarkerOnDiagram();
      this.fixedParticleNode = null;
    },

    handleMovableParticleAdded: function( particle ) {

      // Add the atom node for this guy.

      this.movableParticle = particle;
      this.movableParticleNode = new GrabbableParticleNode( this.atomicInteractionsModel, particle,
        this.modelViewTransform, true, true, 0, 1.0 / 0.0 );
      this.movableParticleNode.top = this.interactiveInteractionPotentialDiagram.bottom;
      this.movableParticleNode.left = this.layoutBounds.minX + 60;
      this.movableParticleNode.setShowAttractiveForces( this.showAttractiveForces );
      this.movableParticleNode.setShowRepulsiveForces( this.showRepulsiveForces );
      this.movableParticleNode.setShowTotalForces( this.showTotalForces );
      this.movableParticleLayer.addChild( this.movableParticleNode );

      // Limit the particle's motion in the X direction so that it can't
      // get to where there is too much overlap, or is on the other side
      // of the fixed particle.
      this.updateMinimumXForMovableAtom();

      // Add ourself as a listener.
      //particle.addListener( this.atomListener );

      // Update the position marker to represent the new particle's position.
      this.updatePositionMarkerOnDiagram();
    },

    handleMovableParticleRemoved: function( particle ) {
      // Get rid of the node for this guy.
      if ( this.movableParticleNode !== null ) {

        // Remove the particle node.
        this.movableParticleLayer.removeChild( this.movableParticleNode );
      }
      else {
        console.error( "Error: Problem encountered removing node from canvas." );
      }
      this.updatePositionMarkerOnDiagram();
      this.movableParticleNode = null;
    },

    /**
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
      if ( this.atomicInteractionsModel.getMotionPaused() ) {
        if ( this.fixedParticleNode.getGradientEnabled() ) {
          this.fixedParticleNode.setGradientEnabled( false );
        }
        if ( this.movableParticleNode.getGradientEnabled() ) {
          this.movableParticleNode.setGradientEnabled( false );
        }
      }
    },

    handlePositionChanged: function() {

      if ( !this.atomicInteractionsModel.getMotionPaused() ) {
        if ( !this.fixedParticleNode.getGradientEnabled() ) {
          // The movable particle is moving, so turn the gradient
          // back on.
          this.fixedParticleNode.setGradientEnabled( true );
        }
        if ( !this.movableParticleNode.getGradientEnabled() ) {
          // The movable particle is moving, so turn the gradient
          // back on.
          this.movableParticleNode.setGradientEnabled( true );
        }
      }

      this.updatePositionMarkerOnDiagram();
      this.updateForceVectors();

      if ( ( this.layout.width > 0 ) &&
           ( this.atomicInteractionsModel.getMovableAtomRef().getX() > ( 1 - WIDTH_TRANSLATION_FACTOR ) *
                                                                       this.layout.width ) ) {
        if ( !this.retrieveAtomButtonNode.isVisible() ) {
          // The particle is off the canvas and the button is not
          // yet shown, so show it.
          this.retrieveAtomButtonNode.setVisible( true );
        }
      }
      else if ( this.retrieveAtomButtonNode.isVisible() ) {
        // The particle is on the canvas but the button is visible
        // (which it shouldn't be), so hide it.
        this.retrieveAtomButtonNode.setVisible( false );
      }
    },

    /**
     * Update the position marker on the Lennard-Jones potential diagram.
     * This will indicate the amount of potential being experienced between
     * the two atoms in the model.
     */
    updatePositionMarkerOnDiagram: function() {

      if ( ( this.fixedParticle !== null ) && ( this.movableParticle !== null ) ) {
        var distance = this.fixedParticle.positionProperty.value.distance( this.movableParticle.positionProperty.value );

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

    /**
     * Update the minimum X value allowed for the movable atom.  This prevents
     * too much overlap between the atoms.
     */
    updateMinimumXForMovableAtom: function() {
      if ( this.movableParticle !== null && this.fixedParticle !== null ) {
        this.movableParticleNode.setMinX( this.atomicInteractionsModel.getSigma() * 0.9 );
      }
    },
    updateLayout: function() {
      if ( this.layout.getWidth() <= 0 || this.layout.getHeight() <= 0 ) {
        // The canvas hasn't been sized yet, so don't try to lay it out.
        return;
      }
      if ( ( !this.wiggleMeShown ) && ( ENABLE_WIGGLE_ME ) ) {
        // The wiggle me has not yet been shown, so show it.
        //this.wiggleMe = new DefaultWiggleMe( this, StatesOfMatterStrings.WIGGLE_ME_CAPTION );
        //this.wiggleMe.setArrowTailPosition( MotionHelpBalloon.LEFT_CENTER );
        //this.wiggleMe.setTextColor( Color.YELLOW );
        //this.wiggleMe.setArrowFillPaint( Color.YELLOW );
        //this.wiggleMe.setArrowStrokePaint( Color.YELLOW );
        //this.wiggleMe.setBalloonFillPaint( new Color( 0, 0, 0, 0 ) );   // Fully transparent.
        //this.wiggleMe.setBalloonStrokePaint( new Color( 0, 0, 0, 0 ) ); // Fully transparent.
        var wiggleMeScale = WIGGLE_ME_HEIGHT / this.wiggleMe.height;
        this.wiggleMe.scale( wiggleMeScale );
        this.addChild( this.wiggleMe );


        // Animate from off the screen to the position of the movable atom.
        //var viewportBounds = getBounds();
        var wiggleMeInitialXPos = new Vector2( 0 /*viewportBounds.getMaxX()*/, 0 );
        // getPhetRootNode().screenToWorld( wiggleMeInitialXPos );
        wiggleMeInitialXPos.setXY( wiggleMeInitialXPos.getX(), 0 );
        this.wiggleMe.setTranslation( wiggleMeInitialXPos.getX(), this.model.getMovableAtomRef().getY() );
        //this.wiggleMe.animateToPositionScaleRotation(
        //this.atomicInteractionsModel.getMovableAtomRef().getX() +
        // this.atomicInteractionsModel.getMovableAtomRef().getRadius(),
        //this.atomicInteractionsModel.getMovableAtomRef().getY(), wiggleMeScale, 0, 2000 );

        // Clicking anywhere on the canvas makes the wiggle me go away.
        /*              this.addInputListener( new PBasicInputEventHandler() {
         mousePressed( event ) {
         this.clearWiggleMe();
         removeInputListener( this );
         }
         } );*/

        // Indicate that the wiggle-me has been shown so that we don't end
        // up showing it again.
        this.wiggleMeShown = true;
      }
    },

    updateForceVectors: function() {
      if ( ( this.fixedParticle !== null ) && ( this.movableParticle !== null ) ) {
        this.fixedParticleNode.setForces( this.atomicInteractionsModel.getAttractiveForce(),
          -this.atomicInteractionsModel.getRepulsiveForce() );
        this.movableParticleNode.setForces( -this.atomicInteractionsModel.getAttractiveForce(),
          this.atomicInteractionsModel.getRepulsiveForce() );
      }
    },
    clearWiggleMe: function() {
      if ( this.wiggleMe !== null ) {
        this.wiggleMe.setEnabled( false );
        this.removeChild( this.wiggleMe );
        this.wiggleMe = null;
      }
    }
  } );
} );
