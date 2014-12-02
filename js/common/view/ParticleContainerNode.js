// Copyright 2002-2013, University of Colorado Boulder

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
  var GaugeNode = require( 'SCENERY_PHET/GaugeNode' );
  var ParticleCanvasNode = require( 'STATES_OF_MATTER/common/view/ParticleCanvasNode' );

  // constants
  var PRESSURE_GAUGE_Y_OFFSET = -3000;
  var PRESSURE_METER_X_OFFSET_PROPORTION = 0.80;
  // Maximum value expected for pressure, in atmospheres.
  var MAX_PRESSURE = 200;

  /**
   * Main constructor.
   *
   * @param {MultipleParticleModel} model
   * @param {ModelViewTransform} modelViewTransform The model view transform for transforming particle position.
   * @param {Object} [options]
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
    var postParticleLayer = new Node( {opacity: 0.8} );

    //which contain handle node(container open/close node) and used to set pressure of container with finger
    this.containerLid = new Node();
    this.addChild( preParticleLayer );
    this.addChild( particleLayer );
    this.addChild( postParticleLayer );

    var openEllipse = new Path( new Shape()
      .ellipticalArc( 125, 2, 25, 125, Math.PI / 2, 0, 2 * Math.PI, false ).close(), {
      lineWidth: '2',
      stroke: '#7E7E7E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#7E7E7E' )
        .addColorStop( 0.3, '#6D6D6D' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#696969' )
    } );
    var closeEllipse = new Path( new Shape()
      .ellipticalArc( 125, StatesOfMatterConstants.VIEW_CONTAINER_HEIGHT, 125,
      25, 0, 0, Math.PI, false ).close(), {
      lineWidth: '2',
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
      .lineTo( 25, 25 )
      .close(), {
      lineWidth: '2',
      stroke: '#7E7E7E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#7E7E7E' )
        .addColorStop( 0.3, '#6D6D6D' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#696969' )
    } );
    this.containerLid.addChild( openEllipse );
    postParticleLayer.addChild( outerMostNode );
    postParticleLayer.addChild( this.containerLid );
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
      .lineTo( 25, 25 )
      .close(), {
      lineWidth: '2',
      stroke: '#4E4E4E',
      fill: new LinearGradient( 0, 0, 100, 0 )
        .addColorStop( 0, '#4E4E4E' )
        .addColorStop( 0.3, '#494949' )
        .addColorStop( 0.5, '# 757575' )
        .addColorStop( 0.6, '#9E9E9E' )
    } );

    postParticleLayer.addChild( middleNode );
    this.middleContainerLayer = new Node();
    // this.middleContainerLayer.bottom=this.top;
    this.addChild( this.middleContainerLayer );
    //this.pressureMeter;
    if ( volumeControlEnabled ) {

      // Add the finger for pressing down on the top of the container.
      // responsible for positioning itself later based on user interaction.

      var fingerNode = new PointingHandNode( model );
      this.addChild( fingerNode );
      fingerNode.bottom = this.containerLid.top;

      // todo: Add the lid and handle
      // Add the handle to the lid.
      //  var handleNode = new HandleNode(50, 100, Color.YELLOW);
      //  handleNode.rotate(Math.PI / 2);
      //  handleNode.setOffset((m_containerLid.getWidth() / 2) + (handleNode.getFullBoundsReference().width / 2), 0);
      //m_containerLid.addChild(handleNode);
    }
    if ( pressureGaugeEnabled ) {
      // Add the pressure meter.
      // this.pressureMeter = new DialGaugeNode(PRESSURE_GAUGE_WIDTH_PROPORTION * m_containmentAreaWidth, StatesOfMatterStrings.PRESSURE_GAUGE_TITLE, 0, MAX_PRESSURE, StatesOfMatterStrings.PRESSURE_GAUGE_UNITS);

      this.pressureMeter = new DialGaugeNode( model, 20 );
      this.pressureMeter.setElbowEnabled( true );
      this.middleContainerLayer.addChild( this.pressureMeter );
      this.updatePressureGauge();
      this.pressureMeterElbowOffset = this.pressureMeter.getCenterY();
    }
    var particleContainerNode = this;
    model.targetContainerHeightProperty.link( function( containerHeight ) {
      particleContainerNode.updatePressureGauge();
    } );
    this.mutate( options );
  }

  return inherit( Node, ParticleContainerNode, {

    /**
     * Update the position and other aspects of the gauge so that it stays
     * connected to the lid or moves as it should when the container
     * explodes.
     * @private
     */
    updatePressureGauge: function() {
      if ( this.pressureMeter != null ) {
        var containerRect = this.model.getParticleContainerRect();
        if ( !this.model.getContainerExploded() ) {
          if ( this.pressureMeter.getRotation() != 0 ) {
            this.pressureMeter.setRotation( 0 );
          }
          //this.pressureMeter.setTranslation( -this.pressureMeter.width * PRESSURE_METER_X_OFFSET_PROPORTION, PRESSURE_GAUGE_Y_OFFSET );

          this.pressureMeter.setElbowHeight( StatesOfMatterConstants.PARTICLE_CONTAINER_INITIAL_HEIGHT -
                                             containerRect.height - this.pressureMeterElbowOffset );
        }
        else {
          // The container is exploding, so spin and move the gauge.
          this.pressureMeter.setRotation( -Math.PI / 20 );
          this.pressureMeter.setTranslation( -this.pressureMeter.width * PRESSURE_METER_X_OFFSET_PROPORTION,
              PRESSURE_GAUGE_Y_OFFSET - this.model.getParticleContainerHeight() );
        }
      }
    },

    /**
     * Handle a notification that the container size has changed.
     * @private
     */
    handleContainerSizeChanged: function() {
      // changed.
      var containerHeight = this.model.getParticleContainerHeight();
      if ( !this.model.getContainerExploded() ) {
        if ( this.containerLid.getRotation() != 0 ) {
          this.containerLid.setRotation( 0 );
        }
        this.containerLid.setTranslation( (this.containmentAreaWidth - this.containerLid.width) / 2,
            this.containmentAreaHeight - containerHeight - (m_containerLid.getFullBoundsReference().height / 2) +
            LID_POSITION_TWEAK_FACTOR );
      }
      else {
        // blown off the top of the container.
        this.containerLid.rotateAboutPoint( this.rotationAmount,
            (this.containmentAreaWidth / 2) / this.containerLid.getScale(), 0 );
        var centerPosY = this.containmentAreaHeight - containerHeight - (this.containerLid.height / 2) +
                         LID_POSITION_TWEAK_FACTOR;
        var currentPosY = this.containerLid.y;
        var newPosX = this.containerLid.x;
        var newPosY;
        if ( currentPosY > centerPosY ) {
          newPosY = centerPosY;
        }
        else {
          newPosY = currentPosY;
        }
        this.containerLid.setTranslation( newPosX, newPosY );
      }
      this.updatePressureGauge();
    }

  } );
} );
