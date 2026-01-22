// Copyright 2015-2016, University of Colorado Boulder

/**
 * Control panel used for selecting atom combinations.
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomAndMoleculeIconFactory = require( 'STATES_OF_MATTER/common/view/AtomAndMoleculeIconFactory' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var AtomPair = require( 'STATES_OF_MATTER/atomic-interactions/model/AtomPair' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

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

  // constants
  var NORMAL_TEXT_FONT = new PhetFont( 12 );
  var RADIO_BUTTON_RADIUS = 6;
  var SLIDER_TICK_TEXT_MAX_WIDTH = 35;
  var TITLE_TEXT_WIDTH = 130;
  var PANEL_X_MARGIN = 10;

  /**
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {boolean} enableHeterogeneousAtoms - flag for enabling heterogeneous atom combinations
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function AtomicInteractionsControlPanel( dualAtomModel, enableHeterogeneousAtoms, options ) {

    var self = this;
    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: 'black',
      stroke: 'white',
      panelTextFill: 'white',
      tickTextColor: 'black',
      buttonTextFill: enableHeterogeneousAtoms ? 'black' : 'white',
      lineWidth: 1,
      cornerRadius: StatesOfMatterConstants.PANEL_CORNER_RADIUS,
      minWidth: 0
    }, options );

    Node.call( this );

    // This control panel width differs between SOM full version and the Atomic Interactions sim, so we are using
    // different max width values.  These were empirically determined.
    var SLIDER_TITTLE_MAX_WIDTH = enableHeterogeneousAtoms ? 170 : 120;
    var NORMAL_TEXT_MAX_WIDTH = enableHeterogeneousAtoms ? 130 : 120;

    // white text within SOM full version, black text in Atomic Interactions
    // white stroke around the atoms & molecules panel within SOM full version, black stroke in Atomic Interactions
    var neonAndNeon;
    var argonAndArgon;
    var oxygenAndOxygen;
    var neonAndArgon;
    var neonAndOxygen;
    var argonAndOxygen;
    var adjustableAttraction;
    var radioButtonGroup;
    var maxLabelWidth;
    var createLabelNode;
    var titleText;
    var titleNode;
    var sliderTrackWidth = 140; // empirically determined

    // common options for radio button labels
    var labelTextOptions = {
      font: NORMAL_TEXT_FONT,
      fill: options.buttonTextFill,
      maxWidth: NORMAL_TEXT_MAX_WIDTH / 2
    };

    // allows user to select from a fixed list of heterogeneous and homogeneous combinations of atoms
    if ( enableHeterogeneousAtoms ) {
      neonAndNeon = [
        new Text( neonString, labelTextOptions ),
        new Text( neonString, labelTextOptions )
      ];
      argonAndArgon = [
        new Text( argonString, labelTextOptions ),
        new Text( argonString, labelTextOptions )
      ];
      oxygenAndOxygen = [
        new Text( oxygenString, labelTextOptions ),
        new Text( oxygenString, labelTextOptions )
      ];
      neonAndArgon = [
        new Text( neonString, labelTextOptions ),
        new Text( argonString, labelTextOptions )
      ];
      neonAndOxygen = [
        new Text( neonString, labelTextOptions ),
        new Text( oxygenString, labelTextOptions )
      ];
      argonAndOxygen = [
        new Text( argonString, labelTextOptions ),
        new Text( oxygenString, labelTextOptions )
      ];
      var customAttraction = new Text( customAttractionString, {
        font: NORMAL_TEXT_FONT,
        fill: options.buttonTextFill,
        maxWidth: NORMAL_TEXT_MAX_WIDTH
      } );
      var pushpinImage = new Image( pushPinImg );
      pushpinImage.scale( 15 / pushpinImage.height );
      var maxWidthOfTitleText = 40; // empirically determined
      var pinnedNodeText = new HBox( {
        children: [
          pushpinImage,
          new Text( pinnedString, { font: new PhetFont( 10 ), maxWidth: maxWidthOfTitleText } ),
          new HStrut( pushpinImage.width )
        ],
        spacing: 5
      } );
      titleText = [ pinnedNodeText, new Text( movingString, {
        font: new PhetFont( 10 ),
        maxWidth: maxWidthOfTitleText
      } ) ];
      maxLabelWidth = Math.max(
        neonAndArgon[ 0 ].width + neonAndArgon[ 1 ].width,
        argonAndArgon[ 0 ].width + argonAndArgon[ 1 ].width,
        oxygenAndOxygen[ 0 ].width + oxygenAndOxygen[ 1 ].width,
        neonAndNeon[ 0 ].width + neonAndNeon[ 1 ].width,
        neonAndOxygen[ 0 ].width + neonAndOxygen[ 1 ].width );
      maxLabelWidth = 2 * Math.max( titleText[ 0 ].width, titleText[ 1 ].width, maxLabelWidth / 2, sliderTrackWidth / 2 );

      // function to create a label node from
      createLabelNode = function( atomNameTextNodes ) {
        var strutWidth1 = ( maxLabelWidth / 2 - atomNameTextNodes[ 0 ].width );
        var strutWidth2 = ( maxLabelWidth / 2 - atomNameTextNodes[ 1 ].width );
        return new HBox( {
          children: [ atomNameTextNodes[ 0 ], new HStrut( strutWidth1 ), atomNameTextNodes[ 1 ], new HStrut( strutWidth2 ) ]
        } );
      };

      var neonNeonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_NEON,
        createLabelNode( neonAndNeon ), { radius: RADIO_BUTTON_RADIUS } );
      var argonArgonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ARGON_ARGON,
        createLabelNode( argonAndArgon ), { radius: RADIO_BUTTON_RADIUS } );
      var oxygenOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.OXYGEN_OXYGEN,
        createLabelNode( oxygenAndOxygen ), { radius: RADIO_BUTTON_RADIUS } );
      var neonArgonRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_ARGON,
        createLabelNode( neonAndArgon ), { radius: RADIO_BUTTON_RADIUS } );
      var neonOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.NEON_OXYGEN,
        createLabelNode( neonAndOxygen ), { radius: RADIO_BUTTON_RADIUS } );
      var argonOxygenRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ARGON_OXYGEN,
        createLabelNode( argonAndOxygen ), { radius: RADIO_BUTTON_RADIUS } );
      var adjustableAttractionRadio = new AquaRadioButton( dualAtomModel.atomPairProperty, AtomPair.ADJUSTABLE,
        new HBox( { children: [ customAttraction ] } ), { radius: RADIO_BUTTON_RADIUS } );
      var createTitle = function( labelNodePair ) {
        var strutWidth1 = RADIO_BUTTON_RADIUS;
        var strutWidth2 = ( maxLabelWidth / 2 - labelNodePair[ 0 ].width );
        var strutWidth3 = ( maxLabelWidth / 2 - labelNodePair[ 1 ].width );
        return new HBox( {
          children: [
            new HStrut( strutWidth1 ),
            labelNodePair[ 0 ],
            new HStrut( strutWidth2 + 9 + RADIO_BUTTON_RADIUS ),
            labelNodePair[ 1 ],
            new HStrut( strutWidth3 + 10 )
          ]
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
      titleNode.align = self.width / 2;

      // dilate the touch areas to make the buttons easier to work with on touch-based devices
      var xDilation = 8;
      var yDilation = 5;
      neonNeonRadio.touchArea = neonNeonRadio.localBounds.dilatedXY( xDilation, yDilation );
      argonArgonRadio.touchArea = argonArgonRadio.localBounds.dilatedXY( xDilation, yDilation );
      oxygenOxygenRadio.touchArea = oxygenOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
      neonArgonRadio.touchArea = neonArgonRadio.localBounds.dilatedXY( xDilation, yDilation );
      neonOxygenRadio.touchArea = neonOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
      argonOxygenRadio.touchArea = argonOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
      adjustableAttractionRadio.touchArea = argonOxygenRadio.localBounds.dilatedXY( xDilation, yDilation );
    }
    else {

      // allows the user to choose the type of atom when both are the same
      var title = new Text( atomsString, {
        font: new PhetFont( 14 ),
        fill: options.panelTextFill,
        maxWidth: TITLE_TEXT_WIDTH
      } );

      // Set up objects that describe the pieces that make up a selector item in the control panel, conforms to the
      // contract: { label: {Node}, icon: {Node} }
      var neon = {
        label: new Text( neonString, labelTextOptions ),
        icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.NEON )
      };
      var argon = {
        label: new Text( argonString, labelTextOptions ),
        icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ARGON )
      };
      adjustableAttraction = {
        label: new Text( adjustableAttractionString, {
          font: NORMAL_TEXT_FONT,
          fill: options.buttonTextFill,
          maxWidth: NORMAL_TEXT_MAX_WIDTH
        } ),
        icon: AtomAndMoleculeIconFactory.createIcon( SubstanceType.ADJUSTABLE_ATOM )
      };
      titleText = {
        label: title
      };

      // compute the maximum item width
      var widestLabelAndIconSpec = _.max( [ neon, argon, adjustableAttraction, titleText ], function( item ) {
        return item.label.width + ( ( item.icon ) ? item.icon.width : 0 );
      } );
      maxLabelWidth = widestLabelAndIconSpec.label.width + ( ( widestLabelAndIconSpec.icon ) ? widestLabelAndIconSpec.icon.width : 0 );
      maxLabelWidth = Math.max( maxLabelWidth, sliderTrackWidth );

      // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
      createLabelNode = function( atomSelectorLabelSpec ) {
        if ( atomSelectorLabelSpec.icon ) {
          var strutWidth = maxLabelWidth - atomSelectorLabelSpec.label.width - atomSelectorLabelSpec.icon.width + 17;
          return new HBox( { children: [ atomSelectorLabelSpec.label, new HStrut( strutWidth ), atomSelectorLabelSpec.icon ] } );
        }
        else {
          return new HBox( { children: [ atomSelectorLabelSpec.label ] } );
        }
      };

      var radioButtonContent = [
        { value: AtomPair.NEON_NEON, node: createLabelNode( neon ) },
        { value: AtomPair.ARGON_ARGON, node: createLabelNode( argon ) },
        { value: AtomPair.ADJUSTABLE, node: createLabelNode( adjustableAttraction ) }
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

      var titleBackground = new Rectangle( 0, 0, titleText.label.width + 5, titleText.label.height, {
        fill: options.fill,
        centerX: titleText.label.centerX,
        centerY: titleText.label.centerY
      } );

      titleNode = new Node( { children: [ titleBackground, titleText.label ] } );
    }

    // add atom diameter slider
    var atomDiameterTitle = new Text( atomDiameterString, {
      font: NORMAL_TEXT_FONT,
      fill: options.panelTextFill,
      maxWidth: SLIDER_TITTLE_MAX_WIDTH
    } );

    var sliderOptions = {
      trackSize: new Dimension2( sliderTrackWidth, 5 ),
      trackFill: 'white',
      thumbSize: new Dimension2( 14, 25 ),
      thumbFillEnabled: '#A670DB',
      thumbFillHighlighted: '#D966FF',
      thumbCenterLineStroke: 'black',
      thumbTouchAreaXDilation: 8,
      thumbTouchAreaYDilation: 8,
      majorTickLength: 15,
      majorTickStroke: options.panelTextFill,
      trackStroke: options.panelTextFill,
      startDrag: function() {
        dualAtomModel.setMotionPaused( true );
      },
      endDrag: function() {
        dualAtomModel.setMotionPaused( false );
      }
    };

    var atomDiameterSlider = new HSlider(
      dualAtomModel.atomDiameterProperty,
      { min: StatesOfMatterConstants.MIN_SIGMA, max: StatesOfMatterConstants.MAX_SIGMA },
      sliderOptions
    );

    var tickTextOptions = { fill: options.panelTextFill, maxWidth: SLIDER_TICK_TEXT_MAX_WIDTH };
    var smallText = new Text( smallString, tickTextOptions );
    var largeText = new Text( largeString, tickTextOptions );

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
      font: NORMAL_TEXT_FONT,
      fill: options.panelTextFill,
      top: atomDiameterSlider.bottom + 5,
      maxWidth: SLIDER_TITTLE_MAX_WIDTH
    } );
    var interactionStrengthSlider = new HSlider(
      dualAtomModel.interactionStrengthProperty,
      { min: StatesOfMatterConstants.MIN_EPSILON, max: StatesOfMatterConstants.MAX_EPSILON },
      sliderOptions
    );
    var weakText = new Text( weakString, tickTextOptions );
    var strongText = new Text( strongString, tickTextOptions );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MIN_EPSILON, weakText );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MAX_EPSILON, strongText );
    var interactionStrength = new Node( { children: [ interactionStrengthTitle, interactionStrengthSlider ] } );

    var content = new VBox( {
      align: 'left', children: [ radioButtonGroup ],
      spacing: 5
    } );
    var verticalSpaceOffset = 7;

    // sliders and title adjustments
    atomDiameterSlider.top = atomDiameterTitle.bottom + verticalSpaceOffset;
    atomDiameterSlider.centerX = radioButtonGroup.centerX;
    interactionStrengthTitle.top = atomDiameterSlider.bottom + verticalSpaceOffset;
    interactionStrengthSlider.top = interactionStrengthTitle.bottom + verticalSpaceOffset;
    interactionStrengthSlider.centerX = radioButtonGroup.centerX;

    var radioButtonPanel = new Panel( content, {
      stroke: options.stroke,
      cornerRadius: options.cornerRadius,
      lineWidth: options.lineWidth,
      fill: options.fill,
      xMargin: PANEL_X_MARGIN,
      minWidth: options.minWidth,
      align: 'center'
    } );
    this.addChild( radioButtonPanel );

    // hide or show the controls for handling the adjustable atom based on the atom pair setting
    dualAtomModel.atomPairProperty.link( function( atomPair ) {
      if ( atomPair === AtomPair.ADJUSTABLE ) {
        content.addChild( atomDiameter );
        content.addChild( interactionStrength );
      }
      else {
        if ( content.hasChild( atomDiameter ) ) {
          content.removeChild( atomDiameter );
        }
        if ( content.hasChild( interactionStrength ) ) {
          content.removeChild( interactionStrength );
        }
      }
    } );

    // Add the tittle node after radio button panel added in SOM full version.  Here around the panel we are drawing a
    // rectangle and on top rectangle added title node.
    if ( !enableHeterogeneousAtoms ) {
      this.addChild( titleNode );
      titleNode.centerX = radioButtonGroup.centerX + 5;
    }
    this.mutate( options );
  }

  statesOfMatter.register( 'AtomicInteractionsControlPanel', AtomicInteractionsControlPanel );

  return inherit( Node, AtomicInteractionsControlPanel );
} );
