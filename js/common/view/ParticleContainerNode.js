// Copyright 2002-2014, University of Colorado Boulder

/**
 * This class is the "view" for the particle container.  This is where the
 * information about the nature of the image that is used to depict the
 * container is encapsulated.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var DialGaugeNode = require( 'STATES_OF_MATTER/common/view/DialGaugeNode' );
  var PointingHandNode = require( 'STATES_OF_MATTER/common/view/PointingHandNode' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );


  var LID_POSITION_TWEAK_FACTOR = 65; // Empirically determined value for aligning lid and container body.

  /**
   *
   * @param {MultipleParticleModel} model
   * @param {ModelViewTransform} modelViewTransform The model view transform for transforming particle position.
   * @param {Object} options
   * @param {boolean} volumeControlEnabled - set true to enable volume control by pushing the lid using a finger from above
   * @param {boolean} pressureGaugeEnabled - set true to show a barometer
   * @constructor
   */
  function ParticleContainerNode( model, modelViewTransform, options, volumeControlEnabled, pressureGaugeEnabled ) {

    this.model = model;
    this.modelViewTransform = modelViewTransform;
    this.containmentAreaWidth = StatesOfMatterConstants.CONTAINER_BOUNDS.width;
    this.containmentAreaHeight = StatesOfMatterConstants.CONTAINER_BOUNDS.height;

    Node.call( this );

    var preParticleLayer = new Node();
    var particleLayer = new Node();
    var postParticleLayer = new Node( { opacity: 0.8} );

    this.containerLid = new Node( { opacity: 0.8 } );
    this.addChild( preParticleLayer );
    this.addChild( particleLayer );

    var openEllipse = new Path( new Shape()
      .ellipticalArc( 125, 2, 25, 125, Math.PI / 2, 0, 2 * Math.PI, false ).close(), {
      lineWidth: 1,
      fill: '#7E7E7E'
    } );
    var openInnerEllipse = new Path( new Shape()
      .ellipticalArc( 125, 2, 20, 100, Math.PI / 2, 0, 2 * Math.PI, false ).close(), {
      lineWidth: 1,
      stroke: '#7E7E7E',
      fill: 'white'
    } );
    openInnerEllipse.centerX = openEllipse.centerX;
    openInnerEllipse.centerY = openEllipse.centerY;
    var open = new Path( new Shape()
      .ellipticalArc( 125, 2, 25, 125, Math.PI / 2, 0, 2 * Math.PI, false ).close(), {
      lineWidth: 1,
      stroke: '#7E7E7E'
    } );
    open.centerX = openEllipse.centerX;
    open.centerY = openEllipse.centerY;
    openInnerEllipse.centerX = openEllipse.centerX;
    openInnerEllipse.centerY = openEllipse.centerY;

    // add container outer shape
    var outerShape = new Path( new Shape()
      .moveTo( 0, 5 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2, 51,
      StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, 5 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 30, 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 25, StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 30 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2, 60, 25, 30 )
      .lineTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .lineTo( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, 0 )
        .addColorStop( 0, '#6E6E6E' )
        .addColorStop( 0.2, '#7A7979' )
        .addColorStop( 0.3, '# 949696' )
        .addColorStop( 0.4, '#BABABA' )
        .addColorStop( 0.7, '#6A6B6B' )
        .addColorStop( 0.9, '#606262' )
    } );
    postParticleLayer.addChild( outerShape );

    // add container inner left
    var leftShape = new Path( new Shape()
      .moveTo( 25, 30 )
      .lineTo( 35, 45 )
      .lineTo( 35, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 15 )
      .lineTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .lineTo( 25, 30 )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 - 30 )
        .addColorStop( 0, '#525252' )
        .addColorStop( 0.2, '#515151' )
        .addColorStop( 0.4, '# 4F4F4F' )
        .addColorStop( 0.5, '#4E4E4E' )
        .addColorStop( 0.7, '#3A3A3A' )
        .addColorStop( 0.8, '# 2E2E2E' )
        .addColorStop( 0.9, '#292929' )
    } );
    postParticleLayer.addChild( leftShape );

    // add container inner right
    var rightShape = new Path( new Shape()
      .moveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 30 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 35, 45 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 35, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 15 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 30 )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 - 30 )
        .addColorStop( 0, '#939393' )
        .addColorStop( 0.2, '#BABABA' )
        .addColorStop( 0.3, '# 585858' )
        .addColorStop( 0.4, '#525252' )
        .addColorStop( 0.5, '#9F9F9F' )
        .addColorStop( 0.5, '#BCBCBC' )
        .addColorStop( 0.9, '#636363' )
    } );
    postParticleLayer.addChild( rightShape );

    // add container inner top
    var topShape = new Path( new Shape()
      .moveTo( 25, 30 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2, 45,
        StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 30 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 35, 45 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2, 65, 35, 45 )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25 - 30, 0 )
        .addColorStop( 0, '#2E2E2E' )
        .addColorStop( 0.2, '#323232' )
        .addColorStop( 0.3, '# 363636' )
        .addColorStop( 0.4, '#3E3E3E' )
        .addColorStop( 0.5, '#4B4B4B' )
        .addColorStop( 0.5, '# 515151' )
        .addColorStop( 0.9, '#525252' )
    } );
    postParticleLayer.addChild( topShape );

    // add container inner bottom
    var bottomShape = new Path( new Shape()
      .moveTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 25, StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 10 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 35, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 15 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2,
        StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT + 10, 35, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT - 15 )
      .close(), {
      lineWidth: 0,
      stroke: 'white',
      fill: new LinearGradient( 0, 0, StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25 - 30, 0 )
        .addColorStop( 0, '#5D5D5D' )
        .addColorStop( 0.2, '#717171' )
        .addColorStop( 0.3, '#7C7C7C' )
        .addColorStop( 0.4, '#8D8D8D' )
        .addColorStop( 0.5, '#9E9E9E' )
        .addColorStop( 0.5, '#A2A2A2' )
        .addColorStop( 0.9, '#A3A3A3' )

    } );
    postParticleLayer.addChild( bottomShape );


    this.addChild( open );
    this.containerLid.addChild( openEllipse );
    preParticleLayer.addChild( this.containerLid );


    this.middleContainerLayer = new Node();
    this.addChild( this.middleContainerLayer );

    if ( volumeControlEnabled ) {
      // Add the finger for pressing down on the top of the container.
      this.fingerNode = new PointingHandNode( model, modelViewTransform );
      // responsible for positioning itself later based on user interaction.
      this.addChild( this.fingerNode );
      this.fingerNode.bottom = this.containerLid.top;
      this.fingerNode.setTranslation( this.fingerNode.x + openEllipse.width / 3,
          Math.abs( this.modelViewTransform.modelToViewDeltaY(
              StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
              this.model.getParticleContainerRect().getHeight() ) ) +
          this.containerLid.y - this.fingerNode.height );

      // Add the handle to the lid.
      this.containerLid.addChild( openInnerEllipse );
      //  var handleNode = new HandleNode(50, 100, Color.YELLOW);
      //  handleNode.rotate(Math.PI / 2);
      //  handleNode.setOffset((m_containerLid.getWidth() / 2) + (handleNode.getFullBoundsReference().width / 2), 0);
      //m_containerLid.addChild(handleNode);
    }
    if ( pressureGaugeEnabled ) {

      // Add the pressure meter.
      this.pressureMeter = new DialGaugeNode( model, 20 );
      this.pressureMeter.setElbowEnabled( true );
      this.middleContainerLayer.addChild( this.pressureMeter );
      this.updatePressureGauge();
      this.pressureMeterElbowOffset = 20;//this.pressureMeter.getCenterY();
      this.pressureMeter.setTranslation( this.containerLid.x - 60, this.containerLid.y - 20 );

    }
    var particleContainerNode = this;
    model.particleContainerHeightProperty.link( function() {
      if ( pressureGaugeEnabled ) {
        particleContainerNode.updatePressureGauge();
        particleContainerNode.handleContainerSizeChanged();
      }
    } );
    this.addChild( postParticleLayer );
    this.mutate( options );
  }

  return inherit( Node, ParticleContainerNode, {
    reset: function() {
      var containerRect = this.model.getParticleContainerRect();
      this.fingerNode.setTranslation( this.fingerNode.x,
          Math.abs( this.modelViewTransform.modelToViewDeltaY(
              StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT - containerRect.getHeight() ) ) +
          this.containerLid.y - this.fingerNode.height );
      this.updatePressureGauge();
      this.containerLid.setTranslation( 0, 0 );
      this.containerLid.setRotation( 0 );
      this.pressureMeter.setTranslation( this.containerLid.x - 60, this.containerLid.y - 20 );
    },

    /**
     * Update the position and other aspects of the gauge so that it stays
     * connected to the lid or moves as it should when the container
     * explodes.
     * @private
     */
    updatePressureGauge: function() {
      if ( this.pressureMeter !== null ) {
        var containerRect = this.model.getParticleContainerRect();
        if ( !this.model.getContainerExploded() ) {
          if ( this.pressureMeter.getRotation() !== 0 ) {
            this.pressureMeter.setRotation( 0 );
          }
          //  this.pressureMeter.setTranslation(      this.pressureMeter.x, this.containerLid.y );
          this.pressureMeter.setElbowHeight( this.pressureMeterElbowOffset +
                                             Math.abs( this.modelViewTransform.modelToViewDeltaY( StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                                                                                  containerRect.height ) ) );
        }
        else {
          // The container is exploding, so spin and move the gauge.
          this.pressureMeter.rotate( -Math.PI / 20 );
          // this.pressureMeter.setTranslation( this.pressureMeter.x, this.modelViewTransform.modelToViewDeltaY( PRESSURE_GAUGE_Y_OFFSET - this.model.getParticleContainerHeight() ) - this.pressureMeter.y );
          this.pressureMeter.setTranslation( this.pressureMeter.x, this.y +
                                                                   this.modelViewTransform.modelToViewDeltaY( containerRect.getHeight() ) );
        }
      }
    },

    /**
     * Handle a notification that the container size has changed.
     * @private
     */
    //Todo: this is not working well yet
    handleContainerSizeChanged: function() {
      // changed.
      var containerHeight = this.model.getParticleContainerHeight();
      if ( !this.model.getContainerExploded() ) {
        if ( this.containerLid.getRotation() !== 0 ) {
          this.containerLid.setRotation( 0 );
        }
        // this.containerLid.setTranslation( (this.containmentAreaWidth - this.containerLid.width) / 2, this.containmentAreaHeight - containerHeight - (this.containerLid.height / 2) + LID_POSITION_TWEAK_FACTOR );
      }
      else {
        // blown off the top of the container.
        // this.containerLid.rotateAboutPoint( this.rotationAmount, (this.containmentAreaWidth / 2) / this.containerLid.getScale(), 0 );
        var centerPosY = this.containmentAreaHeight - containerHeight - (this.containerLid.height / 2) +
                         LID_POSITION_TWEAK_FACTOR;
        var currentPosY = this.containerLid.y;
        var newPosX = this.containerLid.x;

        this.containerLid.setCenterX( this.modelViewTransform.modelToViewDeltaX( this.containmentAreaWidth / 2 ) );

        var newPosY;
        if ( currentPosY > centerPosY ) {
          newPosY = centerPosY;
        }
        else {
          newPosY = currentPosY;
        }
        //  this.containerLid.setTranslation( newPosX, newPosY );
      }
      this.updatePressureGauge();
    }

  } );
} );