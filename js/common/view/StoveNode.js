// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * This class is the graphical representation of a stove that can be used to
 * heat or cool things.
 *
 * @author Siddhartha Chinthapally (Actual Concepts) on 20-11-2014.
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var HSlider = require( 'SUN/HSlider' );
  var Property = require( 'AXON/Property' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Color = require( 'SCENERY/util/Color' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  //images
  var fireImage = require( 'image!STATES_OF_MATTER/flame.png' );
  var iceImage = require( 'image!STATES_OF_MATTER/ice-cube-stack.png' );

  // strings
  var heatString = require( 'string!STATES_OF_MATTER/heat' );
  var coolString = require( 'string!STATES_OF_MATTER/cool' );

  // Width of the burner output - much of the rest of the size of the stove
  // derives from this value.
  var WIDTH = 120; // In screen coords, which are close to pixels.
  var HEIGHT = WIDTH * 0.75; // In screen coords, which are close to pixels.
  var BURNER_OPENING_HEIGHT = WIDTH * 0.1; // In screen coords, which are close to pixels.
  var BOTTOM_WIDTH = WIDTH * 0.8;

  // Basic color used for the stove.
  var BASE_COLOR = new Color( 159, 182, 205 );

  /**
   *
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function StoveNode( multipleParticleModel, options ) {

    Node.call( this );

    // Create the body of the stove.
    var stoveBodyShape = new Shape().
      ellipticalArc( WIDTH / 2, BURNER_OPENING_HEIGHT / 4, WIDTH / 2, BURNER_OPENING_HEIGHT / 2, 0, 0, Math.PI, false ).
      lineTo( ( WIDTH - BOTTOM_WIDTH ) / 2, HEIGHT + BURNER_OPENING_HEIGHT / 2 ).
      ellipticalArc( WIDTH / 2, HEIGHT + BURNER_OPENING_HEIGHT / 4, BOTTOM_WIDTH / 2, BURNER_OPENING_HEIGHT,
      0, Math.PI, 0, true ).
      lineTo( WIDTH, BURNER_OPENING_HEIGHT / 2 );
    var stoveBody = new Path( stoveBodyShape, {
      stroke: 'black',
      fill: new LinearGradient( 0, 0, WIDTH, 0 )
        .addColorStop( 0, BASE_COLOR.brighterColor( 0.5 ) )
        .addColorStop( 1, BASE_COLOR.darkerColor( 0.5 ) )
    } );

    // Create the inside bowl of the burner, which is an ellipse.
    var burnerInteriorShape = new Shape()
      .ellipse( WIDTH / 2, BURNER_OPENING_HEIGHT / 4, WIDTH / 2, BURNER_OPENING_HEIGHT / 2, 0, 0, Math.PI, false );
    var burnerInterior = new Path( burnerInteriorShape, {
      stroke: 'black',
      fill: new LinearGradient( 0, 0, WIDTH, 0 )
        .addColorStop( 0, BASE_COLOR.darkerColor( 0.5 ) )
        .addColorStop( 1, BASE_COLOR.brighterColor( 0.5 ) )
    } );

    // Create the slider.
    var heatProperty = new Property( 0 );
    var labelFont = new PhetFont( 14 );
    var heatTitle = new Text( heatString, { font: labelFont, rotation: Math.PI / 2 } );
    var coolTitle = new Text( coolString, { font: labelFont, rotation: Math.PI / 2 } );
    var sliderTextMaxWidth = stoveBody.width / 9;
    if ( heatTitle.width > sliderTextMaxWidth ) {
      heatTitle.scale( sliderTextMaxWidth / heatTitle.width );
    }
    if ( coolTitle.width > sliderTextMaxWidth ) {
      coolTitle.scale( sliderTextMaxWidth / coolTitle.width );
    }

    var heatCoolSlider = new HSlider( heatProperty, { min: -1, max: 1 },
      {
        endDrag: function() {
          heatProperty.value = 0;
        },
        trackSize: new Dimension2( WIDTH / 2, 10 ),
        trackFill: new LinearGradient( 0, 0, WIDTH / 2, 0 )
          .addColorStop( 0, '#0A00F0' )
          .addColorStop( 1, '#EF000F' ),
        thumbSize: new Dimension2( 15, 30 ),
        majorTickLength: 15,
        minorTickLength: 12,
        rotation: -Math.PI / 2,
        centerY: stoveBody.centerY,
        right:    stoveBody.right - WIDTH / 8
      } );
    heatCoolSlider.addMajorTick( 1, heatTitle );
    heatCoolSlider.addMinorTick( 0 );
    heatCoolSlider.addMajorTick( -1, coolTitle );

    var fireNode = new Image( fireImage, { centerX: stoveBody.centerX, centerY: stoveBody.centerY } );
    var iceNode = new Image( iceImage, { centerX: stoveBody.centerX, centerY: stoveBody.centerY } );
    heatProperty.link( function( heat ) {
      multipleParticleModel.setHeatingCoolingAmount( heat );
      if ( heat > 0 ) {
        fireNode.setTranslation( (stoveBody.width - fireNode.width) / 2, -heat * fireImage.height * 0.85 );
      }
      else if ( heat < 0 ) {
        iceNode.setTranslation( (stoveBody.width - iceNode.width) / 2, heat * iceImage.height * 0.85 );
      }
      iceNode.setVisible( heat < 0 );
      fireNode.setVisible( heat > 0 );
    } );

    this.addChild( burnerInterior );
    this.addChild( fireNode );
    this.addChild( iceNode );
    this.addChild( stoveBody );
    this.addChild( heatCoolSlider );

    this.mutate( options );
  }

  return inherit( Node, StoveNode );
} );

