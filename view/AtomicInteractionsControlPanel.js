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
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // images
  var pushPinImg = require( 'image!ATOMIC_INTERACTIONS/push-pin.png' );

  // strings
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var oxygenString = require( 'string!STATES_OF_MATTER/oxygen' );
  var adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  var customAttractionString = require( 'string!ATOMIC_INTERACTIONS/customAttraction' );
  var tittleString = require( 'string!STATES_OF_MATTER/AtomsMolecules' );
  var pinnedString = require( 'string!ATOMIC_INTERACTIONS/pinned' );
  var movingString = require( 'string!ATOMIC_INTERACTIONS/moving' );
  var atomDiameterString = require( 'string!ATOMIC_INTERACTIONS/atomDiameter' );
  var interactionStrengthString = require( 'string!ATOMIC_INTERACTIONS/interactionStrength' );
  var smallString = require( 'string!ATOMIC_INTERACTIONS/small' );
  var largeString = require( 'string!ATOMIC_INTERACTIONS/large' );
  var weakString = require( 'string!ATOMIC_INTERACTIONS/weak' );
  var strongString = require( 'string!ATOMIC_INTERACTIONS/strong' );

  var NEON_NEON = 'NEON_NEON';
  var ARGON_ARGON = 'ARGON_ARGON';
  var OXYGEN_OXYGEN = 'OXYGEN_OXYGEN';
  var NEON_ARGON = 'NEON_ARGON';
  var NEON_OXYGEN = 'NEON_OXYGEN';
  var ARGON_OXYGEN = 'ARGON_OXYGEN';
  var ADJUSTABLE = 'ADJUSTABLE';

  var inset = 10;

  /**
   *
   * @param {DualAtomModel} dualAtomModel - model of the simulation
   * @param {Boolean} enableHeterogeneousMolecules - true to use a enable heterogeneous molecules , false if not.
   * @param {Object} options that can be passed on to the underlying node
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
      textColor: 'black',
      lineWidth: 1,
      backgroundColor: '#D1D2FF',
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var textOptions;
    var background = new Path( null,
      {
        stroke: 'white',
        lineWidth: options.lineWidth,
        fill: options.backgroundColor
      }
    );
    this.addChild( background );
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

    if ( enableHeterogeneousMolecules ) {
      textOptions = { font: new PhetFont( 12 ), fill: options.textColor };
      neonAndNeon = [ new Text( neonString, textOptions ), new Text( neonString, textOptions ) ];
      argonAndArgon = [ new Text( argonString, textOptions ), new Text( argonString, textOptions ) ];
      oxygenAndOxygen = [ new Text( oxygenString, textOptions ), new Text( oxygenString, textOptions ) ];
      neonAndArgon = [ new Text( neonString, textOptions ), new Text( argonString, textOptions ) ];
      neonAndOxygen = [ new Text( neonString, textOptions ), new Text( oxygenString, textOptions ) ];
      argonAndOxygen = [ new Text( argonString, textOptions ), new Text( oxygenString, textOptions ) ];
      var customAttraction = new Text( customAttractionString, textOptions );
      var pushpinImage = new Image( pushPinImg, { scale: 0.15 } );
      var pinnedNodeText = new HBox( {
        children: [ pushpinImage, new Text( pinnedString,
          { font: new PhetFont( 10 ), fill: options.textColor } ), new HStrut( pushpinImage.width ) ],
        spacing: 5
      } );
      titleText = [ pinnedNodeText, new Text( movingString, { font: new PhetFont( 10 ), fill: options.textColor } ) ];
      maxWidth = Math.max(
        neonAndArgon[ 0 ].width + neonAndArgon[ 1 ].width,
        argonAndArgon[ 0 ].width + argonAndArgon[ 1 ].width,
        oxygenAndOxygen[ 0 ].width + oxygenAndOxygen[ 1 ].width,
        neonAndNeon[ 0 ].width + neonAndNeon[ 1 ].width,
        neonAndOxygen[ 0 ].width + neonAndOxygen[ 1 ].width );
      maxWidth = 2 * Math.max( titleText[ 0 ].width, titleText[ 1 ].width, maxWidth / 2 );
      // pad inserts a spacing node (HStrut) so that the rows occupy a certain fixed width.
      createItem = function( itemSpec ) {
        var strutWidth1 = ( maxWidth / 2 - itemSpec[ 0 ].width );
        var strutWidth2 = ( maxWidth / 2 - itemSpec[ 1 ].width );
        return new HBox( {
          children: [ itemSpec[ 0 ], new HStrut( strutWidth1 + 5 ),
            itemSpec[ 1 ], new HStrut( strutWidth2 ) ]
        } );
      };
      var particleRadius = 8;
      var neonNeonRadio = new AquaRadioButton( dualAtomModel.moleculeTypeProperty, NEON_NEON,
        createItem( neonAndNeon ), { radius: particleRadius } );
      var argonArgonRadio = new AquaRadioButton( dualAtomModel.moleculeTypeProperty, ARGON_ARGON,
        createItem( argonAndArgon ), { radius: particleRadius } );
      var oxygenOxygenRadio = new AquaRadioButton( dualAtomModel.moleculeTypeProperty, OXYGEN_OXYGEN,
        createItem( oxygenAndOxygen ), { radius: particleRadius } );
      var neonArgonRadio = new AquaRadioButton( dualAtomModel.moleculeTypeProperty, NEON_ARGON,
        createItem( neonAndArgon ), { radius: particleRadius } );
      var neonOxygenRadio = new AquaRadioButton( dualAtomModel.moleculeTypeProperty, NEON_OXYGEN,
        createItem( neonAndOxygen ), { radius: particleRadius } );
      var argonOxygenRadio = new AquaRadioButton( dualAtomModel.moleculeTypeProperty, ARGON_OXYGEN,
        createItem( argonAndOxygen ), { radius: particleRadius } );
      var adjustableAttractionRadio = new AquaRadioButton( dualAtomModel.moleculeTypeProperty, ADJUSTABLE,
        new HBox( { children: [ customAttraction ] } ), { radius: particleRadius } );
      var createTitle = function( itemSpec ) {
        var strutWidth1 = particleRadius;
        var strutWidth2 = ( maxWidth / 2 - itemSpec[ 0 ].width );
        var strutWidth3 = ( maxWidth / 2 - itemSpec[ 1 ].width );
        return new HBox( {
          children: [ new HStrut( strutWidth1 ), itemSpec[ 0 ], new HStrut( strutWidth2 + 13 + particleRadius ),
            itemSpec[ 1 ], new HStrut( strutWidth3 + 10 ) ]
        } );
      };
      titleNode = createTitle( titleText );
      radioButtonGroup = new VBox( {
        children: [ titleNode, neonNeonRadio, argonArgonRadio, oxygenOxygenRadio,
          neonArgonRadio, neonOxygenRadio, argonOxygenRadio, adjustableAttractionRadio ],
        align: 'left',
        spacing: 6
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
      textOptions = { font: new PhetFont( 12 ), fill: "#FFFFFF" };
      // itemSpec describes the pieces that make up an item in the control panel,
      // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
      var neon = { label: new Text( neonString, textOptions ), icon: createNeonIcon() };
      var argon = { label: new Text( argonString, textOptions ), icon: createArgonIcon() };
      adjustableAttraction = {
        label: new Text( adjustableAttractionString, textOptions ),
        icon: createAdjustableAttractionIcon()
      };
      titleText = {
        label: new Text( tittleString, {
          font: new PhetFont( 14 ),
          fill: '#FFFFFF'
        } )
      };

      // compute the maximum item width
      var widestItemSpec = _.max( [ neon, argon, adjustableAttraction, titleText ], function( item ) {
        return item.label.width + ((item.icon) ? item.icon.width : 0);
      } );
      maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);
      maxWidth = Math.max( maxWidth );
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
        { value: NEON_NEON, node: createItem( neon ) },
        { value: ARGON_ARGON, node: createItem( argon ) },
        { value: ADJUSTABLE, node: createItem( adjustableAttraction ) }
      ];
      radioButtonGroup = new RadioButtonGroup( dualAtomModel.moleculeTypeProperty, radioButtonContent, {
        orientation: 'vertical',
        spacing: 1,
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
      font: new PhetFont( 12 ),
      fill: options.textColor
    } );
    sliderTrackWidth = maxWidth;
    dualAtomModel.atomDiameterProperty.value = dualAtomModel.getSigma();
    var atomDiameterSlider = new HSlider( dualAtomModel.atomDiameterProperty,
      { min: StatesOfMatterConstants.MIN_SIGMA, max: StatesOfMatterConstants.MAX_SIGMA },
      {
        trackSize: new Dimension2( sliderTrackWidth, 5 ),
        trackFill: 'white',
        thumbSize: new Dimension2( 15, 30 ),
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
    var largeText = new Text( largeString, tickTextOptions );
    atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MIN_SIGMA, smallText );
    smallText.visible = !enableHeterogeneousMolecules;
    largeText.visible = !enableHeterogeneousMolecules;
    atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MAX_SIGMA, largeText );

    var atomDiameter = new VBox( { spacing: 4, align: 'left', children: [ atomDiameterTitle, atomDiameterSlider ] } );
    // add interaction strength slider
    var interactionStrengthTitle = new Text( interactionStrengthString, {
      font: new PhetFont( 12 ),
      fill: options.textColor,
      top: atomDiameterSlider.bottom + 5
    } );
    dualAtomModel.interactionStrength = dualAtomModel.getEpsilon();
    var interactionStrengthSlider = new HSlider( dualAtomModel.interactionStrengthProperty,
      { min: StatesOfMatterConstants.MIN_EPSILON, max: StatesOfMatterConstants.MAX_EPSILON },
      {
        trackSize: new Dimension2( sliderTrackWidth, 5 ),
        trackFill: 'white',
        thumbSize: new Dimension2( 15, 30 ),
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
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MIN_EPSILON, new Text( weakString, tickTextOptions ) );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MAX_EPSILON, new Text( strongString, tickTextOptions ) );
    var interactionStrength = new VBox( { spacing: 4, align: 'left', children: [ interactionStrengthTitle, interactionStrengthSlider ] } );

    var content = new VBox( {
      spacing: 4,
      align: 'left', children: [ radioButtonGroup ]
    } );

    var radioButtonPanel = new Panel( content, { lineWidth: 0, fill: options.backgroundColor } );

    // Update the text when the value or units changes.
    dualAtomModel.moleculeTypeProperty.link(
      function( moleculeType ) {
        switch( moleculeType ) {
          case NEON_NEON:
            dualAtomModel.setBothAtomTypes( AtomType.NEON );
            break;

          case ARGON_ARGON:
            dualAtomModel.setBothAtomTypes( AtomType.ARGON );
            break;

          case OXYGEN_OXYGEN:
            dualAtomModel.setBothAtomTypes( AtomType.OXYGEN );
            break;

          case NEON_ARGON:
            dualAtomModel.settingBothAtomTypes = true;
            dualAtomModel.setFixedAtomType( AtomType.NEON );
            dualAtomModel.setMovableAtomType( AtomType.ARGON );
            dualAtomModel.settingBothAtomTypes = false;
            break;

          case NEON_OXYGEN:
            dualAtomModel.settingBothAtomTypes = true;
            dualAtomModel.setFixedAtomType( AtomType.NEON );
            dualAtomModel.setMovableAtomType( AtomType.OXYGEN );
            dualAtomModel.settingBothAtomTypes = false;
            break;

          case ARGON_OXYGEN:
            dualAtomModel.settingBothAtomTypes = true;
            dualAtomModel.setFixedAtomType( AtomType.ARGON );
            dualAtomModel.setMovableAtomType( AtomType.OXYGEN );
            dualAtomModel.settingBothAtomTypes = false;
            break;
        } //end of switch

        if ( moleculeType === ADJUSTABLE ) {
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
        background.setShape( new Shape().roundRect( -5, -2,
          radioButtonPanel.width + inset,
          radioButtonPanel.height + 3,
          options.cornerRadius, options.cornerRadius ) );
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

