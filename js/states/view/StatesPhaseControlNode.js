// Copyright 2014-2022, University of Colorado Boulder

/**
 * A node that allows user to select the phase of a substance.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Image, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import BooleanRectangularStickyToggleButton from '../../../../sun/js/buttons/BooleanRectangularStickyToggleButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import gasIcon_png from '../../../mipmaps/gasIcon_png.js';
import liquidIcon_png from '../../../mipmaps/liquidIcon_png.js';
import solidIcon_png from '../../../mipmaps/solidIcon_png.js';
import PhaseStateEnum from '../../common/PhaseStateEnum.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';

const gasString = StatesOfMatterStrings.Gas;
const liquidString = StatesOfMatterStrings.Liquid;
const solidString = StatesOfMatterStrings.Solid;

// constants
const DEFAULT_BUTTON_WIDTH = 160;
const ICON_HEIGHT = 25; // in screen coordinates, empirically determined
const SELECTED_BUTTON_COLOR = '#a5a7ff';
const DESELECTED_BUTTON_COLOR = '#F8D980';

class StatesPhaseControlNode extends Node {

  /**
   * @param {MultiParticleModel} model
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( model, options ) {

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

    super();

    // state of the atoms/molecules
    const stateProperty = new EnumerationDeprecatedProperty( PhaseStateEnum, PhaseStateEnum.UNKNOWN, {
      tandem: options.tandem.createTandem( 'stateProperty' ),
      phetioReadOnly: true
    } );

    // boolean properties corresponding to each state, one for each of the phase state selection buttons
    const solidSelectedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'solidSelectedProperty' )
    } );
    const liquidSelectedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'liquidSelectedProperty' )
    } );
    const gasSelectedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'gasSelectedProperty' )
    } );

    // convenience constant
    const tandem = options.tandem;

    // create solid state selection button
    const solidStateButton = new BooleanRectangularStickyToggleButton( solidSelectedProperty, {
      content: createButtonContent( solidIcon_png, solidString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth,
      tandem: tandem.createTandem( 'solidStateButton' )
    } );

    // create liquid state selection button
    const liquidStateButton = new BooleanRectangularStickyToggleButton( liquidSelectedProperty, {
      content: createButtonContent( liquidIcon_png, liquidString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth,
      tandem: tandem.createTandem( 'liquidStateButton' )
    } );

    // create gas state selection button
    const gasStateButton = new BooleanRectangularStickyToggleButton( gasSelectedProperty, {
      content: createButtonContent( gasIcon_png, gasString, options.buttonWidth ),
      maxWidth: options.buttonWidth,
      minWidth: options.buttonWidth,
      tandem: tandem.createTandem( 'gasStateButton' )
    } );

    // set the state when the buttons are pushed
    solidSelectedProperty.link( selected => { if ( selected ) { stateProperty.value = PhaseStateEnum.SOLID; } } );
    liquidSelectedProperty.link( selected => { if ( selected ) { stateProperty.value = PhaseStateEnum.LIQUID; } } );
    gasSelectedProperty.link( selected => { if ( selected ) { stateProperty.value = PhaseStateEnum.GAS; } } );

    // Set the model state and update the button appearances when the user presses one of the buttons.
    stateProperty.link( state => {
      if ( state !== PhaseStateEnum.UNKNOWN ) {

        // Only set the phase in the model if this change comes directly from user interaction and not from PhET-iO state.
        // If the change is from the state engine, then the phase will be set implicitly when the positions and velocities
        // of the molecules are set.
        if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
          model.setPhase( state );
        }
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

    // enable/disable the buttons based on the model state
    model.isExplodedProperty.link( isExploded => {
      solidStateButton.setEnabled( !isExploded );
      liquidStateButton.setEnabled( !isExploded );
      gasStateButton.setEnabled( !isExploded );
    } );

    // if the user changes the temperature, the phase state becomes undefined
    model.heatingCoolingAmountProperty.lazyLink( () => {
      stateProperty.value = PhaseStateEnum.UNKNOWN;
    } );

    // if the model gets reset, set the local phase state value to be undefined until the user selects a phase
    model.resetEmitter.addListener( () => { stateProperty.value = PhaseStateEnum.UNKNOWN; } );

    // put the buttons together in a single VBox
    const buttons = new VBox( {
      children: [ solidStateButton, liquidStateButton, gasStateButton ],
      spacing: 10,
      align: 'center'
    } );
    this.addChild( buttons );
    this.mutate( options );
  }
}

// helper function that puts icon and label together with some struts into an HBox for using as content node on button
const createButtonContent = ( iconImage, string, buttonWidth ) => {

  assert && assert( iconImage && string, 'both icon and label must be defined' );

  // Create the image node and scale it so that it is the desired height.  Note that the width may vary.
  const imageNode = new Image( iconImage );
  imageNode.scale( ICON_HEIGHT / imageNode.height );

  // Create the text node, limiting it to 1/2 of the button width.
  const label = new Text( string, { font: new PhetFont( 14 ), fill: 'black', maxWidth: buttonWidth / 2 } );

  // create the left strut such that the icons will be centered around the same horizontal position
  const desiredIconHorizontalCenter = buttonWidth * 0.25; // multiplier is empirically determined
  const leftStrutWidth = Math.max( desiredIconHorizontalCenter - ( imageNode.width / 2 ), 0 );
  assert && assert( leftStrutWidth > 0, 'icon is too wide, either adjust it or adjust the icon position multiplier' );

  // create the center strut such that the labels are centered around the same horizontal position
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
};

statesOfMatter.register( 'StatesPhaseControlNode', StatesPhaseControlNode );
export default StatesPhaseControlNode;
