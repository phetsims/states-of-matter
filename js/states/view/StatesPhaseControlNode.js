// Copyright 2002 - 2015, University of Colorado Boulder

/**
 * A node that allows user to select the phase of a substance.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var BooleanRectangularStickyToggleButton = require( 'SUN/buttons/BooleanRectangularStickyToggleButton' );
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
  var UNDEFINED_STATE = 0;
  var SOLID_STATE = 1;
  var LIQUID_STATE = 2;
  var GAS_STATE = 3;
  var STATES_BUTTON_WIDTH = 160;
  var ICON_HEIGHT = 25; // in screen coordinates, empirically determined
  var SELECTED_BUTTON_COLOR = '#866891';
  var DESELECTED_BUTTON_COLOR = '#d7bd9f';

  // function that puts icon and label together with some struts into an HBox for using as content node on button
  function createButtonContent( iconImage, string ) {

    assert && assert( iconImage && string, 'both icon and label must be defined' );

    // Create the image node and scale it so that it is the desired height.  Note that the width may vary.
    var imageNode = new Image( iconImage );
    imageNode.scale( ICON_HEIGHT / imageNode.height );

    // Create the text node and, if it consumes more than 1/2 the button width, scale it.
    var label = new Text( string, { font: new PhetFont( 14 ), fill: 'black' } );
    if ( label.width > STATES_BUTTON_WIDTH / 2 ) {
      label.scale( (STATES_BUTTON_WIDTH / 2) / label.width );
    }

    // create the left strut such that the icons will be centered around the same horizontal location
    var desiredIconHorizontalCenter = STATES_BUTTON_WIDTH * 0.25; // multiplier is empirically determined
    var leftStrutWidth = Math.max( desiredIconHorizontalCenter - ( imageNode.width / 2 ), 0 );
    assert && assert( leftStrutWidth > 0, 'icon is too wide, either adjust it or adjust the icon position multiplier' );

    // create the center strut such that the labels are centered around the same horizontal location
    var desiredLabelHorizontalCenter = STATES_BUTTON_WIDTH * 0.65;
    var centerStrutWidth = Math.max( desiredLabelHorizontalCenter - ( label.width / 2 ) - leftStrutWidth - imageNode.width, 0 );
    assert && assert( centerStrutWidth >= 0, 'label is too wide - was it scaled properly?' );

    // create the right strut to fill out the rest of the button
    var rightStrutWidth = STATES_BUTTON_WIDTH - leftStrutWidth - imageNode.width - centerStrutWidth - label.width;

    return new HBox( {
      children: [
        new HStrut( leftStrutWidth ),
        imageNode,
        new HStrut( centerStrutWidth ),
        label,
        new HStrut( rightStrutWidth )
      ],
      spacing: 0
    } );
  }

  /**
   * @param {MultiParticleModel} model
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function StatesPhaseControlNode( model, options ) {

    this.options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#C8C8C8',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );

    // state of the atoms/molecules
    var stateProperty = new Property( UNDEFINED_STATE );

    // boolean properties corresponding to each state
    var solidSelectedProperty = new Property( false );
    var liquidSelectedProperty = new Property( false );
    var gasSelectedProperty = new Property( false );

    // create solid state selection button
    var solidStateButton = new BooleanRectangularStickyToggleButton( solidSelectedProperty, {
      content: createButtonContent( solidIconImage, solidString )
    } );

    // create liquid state selection button
    var liquidStateButton = new BooleanRectangularStickyToggleButton( liquidSelectedProperty, {
      content: createButtonContent( liquidIconImage, liquidString )
    } );

    // create gas state selection button
    var gasStateButton = new BooleanRectangularStickyToggleButton( gasSelectedProperty, {
      content: createButtonContent( gasIconImage, gasString )
    } );

    // set the state when the buttons are pushed
    solidSelectedProperty.link( function( selected ) { if ( selected ){ stateProperty.value = SOLID_STATE } } );
    liquidSelectedProperty.link( function( selected ) { if ( selected ){ stateProperty.value = LIQUID_STATE } } );
    gasSelectedProperty.link( function( selected ) { if ( selected ){ stateProperty.value = GAS_STATE } } );

    // Set the model state and update the button appearances when the user presses one of the buttons.
    stateProperty.link( function( state ) {
      if ( state !== UNDEFINED_STATE ){
        model.setPhase( state );
      }
      solidStateButton.baseColor = state === SOLID_STATE ? SELECTED_BUTTON_COLOR : DESELECTED_BUTTON_COLOR;
      solidStateButton.pickable = state !== SOLID_STATE;
      liquidStateButton.baseColor = state === LIQUID_STATE ? SELECTED_BUTTON_COLOR : DESELECTED_BUTTON_COLOR;
      liquidStateButton.pickable = state !== LIQUID_STATE;
      gasStateButton.baseColor = state === GAS_STATE ? SELECTED_BUTTON_COLOR : DESELECTED_BUTTON_COLOR;
      gasStateButton.pickable = state !== GAS_STATE;
      solidSelectedProperty.value = state === SOLID_STATE;
      liquidSelectedProperty.value = state === LIQUID_STATE;
      gasSelectedProperty.value = state === GAS_STATE;
    } );

    // if the user changes the temperature, the phase state becomes undefined
    model.heatingCoolingAmountProperty.lazyLink( function() {
      stateProperty.value = UNDEFINED_STATE;
    } );

    // if the model gets reset, set the local phase state value to be undefined until the user selects a phase
    model.on( 'reset', function(){ stateProperty.value = UNDEFINED_STATE } );

    // put the buttons together in a single VBox
    var buttons = new VBox( {
      children: [ solidStateButton, liquidStateButton, gasStateButton ],
      spacing: 10,
      align: 'center'
    } );
    this.addChild( buttons );
    this.mutate( this.options );
  }

  return inherit( Node, StatesPhaseControlNode );
} );
