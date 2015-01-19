// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
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
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );

  //strings
  var solidString = require( 'string!STATES_OF_MATTER/solid' );
  var liquidString = require( 'string!STATES_OF_MATTER/liquid' );
  var gasString = require( 'string!STATES_OF_MATTER/gas' );

  var SOLID_STATE = 1;
  var LIQUID_STATE = 2;
  var GAS_STATE = 3;

  /**
   *
   * @param {Property<String>} stateProperty that tracks the state(solid/liquid/gas ) selected in the panel
   * @param {Object} options for various panel display properties
   * @constructor
   */
  function SolidLiquidGasPhaseControlNode( stateProperty, options ) {

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
    var solid = { icon: createSolidIcon(), label: new Text( solidString, textOptions ) };
    var liquid = { icon: createLiquidIcon(), label: new Text( liquidString, textOptions ) };
    var gas = { icon: createGasIcon(), label: new Text( gasString, textOptions ) };

    // compute the maximum item width
    var widestItemSpec = _.max( [ solid, liquid, gas ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 17;
        return new HBox( {
          children: [ new HStrut( 10 ), itemSpec.icon, new HStrut( strutWidth + 30 ), itemSpec.label,
            new HStrut( 30 ) ]
        } );
      }
      else {
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };

    var radioButtonContent = [
      { value: SOLID_STATE, node: createItem( solid ) },
      { value: LIQUID_STATE, node: createItem( liquid ) },
      { value: GAS_STATE, node: createItem( gas ) }
    ];

    var radioButtonGroup = new RadioButtonGroup( stateProperty, radioButtonContent, {
      orientation: 'vertical',
      spacing: 3,
      cornerRadius: 5,
      baseColor: '#FFECCF',
      disabledBaseColor: '#FFECCF',
      selectedLineWidth: 1,
      selectedStroke: '#FFECCF',
      selectedButtonOpacity: 0.6,
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1,
      deselectedButtonOpacity: 1
    } );


    this.addChild( radioButtonGroup );
    this.mutate( this.options );
  }

  var imageScale = 0.5;
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
