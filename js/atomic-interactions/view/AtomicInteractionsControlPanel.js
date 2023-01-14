// Copyright 2015-2023, University of Colorado Boulder

/**
 * Control panel used for selecting atom combinations.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Image, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import pushPin_png from '../../../images/pushPin_png.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import AtomAndMoleculeIconFactory from '../../common/view/AtomAndMoleculeIconFactory.js';
import SOMColors from '../../common/view/SOMColors.js';
import TitledSlider from '../../common/view/TitledSlider.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import AtomPair from '../model/AtomPair.js';

const adjustableAttractionString = StatesOfMatterStrings.adjustableAttraction;
const argonString = StatesOfMatterStrings.argon;
const atomDiameterString = StatesOfMatterStrings.atomDiameter;
const atomsString = StatesOfMatterStrings.Atoms;
const customAttractionString = StatesOfMatterStrings.customAttraction;
const interactionStrengthString = StatesOfMatterStrings.interactionStrength;
const largeString = StatesOfMatterStrings.large;
const movingString = StatesOfMatterStrings.moving;
const neonString = StatesOfMatterStrings.neon;
const oxygenString = StatesOfMatterStrings.oxygen;
const pinnedString = StatesOfMatterStrings.pinned;
const smallString = StatesOfMatterStrings.small;
const strongString = StatesOfMatterStrings.strong;
const weakString = StatesOfMatterStrings.weak;

// constants
const NORMAL_TEXT_FONT = new PhetFont( 12 );
const RADIO_BUTTON_RADIUS = 6;
const TITLE_TEXT_WIDTH = 130;
const PANEL_X_MARGIN = 10;
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
      const pushpinImage = new Image( pushPin_png, {
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
      labelNodes = [ pinnedNodeText, movingNodeText ];
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
          children: [ atomNameTextNodes[ 0 ], new HStrut( strutWidth1 ), atomNameTextNodes[ 1 ], new HStrut( strutWidth2 ) ]
        } );
      };

      const radioButtonGroup = new AquaRadioButtonGroup(
        dualAtomModel.atomPairProperty,
        [
          {
            createNode: () => createLabelNode( neonAndNeonLabelItems ),
            value: AtomPair.NEON_NEON,
            tandemName: 'neonAndNeonRadioButton'
          },
          {
            createNode: () => createLabelNode( argonAndArgonLabelItems ),
            value: AtomPair.ARGON_ARGON,
            tandemName: 'argonAndArgonRadioButton'
          },
          {
            createNode: () => createLabelNode( oxygenAndOxygenLabelItems ),
            value: AtomPair.OXYGEN_OXYGEN,
            tandemName: 'oxygenAndOxygenRadioButton'
          },
          {
            createNode: () => createLabelNode( neonAndArgonLabelItems ),
            value: AtomPair.NEON_ARGON,
            tandemName: 'neonAndArgonRadioButton'
          },
          {
            createNode: () => createLabelNode( neonAndOxygenLabelItems ),
            value: AtomPair.NEON_OXYGEN,
            tandemName: 'neonAndOxygenRadioButton'
          },
          {
            createNode: () => createLabelNode( argonAndOxygenLabelItems ),
            value: AtomPair.ARGON_OXYGEN,
            tandemName: 'argonAndOxygenRadioButton'
          },
          {
            createNode: () => customAttractionLabel,
            value: AtomPair.ADJUSTABLE,
            tandemName: 'adjustableRadioButton'
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
        children: [ titleNode, radioButtonGroup ],
        align: 'left',
        spacing: 5
      } );

      titleNode.align = 'center';
    }
    else {

      // allows the user to choose the type of atom, both atoms will be the same type
      const titleText = new Text( atomsString, {
        font: new PhetFont( 14 ),
        fill: options.panelTextFill,
        maxWidth: TITLE_TEXT_WIDTH,
        tandem: options.tandem.createTandem( 'titleText' )
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
        label: titleText
      };

      // compute the maximum item width
      const widestLabelAndIconSpec = _.maxBy(
        [ neon, argon, adjustableAttraction, labelNodes ],
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
          return new HBox( { children: [ atomSelectorLabelSpec.label, new HStrut( strutWidth ), atomSelectorLabelSpec.icon ] } );
        }
        else {
          return new HBox( { children: [ atomSelectorLabelSpec.label ] } );
        }
      };

      const radioButtonContent = [
        {
          value: AtomPair.NEON_NEON,
          createNode: () => createLabelNode( neon ),
          tandemName: 'neonRadioButton'
        },
        {
          value: AtomPair.ARGON_ARGON,
          createNode: () => createLabelNode( argon ),
          tandemName: 'argonRadioButton'
        },
        {
          value: AtomPair.ADJUSTABLE,
          createNode: () => createLabelNode( adjustableAttraction ),
          tandemName: 'adjustableAttractionRadioButton'
        }
      ];
      const radioButtonGroup = new RectangularRadioButtonGroup( dualAtomModel.atomPairProperty, radioButtonContent, {
        orientation: 'vertical',
        radioButtonOptions: {
          cornerRadius: 5,
          baseColor: 'black',
          buttonAppearanceStrategyOptions: {
            selectedLineWidth: 1,
            selectedStroke: 'white',
            deselectedLineWidth: 0,
            deselectedContentOpacity: 1
          }
        },
        tandem: options.tandem.createTandem( 'radioButtonGroup' )
      } );
      atomPairSelector = radioButtonGroup;

      titleNode = new BackgroundNode( labelNodes.label, {
        yMargin: 1,
        rectangleOptions: {
          fill: SOMColors.backgroundProperty,
          opacity: 1
        }
      } );
    }

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

    const maxTickTextWidth = enableHeterogeneousAtoms ? 85 : 35;
    const tickTextOptions = {
      font: SOMConstants.SLIDER_TICK_TEXT_FONT,
      fill: options.panelTextFill,
      maxWidth: maxTickTextWidth
    };
    const smallText = new Text( smallString, tickTextOptions );
    const largeText = new Text( largeString, tickTextOptions );

    const atomDiameterSlider = new TitledSlider(
      dualAtomModel.adjustableAtomDiameterProperty,
      new Range( SOMConstants.MIN_SIGMA, SOMConstants.MAX_SIGMA ),
      atomDiameterString,
      options.tandem.createTandem( 'atomDiameterSlider' ),
      {
        titleOptions: {
          fill: options.panelTextFill,
          maxWidth: SLIDER_TITLE_MAX_WIDTH
        },
        sliderOptions: commonSliderOptions,
        phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
      }
    );

    if ( enableHeterogeneousAtoms ) {
      atomDiameterSlider.slider.addMajorTick( SOMConstants.MIN_SIGMA );
      atomDiameterSlider.slider.addMajorTick( SOMConstants.MAX_SIGMA );
    }
    else {
      atomDiameterSlider.slider.addMajorTick( SOMConstants.MIN_SIGMA, smallText );
      atomDiameterSlider.slider.addMajorTick( SOMConstants.MAX_SIGMA, largeText );
    }

    // add interaction strength slider
    const interactionStrengthSlider = new TitledSlider(
      dualAtomModel.adjustableAtomInteractionStrengthProperty,
      new Range( SOMConstants.MIN_EPSILON, SOMConstants.MAX_EPSILON ),
      interactionStrengthString,
      options.tandem.createTandem( 'interactionStrengthSlider' ),
      {
        sliderOptions: commonSliderOptions,
        titleOptions: {
          fill: options.panelTextFill,
          maxWidth: SLIDER_TITLE_MAX_WIDTH
        },
        phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
      }
    );
    const weakText = new Text( weakString, tickTextOptions );
    interactionStrengthSlider.slider.addMajorTick( SOMConstants.MIN_EPSILON, weakText );
    const strongText = new Text( strongString, tickTextOptions );
    interactionStrengthSlider.slider.addMajorTick( SOMConstants.MAX_EPSILON, strongText );

    const content = new VBox( {
      align: 'center', children: [ atomPairSelector ],
      spacing: 5
    } );

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
        content.addChild( atomDiameterSlider );
        content.addChild( interactionStrengthSlider );
      }
      else {
        if ( content.hasChild( atomDiameterSlider ) ) {
          content.removeChild( atomDiameterSlider );
        }
        if ( content.hasChild( interactionStrengthSlider ) ) {
          content.removeChild( interactionStrengthSlider );
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

      // Hide the title if all items are removed from the radio button group (which can only be done through phet-io).
      atomPairSelector.localBoundsProperty.link( localBounds => {
        titleNode.visible = !localBounds.equals( Bounds2.NOTHING );
      } );
    }
    this.mutate( options );
  }
}

statesOfMatter.register( 'AtomicInteractionsControlPanel', AtomicInteractionsControlPanel );
export default AtomicInteractionsControlPanel;

