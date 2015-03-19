// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * View for the panel for selecting the atoms/molecules
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HStrut = require( 'SUN/HStrut' );
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

  // strings
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var weakString = require( 'string!STATES_OF_MATTER/weak' );
  var strongString = require( 'string!STATES_OF_MATTER/strong' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var waterString = require( 'string!STATES_OF_MATTER/water' );
  var oxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  var adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  var titleString = require( 'string!STATES_OF_MATTER/AtomsMolecules' );
  var interactionStrengthTitleString = require( 'string!STATES_OF_MATTER/interactionStrengthWithSymbol' );

  // constants
  var inset = 10;
  var MAX_WIDTH = 120;
  var TickTextWidth = 20;
  var NORMAL_TEXT_FONT_SIZE = 12;

  /**
   *
   * @param options
   * @param { MultipleParticleModel } multipleParticleModel - model of the simulation
   * @param {Boolean} isBasicVersion
   * @param {Object} options for various panel display properties
   * @constructor
   */
  function PhaseChangesMoleculesControlPanel( multipleParticleModel, isBasicVersion, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#C8C8C8  ',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var textOptions = { font: new PhetFont( NORMAL_TEXT_FONT_SIZE ), fill: "#FFFFFF" };

    var weakTitle = new Text( weakString, textOptions );
    if ( weakTitle.width > TickTextWidth ) {
      weakTitle.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * TickTextWidth / weakTitle.width ) );
    }
    var strongTitle = new Text( strongString, textOptions );
    if ( strongTitle.width > TickTextWidth ) {
      strongTitle.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * TickTextWidth / strongTitle.width ) );
    }

    // add interaction strength slider and title
    var interactionStrengthNode = new Node();
    var interactionTitle = new Text( interactionStrengthTitleString, textOptions );
    if ( interactionTitle.width > MAX_WIDTH ) {
      interactionTitle.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / interactionTitle.width ) );
    }
    interactionStrengthNode.addChild( interactionTitle );
    var interactionStrengthSlider = new HSlider( multipleParticleModel.interactionStrengthProperty,
      { min: StatesOfMatterConstants.MIN_ADJUSTABLE_EPSILON, max: StatesOfMatterConstants.EPSILON_FOR_WATER },
      {
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
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.EPSILON_FOR_WATER, strongTitle );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MIN_ADJUSTABLE_EPSILON, weakTitle );


    var neonText = new Text( neonString, textOptions );
    if ( neonText.width > MAX_WIDTH ) {
      neonText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / neonText.width ) );
    }
    var argonText = new Text( argonString, textOptions );
    if ( argonText.width > MAX_WIDTH ) {
      argonText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / argonText.width ) );
    }
    var waterText = new Text( waterString, textOptions );
    if ( waterText.width > MAX_WIDTH ) {
      waterText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / waterText.width ) );
    }
    var oxygenText = new Text( oxygenString, textOptions );
    if ( oxygenText.width > MAX_WIDTH ) {
      oxygenText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / oxygenText.width ) );
    }
    var adjustableAttractionText = new Text( adjustableAttractionString, textOptions );
    if ( adjustableAttractionText.width > MAX_WIDTH ) {
      adjustableAttractionText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / adjustableAttractionText.width ) );
    }
    var title = new Text( titleString, {
      font: new PhetFont( 14 ),
      fill: '#FFFFFF'
    } );
    if ( title.width > MAX_WIDTH ) {
      title.setFont( new PhetFont( 14 * MAX_WIDTH / title.width ) );
    }

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var neon = { label: neonText, icon: createNeonIcon() };
    var argon = { label: argonText, icon: createArgonIcon() };
    var water = { label: waterText, icon: createWaterIcon() };
    var oxygen = { label: oxygenText, icon: createOxygenIcon() };
    var adjustableAttraction = {
      label: adjustableAttractionText,
      icon: createAdjustableAttractionIcon()
    };
    var titleText = {
      label: title
    };

    // compute the maximum item width
    var widestItemSpec = _.max( [ neon, argon, water, oxygen, adjustableAttraction, titleText ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);
    maxWidth = Math.max( maxWidth, interactionStrengthNode.width - 5 );
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
      deselectedContentOpacity: 1
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
      minWidth: 160
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
        if ( content.isChild( interactionStrengthNode ) ) {
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

  //Create an icon for the adjustable attraction  button
  var createAdjustableAttractionIcon = function() {
    return new Circle( 6, { fill: StatesOfMatterConstants.ADJUSTABLE_ATTRACTION_COLOR } );
  };

  //Create an icon for the neon  button
  var createNeonIcon = function() {
    return new Circle( 5, { fill: StatesOfMatterConstants.NEON_COLOR } );
  };

  //Create an icon for the argon  button
  var createArgonIcon = function() {
    return new Circle( 6, { fill: StatesOfMatterConstants.ARGON_COLOR } );
  };

  //Create an icon for the water  button
  var createWaterIcon = function() {
    var dot1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
    var dot2 = new Circle( 3, {
      fill: StatesOfMatterConstants.HYDROGEN_COLOR,
      stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: dot1.top + 5, right: dot1.left + 5
    } );
    var dot3 = new Circle( 3, {
      fill: StatesOfMatterConstants.HYDROGEN_COLOR,
      stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: dot1.top + 5, left: dot1.right - 5
    } );

    return new Node( { children: [ dot3, dot1, dot2 ] } );

  };

  //Create an icon for the oxygen  button
  var createOxygenIcon = function() {
    var dot1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
    var dot2 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR, left: dot1.right - 4 } );
    return new Node( { children: [ dot1, dot2 ] } );
  };


  return inherit( Node, PhaseChangesMoleculesControlPanel );
} );
