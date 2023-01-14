// Copyright 2014-2023, University of Colorado Boulder

/**
 * panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import AtomAndMoleculeIconFactory from '../../common/view/AtomAndMoleculeIconFactory.js';
import SOMColors from '../../common/view/SOMColors.js';
import SubstanceSelectorNode from '../../common/view/SubstanceSelectorNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';

const argonString = StatesOfMatterStrings.argon;
const atomsAndMoleculesString = StatesOfMatterStrings.AtomsAndMolecules;
const diatomicOxygenString = StatesOfMatterStrings.diatomicOxygen;
const neonString = StatesOfMatterStrings.neon;
const waterString = StatesOfMatterStrings.water;

// constants
const DEFAULT_WIDTH = 160;

class StatesMoleculesControlPanel extends Node {

  /**
   * @param {Property.<number>} substanceProperty that tracks the substance selected in the panel
   * @param {Object} [options] for various panel display properties
   */
  constructor( substanceProperty, options ) {

    options = merge( {
      xMargin: 5,
      yMargin: 8,
      fill: SOMColors.controlPanelBackgroundProperty,
      stroke: SOMColors.controlPanelStrokeProperty,
      lineWidth: 1,
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      maxWidth: DEFAULT_WIDTH,
      minWidth: DEFAULT_WIDTH,
      tandem: Tandem.REQUIRED
    }, options );

    super();
    const maxTextWidth = options.maxWidth * 0.75;
    const textOptions = { font: new PhetFont( 12 ), fill: '#FFFFFF', maxWidth: maxTextWidth };

    // title for the panel
    const titleText = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: maxTextWidth,
      tandem: options.tandem.createTandem( 'titleText' )
    } );

    // pre-create the tandem for the radio button group so that the text nodes can be under it
    const radioButtonGroupTandem = options.tandem.createTandem( 'radioButtonGroup' );

    // text nodes that will be used on the radio buttons
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

    // create objects that describe the pieces that make up an item in the control panel, conforms to the contract:
    // { label: {Node}, icon: {Node}, tandem: {Tandem} }
    const neonSelectionNodeSpec = {
      label: neonText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.NEON )
    };
    const argonSelectionNodeSpec = {
      label: argonText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ARGON )
    };
    const waterSelectionNodeSpec = {
      label: waterText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.WATER )
    };
    const oxygenSelectionNodeSpec = {
      label: oxygenText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.DIATOMIC_OXYGEN )
    };

    const selectorWidth = options.minWidth - 2 * options.xMargin;

    // function to create the selector nodes that will go into the radio button group
    const createSelectionNode = selectionNodeSpec => {
      if ( selectionNodeSpec.icon ) {
        return new SubstanceSelectorNode( selectionNodeSpec.label, selectionNodeSpec.icon, selectorWidth );
      }
      else {
        return new HBox( {
          children: [ selectionNodeSpec.label ]
        } );
      }
    };

    const radioButtonContent = [
      { value: SubstanceType.NEON, createNode: () => createSelectionNode( neonSelectionNodeSpec ), tandemName: 'neonRadioButton' },
      { value: SubstanceType.ARGON, createNode: () => createSelectionNode( argonSelectionNodeSpec ), tandemName: 'argonRadioButton' },
      {
        value: SubstanceType.DIATOMIC_OXYGEN,
        createNode: () => createSelectionNode( oxygenSelectionNodeSpec ),
        tandemName: 'oxygenRadioButton'
      },
      { value: SubstanceType.WATER, createNode: () => createSelectionNode( waterSelectionNodeSpec ), tandemName: 'waterRadioButton' }
    ];

    const radioButtonGroup = new RectangularRadioButtonGroup( substanceProperty, radioButtonContent, {
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
      tandem: radioButtonGroupTandem
    } );

    SOMColors.controlPanelBackgroundProperty.link( color => {
      radioButtonGroup.baseColor = color;
    } );

    const radioButtonPanel = new Panel( radioButtonGroup, {
      yMargin: 10,
      stroke: options.stroke,
      align: 'center',
      lineWidth: options.lineWidth,
      cornerRadius: options.cornerRadius,
      fill: options.fill,
      minWidth: options.minWidth,
      maxWidth: options.maxWidth
    } );
    this.addChild( radioButtonPanel );

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

statesOfMatter.register( 'StatesMoleculesControlPanel', StatesMoleculesControlPanel );
export default StatesMoleculesControlPanel;