// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * A node that allows user to select the phase of a substance.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SUN/HStrut' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Color = require( 'SCENERY/util/Color' );

  // strings
  var solidString = require( 'string!STATES_OF_MATTER/Solid' );
  var liquidString = require( 'string!STATES_OF_MATTER/Liquid' );
  var gasString = require( 'string!STATES_OF_MATTER/Gas' );

  // constants
  var SOLID_STATE = 1;
  var LIQUID_STATE = 2;
  var GAS_STATE = 3;
  var MAX_WIDTH = 150;

  /**
   * @param {Property<Number>} heatingCoolingAmountProperty
   * @param {Property<Number>} stateProperty
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function SolidLiquidGasPhaseControlNode( heatingCoolingAmountProperty, stateProperty, options ) {

    this.options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#C8C8C8  ',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var textOptions = { font: new PhetFont( 14 ), fill: 'black' };

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var solidText = new Text( solidString, textOptions );
    var liquidText = new Text( liquidString, textOptions );
    var gasText = new Text( gasString, textOptions );

    var sizeOfChar;
    if ( solidText.width > MAX_WIDTH / 2 ) {
      sizeOfChar = solidText.width / solidString.length;
      solidText.setText( solidString.slice( 0, MAX_WIDTH / (2 * sizeOfChar) ) );
    }
    if ( liquidText.width > MAX_WIDTH / 2 ) {
      sizeOfChar = liquidText.width / liquidString.length;
      liquidText.setText( liquidString.slice( 0, MAX_WIDTH / (2 * sizeOfChar) ) );
    }
    if ( gasText.width > MAX_WIDTH / 2 ) {
      sizeOfChar = gasText.width / gasString.length;
      gasText.setText( gasString.slice( 0, MAX_WIDTH / (2 * sizeOfChar) ) );
    }
    var solid = { icon: createSolidIcon(), label: solidText };
    var liquid = { icon: createLiquidIcon(), label: liquidText };
    var gas = { icon: createGasIcon(), label: gasText };

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth1 = MAX_WIDTH / 2 - itemSpec.icon.width;
        var strutWidth2 = MAX_WIDTH / 2 - itemSpec.label.width;
        return new HBox( {
          children: [ new HStrut( 10 ), itemSpec.icon, new HStrut( strutWidth1 ), itemSpec.label,
            new HStrut( strutWidth2 ) ]
        } );
      }
      else {
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };

    // solid state button
    var solidStateButton = new RectangularPushButton( {
      content: createItem( solid ),
      listener: function() {
        stateProperty.value = SOLID_STATE;
      }
    } );

    // liquid state button
    var liquidStateButton = new RectangularPushButton( {
      content: createItem( liquid ),
      listener: function() {
        stateProperty.value = LIQUID_STATE;
      },
      baseColor: new Color( 250, 0, 0 )
    } );

    // gas state button
    var gasStateButton = new RectangularPushButton( {
      content: createItem( gas ),
      listener: function() {
        stateProperty.value = GAS_STATE;
      },
      baseColor: 'rgb( 204, 102, 204 )'
    } );

    stateProperty.link( function( state ) {
      switch( state ) {
        case SOLID_STATE:
          solidStateButton.baseColor = '#998D7C';
          liquidStateButton.baseColor = '#FFECCF';
          gasStateButton.baseColor = '#FFECCF';
          break;
        case LIQUID_STATE:
          solidStateButton.baseColor = '#FFECCF';
          liquidStateButton.baseColor = '#998D7C';
          gasStateButton.baseColor = '#FFECCF';
          break;
        case GAS_STATE:
          solidStateButton.baseColor = '#FFECCF';
          liquidStateButton.baseColor = '#FFECCF';
          gasStateButton.baseColor = '#998D7C';
          break;
      }
    } );

    heatingCoolingAmountProperty.link( function() {
      switch( stateProperty.value ) {
        case SOLID_STATE:
          solidStateButton.baseColor = '#FFECCF';
          break;
        case LIQUID_STATE:
          liquidStateButton.baseColor = '#FFECCF';
          break;
        case GAS_STATE:
          gasStateButton.baseColor = '#FFECCF';
          break;
      }
    } );
    var buttons = new VBox( {
      children: [ solidStateButton, liquidStateButton, gasStateButton ],
      spacing: 10,
      align: 'center'
    } );
    this.addChild( buttons );
    this.mutate( this.options );
  }

  var imageScale = 0.5;
  // solid icon
  var createSolidIcon = function() {

    var frontShape = new Path( new Shape()
        .moveTo( 2, 6 )
        .lineTo( 2, 39 )
        .lineTo( 17, 49 )
        .lineTo( 17, 14 )
        .close(), { stroke: '#15597F', fill: '#15597F' }
    );
    var topShape = new Path( new Shape()
        .moveTo( 2, 6 )
        .lineTo( 33, 0 )
        .lineTo( 49, 9 )
        .lineTo( 17, 14 )
        .close(), { stroke: '#2874B2', fill: '#2874B2' }
    );
    var sidShape = new Path( new Shape()
        .moveTo( 17, 14 )
        .lineTo( 17, 49 )
        .lineTo( 50, 44 )
        .lineTo( 49, 9 )
        .close(), { stroke: '#2990DF', fill: '#2990DF' }
    );
    return new Node( { children: [ frontShape, topShape, sidShape ], scale: imageScale } );
  };

  // liquid icon
  var createLiquidIcon = function() {

    // bucket shape
    var outerShape = new Path( new Shape()
        .moveTo( 2, 7 )
        .quadraticCurveTo( 20, 2, 46, 7 )
        .lineTo( 41, 50 )
        .quadraticCurveTo( 21, 52, 8, 50 )
        .close(), { lineWidth: 1.2, stroke: '#7B7B7B' }
    );
    // liquid shape
    var innerShape = new Path( new Shape()
        .moveTo( 6, 24 )
        .quadraticCurveTo( 21, 20, 45, 24 )
        .lineTo( 41, 50 )
        .quadraticCurveTo( 21, 52, 8, 50 )
        .close(), { lineWidth: 1.2, stroke: '#7B7B7B', fill: '#3DACFF' }
    );

    return new Node( { children: [ outerShape, innerShape ], scale: imageScale } );
  };

  // gas icon
  var createGasIcon = function() {

    var largeCircleRadius = 15;
    var mediumCircleRadius = 10;
    var smallCircleRadius = 5;
    var circle1 = new Circle( largeCircleRadius, {
      stroke: '#3DACFF',
      fill: new RadialGradient( 0, 0, 0, 0, 0, 15 )
        .addColorStop( 0, '#6BBFF5' )
        .addColorStop( 1, '#3DACFF' )
    } );
    var circle2 = new Circle( largeCircleRadius, {
      stroke: '#3DACFF',
      fill: new RadialGradient( 0, 0, 0, 0, 0, 15 )
        .addColorStop( 0, '#6BBFF5' )
        .addColorStop( 1, '#3DACFF' )
    } );
    var circle3 = new Circle( 10, {
      stroke: '#3DACFF',
      fill: new RadialGradient( 0, 0, 0, 0, 0, 10 )
        .addColorStop( 0, '#6BBFF5' )
        .addColorStop( 1, '#3DACFF' )
    } );
    var circle4 = new Circle( mediumCircleRadius, {
      stroke: '#3DACFF',
      fill: new RadialGradient( 0, 0, 0, 0, 0, mediumCircleRadius )
        .addColorStop( 0, '#6BBFF5' )
        .addColorStop( 1, '#3DACFF' )
    } );
    var circle5 = new Circle( 8, {
      stroke: '#3DACFF',
      fill: new RadialGradient( 0, 0, 0, 0, 0, 8 )
        .addColorStop( 0, '#6BBFF5' )
        .addColorStop( 1, '#3DACFF' )
    } );

    circle2.top = circle1.bottom - largeCircleRadius;
    circle2.left = circle1.right - 20;
    circle3.top = circle1.top;
    circle3.left = circle1.right - 5;
    circle4.top = circle3.bottom - 5;
    circle4.left = circle3.right - mediumCircleRadius;
    circle5.top = circle1.bottom - 5;
    circle5.right = circle1.left + 15;

    var circle6 = new Circle( smallCircleRadius, { stroke: '#3DACFF', fill: '#6BBFF5' } );
    var circle7 = new Circle( smallCircleRadius, { stroke: '#3DACFF', fill: '#6BBFF5' } );
    var circle8 = new Circle( smallCircleRadius, { stroke: '#3DACFF', fill: '#6BBFF5' } );
    var circle9 = new Circle( smallCircleRadius, { stroke: '#3DACFF', fill: '#6BBFF5' } );
    var circle10 = new Circle( smallCircleRadius, { stroke: '#3DACFF', fill: '#6BBFF5' } );
    circle6.left = circle1.right + 40;
    circle7.right = circle6.left;
    circle8.left = circle6.right;
    circle9.top = circle6.bottom - 2;
    circle10.bottom = circle6.top + 2;
    circle9.left = circle7.right - smallCircleRadius;
    circle10.right = circle8.left - smallCircleRadius;
    return new Node( {
      children: [ circle1, circle2, circle3, circle4, circle5, circle6, circle7,
        circle8, circle9, circle10 ], scale: imageScale
    } );
  };

  return inherit( Node, SolidLiquidGasPhaseControlNode );
} );
