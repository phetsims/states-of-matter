// Copyright 2014-2020, University of Colorado Boulder

/**
 * panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco (PhET Interactive Simulations)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import SubstanceType from '../../common/SubstanceType.js';
import AtomAndMoleculeIconFactory from '../../common/view/AtomAndMoleculeIconFactory.js';
import SOMColorProfile from '../../common/view/SOMColorProfile.js';
import SubstanceSelectorNode from '../../common/view/SubstanceSelectorNode.js';
import statesOfMatterStrings from '../../states-of-matter-strings.js';
import statesOfMatter from '../../statesOfMatter.js';

const argonString = statesOfMatterStrings.argon;
const atomsAndMoleculesString = statesOfMatterStrings.AtomsAndMolecules;
const diatomicOxygenString = statesOfMatterStrings.diatomicOxygen;
const neonString = statesOfMatterStrings.neon;
const waterString = statesOfMatterStrings.water;

// constants
const DEFAULT_WIDTH = 160;

/**
 * @param {Property<number>} substanceProperty that tracks the substance selected in the panel
 * @param {Object} [options] for various panel display properties
 * @constructor
 */
function StatesMoleculesControlPanel( substanceProperty, options ) {

  options = merge( {
    xMargin: 5,
    yMargin: 8,
    fill: SOMColorProfile.controlPanelBackgroundProperty,
    stroke: SOMColorProfile.controlPanelStrokeProperty,
    lineWidth: 1,
    cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
    maxWidth: DEFAULT_WIDTH,
    minWidth: DEFAULT_WIDTH,
    tandem: Tandem.REQUIRED
  }, options );

  Node.call( this );
  const maxTextWidth = options.maxWidth * 0.75;
  const textOptions = { font: new PhetFont( 12 ), fill: '#FFFFFF', maxWidth: maxTextWidth };

  // title for the panel
  const title = new Text( atomsAndMoleculesString, {
    font: new PhetFont( 14 ),
    fill: SOMColorProfile.controlPanelTextProperty,
    maxWidth: maxTextWidth,
    tandem: options.tandem.createTandem( 'title' )
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
  const createSelectionNode = function( selectionNodeSpec ) {
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
    { value: SubstanceType.NEON, node: createSelectionNode( neonSelectionNodeSpec ), tandemName: 'neon' },
    { value: SubstanceType.ARGON, node: createSelectionNode( argonSelectionNodeSpec ), tandemName: 'argon' },
    {
      value: SubstanceType.DIATOMIC_OXYGEN,
      node: createSelectionNode( oxygenSelectionNodeSpec ),
      tandemName: 'oxygen'
    },
    { value: SubstanceType.WATER, node: createSelectionNode( waterSelectionNodeSpec ), tandemName: 'water' }
  ];

  const radioButtonGroup = new RadioButtonGroup( substanceProperty, radioButtonContent, {
    orientation: 'vertical',
    cornerRadius: 5,
    baseColor: 'black',
    disabledBaseColor: 'black',
    selectedLineWidth: 1,
    selectedStroke: 'white',
    deselectedLineWidth: 0,
    deselectedContentOpacity: 1,
    tandem: radioButtonGroupTandem
  } );

  SOMColorProfile.controlPanelBackgroundProperty.link( function( color ) {
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
  this.addChild( new Node( { children: [ titleBackground, title ] } ) );

  // closure for updating the title background size and overall position
  const updateTitle = () => {
    titleBackground.rectWidth = title.width + 5;
    titleBackground.rectHeight = title.height;
    titleBackground.centerX = radioButtonPanel.centerX;
    titleBackground.centerY = radioButtonPanel.top;
    title.centerX = titleBackground.centerX;
    title.centerY = titleBackground.centerY;
  };

  // do the initial update of the title
  updateTitle();

  // Listen for changes to the title text node's bounds and update the title when they occur.  There is no need to
  // unlink this since the panel is permanent.
  title.on( 'localBounds', updateTitle );

  this.mutate( options );
}

statesOfMatter.register( 'StatesMoleculesControlPanel', StatesMoleculesControlPanel );

inherit( Node, StatesMoleculesControlPanel );
export default StatesMoleculesControlPanel;