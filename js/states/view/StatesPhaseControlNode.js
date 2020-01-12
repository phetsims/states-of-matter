// Copyright 2014-2020, University of Colorado Boulder

/**
 * A node that allows user to select the phase of a substance.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const BooleanRectangularStickyToggleButton = require( 'SUN/buttons/BooleanRectangularStickyToggleButton' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhaseStateEnum = require( 'STATES_OF_MATTER/common/PhaseStateEnum' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const gasString = require( 'string!STATES_OF_MATTER/Gas' );
  const liquidString = require( 'string!STATES_OF_MATTER/Liquid' );
  const solidString = require( 'string!STATES_OF_MATTER/Solid' );

  // images
  const gasIconImage = require( 'image!STATES_OF_MATTER/gas-icon.png' );
  const liquidIconImage = require( 'image!STATES_OF_MATTER/liquid-icon.png' );
  const solidIconImage = require( 'image!STATES_OF_MATTER/solid-icon.png' );

  // constants
  const DEFAULT_BUTTON_WIDTH = 160;
  const ICON_HEIGHT = 25; // in screen coordinates, empirically determined
  const SELECTED_BUTTON_COLOR = '#a5a7ff';
  const DESELECTED_BUTTON_COLOR = '#F8D980';

  /**
   * @param {MultiParticleModel} model
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function StatesPhaseControlNode( model, options ) {

    options = merge( {
      xMargin: 5,
      yMargin: 8,
      fill: '#C8C8C8',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5, // radius of the rounded corners on the background
      buttonWidth: DEFAULT_BUTTON_WIDTH,
      tandem: Tandem.REQUIRED
    }, options );

    Node.call( this );

    // state of the atoms/molecules
    const stateProperty = new Property( PhaseStateEnum.UNKNOWN );

    // boolean properties corresponding to each state
    const solidSelectedProperty = new Property( false );
    const liquidSelectedProperty = new Property( false );
    const gasSelectedProperty = new Property( false );

    // convenience constant
    const tandem = options.tandem;

    // create solid state selection button
    const solidStateButton = new BooleanRectangularStickyToggleButton( solidSelectedProperty, {
      content: createButtonContent( solidIconImage, solidString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth,
      tandem: tandem.createTandem( 'solidStateButton' )
    } );

    // create liquid state selection button
    const liquidStateButton = new BooleanRectangularStickyToggleButton( liquidSelectedProperty, {
      content: createButtonContent( liquidIconImage, liquidString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth,
      tandem: tandem.createTandem( 'liquidStateButton' )
    } );

    // create gas state selection button
    const gasStateButton = new BooleanRectangularStickyToggleButton( gasSelectedProperty, {
      content: createButtonContent( gasIconImage, gasString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth,
      tandem: tandem.createTandem( 'gasStateButton' )
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
    const buttons = new VBox( {
      children: [ solidStateButton, liquidStateButton, gasStateButton ],
      spacing: 10,
      align: 'center'
    } );
    this.addChild( buttons );
    this.mutate( options );
  }

  // helper function that puts icon and label together with some struts into an HBox for using as content node on button
  function createButtonContent( iconImage, string, buttonWidth ) {

    assert && assert( iconImage && string, 'both icon and label must be defined' );

    // Create the image node and scale it so that it is the desired height.  Note that the width may vary.
    const imageNode = new Image( iconImage );
    imageNode.scale( ICON_HEIGHT / imageNode.height );

    // Create the text node, limiting it to 1/2 of the button width.
    const label = new Text( string, { font: new PhetFont( 14 ), fill: 'black', maxWidth: buttonWidth / 2 } );

    // create the left strut such that the icons will be centered around the same horizontal location
    const desiredIconHorizontalCenter = buttonWidth * 0.25; // multiplier is empirically determined
    const leftStrutWidth = Math.max( desiredIconHorizontalCenter - ( imageNode.width / 2 ), 0 );
    assert && assert( leftStrutWidth > 0, 'icon is too wide, either adjust it or adjust the icon position multiplier' );

    // create the center strut such that the labels are centered around the same horizontal location
    const desiredLabelHorizontalCenter = buttonWidth * 0.65;
    const centerStrutWidth = Math.max( desiredLabelHorizontalCenter - ( label.width / 2 ) - leftStrutWidth - imageNode.width, 0 );
    assert && assert( centerStrutWidth >= 0, 'label is too wide - was it scaled properly?' );

    // create the right strut to fill out the rest of the button
    const rightStrutWidth = buttonWidth - leftStrutWidth - imageNode.width - centerStrutWidth - label.width;

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

  statesOfMatter.register( 'StatesPhaseControlNode', StatesPhaseControlNode );

  return inherit( Node, StatesPhaseControlNode );
} );
