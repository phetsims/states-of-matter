// Copyright 2014-2020, University of Colorado Boulder

/**
 * panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const AtomAndMoleculeIconFactory = require( 'STATES_OF_MATTER/common/view/AtomAndMoleculeIconFactory' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HSlider = require( 'SUN/HSlider' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  const argonString = require( 'string!STATES_OF_MATTER/argon' );
  const atomsAndMoleculesString = require( 'string!STATES_OF_MATTER/AtomsAndMolecules' );
  const diatomicOxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  const interactionStrengthWithSymbolString = require( 'string!STATES_OF_MATTER/interactionStrengthWithSymbol' );
  const neonString = require( 'string!STATES_OF_MATTER/neon' );
  const strongString = require( 'string!STATES_OF_MATTER/strong' );
  const waterString = require( 'string!STATES_OF_MATTER/water' );
  const weakString = require( 'string!STATES_OF_MATTER/weak' );

  // constants
  const INSET = 10;
  const TICK_TEXT_MAX_WIDTH = 40;
  const NORMAL_TEXT_FONT_SIZE = 12;

  /**
   * @param { MultipleParticleModel } multipleParticleModel - model of the simulation
   * @param {boolean} isBasicVersion
   * @param {Object} [options] options for various panel display properties
   * @constructor
   */
  function PhaseChangesMoleculesControlPanel( multipleParticleModel, isBasicVersion, options ) {

    options = merge( {
      xMargin: 5,
      yMargin: 5,
      fill: SOMColorProfile.controlPanelBackgroundProperty,
      stroke: SOMColorProfile.controlPanelStrokeProperty,
      lineWidth: 1,
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      minWidth: 120, // somewhat arbitrary, will generally be set by constructor
      tandem: Tandem.REQUIRED
    }, options );

    const selectorWidth = options.minWidth - 2 * options.xMargin;

    Node.call( this );
    const textOptions = {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: '#FFFFFF',
      maxWidth: selectorWidth * 0.75
    };
    const tickTextOptions = {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: TICK_TEXT_MAX_WIDTH
    };

    const weakTitle = new Text( weakString, tickTextOptions );
    const strongTitle = new Text( strongString, tickTextOptions );

    // add interaction strength slider and title
    const interactionStrengthNode = new Node();
    const interactionTitle = new Text( interactionStrengthWithSymbolString, {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: 140
    } );

    interactionStrengthNode.addChild( interactionTitle );
    const interactionStrengthSlider = new HSlider(
      multipleParticleModel.interactionStrengthProperty,
      new Range( SOMConstants.MIN_ADJUSTABLE_EPSILON, MultipleParticleModel.MAX_ADJUSTABLE_EPSILON ), {
        trackFill: 'white',
        thumbSize: new Dimension2( 14, 25 ),
        majorTickLength: 15,
        minorTickLength: 12,
        trackSize: new Dimension2( 110, 4 ),
        trackStroke: SOMColorProfile.controlPanelTextProperty,
        trackLineWidth: 1,
        thumbLineWidth: 1,
        thumbTouchAreaXDilation: 8,
        thumbTouchAreaYDilation: 8,
        tickLabelSpacing: 6,
        majorTickStroke: SOMColorProfile.controlPanelTextProperty,
        majorTickLineWidth: 1,
        minorTickStroke: SOMColorProfile.controlPanelTextProperty,
        minorTickLineWidth: 1,
        cursor: 'pointer'
      } );
    interactionStrengthNode.addChild( interactionStrengthSlider );
    interactionStrengthSlider.addMajorTick( MultipleParticleModel.MAX_ADJUSTABLE_EPSILON, strongTitle );
    interactionStrengthSlider.addMajorTick( SOMConstants.MIN_ADJUSTABLE_EPSILON, weakTitle );

    const neonText = new Text( neonString, textOptions );
    const argonText = new Text( argonString, textOptions );
    const waterText = new Text( waterString, textOptions );
    const oxygenText = new Text( diatomicOxygenString, textOptions );
    const adjustableAttractionText = new Text( adjustableAttractionString, textOptions );
    const title = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: options.minWidth * 0.85,
      tandem: options.tandem.createTandem( 'title' )
    } );

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

    // function that creates the selector nodes, which have a label and an icon with a space between
    function createLabelAndIconNode( labelAndIconSpec ) {
      const strutWidth = selectorWidth - labelAndIconSpec.label.width - labelAndIconSpec.icon.width;
      return new HBox( { children: [ labelAndIconSpec.label, new HStrut( strutWidth ), labelAndIconSpec.icon ] } );
    }

    let radioButtonContent;
    if ( !isBasicVersion ) {
      radioButtonContent = [
        { value: SubstanceType.NEON, node: createLabelAndIconNode( neonSelectorInfo ) },
        { value: SubstanceType.ARGON, node: createLabelAndIconNode( argonSelectorInfo ) },
        { value: SubstanceType.DIATOMIC_OXYGEN, node: createLabelAndIconNode( oxygenSelectorInfo ) },
        { value: SubstanceType.WATER, node: createLabelAndIconNode( waterSelectorInfo ) }
      ];
    }
    else {
      radioButtonContent = [
        { value: SubstanceType.NEON, node: createLabelAndIconNode( neonSelectorInfo ) },
        { value: SubstanceType.ARGON, node: createLabelAndIconNode( argonSelectorInfo ) },
        { value: SubstanceType.DIATOMIC_OXYGEN, node: createLabelAndIconNode( oxygenSelectorInfo ) },
        { value: SubstanceType.WATER, node: createLabelAndIconNode( waterSelectorInfo ) },
        { value: SubstanceType.ADJUSTABLE_ATOM, node: createLabelAndIconNode( adjustableAttractionSelectorInfo ) }
      ];
    }

    const radioButtonGroup = new RadioButtonGroup( multipleParticleModel.substanceProperty, radioButtonContent, {
      orientation: 'vertical',
      spacing: 3,
      cornerRadius: 5,
      baseColor: 'black',
      disabledBaseColor: 'black',
      selectedLineWidth: 1,
      selectedStroke: 'white',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1,
      touchAreaYDilation: 0
    } );

    multipleParticleModel.interactionStrengthProperty.link( function( value ) {
      if ( multipleParticleModel.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM ) {
        multipleParticleModel.setEpsilon( value );
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
    interactionStrengthNode.centerX = radioButtonGroup.centerX;
    interactionStrengthNode.top = radioButtonGroup.bottom + INSET;

    // make any updates needed to the panel when the selected substance changes
    multipleParticleModel.substanceProperty.link( function( value ) {

      // add or remove the node for controlling interaction strength
      if ( value === SubstanceType.ADJUSTABLE_ATOM ) {
        content.addChild( interactionStrengthNode );
      }
      else if ( content.hasChild( interactionStrengthNode ) ) {
        content.removeChild( interactionStrengthNode );
      }
    } );

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

  statesOfMatter.register( 'PhaseChangesMoleculesControlPanel', PhaseChangesMoleculesControlPanel );

  return inherit( Node, PhaseChangesMoleculesControlPanel );
} );
