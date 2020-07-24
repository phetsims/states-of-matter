// Copyright 2015-2020, University of Colorado Boulder

/**
 * Control panel used for selecting atom combinations.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import pushPinImg from '../../../images/push-pin_png.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import AtomAndMoleculeIconFactory from '../../common/view/AtomAndMoleculeIconFactory.js';
import SOMColorProfile from '../../common/view/SOMColorProfile.js';
import statesOfMatter from '../../statesOfMatter.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
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
const SLIDER_VBOX_SPACING = 5;
const AQUA_RADIO_BUTTON_X_SPACING = 8; // only used for atomic-interactions

class AtomicInteractionsControlPanel extends Node {

  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {boolean} enableHeterogeneousAtoms - flag for enabling heterogeneous atom combinations
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( dualAtomModel, enableHeterogeneousAtoms, options ) {

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

    super();

    // This control panel width differs between SOM full version and the Atomic Interactions sim, so we are using
    // different max width values.  These were empirically determined.
    const SLIDER_TITLE_MAX_WIDTH = enableHeterogeneousAtoms ? 225 : 150;
    const NORMAL_TEXT_MAX_WIDTH = enableHeterogeneousAtoms ? 200 : 165;

    // white text within SOM full version, black text in Atomic Interactions
    // white stroke around the atoms & molecules panel within SOM full version, black stroke in Atomic Interactions
    let neonAndNeonLabelItems;
    let argonAndArgonLabelItems;
    let oxygenAndOxygenLabelItems;
    let neonAndArgonLabelItems;
    let neonAndOxygenLabelItems;
    let argonAndOxygenLabelItems;
    let adjustableAttraction;
    let atomPairSelector;
    let labelWidth;
    let createLabelNode;
    let labelNodes;
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
      neonAndNeonLabelItems = [
        new Text( neonString, labelTextOptions ),
        new Text( neonString, labelTextOptions )
      ];
      argonAndArgonLabelItems = [
        new Text( argonString, labelTextOptions ),
        new Text( argonString, labelTextOptions )
      ];
      oxygenAndOxygenLabelItems = [
        new Text( oxygenString, labelTextOptions ),
        new Text( oxygenString, labelTextOptions )
      ];
      neonAndArgonLabelItems = [
        new Text( neonString, labelTextOptions ),
        new Text( argonString, labelTextOptions )
      ];
      neonAndOxygenLabelItems = [
        new Text( neonString, labelTextOptions ),
        new Text( oxygenString, labelTextOptions )
      ];
      argonAndOxygenLabelItems = [
        new Text( argonString, labelTextOptions ),
        new Text( oxygenString, labelTextOptions )
      ];
      const customAttractionLabel = new Text( customAttractionString, {
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

      const movingNodeText = new Text( movingString, {
        font: new PhetFont( 10 ),
        maxWidth: maxWidthOfTitleText,
        tandem: options.tandem.createTandem( 'movingNodeText' )
      } );
      labelNodes = [pinnedNodeText, movingNodeText];
      labelWidth = Math.max(
        neonAndArgonLabelItems[ 0 ].width + neonAndArgonLabelItems[ 1 ].width,
        argonAndArgonLabelItems[ 0 ].width + argonAndArgonLabelItems[ 1 ].width,
        oxygenAndOxygenLabelItems[ 0 ].width + oxygenAndOxygenLabelItems[ 1 ].width,
        neonAndNeonLabelItems[ 0 ].width + neonAndNeonLabelItems[ 1 ].width,
        neonAndOxygenLabelItems[ 0 ].width + neonAndOxygenLabelItems[ 1 ].width );
      labelWidth = Math.max(
        labelNodes[ 0 ].width * 2,
        labelNodes[ 1 ].width * 2,
        labelWidth, sliderTrackWidth,
        options.minWidth - 2 * PANEL_X_MARGIN - 2 * RADIO_BUTTON_RADIUS - AQUA_RADIO_BUTTON_X_SPACING );

      // function to create a label node
      const createLabelNode = atomNameTextNodes => {
        const strutWidth1 = labelWidth / 2 - atomNameTextNodes[ 0 ].width;
        const strutWidth2 = labelWidth / 2 - atomNameTextNodes[ 1 ].width;
        return new HBox( {
          children: [atomNameTextNodes[ 0 ], new HStrut( strutWidth1 ), atomNameTextNodes[ 1 ], new HStrut( strutWidth2 )]
        } );
      };

      const radioButtonGroup = new AquaRadioButtonGroup(
        dualAtomModel.atomPairProperty,
        [
          {
            node: createLabelNode( neonAndNeonLabelItems ),
            value: AtomPair.NEON_NEON,
            tandemName: 'neonAndNeon'
          },
          {
            node: createLabelNode( argonAndArgonLabelItems ),
            value: AtomPair.ARGON_ARGON,
            tandemName: 'argonAndArgon'
          },
          {
            node: createLabelNode( oxygenAndOxygenLabelItems ),
            value: AtomPair.OXYGEN_OXYGEN,
            tandemName: 'oxygenAndOxygen'
          },
          {
            node: createLabelNode( neonAndArgonLabelItems ),
            value: AtomPair.NEON_ARGON,
            tandemName: 'neonAndArgon'
          },
          {
            node: createLabelNode( neonAndOxygenLabelItems ),
            value: AtomPair.NEON_OXYGEN,
            tandemName: 'neonAndOxygen'
          },
          {
            node: createLabelNode( argonAndOxygenLabelItems ),
            value: AtomPair.ARGON_OXYGEN,
            tandemName: 'argonAndOxygen'
          },
          {
            node: customAttractionLabel,
            value: AtomPair.ADJUSTABLE,
            tandemName: 'adjustable'
          }
        ],
        {
          spacing: 13,
          radioButtonOptions: {
            radius: RADIO_BUTTON_RADIUS,
            xSpacing: AQUA_RADIO_BUTTON_X_SPACING
          },
          tandem: options.tandem.createTandem( 'radioButtonGroup' )
        }
      );

      // create the title of the panel in such a way that it will align in a column with the atom selections
      const createTitle = labelNodePair => {
        const strutWidth1 = RADIO_BUTTON_RADIUS;
        const strutWidth2 = ( labelWidth / 2 - labelNodePair[ 0 ].width );
        const strutWidth3 = ( labelWidth / 2 - labelNodePair[ 1 ].width );
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
      titleNode = createTitle( labelNodes );

      // put the title and radio button group together into a single node
      atomPairSelector = new VBox( {
        children: [titleNode, radioButtonGroup],
        align: 'left',
        spacing: 5
      } );
      titleNode.align = this.width / 2;
    }
    else {

      // allows the user to choose the type of atom, both atoms will be the same type
      const title = new Text( atomsString, {
        font: new PhetFont( 14 ),
        fill: options.panelTextFill,
        maxWidth: TITLE_TEXT_WIDTH,
        tandem: options.tandem.createTandem( 'title' )
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
      labelNodes = {
        label: title
      };

      // compute the maximum item width
      const widestLabelAndIconSpec = _.maxBy(
        [neon, argon, adjustableAttraction, labelNodes],
        item => item.label.width + ( ( item.icon ) ? item.icon.width : 0 )
      );
      labelWidth = widestLabelAndIconSpec.label.width + ( ( widestLabelAndIconSpec.icon ) ? widestLabelAndIconSpec.icon.width : 0 );
      labelWidth = Math.max(
        labelWidth,
        sliderTrackWidth,
        options.minWidth - 2 * PANEL_X_MARGIN );

      // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
      createLabelNode = atomSelectorLabelSpec => {
        if ( atomSelectorLabelSpec.icon ) {
          const strutWidth = labelWidth - atomSelectorLabelSpec.label.width - atomSelectorLabelSpec.icon.width;
          return new HBox( { children: [atomSelectorLabelSpec.label, new HStrut( strutWidth ), atomSelectorLabelSpec.icon] } );
        }
        else {
          return new HBox( { children: [atomSelectorLabelSpec.label] } );
        }
      };

      const radioButtonContent = [
        {
          value: AtomPair.NEON_NEON,
          node: createLabelNode( neon ),
          tandemName: 'neon'
        },
        {
          value: AtomPair.ARGON_ARGON,
          node: createLabelNode( argon ),
          tandemName: 'argon'
        },
        {
          value: AtomPair.ADJUSTABLE,
          node: createLabelNode( adjustableAttraction ),
          tandemName: 'adjustableAttraction'
        }
      ];
      const radioButtonGroup = new RadioButtonGroup( dualAtomModel.atomPairProperty, radioButtonContent, {
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
      atomPairSelector = radioButtonGroup;

      titleNode = new BackgroundNode( labelNodes.label, {
        yMargin: 1,
        backgroundOptions: {
          fill: SOMColorProfile.backgroundProperty,
          opacity: 1
        }
      } );
    }

    // create the root tandem for the node that includes the atom diameter title and slider
    const atomDiameterSliderTandem = options.tandem.createTandem( 'atomDiameterSlider' );

    // add atom diameter slider
    const atomDiameterTitle = new Text( atomDiameterString, {
      font: NORMAL_TEXT_FONT,
      fill: options.panelTextFill,
      maxWidth: SLIDER_TITLE_MAX_WIDTH,
      tandem: atomDiameterSliderTandem.createTandem( 'title' )
    } );

    const commonSliderOptions = merge( {}, SOMConstants.ADJUSTABLE_ATTRACTION_SLIDER_COMMON_OPTIONS, {
      trackSize: new Dimension2( sliderTrackWidth, 5 ),
      majorTickStroke: options.panelTextFill,
      trackStroke: options.panelTextFill,
      constrainValue: value => Utils.roundToInterval( value, 5 ),
      startDrag: () => {
        dualAtomModel.setMotionPaused( true );
      },
      endDrag: () => {
        dualAtomModel.setMotionPaused( false );
      }
    } );

    const atomDiameterSlider = new HSlider(
      dualAtomModel.adjustableAtomDiameterProperty,
      new Range( SOMConstants.MIN_SIGMA, SOMConstants.MAX_SIGMA ),
      merge( { tandem: atomDiameterSliderTandem.createTandem( 'slider' ) }, commonSliderOptions )
    );

    const maxTickTextWidth = enableHeterogeneousAtoms ? 85 : 35;
    const tickTextOptions = {
      font: SOMConstants.SLIDER_TICK_TEXT_FONT,
      fill: options.panelTextFill,
      maxWidth: maxTickTextWidth
    };
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

    const atomDiameterSliderBox = new VBox( {
      children: [atomDiameterTitle, atomDiameterSlider],
      align: 'center',
      spacing: SLIDER_VBOX_SPACING,
      tandem: atomDiameterSliderTandem,
      phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
    } );

    // create the root tandem for the node that includes the interaction title and slider
    const interactionStrengthSliderTandem = options.tandem.createTandem( 'interactionStrengthSlider' );

    // add interaction strength slider
    const interactionStrengthTitle = new Text( interactionStrengthString, {
      font: NORMAL_TEXT_FONT,
      fill: options.panelTextFill,
      top: atomDiameterSlider.bottom + 5,
      maxWidth: SLIDER_TITLE_MAX_WIDTH,
      tandem: interactionStrengthSliderTandem.createTandem( 'title' )
    } );
    const interactionStrengthSlider = new HSlider(
      dualAtomModel.adjustableAtomInteractionStrengthProperty,
      new Range( SOMConstants.MIN_EPSILON, SOMConstants.MAX_EPSILON ),
      merge( { tandem: interactionStrengthSliderTandem.createTandem( 'slider' ) }, commonSliderOptions )
    );
    const weakText = new Text( weakString, tickTextOptions );
    const strongText = new Text( strongString, tickTextOptions );
    interactionStrengthSlider.addMajorTick( SOMConstants.MIN_EPSILON, weakText );
    interactionStrengthSlider.addMajorTick( SOMConstants.MAX_EPSILON, strongText );
    const interactionStrengthSliderBox = new VBox( {
      children: [interactionStrengthTitle, interactionStrengthSlider],
      spacing: SLIDER_VBOX_SPACING,
      align: 'center',
      tandem: interactionStrengthSliderTandem,
      phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
    } );

    const content = new VBox( {
      align: 'center', children: [atomPairSelector],
      spacing: 5
    } );
    const verticalSpaceOffset = 7;

    // sliders and title adjustments
    atomDiameterSlider.top = atomDiameterTitle.bottom + verticalSpaceOffset;
    atomDiameterSlider.centerX = atomPairSelector.centerX;
    interactionStrengthTitle.top = atomDiameterSlider.bottom + verticalSpaceOffset;
    interactionStrengthSlider.top = interactionStrengthTitle.bottom + verticalSpaceOffset;
    interactionStrengthSlider.centerX = atomPairSelector.centerX;

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
    dualAtomModel.atomPairProperty.link( atomPair => {
      if ( atomPair === AtomPair.ADJUSTABLE ) {
        content.addChild( atomDiameterSliderBox );
        content.addChild( interactionStrengthSliderBox );
      }
      else {
        if ( content.hasChild( atomDiameterSliderBox ) ) {
          content.removeChild( atomDiameterSliderBox );
        }
        if ( content.hasChild( interactionStrengthSliderBox ) ) {
          content.removeChild( interactionStrengthSliderBox );
        }
      }
    } );

    // Add the title node after radio button panel is added in the SOM full version.  This title is at the top center of
    // the panel.
    if ( !enableHeterogeneousAtoms ) {
      this.addChild( titleNode );

      // Keep the title node centered if its bounds change (which can only be done through phet-io).
      titleNode.localBoundsProperty.link( () => {
        titleNode.centerX = radioButtonPanel.centerX;
        titleNode.bottom = radioButtonPanel.top + 5; // empirically determined to overlap reasonably well
      } );
    }
    this.mutate( options );
  }

}

statesOfMatter.register( 'AtomicInteractionsControlPanel', AtomicInteractionsControlPanel );
export default AtomicInteractionsControlPanel;

