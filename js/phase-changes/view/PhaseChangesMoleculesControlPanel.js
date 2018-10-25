// Copyright 2014-2017, University of Colorado Boulder

/**
 * panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomAndMoleculeIconFactory = require( 'STATES_OF_MATTER/common/view/AtomAndMoleculeIconFactory' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/common/model/MultipleParticleModel' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var atomsAndMoleculesString = require( 'string!STATES_OF_MATTER/AtomsAndMolecules' );
  var diatomicOxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  var interactionStrengthWithSymbolString = require( 'string!STATES_OF_MATTER/interactionStrengthWithSymbol' );
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var strongString = require( 'string!STATES_OF_MATTER/strong' );
  var waterString = require( 'string!STATES_OF_MATTER/water' );
  var weakString = require( 'string!STATES_OF_MATTER/weak' );

  // constants
  var INSET = 10;
  var TICK_TEXT_MAX_WIDTH = 40;
  var NORMAL_TEXT_FONT_SIZE = 12;

  /**
   * @param { MultipleParticleModel } multipleParticleModel - model of the simulation
   * @param {boolean} isBasicVersion
   * @param {Object} [options] options for various panel display properties
   * @constructor
   */
  function PhaseChangesMoleculesControlPanel( multipleParticleModel, isBasicVersion, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 5,
      fill: SOMColorProfile.controlPanelBackgroundProperty,
      stroke: SOMColorProfile.controlPanelStrokeProperty,
      lineWidth: 1,
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      minWidth: 120 // somewhat arbitrary, will generally be set by constructor
    }, options );

    var selectorWidth = options.minWidth - 2 * options.xMargin;

    Node.call( this );
    var textOptions = { font: new PhetFont( NORMAL_TEXT_FONT_SIZE ), fill: '#FFFFFF', maxWidth: selectorWidth * 0.75 };
    var tickTextOptions = {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: TICK_TEXT_MAX_WIDTH
    };

    var weakTitle = new Text( weakString, tickTextOptions );
    var strongTitle = new Text( strongString, tickTextOptions );

    // add interaction strength slider and title
    var interactionStrengthNode = new Node();
    var interactionTitle = new Text( interactionStrengthWithSymbolString, {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: 140
    } );

    interactionStrengthNode.addChild( interactionTitle );
    var interactionStrengthSlider = new HSlider(
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

    var neonText = new Text( neonString, textOptions );
    var argonText = new Text( argonString, textOptions );
    var waterText = new Text( waterString, textOptions );
    var oxygenText = new Text( diatomicOxygenString, textOptions );
    var adjustableAttractionText = new Text( adjustableAttractionString, textOptions );
    var titleText = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: options.minWidth * 0.85
    } );

    // create objects that describe the pieces that make up a selector item in the control panel, conforms to the
    // contract: { label: {Node}, icon: {Node} (optional) }
    var neonSelectorInfo = { label: neonText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.NEON ) };
    var argonSelectorInfo = { label: argonText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ARGON ) };
    var waterSelectorInfo = { label: waterText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.WATER ) };
    var oxygenSelectorInfo = {
      label: oxygenText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.DIATOMIC_OXYGEN )
    };
    var adjustableAttractionSelectorInfo = {
      label: adjustableAttractionText,
      icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ADJUSTABLE_ATOM )
    };

    // function that creates the selector nodes, which have a label and an icon with a space between
    function createLabelAndIconNode( labelAndIconSpec ) {
      var strutWidth = selectorWidth - labelAndIconSpec.label.width - labelAndIconSpec.icon.width;
      return new HBox( { children: [ labelAndIconSpec.label, new HStrut( strutWidth ), labelAndIconSpec.icon ] } );
    }

    var radioButtonContent;
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

    var radioButtonGroup = new RadioButtonGroup( multipleParticleModel.substanceProperty, radioButtonContent, {
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
    var content = new VBox( { spacing: 4, children: [ radioButtonGroup ] } );
    var radioButtonPanel = new Panel( content, {
      yMargin: 8,
      stroke: options.stroke,
      align: 'center',
      fill: options.fill,
      cornerRadius: options.cornerRadius,
      minWidth: options.minWidth,
      lineWidth: options.lineWidth
    } );
    interactionTitle.bottom = interactionStrengthSlider.top - 5;
    interactionTitle.centerX = interactionStrengthSlider.centerX;
    interactionStrengthNode.centerX = radioButtonGroup.centerX;
    interactionStrengthNode.top = radioButtonGroup.bottom + INSET;

    multipleParticleModel.substanceProperty.link( function( value ) {

      // adjust the control panel border when adjustable attraction selected or deselect
      if ( value === SubstanceType.ADJUSTABLE_ATOM ) {
        content.addChild( interactionStrengthNode );
      }
      else {
        if ( content.hasChild( interactionStrengthNode ) ) {
          content.removeChild( interactionStrengthNode );
        }
      }
    } );
    var titleBackground = new Rectangle( 0, 0, titleText.width + 5, titleText.height, {
      fill: SOMColorProfile.controlPanelBackgroundProperty
    } );
    titleBackground.centerX = radioButtonPanel.centerX;
    titleBackground.centerY = radioButtonPanel.top;
    titleText.centerX = titleBackground.centerX;
    titleText.centerY = titleBackground.centerY;

    this.addChild( radioButtonPanel );
    //add the title node
    this.addChild( new Node( { children: [ titleBackground, titleText ] } ) );
    this.mutate( options );
  }

  statesOfMatter.register( 'PhaseChangesMoleculesControlPanel', PhaseChangesMoleculesControlPanel );

  return inherit( Node, PhaseChangesMoleculesControlPanel );
} );
