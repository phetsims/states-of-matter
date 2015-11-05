// Copyright 2002-2015, University of Colorado Boulder

/**
 * Control panel used for selecting atom combinations.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var HSlider = require( 'SUN/HSlider' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var AtomPair = require( 'STATES_OF_MATTER/atomic-interactions/model/AtomPair' );

  // images
  var pushPinImg = require( 'image!STATES_OF_MATTER/push-pin.png' );

  // strings
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var oxygenString = require( 'string!STATES_OF_MATTER/oxygen' );
  var adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  var customAttractionString = require( 'string!STATES_OF_MATTER/customAttraction' );
  var atomsString = require( 'string!STATES_OF_MATTER/Atoms' );
  var pinnedString = require( 'string!STATES_OF_MATTER/pinned' );
  var movingString = require( 'string!STATES_OF_MATTER/moving' );
  var atomDiameterString = require( 'string!STATES_OF_MATTER/atomDiameter' );
  var interactionStrengthString = require( 'string!STATES_OF_MATTER/interactionStrength' );
  var smallString = require( 'string!STATES_OF_MATTER/small' );
  var largeString = require( 'string!STATES_OF_MATTER/large' );
  var weakString = require( 'string!STATES_OF_MATTER/weak' );
  var strongString = require( 'string!STATES_OF_MATTER/strong' );

//  Constants

  var SLIDER_TICK_TEXT_MAX_WIDTH = 26;
  var NORMAL_TEXT_FONT_SIZE = 12;
  var TITLE_TEXT_WIDTH = 130;

  // Icon for the adjustable attraction  button
  var ADJUSTABLE_ATTRACTION_ICON = new Circle( 6, { fill: StatesOfMatterConstants.ADJUSTABLE_ATTRACTION_COLOR } );
  // Icon for the neon  button
  var NEON_ICON = new Circle( 5, { fill: StatesOfMatterConstants.NEON_COLOR } );

  // Icon for the argon  button
  var ARGON_ICON = new Circle( 6, { fill: StatesOfMatterConstants.ARGON_COLOR } );


  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {boolean} enableHeterogeneousAtoms - flag for enabling heterogeneous atom combinations
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function AtomicInteractionsControlPanel( dualAtomModel, enableHeterogeneousAtoms, options ) {

    var atomicInteractionsControlPanel = this;
    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#D1D2FF',
      stroke: 'gray',
      tickTextColor: 'black',
      textColor: enableHeterogeneousAtoms ? 'black' : 'white',
      lineWidth: 1,
      backgroundColor: '#D1D2FF',
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );

    //  Atomic controlPanel width in SOM full version and Atomic  sim is different ,
    // so we are using different scale factor values
    var SLIDER_TITTLE_MAX_WIDTH = enableHeterogeneousAtoms ? 170 : 120;
    var NORMAL_TEXT__MAX_WIDTH = enableHeterogeneousAtoms ? 130 : 120;

    // white text within SOM full version  else  black text
    // show white stroke around the atoms & molecules panel within SOM full version  else  show black stroke
    var panelStroke = enableHeterogeneousAtoms ? 'black' : 'white';
    var neonAndNeon;
    var argonAndArgon;
    var oxygenAndOxygen;
    var neonAndArgon;
    var neonAndOxygen;
    var argonAndOxygen;
    var adjustableAttraction;
    var radioButtonGroup;
    var maxWidth;
    var createItem;
    var titleText;
    var titleNode;
    var sliderTrackWidth = 135; // empirically determined

    // convenience function that scales the text node if it is too wide
    var createText = function( string, width, fontSize ) {
      var text = new Text( string, { font: new PhetFont( fontSize ), fill: options.textColor } );
      if ( text.width > width ) {
        text.scale( width / text.width );
      }
      return text;
    };

    // Allows user to select from a fixed list of heterogeneous and
    // homogeneous combinations of atoms.
    if ( enableHeterogeneousAtoms ) {

      neonAndNeon = [ createText( neonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ), createText( neonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ) ];
      argonAndArgon = [ createText( argonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ), createText( argonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ) ];
      oxygenAndOxygen = [ createText( oxygenString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ), createText( oxygenString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ) ];
      neonAndArgon = [ createText( neonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ), createText( argonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ) ];
      neonAndOxygen = [ createText( neonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ), createText( oxygenString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ) ];
      argonAndOxygen = [ createText( argonString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ), createText( oxygenString, NORMAL_TEXT__MAX_WIDTH / 2, NORMAL_TEXT_FONT_SIZE ) ];
      var customAttraction = createText( customAttractionString, NORMAL_TEXT__MAX_WIDTH, NORMAL_TEXT_FONT_SIZE );
      var pushpinImage = new Image( pushPinImg, { scale: 0.15 } );
      var maxWidthOfTitleText = 40;
      var pinnedNodeText = new HBox( {
        children: [ pushpinImage, createText( pinnedString, maxWidthOfTitleText, 10 ), new HStrut( pushpinImage.width ) ],
        spacing: 5
      } );
      titleText = [ pinnedNodeText, createText( movingString, maxWidthOfTitleText, 10 ) ];
      maxWidth = Math.max(
        neonAndArgon[ 0 ].width + neonAndArgon[ 1 ].width,
        argonAndArgon[ 0 ].width + argonAndArgon[ 1 ].width,
        oxygenAndOxygen[ 0 ].width + oxygenAndOxygen[ 1 ].width,
        neonAndNeon[ 0 ].width + neonAndNeon[ 1 ].width,
        neonAndOxygen[ 0 ].width + neonAndOxygen[ 1 ].width );
      maxWidth = 2 * Math.max( titleText[ 0 ].width, titleText[ 1 ].width, maxWidth / 2, sliderTrackWidth / 2 );

      // pad inserts a spacing node (HStrut) so that the rows occupy a certain fixed width.
      createItem = function( itemSpec ) {
        var strutWidth1 = ( maxWidth / 2 - itemSpec[ 0 ].width );
        var strutWidth2 = ( maxWidth / 2 - itemSpec[ 1 ].width );
        return new HBox( {
          children: [ itemSpec[ 0 ], new HStrut( strutWidth1 ),
            itemSpec[ 1 ], new HStrut( strutWidth2 ) ]
        } );
      };
      var particleRadius = 8;
      var neonNeonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_NEON,
        createItem( neonAndNeon ), { radius: particleRadius } );
      var argonArgonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ARGON_ARGON,
        createItem( argonAndArgon ), { radius: particleRadius } );
      var oxygenOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.OXYGEN_OXYGEN,
        createItem( oxygenAndOxygen ), { radius: particleRadius } );
      var neonArgonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_ARGON,
        createItem( neonAndArgon ), { radius: particleRadius } );
      var neonOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_OXYGEN,
        createItem( neonAndOxygen ), { radius: particleRadius } );
      var argonOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ARGON_OXYGEN,
        createItem( argonAndOxygen ), { radius: particleRadius } );
      var adjustableAttractionRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ADJUSTABLE,
        new HBox( { children: [ customAttraction ] } ), { radius: particleRadius } );
      var createTitle = function( itemSpec ) {
        var strutWidth1 = particleRadius;
        var strutWidth2 = ( maxWidth / 2 - itemSpec[ 0 ].width );
        var strutWidth3 = ( maxWidth / 2 - itemSpec[ 1 ].width );
        return new HBox( {
          children: [ new HStrut( strutWidth1 ), itemSpec[ 0 ], new HStrut( strutWidth2 + 9 + particleRadius ),
            itemSpec[ 1 ], new HStrut( strutWidth3 + 10 ) ]
        } );
      };
      titleNode = createTitle( titleText );
      var radioButtons = new VBox( {
        children: [ neonNeonRadio, argonArgonRadio, oxygenOxygenRadio,
          neonArgonRadio, neonOxygenRadio, argonOxygenRadio, adjustableAttractionRadio ],
        align: 'left',
        spacing: 11
      } );
      radioButtonGroup = new VBox( {
        children: [ titleNode, radioButtons ],
        align: 'left',
        spacing: 5
      } );
      var maxRadioButtonWidth = _.max( [ neonNeonRadio, argonArgonRadio, oxygenOxygenRadio, neonArgonRadio,
            neonOxygenRadio, argonOxygenRadio, adjustableAttractionRadio ],
          function( item ) {
            return item.width;
          } ).width + 5;
      titleNode.align = atomicInteractionsControlPanel.width / 2;

      //touch Areas
      var touchExpansionXFactor = 8;
      var touchExpansionYFactor = 4;
      neonNeonRadio.touchArea = neonNeonRadio.localBounds.dilatedXY( touchExpansionXFactor, touchExpansionYFactor );
      argonArgonRadio.touchArea = argonArgonRadio.localBounds.dilatedXY( touchExpansionXFactor, touchExpansionYFactor );
      oxygenOxygenRadio.touchArea = oxygenOxygenRadio.localBounds.dilatedXY( touchExpansionXFactor, touchExpansionYFactor );
      neonArgonRadio.touchArea = neonArgonRadio.localBounds.dilatedXY( touchExpansionXFactor, touchExpansionYFactor );
      neonOxygenRadio.touchArea = neonOxygenRadio.localBounds.dilatedXY( touchExpansionXFactor, touchExpansionYFactor );
      argonOxygenRadio.touchArea = argonOxygenRadio.localBounds.dilatedXY( touchExpansionXFactor, touchExpansionYFactor );
      adjustableAttractionRadio.touchArea = new Bounds2( adjustableAttractionRadio.localBounds.minX - 8, adjustableAttractionRadio.localBounds.minY - 3,
        adjustableAttractionRadio.localBounds.minX + maxRadioButtonWidth + 4, adjustableAttractionRadio.localBounds.maxY + 4 );
    }
    else {

      // allows the user to choose
      // the type of molecule when both are the same.
      var title = new Text( atomsString, { font: new PhetFont( 14 ), fill: '#FFFFFF' } );
      if ( title.width > TITLE_TEXT_WIDTH ) {
        title.scale( TITLE_TEXT_WIDTH / title.width );
      }
      // itemSpec describes the pieces that make up an item in the control panel,
      // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
      var neon = { label: createText( neonString, NORMAL_TEXT__MAX_WIDTH ), icon: NEON_ICON };
      var argon = { label: createText( argonString, NORMAL_TEXT__MAX_WIDTH ), icon: ARGON_ICON };
      adjustableAttraction = {
        label: createText( adjustableAttractionString, NORMAL_TEXT__MAX_WIDTH ),
        icon: ADJUSTABLE_ATTRACTION_ICON
      };
      titleText = {
        label: title
      };

      // compute the maximum item width
      var widestItemSpec = _.max( [ neon, argon, adjustableAttraction, titleText ], function( item ) {
        return item.label.width + ((item.icon) ? item.icon.width : 0);
      } );
      maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);
      maxWidth = Math.max( maxWidth, sliderTrackWidth );
      // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
      createItem = function( itemSpec ) {
        if ( itemSpec.icon ) {
          var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 17;
          return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
        }
        else {
          return new HBox( { children: [ itemSpec.label ] } );
        }
      };

      var radioButtonContent = [
        { value: AtomPair.NEON_NEON, node: createItem( neon ) },
        { value: AtomPair.ARGON_ARGON, node: createItem( argon ) },
        { value: AtomPair.ADJUSTABLE, node: createItem( adjustableAttraction ) }
      ];
      radioButtonGroup = new RadioButtonGroup( dualAtomModel.atomPairProperty, radioButtonContent, {
        orientation: 'vertical',
        cornerRadius: 5,
        baseColor: 'black',
        disabledBaseColor: 'black',
        selectedLineWidth: 1,
        selectedStroke: 'white',
        deselectedLineWidth: 0,
        deselectedContentOpacity: 1
      } );

      var titleBackground = new Rectangle( 0, 0,
        titleText.label.width + 5, titleText.label.height, {
          fill: 'black',
          centerX: titleText.label.centerX,
          centerY: titleText.label.centerY
        } );

      titleNode = new Node( { children: [ titleBackground, titleText.label ] } );
    }

    // add atom diameter slider
    var atomDiameterTitle = new Text( atomDiameterString, {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: options.textColor
    } );

    if ( atomDiameterTitle.width > SLIDER_TITTLE_MAX_WIDTH ) {
      atomDiameterTitle.scale( SLIDER_TITTLE_MAX_WIDTH / atomDiameterTitle.width );
    }

    var atomDiameterSlider = new HSlider( dualAtomModel.atomDiameterProperty,
      { min: StatesOfMatterConstants.MIN_SIGMA, max: StatesOfMatterConstants.MAX_SIGMA },
      {
        trackSize: new Dimension2( sliderTrackWidth, 5 ),
        trackFill: 'white',
        thumbSize: new Dimension2( 14, 25 ),
        majorTickLength: 15,
        majorTickStroke: options.tickTextColor,
        trackStroke: options.tickTextColor,
        startDrag: function() {
          dualAtomModel.setMotionPaused( true );
        },
        endDrag: function() {
          dualAtomModel.setMotionPaused( false );
        }
      } );
    var tickTextOptions = { fill: options.tickTextColor };
    var smallText = new Text( smallString, tickTextOptions );

    if ( smallText.width > SLIDER_TICK_TEXT_MAX_WIDTH ) {
      smallText.scale( SLIDER_TICK_TEXT_MAX_WIDTH / smallText.width );
    }

    var largeText = new Text( largeString, tickTextOptions );
    if ( largeText.width > SLIDER_TICK_TEXT_MAX_WIDTH ) {
      largeText.scale( SLIDER_TICK_TEXT_MAX_WIDTH / largeText.width );
    }

    if ( enableHeterogeneousAtoms ) {
      atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MIN_SIGMA );
      atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MAX_SIGMA );
    }
    else {
      atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MIN_SIGMA, smallText );
      atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MAX_SIGMA, largeText );
    }

    var atomDiameter = new Node( { children: [ atomDiameterTitle, atomDiameterSlider ] } );
    // add interaction strength slider
    var interactionStrengthTitle = new Text( interactionStrengthString, {
      font: new PhetFont( NORMAL_TEXT_FONT_SIZE ),
      fill: options.textColor,
      top: atomDiameterSlider.bottom + 5
    } );
    if ( interactionStrengthTitle.width > SLIDER_TITTLE_MAX_WIDTH ) {
      interactionStrengthTitle.scale( SLIDER_TITTLE_MAX_WIDTH / interactionStrengthTitle.width );
    }
    var interactionStrengthSlider = new HSlider( dualAtomModel.interactionStrengthProperty,
      { min: StatesOfMatterConstants.MIN_EPSILON, max: StatesOfMatterConstants.MAX_EPSILON },
      {
        trackSize: new Dimension2( sliderTrackWidth, 5 ),
        trackFill: 'white',
        thumbSize: new Dimension2( 14, 25 ),
        majorTickLength: 15,
        majorTickStroke: options.tickTextColor,
        trackStroke: options.tickTextColor,
        startDrag: function() {
          dualAtomModel.setMotionPaused( true );
        },
        endDrag: function() {
          dualAtomModel.setMotionPaused( false );
        }
      } );
    var weakText = new Text( weakString, tickTextOptions );
    if ( weakText.width > SLIDER_TICK_TEXT_MAX_WIDTH ) {
      weakText.scale( SLIDER_TICK_TEXT_MAX_WIDTH / weakText.width );
    }
    var strongText = new Text( strongString, tickTextOptions );
    if ( strongText.width > SLIDER_TICK_TEXT_MAX_WIDTH ) {
      strongText.scale( SLIDER_TICK_TEXT_MAX_WIDTH / strongText.width );
    }
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MIN_EPSILON, weakText );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MAX_EPSILON, strongText );
    var interactionStrength = new Node( { children: [ interactionStrengthTitle, interactionStrengthSlider ] } );

    var content = new VBox( {
      align: 'left', children: [ radioButtonGroup ],
      spacing: 5
    } );
    var verticalSpaceOffset = 7;

    var radioButtonPanel = new Panel( content, {
      stroke: panelStroke,
      cornerRadius: 6,
      xMargin: 10,
      lineWidth: options.lineWidth,
      fill: options.backgroundColor
    } );

    // sliders and title adjustments
    atomDiameterTitle.left = content.left;
    atomDiameterSlider.top = atomDiameterTitle.bottom + verticalSpaceOffset;
    atomDiameterSlider.centerX = radioButtonPanel.centerX;
    interactionStrengthTitle.left = content.left;
    interactionStrengthTitle.top = atomDiameterSlider.bottom + verticalSpaceOffset;
    interactionStrengthSlider.top = interactionStrengthTitle.bottom + verticalSpaceOffset;
    interactionStrengthSlider.centerX = radioButtonPanel.centerX;

    // Update the text when the value or units changes.
    dualAtomModel.atomPairProperty.link(
      function( moleculeType ) {
        switch( moleculeType ) {
          case AtomPair.NEON_NEON:
            dualAtomModel.setBothAtomTypes( AtomType.NEON );
            break;

          case AtomPair.ARGON_ARGON:
            dualAtomModel.setBothAtomTypes( AtomType.ARGON );
            break;

          case AtomPair.OXYGEN_OXYGEN:
            dualAtomModel.setBothAtomTypes( AtomType.OXYGEN );
            break;

          case AtomPair.NEON_ARGON:
            dualAtomModel.settingBothAtomTypes = true;
            dualAtomModel.setFixedAtomType( AtomType.NEON );
            dualAtomModel.setMovableAtomType( AtomType.ARGON );
            dualAtomModel.settingBothAtomTypes = false;
            break;

          case AtomPair.NEON_OXYGEN:
            dualAtomModel.settingBothAtomTypes = true;
            dualAtomModel.setFixedAtomType( AtomType.NEON );
            dualAtomModel.setMovableAtomType( AtomType.OXYGEN );
            dualAtomModel.settingBothAtomTypes = false;
            break;

          case AtomPair.ARGON_OXYGEN:
            dualAtomModel.settingBothAtomTypes = true;
            dualAtomModel.setFixedAtomType( AtomType.ARGON );
            dualAtomModel.setMovableAtomType( AtomType.OXYGEN );
            dualAtomModel.settingBothAtomTypes = false;
            break;
        } //end of switch

        if ( moleculeType === AtomPair.ADJUSTABLE ) {
          // add atom diameter slider and interaction
          content.addChild( atomDiameter );
          content.addChild( interactionStrength );
        }
        else {
          //if  atom and interaction slider
          if ( content.isChild( atomDiameter ) ) {
            content.removeChild( atomDiameter );
          }
          if ( content.isChild( interactionStrength ) ) {
            content.removeChild( interactionStrength );
          }
        }
      } );
    this.addChild( radioButtonPanel );
    // add the tittle node after radio button panel added in SOM full version.
    // here around the panel we are drawing a rectangle and on top rectangle added title node
    if ( !enableHeterogeneousAtoms ) {
      this.addChild( titleNode );
      titleNode.centerX = radioButtonGroup.centerX + 5;
    }
    this.mutate( options );
  }

  return inherit( Node, AtomicInteractionsControlPanel );
} );
