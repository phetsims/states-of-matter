// Copyright 2014-2023, University of Colorado Boulder

/**
 * panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import AtomAndMoleculeIconFactory from '../../common/view/AtomAndMoleculeIconFactory.js';
import SOMColors from '../../common/view/SOMColors.js';
import SubstanceSelectorNode from '../../common/view/SubstanceSelectorNode.js';
import TitledSlider from '../../common/view/TitledSlider.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import PhaseChangesModel from '../PhaseChangesModel.js';

// strings
const adjustableAttractionString = StatesOfMatterStrings.adjustableAttraction;
const argonString = StatesOfMatterStrings.argon;
const atomsAndMoleculesString = StatesOfMatterStrings.AtomsAndMolecules;
const diatomicOxygenString = StatesOfMatterStrings.diatomicOxygen;
const interactionStrengthWithSymbolString = StatesOfMatterStrings.interactionStrengthWithSymbol;
const neonString = StatesOfMatterStrings.neon;
const strongString = StatesOfMatterStrings.strong;
const waterString = StatesOfMatterStrings.water;
const weakString = StatesOfMatterStrings.weak;

// constants
const INSET = 10;
const TICK_TEXT_MAX_WIDTH = 40;
const NORMAL_TEXT_FONT_SIZE = 12;

class PhaseChangesMoleculesControlPanel extends Node {

  /**
   * @param { PhaseChangesModel } phaseChangesModel - model of the simulation
   * @param {Object} [options] options for various panel display properties
   */
  constructor( phaseChangesModel, options ) {

    options = merge( {
      showAdjustableAttraction: false,
      xMargin: 5,
      yMargin: 5,
      fill: SOMColors.controlPanelBackgroundProperty,
      stroke: SOMColors.controlPanelStrokeProperty,
      lineWidth: 1,
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      minWidth: 120, // somewhat arbitrary, will generally be set by constructor
      tandem: Tandem.REQUIRED
    }, options );

    const selectorWidth = options.minWidth - 2 * options.xMargin;

    super();

    const tickTextOptions = {
      font: SOMConstants.SLIDER_TICK_TEXT_FONT,
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: TICK_TEXT_MAX_WIDTH
    };

    const weakTitle = new Text( weakString, tickTextOptions );
    const strongTitle = new Text( strongString, tickTextOptions );

    // slider (with a title) that can be used to control the interaction strength of the adjustable attraction atoms
    const interactionStrengthSliderVbox = new TitledSlider(
      phaseChangesModel.adjustableAtomInteractionStrengthProperty,
      new Range( SOMConstants.MIN_ADJUSTABLE_EPSILON, PhaseChangesModel.MAX_ADJUSTABLE_EPSILON ),
      interactionStrengthWithSymbolString,
      options.tandem.createTandem( 'interactionStrengthSlider' ),
      {
        sliderOptions: merge(
          {},
          SOMConstants.ADJUSTABLE_ATTRACTION_SLIDER_COMMON_OPTIONS,
          { trackSize: new Dimension2( 110, 4 ) }
        ),
        titleOptions: {
          fill: SOMColors.controlPanelTextProperty,
          maxWidth: 140
        },
        phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
      }
    );
    interactionStrengthSliderVbox.slider.addMajorTick( PhaseChangesModel.MAX_ADJUSTABLE_EPSILON, strongTitle );
    interactionStrengthSliderVbox.slider.addMajorTick( SOMConstants.MIN_ADJUSTABLE_EPSILON, weakTitle );

    // pre-create the tandem for the radio button group so that the text nodes can be under it
    const radioButtonGroupTandem = options.tandem.createTandem( 'radioButtonGroup' );

    // text for the radio buttons
    const textOptions = {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: '#FFFFFF',
      maxWidth: selectorWidth * 0.75
    };
    const neonText = new Text(
      neonString,
      merge( { tandem: radioButtonGroupTandem.createTandem( 'neonText' ) }, textOptions )
    );
    const argonText = new Text(
      argonString,
      merge( { tandem: radioButtonGroupTandem.createTandem( 'argonText' ) }, textOptions )
    );
    const waterText = new Text(
      waterString,
      merge( { tandem: radioButtonGroupTandem.createTandem( 'waterText' ) }, textOptions )
    );
    const oxygenText = new Text(
      diatomicOxygenString,
      merge( { tandem: radioButtonGroupTandem.createTandem( 'oxygenText' ) }, textOptions )
    );
    const adjustableAttractionText = new Text(
      adjustableAttractionString,
      merge( { tandem: radioButtonGroupTandem.createTandem( 'adjustableAttractionText' ) }, textOptions )
    );

    // create objects that describe the pieces that make up a selector item in the control panel, conforms to the
    // contract: { label: {Node}, icon: {Node} (optional) }
    const neonSelectorInfo = { label: neonText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.NEON ) };
    const argonSelectorInfo = { label: argonText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ARGON ) };
    const waterSelectorInfo = { label: waterText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.WATER ) };
    const oxygenSelectorInfo = {
      label: oxygenText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.DIATOMIC_OXYGEN )
    };
    const adjustableAttractionSelectorInfo = {
      label: adjustableAttractionText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ADJUSTABLE_ATOM )
    };

    const radioButtonContent = [
      {
        value: SubstanceType.NEON,
        createNode: () => new SubstanceSelectorNode( neonSelectorInfo.label, neonSelectorInfo.icon, selectorWidth ),
        tandemName: 'neonRadioButton'
      },
      {
        value: SubstanceType.ARGON,
        createNode: () => new SubstanceSelectorNode( argonSelectorInfo.label, argonSelectorInfo.icon, selectorWidth ),
        tandemName: 'argonRadioButton'
      },
      {
        value: SubstanceType.DIATOMIC_OXYGEN,
        createNode: () => new SubstanceSelectorNode( oxygenSelectorInfo.label, oxygenSelectorInfo.icon, selectorWidth ),
        tandemName: 'oxygenRadioButton'
      },
      {
        value: SubstanceType.WATER,
        createNode: () => new SubstanceSelectorNode( waterSelectorInfo.label, waterSelectorInfo.icon, selectorWidth ),
        tandemName: 'waterRadioButton'
      }
    ];

    if ( options.showAdjustableAttraction ) {
      radioButtonContent.push( {
          value: SubstanceType.ADJUSTABLE_ATOM,
          createNode: () => new SubstanceSelectorNode(
            adjustableAttractionSelectorInfo.label,
            adjustableAttractionSelectorInfo.icon,
            selectorWidth
          ),
          tandemName: 'adjustableAttractionRadioButton'
        }
      );
    }

    const radioButtonGroup = new RectangularRadioButtonGroup( phaseChangesModel.substanceProperty, radioButtonContent, {
      orientation: 'vertical',
      spacing: 3,
      touchAreaYDilation: 0,
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
      tandem: radioButtonGroupTandem
    } );

    phaseChangesModel.adjustableAtomInteractionStrengthProperty.link( value => {
      if ( phaseChangesModel.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM ) {
        phaseChangesModel.setEpsilon( value );
      }
    } );
    const content = new VBox( { spacing: 4, children: [ radioButtonGroup ] } );
    const radioButtonPanel = new Panel( content, {
      yMargin: 8,
      stroke: options.stroke,
      align: 'center',
      fill: options.fill,
      cornerRadius: options.cornerRadius,
      minWidth: options.minWidth,
      lineWidth: options.lineWidth
    } );
    this.addChild( radioButtonPanel );

    // do some layout now that many of the pieces exist
    interactionStrengthSliderVbox.centerX = radioButtonGroup.centerX;
    interactionStrengthSliderVbox.top = radioButtonGroup.bottom + INSET;

    // make any updates needed to the panel when the selected substance changes
    phaseChangesModel.substanceProperty.link( value => {

      // add or remove the node for controlling interaction strength
      if ( value === SubstanceType.ADJUSTABLE_ATOM ) {
        content.addChild( interactionStrengthSliderVbox );
      }
      else if ( content.hasChild( interactionStrengthSliderVbox ) ) {
        content.removeChild( interactionStrengthSliderVbox );
      }
    } );

    // title for the panel
    const titleText = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: options.minWidth * 0.85,
      tandem: options.tandem.createTandem( 'titleText' )
    } );

    // create the background for the title - initial size is arbitrary, it will be sized and positioned below
    const titleBackground = new Rectangle( 0, 0, 1, 1, { fill: options.fill } );
    this.addChild( new Node( { children: [ titleBackground, titleText ] } ) );

    // closure for updating the title background size and overall position
    const updateTitle = () => {
      if ( radioButtonPanel.bounds.equals( Bounds2.NOTHING ) ) {
        titleBackground.visible = false;
        titleText.visible = false;
      }
      else {
        titleBackground.rectWidth = titleText.width + 5;
        titleBackground.rectHeight = titleText.height;
        titleBackground.centerX = radioButtonPanel.centerX;
        titleBackground.centerY = radioButtonPanel.top;
        titleText.centerX = titleBackground.centerX;
        titleText.centerY = titleBackground.centerY;
        titleBackground.visible = true;
        titleText.visible = true;
      }
    };

    // do the initial update of the title
    updateTitle();

    // Listen for changes to the title text node's bounds and update the title when they occur.  There is no need to
    // unlink this since the panel is permanent.
    titleText.localBoundsProperty.lazyLink( updateTitle );

    // Listen for changes to the panel bounds and update the title.
    radioButtonPanel.localBoundsProperty.link( updateTitle );

    this.mutate( options );
  }
}

statesOfMatter.register( 'PhaseChangesMoleculesControlPanel', PhaseChangesMoleculesControlPanel );
export default PhaseChangesMoleculesControlPanel;