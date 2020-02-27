// Copyright 2015-2020, University of Colorado Boulder

/**
 * Control panel used for selecting atom combinations.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import pushPinImg from '../../../images/push-pin_png.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import AtomAndMoleculeIconFactory from '../../common/view/AtomAndMoleculeIconFactory.js';
import statesOfMatterStrings from '../../states-of-matter-strings.js';
import statesOfMatter from '../../statesOfMatter.js';
import AtomPair from '../model/AtomPair.js';

const adjustableAttractionString = statesOfMatterStrings.adjustableAttraction;
const argonString = statesOfMatterStrings.argon;
const atomDiameterString = statesOfMatterStrings.atomDiameter;
const atomsString = statesOfMatterStrings.Atoms;
const customAttractionString = statesOfMatterStrings.customAttraction;
const interactionStrengthString = statesOfMatterStrings.interactionStrength;
const largeString = statesOfMatterStrings.large;
const movingString = statesOfMatterStrings.moving;
const neonString = statesOfMatterStrings.neon;
const oxygenString = statesOfMatterStrings.oxygen;
const pinnedString = statesOfMatterStrings.pinned;
const smallString = statesOfMatterStrings.small;
const strongString = statesOfMatterStrings.strong;
const weakString = statesOfMatterStrings.weak;

// constants
const NORMAL_TEXT_FONT = new PhetFont( 12 );
const RADIO_BUTTON_RADIUS = 6;
const TITLE_TEXT_WIDTH = 130;
const PANEL_X_MARGIN = 10;

/**
 * @param {DualAtomModel} dualAtomModel - model of the simulation
 * @param {boolean} enableHeterogeneousAtoms - flag for enabling heterogeneous atom combinations
 * @param {Object} [options] that can be passed on to the underlying node
 * @constructor
 */
