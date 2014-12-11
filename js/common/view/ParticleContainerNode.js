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


  //var PRESSURE_GAUGE_Y_OFFSET = -3000;
  // var PRESSURE_METER_X_OFFSET_PROPORTION = 0.80;
// Maximum value expected for pressure, in atmospheres.
  //var MAX_PRESSURE = 200;
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
      lineWidth: '2',
      fill: '#7E7E7E'
    } );
    var openInnerEllipse = new Path( new Shape()
      .ellipticalArc( 125, 2, 20, 100, Math.PI / 2, 0, 2 * Math.PI, false ).close(), {
      lineWidth: '2',
      stroke: '#7E7E7E',
      fill: 'white'
    } );
    openInnerEllipse.centerX = openEllipse.centerX;
    openInnerEllipse.centerY = openEllipse.centerY;
    var open = new Path( new Shape()
      .ellipticalArc( 125, 2, 25, 125, Math.PI / 2, 0, 2 * Math.PI, false ).close(), {
      lineWidth: '2',
      stroke: '#7E7E7E'
    } );
    open.centerX = openEllipse.centerX;
    open.centerY = openEllipse.centerY;
    openInnerEllipse.centerX = openEllipse.centerX;
    openInnerEllipse.centerY = openEllipse.centerY;
    var closeEllipse = new Path( new Shape()
      .ellipticalArc( 125, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT, 125,
      15, 0, 0, Math.PI, false ).close(), {
      lineWidth: 0,
      stroke: '#7E7E7E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#7E7E7E' )
        .addColorStop( 0.3, '#6D6D6D' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#696969' )
    } );

    var outerMostNode = new Path( new Shape()
      .moveTo( 0, 5 )
      .lineTo( 0, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, 5 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 25, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH, 10 )
      .quadraticCurveTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / 2, 50, 0, 10 )
      .lineTo( 25, 25 )
      .close(), {
      lineWidth: 0,
      stroke: '#7E7E7E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#7E7E7E' )
        .addColorStop( 0.3, '#6D6D6D' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#696969' )
    } );

    this.addChild( open );
    this.containerLid.addChild( openEllipse );
    postParticleLayer.addChild( outerMostNode );
    preParticleLayer.addChild( this.containerLid );
    postParticleLayer.addChild( closeEllipse );

    var middleNode = new Path( new Shape()
      .moveTo( 25, 25 )
      .lineTo( 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 25, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 50, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT )
      .lineTo( 50, 25 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, 25 )
      .lineTo( 50, 25 )
      .lineTo( 50, 40 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, 40 )
      .lineTo( StatesOfMatterConstants.VIEW_CONTAINER_WIDTH - 50, 25 )
      .lineTo( 50, 25 )
      .lineTo( 25, 25 )
      .close(), {
      lineWidth: 0,
      stroke: '#4E4E4E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#4E4E4E' )
        .addColorStop( 0.3, '#494949' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#9E9E9E' )
    } );

    postParticleLayer.addChild( middleNode );
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
