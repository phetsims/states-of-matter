// Copyright 2014-2020, University of Colorado Boulder

/**
 * panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AtomAndMoleculeIconFactory = require( 'STATES_OF_MATTER/common/view/AtomAndMoleculeIconFactory' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const argonString = require( 'string!STATES_OF_MATTER/argon' );
  const atomsAndMoleculesString = require( 'string!STATES_OF_MATTER/AtomsAndMolecules' );
  const diatomicOxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  const neonString = require( 'string!STATES_OF_MATTER/neon' );
  const waterString = require( 'string!STATES_OF_MATTER/water' );

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
    const tandem = options.tandem;

    const neonText = new Text(
      neonString,
      merge( { tandem: tandem.createTandem( 'neonText' ) }, textOptions )
    );
    const argonText = new Text(
      argonString,
      merge( { tandem: tandem.createTandem( 'argonText' ) }, textOptions )
    );
    const waterText = new Text(
      waterString,
      merge( { tandem: tandem.createTandem( 'waterText' ) }, textOptions )
    );
    const oxygenText = new Text(
      diatomicOxygenString,
      merge( { tandem: tandem.createTandem( 'oxygenText' ) }, textOptions )
    );
    const title = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: maxTextWidth,
      tandem: options.tandem.createTandem( 'title' )
    } );

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
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.DIATOMIC_OXYGEN ),
      tandem: tandem.createTandem( 'oxygenSelectionNode' )
    };

    const selectorWidth = options.minWidth - 2 * options.xMargin;

    // function to create a node with text and an icon for selection a substance
    const createSelectionNode = function( selectionNodeSpec ) {
      if ( selectionNodeSpec.icon ) {
        const strutWidth = selectorWidth - selectionNodeSpec.label.width - selectionNodeSpec.icon.width;
        return new HBox( {
          children: [ selectionNodeSpec.label, new HStrut( strutWidth ), selectionNodeSpec.icon ]
        } );
      }
      else {
        return new HBox( {
          children: [ selectionNodeSpec.label ]
        } );
      }
    };

    const radioButtonContent = [
      { value: SubstanceType.NEON, node: createSelectionNode( neonSelectionNodeSpec ), tandemName: 'neonSelector' },
      { value: SubstanceType.ARGON, node: createSelectionNode( argonSelectionNodeSpec ), tandemName: 'argonSelector' },
      {
        value: SubstanceType.DIATOMIC_OXYGEN,
        node: createSelectionNode( oxygenSelectionNodeSpec ),
        tandemName: 'oxygenSelector'
      },
      { value: SubstanceType.WATER, node: createSelectionNode( waterSelectionNodeSpec ), tandemName: 'waterSelector' }
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
      tandem: options.tandem.createTandem( 'radioButtonGroup' )
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

  return inherit( Node, StatesMoleculesControlPanel );
} );
