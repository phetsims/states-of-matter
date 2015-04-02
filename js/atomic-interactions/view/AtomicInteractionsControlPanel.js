// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * View for the panel used for selecting the atoms/molecules
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SUN/HStrut' );
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
  var titleString = require( 'string!STATES_OF_MATTER/AtomsMolecules' );
  var pinnedString = require( 'string!STATES_OF_MATTER/pinned' );
  var movingString = require( 'string!STATES_OF_MATTER/moving' );
  var atomDiameterString = require( 'string!STATES_OF_MATTER/atomDiameter' );
  var interactionStrengthString = require( 'string!STATES_OF_MATTER/interactionStrength' );
  var smallString = require( 'string!STATES_OF_MATTER/small' );
  var largeString = require( 'string!STATES_OF_MATTER/large' );
  var weakString = require( 'string!STATES_OF_MATTER/weak' );
  var strongString = require( 'string!STATES_OF_MATTER/strong' );

  var MAX_WIDTH = 130;
  var TickTextWidth = 26;
  var NORMAL_TEXT_FONT_SIZE = 12;

  /**
   *
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {Boolean} enableHeterogeneousMolecules - true to use a enable heterogeneous molecules , false if not.
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function AtomicInteractionsControlPanel( dualAtomModel, enableHeterogeneousMolecules, options ) {

    var atomicInteractionsControlPanel = this;
    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#D1D2FF',
      stroke: 'gray',
      tickTextColor: 'black',
      textColor: enableHeterogeneousMolecules ? 'black' : 'white',
      lineWidth: 1,
      backgroundColor: '#D1D2FF',
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var textOptions;
    // show white stroke around the atoms & molecules panel within SOM  full version  else  show black stroke
    var panelStroke = enableHeterogeneousMolecules ? 'black' : 'white';
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
    var sliderTrackWidth;
    sliderTrackWidth = 140;
    textOptions = { font: new PhetFont( NORMAL_TEXT_FONT_SIZE ), fill: options.textColor };
    var createText = function( string, width ) {
      var text = new Text( string, textOptions );
      if ( text.width > width ) {
        text.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * width / text.width ) );
      }
      return text;
    };
    if ( enableHeterogeneousMolecules ) {

      neonAndNeon = [ createText( neonString, MAX_WIDTH / 2 ), createText( neonString, MAX_WIDTH / 2 ) ];
      argonAndArgon = [ createText( argonString, MAX_WIDTH / 2 ), createText( argonString, MAX_WIDTH / 2 ) ];
      oxygenAndOxygen = [ createText( oxygenString, MAX_WIDTH / 2 ), createText( oxygenString, MAX_WIDTH / 2 ) ];
      neonAndArgon = [ createText( neonString, MAX_WIDTH / 2 ), createText( argonString, MAX_WIDTH / 2 ) ];
      neonAndOxygen = [ createText( neonString, MAX_WIDTH / 2 ), createText( oxygenString, MAX_WIDTH / 2 ) ];
      argonAndOxygen = [ createText( argonString, MAX_WIDTH / 2 ), createText( oxygenString, MAX_WIDTH / 2 ) ];
      var customAttraction = createText( customAttractionString, MAX_WIDTH );
      var pushpinImage = new Image( pushPinImg, { scale: 0.15 } );
      var createTitleText = function( string, width, fontSize ) {
        var text = new Text( string, { font: new PhetFont( fontSize ), fill: options.textColor } );
        if ( text.width > width ) {
          text.setFont( new PhetFont( fontSize * width / text.width ) );
        }
        return text;
      };
      var maxWidthOfTitleText = 40;
      var pinnedNodeText = new HBox( {
        children: [ pushpinImage, createTitleText( pinnedString, maxWidthOfTitleText, 10 ), new HStrut( pushpinImage.width ) ],
        spacing: 5
      } );
      titleText = [ pinnedNodeText, createTitleText( movingString, maxWidthOfTitleText, 10 ) ];
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
        spacing: 8
      } );
      radioButtonGroup = new VBox( {
        children: [ titleNode, radioButtons ],
        align: 'left',
        spacing: 1
      } );
      var maxRadioButtonWidth = _.max( [ neonNeonRadio, argonArgonRadio, oxygenOxygenRadio, neonArgonRadio,
            neonOxygenRadio, argonOxygenRadio, adjustableAttractionRadio ],
          function( item ) {
            return item.width;
          } ).width + 5;
      titleNode.align = atomicInteractionsControlPanel.width / 2;
      //touch Areas
      neonNeonRadio.touchArea = new Bounds2( neonNeonRadio.localBounds.minX - 5, neonNeonRadio.localBounds.minY,
        neonNeonRadio.localBounds.minX + maxRadioButtonWidth, neonNeonRadio.localBounds.maxY );
      argonArgonRadio.touchArea = new Bounds2( argonArgonRadio.localBounds.minX - 5, argonArgonRadio.localBounds.minY,
        argonArgonRadio.localBounds.minX + maxRadioButtonWidth, argonArgonRadio.localBounds.maxY );
      oxygenOxygenRadio.touchArea = new Bounds2( oxygenOxygenRadio.localBounds.minX - 5, oxygenOxygenRadio.localBounds.minY,
        oxygenOxygenRadio.localBounds.minX + maxRadioButtonWidth, oxygenOxygenRadio.localBounds.maxY );
      neonArgonRadio.touchArea = new Bounds2( neonArgonRadio.localBounds.minX - 5,
        neonArgonRadio.localBounds.minY,
        neonArgonRadio.localBounds.minX + maxRadioButtonWidth, neonArgonRadio.localBounds.maxY );
      neonOxygenRadio.touchArea = new Bounds2( neonOxygenRadio.localBounds.minX - 5, neonOxygenRadio.localBounds.minY,
        neonOxygenRadio.localBounds.minX + maxRadioButtonWidth, neonOxygenRadio.localBounds.maxY );
      argonOxygenRadio.touchArea = new Bounds2( argonOxygenRadio.localBounds.minX - 5,
        argonOxygenRadio.localBounds.minY,
        argonOxygenRadio.localBounds.minX + maxRadioButtonWidth, argonOxygenRadio.localBounds.maxY );
      adjustableAttractionRadio.touchArea = new Bounds2( adjustableAttractionRadio.localBounds.minX - 5, adjustableAttractionRadio.localBounds.minY,
        adjustableAttractionRadio.localBounds.minX + maxRadioButtonWidth, adjustableAttractionRadio.localBounds.maxY );
    }

    else {
      var title = new Text( titleString, {
        font: new PhetFont( 14 ),
        fill: '#FFFFFF'
      } );
      if ( title.width > 150 ) {
        title.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * 150 / title.width ) );
      }
      // itemSpec describes the pieces that make up an item in the control panel,
      // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
      var neon = { label: createText( neonString, MAX_WIDTH ), icon: createNeonIcon() };
      var argon = { label: createText( argonString, MAX_WIDTH ), icon: createArgonIcon() };
      adjustableAttraction = {
        label: createText( adjustableAttractionString, MAX_WIDTH ),
        icon: createAdjustableAttractionIcon()
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
    if ( atomDiameterTitle.width > MAX_WIDTH ) {
      atomDiameterTitle.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / atomDiameterTitle.width ) );
    }
    dualAtomModel.atomDiameterProperty.value = dualAtomModel.getSigma();
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
    if ( smallText.width > TickTextWidth ) {
      smallText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * TickTextWidth / smallText.width ) );
    }
    var largeText = new Text( largeString, tickTextOptions );
    if ( largeText.width > TickTextWidth ) {
      largeText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * TickTextWidth / largeText.width ) );
    }

    if ( enableHeterogeneousMolecules ) {
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
    if ( interactionStrengthTitle.width > MAX_WIDTH ) {
      interactionStrengthTitle.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * MAX_WIDTH / interactionStrengthTitle.width ) );
    }
    dualAtomModel.interactionStrength = dualAtomModel.getEpsilon();
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
    if ( weakText.width > TickTextWidth ) {
      weakText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * TickTextWidth / weakText.width ) );
    }
    var strongText = new Text( strongString, tickTextOptions );
    if ( strongText.width > TickTextWidth ) {
      strongText.setFont( new PhetFont( NORMAL_TEXT_FONT_SIZE * TickTextWidth / strongText.width ) );
    }
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MIN_EPSILON, weakText );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MAX_EPSILON, strongText );
    var interactionStrength = new Node( { children: [ interactionStrengthTitle, interactionStrengthSlider ] } );

    var content = new VBox( {
      align: 'left', children: [ radioButtonGroup ]
    } );
    var verticalSpaceOffset = 3;

    var radioButtonPanel = new Panel( content, {
      stroke: panelStroke,
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
    if ( !enableHeterogeneousMolecules ) {
      this.addChild( titleNode );
      titleNode.centerX = radioButtonGroup.centerX + 5;
    }
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

  return inherit( Node, AtomicInteractionsControlPanel );
} );
