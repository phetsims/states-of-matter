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
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Image = require( 'SCENERY/nodes/Image' );

  //images
  var iceImage = require( 'image!STATES_OF_MATTER/ice-cube.png' );
  var liquidInCupImage = require( 'image!STATES_OF_MATTER/liquid-in-cup.png' );
  var gasImage = require( 'image!STATES_OF_MATTER/gas.png' );

  //strings
  var solidString = require( 'string!STATES_OF_MATTER/solid' );
  var liquidString = require( 'string!STATES_OF_MATTER/liquid' );
  var gasString = require( 'string!STATES_OF_MATTER/gas' );

  /**
   *
   * @param {MultiParticleModel}  model of the simulation
   * @param {Object} options for various panel display properties
   * @constructor
   */
  function SolidLiquidGasPhaseControlNode( model, options ) {

    this.options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#C8C8C8  ',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var textOptions = {font: new PhetFont( 14 ), fill: 'black', fontWeight: 'bold'};

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var solid = { icon: createSolidIcon(), label: new Text( solidString, textOptions ) };
    var liquid = { icon: createLiquidIcon(), label: new Text( liquidString, textOptions )};
    var gas = {  icon: createGasIcon(), label: new Text( gasString, textOptions )};

    // compute the maximum item width
    var widestItemSpec = _.max( [ solid, liquid, gas ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 17;
        return new HBox( { children: [  new HStrut( 10 ), itemSpec.icon , new HStrut( strutWidth + 10 ), itemSpec.label,
                                        new HStrut( 30 )] } );
      }
      else {
        return new HBox( { children: [ itemSpec.label] } );
      }
    };


    var radioButtonContent = [
      { value: 1, node: createItem( solid ) },
      { value: 2, node: createItem( liquid )},
      { value: 3, node: createItem( gas ) }
    ];
    model.stateProperty.link( function( phase ) {
      model.setPhase( phase );
    } );
    var radioButtonGroup = new RadioButtonGroup( model.stateProperty, radioButtonContent, {
      orientation: 'vertical',
      spacing: 3,
      cornerRadius: 5,
      baseColor: '#FFECCF',
      disabledBaseColor: '#FFECCF',
      selectedLineWidth: 3,
      selectedStroke: '#FFECCF',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 2
    } );


    var radioButtonPanel = new Panel( radioButtonGroup, {
      stroke: '#FFFCD3',
      lineWidth: 0,
      fill: 'black'
    } );

    this.addChild( radioButtonPanel );
    this.mutate( this.options );
  }

  var imageScale = 0.8;
  //Create an icon for the solid button
  var createSolidIcon = function() {
    return new Image( iceImage, {scale: imageScale} );
  };

  //Create an icon for the liquid button
  var createLiquidIcon = function() {
    return new Image( liquidInCupImage, {scale: imageScale} );
  };

  //Create an icon for the gas button
  var createGasIcon = function() {
    return new Image( gasImage, {scale: imageScale} );
  };
  return inherit( Node, SolidLiquidGasPhaseControlNode );
} );
