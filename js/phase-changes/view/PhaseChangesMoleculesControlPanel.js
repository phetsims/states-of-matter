// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the panel for selecting the atoms/molecules
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var HSlider = require( 'SUN/HSlider' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // strings
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var weakString = require( 'string!STATES_OF_MATTER/weak' );
  var strongString = require( 'string!STATES_OF_MATTER/strong' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var waterString = require( 'string!STATES_OF_MATTER/water' );
  var diatomicOxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  var adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  var atomsAndMoleculesString = require( 'string!STATES_OF_MATTER/AtomsAndMolecules' );
  var interactionStrengthWithSymbolString = require( 'string!STATES_OF_MATTER/interactionStrengthWithSymbol' );

  // constants
  var inset = 10;
  var MAX_WIDTH = 120;
  var TICK_TEXT_MAX_WIDTH = 40;
  var NORMAL_TEXT_FONT_SIZE = 12;

  // icon for the adjustable attraction button
  var ADJUSTABLE_ATTRACTION_ICON = new Circle( 6, { fill: StatesOfMatterConstants.ADJUSTABLE_ATTRACTION_COLOR } );

  // icon for the neon button
  var NEON_ICON = new Circle( 5, { fill: StatesOfMatterConstants.NEON_COLOR } );

  // icon for the argon button
  var ARGON_ICON = new Circle( 6, { fill: StatesOfMatterConstants.ARGON_COLOR } );

  // icon for the water button
  var dot1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
  var dot2 = new Circle( 3, {
    fill: StatesOfMatterConstants.HYDROGEN_COLOR,
    stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: dot1.top + 5, right: dot1.left + 5
  } );
  var dot3 = new Circle( 3, {
    fill: StatesOfMatterConstants.HYDROGEN_COLOR,
    stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: dot1.top + 5, left: dot1.right - 5
  } );
  var WATER_ICON = new Node( { children: [ dot3, dot1, dot2 ] } );

  // icon for the oxygen button
  var oxygen1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
  var oxygen2 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR, left: oxygen1.right - 4 } );
  var OXYGEN_ICON = new Node( { children: [ oxygen1, oxygen2 ] } );

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
      fill: '#C8C8C8  ',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5, // radius of the rounded corners on the background
      minWidth: 0
    }, options );

    Node.call( this );
    var textOptions = { font: new PhetFont( NORMAL_TEXT_FONT_SIZE ), fill: '#FFFFFF', maxWidth: MAX_WIDTH };
    var tickTextOptions = { font: new PhetFont( NORMAL_TEXT_FONT_SIZE ), fill: '#FFFFFF', maxWidth: TICK_TEXT_MAX_WIDTH };

    var weakTitle = new Text( weakString, tickTextOptions );

    var strongTitle = new Text( strongString, tickTextOptions );

    // add interaction strength slider and title
    var interactionStrengthNode = new Node();
    var interactionTitle = new Text( interactionStrengthWithSymbolString, {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: '#FFFFFF',
      maxWidth: 140
    } );

    interactionStrengthNode.addChild( interactionTitle );
    var interactionStrengthSlider = new HSlider(
      multipleParticleModel.interactionStrengthProperty, {
        min: StatesOfMatterConstants.MIN_ADJUSTABLE_EPSILON, max: multipleParticleModel.MAX_ADJUSTABLE_EPSILON
      }, {
        trackFill: 'white',
        thumbSize: new Dimension2( 14, 25 ),
        majorTickLength: 15,
        minorTickLength: 12,
        trackSize: new Dimension2( 110, 4 ),
        trackStroke: 'white',
        trackLineWidth: 1,
        thumbLineWidth: 1,
        tickLabelSpacing: 6,
        majorTickStroke: 'white',
        majorTickLineWidth: 1,
        minorTickStroke: 'white',
        minorTickLineWidth: 1,

        cursor: 'pointer'

      } );
    interactionStrengthNode.addChild( interactionStrengthSlider );
    interactionStrengthSlider.addMajorTick( multipleParticleModel.MAX_ADJUSTABLE_EPSILON, strongTitle );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MIN_ADJUSTABLE_EPSILON, weakTitle );

    var neonText = new Text( neonString, textOptions );
    var argonText = new Text( argonString, textOptions );
    var waterText = new Text( waterString, textOptions );
    var oxygenText = new Text( diatomicOxygenString, textOptions );
    var adjustableAttractionText = new Text( adjustableAttractionString, textOptions );
    var title = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: '#FFFFFF',
      maxWidth: MAX_WIDTH
    } );

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var neon = { label: neonText, icon: NEON_ICON };
    var argon = { label: argonText, icon: ARGON_ICON };
    var water = { label: waterText, icon: WATER_ICON };
    var oxygen = { label: oxygenText, icon: OXYGEN_ICON };
    var adjustableAttraction = {
      label: adjustableAttractionText,
      icon: ADJUSTABLE_ATTRACTION_ICON
    };
    var titleText = {
      label: title
    };

    // compute the maximum item width
    var widestItemSpec = _.max( [ neon, argon, water, oxygen, adjustableAttraction, titleText ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);
    maxWidth = Math.max( maxWidth, interactionStrengthNode.width );

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 12;
        return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };
    var radioButtonContent;
    if ( !isBasicVersion ) {
      radioButtonContent = [
        { value: StatesOfMatterConstants.NEON, node: createItem( neon ) },
        { value: StatesOfMatterConstants.ARGON, node: createItem( argon ) },
        { value: StatesOfMatterConstants.DIATOMIC_OXYGEN, node: createItem( oxygen ) },
        { value: StatesOfMatterConstants.WATER, node: createItem( water ) }
      ];
    }
    else {
      radioButtonContent = [
        { value: StatesOfMatterConstants.NEON, node: createItem( neon ) },
        { value: StatesOfMatterConstants.ARGON, node: createItem( argon ) },
        { value: StatesOfMatterConstants.DIATOMIC_OXYGEN, node: createItem( oxygen ) },
        { value: StatesOfMatterConstants.WATER, node: createItem( water ) },
        { value: StatesOfMatterConstants.USER_DEFINED_MOLECULE, node: createItem( adjustableAttraction ) }
      ];
    }

    var radioButtonGroup = new RadioButtonGroup( multipleParticleModel.moleculeTypeProperty, radioButtonContent, {
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
      if ( multipleParticleModel.currentMolecule === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        multipleParticleModel.setEpsilon( value );
      }
    } );
    var content = new VBox( { spacing: 4, children: [ radioButtonGroup ] } );
    var radioButtonPanel = new Panel( content, {
      yMargin: 10,
      stroke: 'white',
      align: 'center',
      fill: 'black',
      minWidth: options.minWidth
    } );
    interactionTitle.bottom = interactionStrengthSlider.top - 5;
    interactionTitle.centerX = interactionStrengthSlider.centerX;
    interactionStrengthNode.centerX = radioButtonGroup.centerX;
    interactionStrengthNode.top = radioButtonGroup.bottom + inset;

    multipleParticleModel.moleculeTypeProperty.link( function( value ) {
      multipleParticleModel.temperatureSetPointProperty._notifyObservers();

      // adjust the control panel border when adjustable attraction selected or deselect
      if ( value === StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
        content.addChild( interactionStrengthNode );
      }
      else {
        if ( content.hasChild( interactionStrengthNode ) ) {
          content.removeChild( interactionStrengthNode );
        }
      }
    } );
    var titleBackground = new Rectangle( 0, 0,
      titleText.label.width + 5, titleText.label.height, {
        fill: 'black'
      } );
    titleBackground.centerX = radioButtonPanel.centerX;
    titleBackground.centerY = radioButtonPanel.top;
    titleText.label.centerX = titleBackground.centerX;
    titleText.label.centerY = titleBackground.centerY;

    this.addChild( radioButtonPanel );
    //add the title node
    this.addChild( new Node( { children: [ titleBackground, titleText.label ] } ) );
    this.mutate( options );
  }

  statesOfMatter.register( 'PhaseChangesMoleculesControlPanel', PhaseChangesMoleculesControlPanel );

  return inherit( Node, PhaseChangesMoleculesControlPanel );
} );
