// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomAndMoleculeIconFactory = require( 'STATES_OF_MATTER/common/view/AtomAndMoleculeIconFactory' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterColorProfile = require( 'STATES_OF_MATTER/common/view/StatesOfMatterColorProfile' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var waterString = require( 'string!STATES_OF_MATTER/water' );
  var diatomicOxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  var atomsAndMoleculesString = require( 'string!STATES_OF_MATTER/AtomsAndMolecules' );

  // constants
  var DEFAULT_WIDTH = 160;

  /**
   * @param {Property<number>} substanceProperty that tracks the substance selected in the panel
   * @param {Object} [options] for various panel display properties
   * @constructor
   */
  function StatesMoleculesControlPanel( substanceProperty, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: StatesOfMatterColorProfile.controlPanelBackgroundProperty,
      stroke: StatesOfMatterColorProfile.controlPanelStrokeProperty,
      lineWidth: 1,
      cornerRadius: StatesOfMatterConstants.PANEL_CORNER_RADIUS,
      maxWidth: DEFAULT_WIDTH,
      minWidth: DEFAULT_WIDTH
    }, options );

    Node.call( this );
    var maxTextWidth = options.maxWidth * 0.75;
    var textOptions = { font: new PhetFont( 12 ), fill: '#FFFFFF', maxWidth: maxTextWidth };

    var neonText = new Text( neonString, textOptions );
    var argonText = new Text( argonString, textOptions );
    var waterText = new Text( waterString, textOptions );
    var oxygenText = new Text( diatomicOxygenString, textOptions );
    var title = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: StatesOfMatterColorProfile.controlPanelTextProperty,
      maxWidth: maxTextWidth
    } );

    // create objects that describe the pieces that make up an item in the control panel, conforms to the contract:
    // { label: {Node}, icon: {Node} }
    var neon = { label: neonText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.NEON ) };
    var argon = { label: argonText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ARGON ) };
    var water = { label: waterText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.WATER ) };
    var oxygen = { label: oxygenText, icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.DIATOMIC_OXYGEN ) };

    var titleText = {
      label: title
    };

    var selectorWidth = options.minWidth - 2 * options.xMargin;

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createLabelAndIconNode = function( labelAndIconSpec ) {
      if ( labelAndIconSpec.icon ) {
        var strutWidth = selectorWidth - labelAndIconSpec.label.width - labelAndIconSpec.icon.width;
        return new HBox( { children: [ labelAndIconSpec.label, new HStrut( strutWidth ), labelAndIconSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ labelAndIconSpec.label ] } );
      }
    };

    var radioButtonContent = [
      { value: SubstanceType.NEON, node: createLabelAndIconNode( neon ) },
      { value: SubstanceType.ARGON, node: createLabelAndIconNode( argon ) },
      { value: SubstanceType.DIATOMIC_OXYGEN, node: createLabelAndIconNode( oxygen ) },
      { value: SubstanceType.WATER, node: createLabelAndIconNode( water ) }
    ];

    var radioButtonGroup = new RadioButtonGroup( substanceProperty, radioButtonContent, {
      orientation: 'vertical',
      cornerRadius: 5,
      baseColor: 'black',
      disabledBaseColor: 'black',
      selectedLineWidth: 1,
      selectedStroke: 'white',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1
    } );

    StatesOfMatterColorProfile.controlPanelBackgroundProperty.link( function( color ){
      radioButtonGroup.baseColor = color;
    } );

    var radioButtonPanel = new Panel( radioButtonGroup, {
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

    var titleBackground = new Rectangle( 0, 0, titleText.label.width + 5, titleText.label.height, {
      fill: options.fill
    } );
    titleBackground.centerX = radioButtonPanel.centerX;
    titleBackground.centerY = radioButtonPanel.top;
    titleText.label.centerX = titleBackground.centerX;
    titleText.label.centerY = titleBackground.centerY;
    var tittleNode = new Node( { children: [ titleBackground, titleText.label ] } );
    this.addChild( tittleNode );

    this.mutate( options );
  }

  statesOfMatter.register( 'StatesMoleculesControlPanel', StatesMoleculesControlPanel );

  return inherit( Node, StatesMoleculesControlPanel );
} );
