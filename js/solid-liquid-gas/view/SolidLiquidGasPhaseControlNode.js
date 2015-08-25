// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * A node that allows user to select the phase of a substance.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var solidString = require( 'string!STATES_OF_MATTER/Solid' );
  var liquidString = require( 'string!STATES_OF_MATTER/Liquid' );
  var gasString = require( 'string!STATES_OF_MATTER/Gas' );

  // images
  var gasIconImage = require( 'image!STATES_OF_MATTER/gas-icon.png' );
  var liquidIconImage = require( 'image!STATES_OF_MATTER/liquid-icon.png' );
  var solidIconImage = require( 'image!STATES_OF_MATTER/solid-icon.png' );

  // constants
  var SOLID_STATE = 1;
  var LIQUID_STATE = 2;
  var GAS_STATE = 3;
  var STATES_BUTTON_MAX_WIDTH = 150;
  var ICON_HEIGHT = 25; // in screen coordinates, empirically determined

  /**
   * @param {Property<number>} heatingCoolingAmountProperty
   * @param {Property<number>} stateProperty
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

    if ( solidText.width > STATES_BUTTON_MAX_WIDTH / 2 ) {
      solidText.scale( (STATES_BUTTON_MAX_WIDTH / 2) / solidText.width );
    }
    if ( liquidText.width > STATES_BUTTON_MAX_WIDTH / 2 ) {
      liquidText.scale( (STATES_BUTTON_MAX_WIDTH / 2) / Math.round( liquidText.width ) );
    }
    if ( gasText.width > STATES_BUTTON_MAX_WIDTH / 2 ) {
      gasText.scale( (STATES_BUTTON_MAX_WIDTH / 2) / gasText.width );
    }
    var solid = { icon: createButtonIcon( solidIconImage), label: solidText };
    var liquid = { icon: createButtonIcon( liquidIconImage), label: liquidText };
    var gas = { icon: createButtonIcon( gasIconImage ), label: gasText };

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth1 = STATES_BUTTON_MAX_WIDTH / 2 - itemSpec.icon.width;
        var strutWidth2 = STATES_BUTTON_MAX_WIDTH / 2 - itemSpec.label.width;
        return new HBox( {
          children: [ new HStrut( 10 ), itemSpec.icon, new HStrut( strutWidth1 ), itemSpec.label,
            new HStrut( strutWidth2 ) ],
          align: 'center'
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
        stateProperty._notifyObservers();
      }
    } );

    // liquid state button
    var liquidStateButton = new RectangularPushButton( {
      content: createItem( liquid ),
      listener: function() {
        stateProperty.value = LIQUID_STATE;
        stateProperty._notifyObservers();
      },
      baseColor: new Color( 250, 0, 0 )
    } );

    // gas state button
    var gasStateButton = new RectangularPushButton( {
      content: createItem( gas ),
      listener: function() {
        stateProperty.value = GAS_STATE;
        stateProperty._notifyObservers();
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

  // @private - create icon scaled to the appropriate size for the phase selection buttons
  var createButtonIcon = function( rawImage) {
    var image = new Image( rawImage );
    image.scale( ICON_HEIGHT / image.height );
    return image;
  };

  return inherit( Node, SolidLiquidGasPhaseControlNode );
} );