function AtomicInteractionsControlPanel( dualAtomModel, enableHeterogeneousAtoms, options ) {

  const self = this;
  options = merge( {
    xMargin: 5,
    yMargin: 8,
    fill: 'black',
    stroke: 'white',
    panelTextFill: 'white',
    tickTextColor: 'black',
    buttonTextFill: enableHeterogeneousAtoms ? 'black' : 'white',
    lineWidth: 1,
    cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
    minWidth: 0,
    tandem: Tandem.REQUIRED
  }, options );

  Node.call( this );

  // This control panel width differs between SOM full version and the Atomic Interactions sim, so we are using
  // different max width values.  These were empirically determined.
  const SLIDER_TITLE_MAX_WIDTH = enableHeterogeneousAtoms ? 225 : 150;
  const NORMAL_TEXT_MAX_WIDTH = enableHeterogeneousAtoms ? 200 : 120;

  // white text within SOM full version, black text in Atomic Interactions
  // white stroke around the atoms & molecules panel within SOM full version, black stroke in Atomic Interactions
  let neonAndNeon;
  let argonAndArgon;
  let oxygenAndOxygen;
  let neonAndArgon;
  let neonAndOxygen;
  let argonAndOxygen;
  let adjustableAttraction;
  let radioButtonGroup;
  let maxLabelWidth;
  let createLabelNode;
  let titleText;
  let titleNode;
  const sliderTrackWidth = 140; // empirically determined

  // common options for radio button labels
  const labelTextOptions = {
    font: NORMAL_TEXT_FONT,
    fill: options.buttonTextFill,
    maxWidth: enableHeterogeneousAtoms ? NORMAL_TEXT_MAX_WIDTH / 2 : NORMAL_TEXT_MAX_WIDTH
  };

  // allows user to select from a fixed list of heterogeneous and homogeneous combinations of atoms
  if ( enableHeterogeneousAtoms ) {
    neonAndNeon = [
      new Text( neonString, labelTextOptions ),
      new Text( neonString, labelTextOptions )
    ];
    argonAndArgon = [
      new Text( argonString, labelTextOptions ),
      new Text( argonString, labelTextOptions )
    ];
    oxygenAndOxygen = [
      new Text( oxygenString, labelTextOptions ),
      new Text( oxygenString, labelTextOptions )
    ];
    neonAndArgon = [
      new Text( neonString, labelTextOptions ),
      new Text( argonString, labelTextOptions )
    ];
    neonAndOxygen = [
      new Text( neonString, labelTextOptions ),
      new Text( oxygenString, labelTextOptions )
    ];
    argonAndOxygen = [
      new Text( argonString, labelTextOptions ),
      new Text( oxygenString, labelTextOptions )
    ];
    const customAttraction = new Text( customAttractionString, {
      font: NORMAL_TEXT_FONT,
      fill: options.buttonTextFill,
      maxWidth: NORMAL_TEXT_MAX_WIDTH
    } );
    const pushpinImage = new Image( pushPinImg, {
      tandem: options.tandem.createTandem( 'pushpinImage' )
    } );
    pushpinImage.scale( 15 / pushpinImage.height );
    const maxWidthOfTitleText = 100; // empirically determined
    const pinnedNodeText = new HBox( {
      children: [
        pushpinImage,
        new Text( pinnedString, {
          font: new PhetFont( 10 ),
          maxWidth: maxWidthOfTitleText,
          tandem: options.tandem.createTandem( 'pinnedNodeText' )
        } ),
        new HStrut( pushpinImage.width )
      ],
      spacing: 5
    } );
    titleText = [ pinnedNodeText, new Text( movingString, {
      font: new PhetFont( 10 ),
      maxWidth: maxWidthOfTitleText,
      tandem: options.tandem.createTandem( 'movingNodeText' )
    } ) ];
    maxLabelWidth = Math.max(
      neonAndArgon[ 0 ].width + neonAndArgon[ 1 ].width,
      argonAndArgon[ 0 ].width + argonAndArgon[ 1 ].width,
      oxygenAndOxygen[ 0 ].width + oxygenAndOxygen[ 1 ].width,
      neonAndNeon[ 0 ].width + neonAndNeon[ 1 ].width,
      neonAndOxygen[ 0 ].width + neonAndOxygen[ 1 ].width );
    maxLabelWidth = 2 * Math.max( titleText[ 0 ].width, titleText[ 1 ].width, maxLabelWidth / 2, sliderTrackWidth / 2 );

    // function to create a label node
    createLabelNode = function( atomNameTextNodes ) {
      const strutWidth1 = maxLabelWidth / 2 - atomNameTextNodes[ 0 ].width;
      const strutWidth2 = maxLabelWidth / 2 - atomNameTextNodes[ 1 ].width;
      return new HBox( {
        children: [ atomNameTextNodes[ 0 ], new HStrut( strutWidth1 ), atomNameTextNodes[ 1 ], new HStrut( strutWidth2 ) ]
      } );
    };

    const neonNeonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_NEON,
      createLabelNode( neonAndNeon ), { radius: RADIO_BUTTON_RADIUS } );
    const argonArgonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ARGON_ARGON,
      createLabelNode( argonAndArgon ), { radius: RADIO_BUTTON_RADIUS } );
    const oxygenOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.OXYGEN_OXYGEN,
      createLabelNode( oxygenAndOxygen ), { radius: RADIO_BUTTON_RADIUS } );
    const neonArgonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_ARGON,
      createLabelNode( neonAndArgon ), { radius: RADIO_BUTTON_RADIUS } );
    const neonOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_OXYGEN,
      createLabelNode( neonAndOxygen ), { radius: RADIO_BUTTON_RADIUS } );
    const argonOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ARGON_OXYGEN,
      createLabelNode( argonAndOxygen ), { radius: RADIO_BUTTON_RADIUS } );
    const adjustableAttractionRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ADJUSTABLE,
      new HBox( { children: [ customAttraction ] } ), { radius: RADIO_BUTTON_RADIUS } );
    const createTitle = function( labelNodePair ) {
      const strutWidth1 = RADIO_BUTTON_RADIUS;
      const strutWidth2 = ( maxLabelWidth / 2 - labelNodePair[ 0 ].width );
      const strutWidth3 = ( maxLabelWidth / 2 - labelNodePair[ 1 ].width );
      return new HBox( {
        children: [
          new HStrut( strutWidth1 ),
          labelNodePair[ 0 ],
          new HStrut( strutWidth2 + 9 + RADIO_BUTTON_RADIUS ),
          labelNodePair[ 1 ],
          new HStrut( strutWidth3 + 10 )
        ]
      } );
    };
    titleNode = createTitle( titleText );
    const radioButtons = new VBox( {
      children: [ neonNeonRadio, argonArgonRadio, oxygenOxygenRadio,
        neonArgonRadio, neonOxygenRadio, argonOxygenRadio, adjustableAttractionRadio ],
      align: 'left',
      spacing: 13
    } );
    radioButtonGroup = new VBox( {
      children: [ titleNode, radioButtons ],
      align: 'left',
      spacing: 5
    } );
    titleNode.align = self.width / 2;

    // dilate the touch areas to make the buttons easier to work with on touch-based devices
    const xDilation = 8;
    const yDilation = 5;
    neonNeonRadio.touchArea = neonNeonRadio.localBounds.dilatedXY( xDilation, yDilation );
    argonArgonRadio.touchArea = argonArgonRadio.localBounds.dilatedXY( xDilation, yDilation );
    oxygenOxygenRadio.touchArea = oxygenOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
    neonArgonRadio.touchArea = neonArgonRadio.localBounds.dilatedXY( xDilation, yDilation );
    neonOxygenRadio.touchArea = neonOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
    argonOxygenRadio.touchArea = argonOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
    adjustableAttractionRadio.touchArea = argonOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
  }
  else {

    // allows the user to choose the type of atom when both are the same
    const title = new Text( atomsString, {
      font: new PhetFont( 14 ),
      fill: options.panelTextFill,
      maxWidth: TITLE_TEXT_WIDTH
    } );

    // Set up objects that describe the pieces that make up a selector item in the control panel, conforms to the
    // contract: { label: {Node}, icon: {Node} }
    const neon = {
      label: new Text( neonString, labelTextOptions ),
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.NEON )
    };
    const argon = {
      label: new Text( argonString, labelTextOptions ),
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ARGON )
    };
    adjustableAttraction = {
      label: new Text( adjustableAttractionString, {
        font: NORMAL_TEXT_FONT,
        fill: options.buttonTextFill,
        maxWidth: NORMAL_TEXT_MAX_WIDTH
      } ),
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ADJUSTABLE_ATOM )
    };
    titleText = {
      label: title
    };

    // compute the maximum item width
    const widestLabelAndIconSpec = _.maxBy( [ neon, argon, adjustableAttraction, titleText ], function( item ) {
      return item.label.width + ( ( item.icon ) ? item.icon.width : 0 );
    } );
    maxLabelWidth = widestLabelAndIconSpec.label.width + ( ( widestLabelAndIconSpec.icon ) ? widestLabelAndIconSpec.icon.width : 0 );
    maxLabelWidth = Math.max( maxLabelWidth, sliderTrackWidth );

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    createLabelNode = function( atomSelectorLabelSpec ) {
      if ( atomSelectorLabelSpec.icon ) {
        const strutWidth = maxLabelWidth - atomSelectorLabelSpec.label.width - atomSelectorLabelSpec.icon.width + 17;
        return new HBox( { children: [ atomSelectorLabelSpec.label, new HStrut( strutWidth ), atomSelectorLabelSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ atomSelectorLabelSpec.label ] } );
      }
    };

    const radioButtonContent = [
      { value: AtomPair.NEON_NEON, node: createLabelNode( neon ), tandemName: 'neonNeonSelector' },
      { value: AtomPair.ARGON_ARGON, node: createLabelNode( argon ), tandemName: 'argonArgonSelector' },
      {
        value: AtomPair.ADJUSTABLE,
        node: createLabelNode( adjustableAttraction ),
        tandemName: 'adjustableAttractionSelector'
      }
    ];
    radioButtonGroup = new RadioButtonGroup( dualAtomModel.atomPairProperty, radioButtonContent, {
      orientation: 'vertical',
      cornerRadius: 5,
      baseColor: 'black',
      disabledBaseColor: 'black',
      selectedLineWidth: 1,
      selectedStroke: 'white',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1,
      tandem: options.tandem.createTandem( 'radioButtonGroup' )
    } );

    const titleBackground = new Rectangle( 0, 0, titleText.label.width + 5, titleText.label.height, {
      fill: options.fill,
      centerX: titleText.label.centerX,
      centerY: titleText.label.centerY
    } );

    titleNode = new Node( { children: [ titleBackground, titleText.label ] } );
  }

  // add atom diameter slider
  const atomDiameterTitle = new Text( atomDiameterString, {
    font: NORMAL_TEXT_FONT,
    fill: options.panelTextFill,
    maxWidth: SLIDER_TITLE_MAX_WIDTH
  } );

  const commonSliderOptions = {
    trackSize: new Dimension2( sliderTrackWidth, 5 ),
    trackFill: 'white',
    thumbSize: new Dimension2( 14, 25 ),
    thumbFill: '#A670DB',
    thumbFillHighlighted: '#D966FF',
    thumbCenterLineStroke: 'black',
    thumbTouchAreaXDilation: 8,
    thumbTouchAreaYDilation: 8,
    majorTickLength: 15,
    majorTickStroke: options.panelTextFill,
    trackStroke: options.panelTextFill,
    startDrag: function() {
      dualAtomModel.setMotionPaused( true );
    },
    endDrag: function() {
      dualAtomModel.setMotionPaused( false );
    }
  };

  const atomDiameterSlider = new HSlider(
    dualAtomModel.atomDiameterProperty,
    new Range( SOMConstants.MIN_SIGMA, SOMConstants.MAX_SIGMA ),
    merge( { tandem: options.tandem.createTandem( 'atomDiameterSlider' ) }, commonSliderOptions )
  );

  const maxTickTextWidth = enableHeterogeneousAtoms ? 85 : 35;
  const tickTextOptions = { fill: options.panelTextFill, maxWidth: maxTickTextWidth };
  const smallText = new Text( smallString, tickTextOptions );
  const largeText = new Text( largeString, tickTextOptions );

  if ( enableHeterogeneousAtoms ) {
    atomDiameterSlider.addMajorTick( SOMConstants.MIN_SIGMA );
    atomDiameterSlider.addMajorTick( SOMConstants.MAX_SIGMA );
  }
  else {
    atomDiameterSlider.addMajorTick( SOMConstants.MIN_SIGMA, smallText );
    atomDiameterSlider.addMajorTick( SOMConstants.MAX_SIGMA, largeText );
  }

  const atomDiameter = new Node( { children: [ atomDiameterTitle, atomDiameterSlider ] } );

  // add interaction strength slider
  const interactionStrengthTitle = new Text( interactionStrengthString, {
    font: NORMAL_TEXT_FONT,
    fill: options.panelTextFill,
    top: atomDiameterSlider.bottom + 5,
    maxWidth: SLIDER_TITLE_MAX_WIDTH
  } );
  const interactionStrengthSlider = new HSlider(
    dualAtomModel.interactionStrengthProperty,
    new Range( SOMConstants.MIN_EPSILON, SOMConstants.MAX_EPSILON ),
    merge( { tandem: options.tandem.createTandem( 'interactionStrengthSlider' ) }, commonSliderOptions )
  );
  const weakText = new Text( weakString, tickTextOptions );
  const strongText = new Text( strongString, tickTextOptions );
  interactionStrengthSlider.addMajorTick( SOMConstants.MIN_EPSILON, weakText );
  interactionStrengthSlider.addMajorTick( SOMConstants.MAX_EPSILON, strongText );
  const interactionStrength = new Node( { children: [ interactionStrengthTitle, interactionStrengthSlider ] } );

  const content = new VBox( {
    align: 'left', children: [ radioButtonGroup ],
    spacing: 5
  } );
  const verticalSpaceOffset = 7;

  // sliders and title adjustments
  atomDiameterSlider.top = atomDiameterTitle.bottom + verticalSpaceOffset;
  atomDiameterSlider.centerX = radioButtonGroup.centerX;
  interactionStrengthTitle.top = atomDiameterSlider.bottom + verticalSpaceOffset;
  interactionStrengthSlider.top = interactionStrengthTitle.bottom + verticalSpaceOffset;
  interactionStrengthSlider.centerX = radioButtonGroup.centerX;

  const radioButtonPanel = new Panel( content, {
    stroke: options.stroke,
    cornerRadius: options.cornerRadius,
    lineWidth: options.lineWidth,
    fill: options.fill,
    xMargin: PANEL_X_MARGIN,
    minWidth: options.minWidth,
    align: 'left'
  } );
  this.addChild( radioButtonPanel );

  // hide or show the controls for handling the adjustable atom based on the atom pair setting
  dualAtomModel.atomPairProperty.link( function( atomPair ) {
    if ( atomPair === AtomPair.ADJUSTABLE ) {
      content.addChild( atomDiameter );
      content.addChild( interactionStrength );
    }
    else {
      if ( content.hasChild( atomDiameter ) ) {
        content.removeChild( atomDiameter );
      }
      if ( content.hasChild( interactionStrength ) ) {
        content.removeChild( interactionStrength );
      }
    }
  } );

  // Add the title node after radio button panel added in SOM full version.  Here around the panel we are drawing a
  // rectangle and on top rectangle added title node.
  if ( !enableHeterogeneousAtoms ) {
    this.addChild( titleNode );
    titleNode.centerX = radioButtonGroup.centerX + 5;
  }
  this.mutate( options );
}

statesOfMatter.register( 'AtomicInteractionsControlPanel', AtomicInteractionsControlPanel );

inherit( Node, AtomicInteractionsControlPanel );
export default AtomicInteractionsControlPanel;