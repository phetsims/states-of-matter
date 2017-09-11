// Copyright 2014-2015, University of Colorado Boulder

/**
 * A node that allows user to select the phase of a substance.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanRectangularStickyToggleButton = require( 'SUN/buttons/BooleanRectangularStickyToggleButton' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var gasString = require( 'string!STATES_OF_MATTER/Gas' );
  var liquidString = require( 'string!STATES_OF_MATTER/Liquid' );
  var solidString = require( 'string!STATES_OF_MATTER/Solid' );

  // images
  var gasIconImage = require( 'image!STATES_OF_MATTER/gas-icon.png' );
  var liquidIconImage = require( 'image!STATES_OF_MATTER/liquid-icon.png' );
  var solidIconImage = require( 'image!STATES_OF_MATTER/solid-icon.png' );

  // constants
  var DEFAULT_BUTTON_WIDTH = 160;
  var ICON_HEIGHT = 25; // in screen coordinates, empirically determined
  var SELECTED_BUTTON_COLOR = '#a5a7ff';
  var DESELECTED_BUTTON_COLOR = '#F8D980';

  // function that puts icon and label together with some struts into an HBox for using as content node on button
  function createButtonContent( iconImage, string, buttonWidth ) {

    assert && assert( iconImage && string, 'both icon and label must be defined' );

    // Create the image node and scale it so that it is the desired height.  Note that the width may vary.
    var imageNode = new Image( iconImage );
    imageNode.scale( ICON_HEIGHT / imageNode.height );

    // Create the text node, limiting it to 1/2 of the button width.
    var label = new Text( string, { font: new PhetFont( 14 ), fill: 'black', maxWidth: buttonWidth / 2 } );

    // create the left strut such that the icons will be centered around the same horizontal location
    var desiredIconHorizontalCenter = buttonWidth * 0.25; // multiplier is empirically determined
    var leftStrutWidth = Math.max( desiredIconHorizontalCenter - ( imageNode.width / 2 ), 0 );
    assert && assert( leftStrutWidth > 0, 'icon is too wide, either adjust it or adjust the icon position multiplier' );

    // create the center strut such that the labels are centered around the same horizontal location
    var desiredLabelHorizontalCenter = buttonWidth * 0.65;
    var centerStrutWidth = Math.max( desiredLabelHorizontalCenter - ( label.width / 2 ) - leftStrutWidth - imageNode.width, 0 );
    assert && assert( centerStrutWidth >= 0, 'label is too wide - was it scaled properly?' );

    // create the right strut to fill out the rest of the button
    var rightStrutWidth = buttonWidth - leftStrutWidth - imageNode.width - centerStrutWidth - label.width;

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

    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#C8C8C8',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5, // radius of the rounded corners on the background
      buttonWidth: DEFAULT_BUTTON_WIDTH
    }, options );

    Node.call( this );

    // state of the atoms/molecules
    var stateProperty = new Property( PhaseStateEnum.UNKNOWN );

    // boolean properties corresponding to each state
    var solidSelectedProperty = new Property( false );
    var liquidSelectedProperty = new Property( false );
    var gasSelectedProperty = new Property( false );

    // create solid state selection button
    var solidStateButton = new BooleanRectangularStickyToggleButton( solidSelectedProperty, {
      content: createButtonContent( solidIconImage, solidString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth
    } );

    // create liquid state selection button
    var liquidStateButton = new BooleanRectangularStickyToggleButton( liquidSelectedProperty, {
      content: createButtonContent( liquidIconImage, liquidString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth
    } );

    // create gas state selection button
    var gasStateButton = new BooleanRectangularStickyToggleButton( gasSelectedProperty, {
      content: createButtonContent( gasIconImage, gasString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth
    } );

    // set the state when the buttons are pushed
    solidSelectedProperty.link( function( selected ) { if ( selected ) { stateProperty.value = PhaseStateEnum.SOLID; } } );
    liquidSelectedProperty.link( function( selected ) { if ( selected ) { stateProperty.value = PhaseStateEnum.LIQUID; } } );
    gasSelectedProperty.link( function( selected ) { if ( selected ) { stateProperty.value = PhaseStateEnum.GAS; } } );

    // Set the model state and update the button appearances when the user presses one of the buttons.
    stateProperty.link( function( state ) {
      if ( state !== PhaseStateEnum.UNKNOWN ) {
        model.setPhase( state );
      }
      solidStateButton.baseColor = state === PhaseStateEnum.SOLID ? SELECTED_BUTTON_COLOR : DESELECTED_BUTTON_COLOR;
      solidStateButton.pickable = state !== PhaseStateEnum.SOLID;
      liquidStateButton.baseColor = state === PhaseStateEnum.LIQUID ? SELECTED_BUTTON_COLOR : DESELECTED_BUTTON_COLOR;
      liquidStateButton.pickable = state !== PhaseStateEnum.LIQUID;
      gasStateButton.baseColor = state === PhaseStateEnum.GAS ? SELECTED_BUTTON_COLOR : DESELECTED_BUTTON_COLOR;
      gasStateButton.pickable = state !== PhaseStateEnum.GAS;
      solidSelectedProperty.value = state === PhaseStateEnum.SOLID;
      liquidSelectedProperty.value = state === PhaseStateEnum.LIQUID;
      gasSelectedProperty.value = state === PhaseStateEnum.GAS;
    } );

    // if the user changes the temperature, the phase state becomes undefined
    model.heatingCoolingAmountProperty.lazyLink( function() {
      stateProperty.value = PhaseStateEnum.UNKNOWN;
    } );

    // if the model gets reset, set the local phase state value to be undefined until the user selects a phase
    model.resetEmitter.addListener( function() { stateProperty.value = PhaseStateEnum.UNKNOWN; } );

    // put the buttons together in a single VBox
    var buttons = new VBox( {
      children: [ solidStateButton, liquidStateButton, gasStateButton ],
      spacing: 10,
      align: 'center'
    } );
    this.addChild( buttons );
    this.mutate( options );
  }

  statesOfMatter.register( 'StatesPhaseControlNode', StatesPhaseControlNode );

  return inherit( Node, StatesPhaseControlNode );
} );
