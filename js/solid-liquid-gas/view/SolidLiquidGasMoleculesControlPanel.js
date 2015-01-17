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
  var HStrut = require( 'SUN/HStrut' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // strings
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var waterString = require( 'string!STATES_OF_MATTER/water' );
  var oxygenString = require( 'string!STATES_OF_MATTER/oxygen' );
  var adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  var titleString = require( 'string!STATES_OF_MATTER/AtomsMolecules' );

  // constants
  var inset = 10;

  /**
   *
   * @param {Property<Number>} moleculeTypeProperty that tracks the molecule type selected in the panel
   * @param {Object} options for various panel display properties
   * @constructor
   */
  function SolidLiquidGasMoleculesControlPanel( moleculeTypeProperty, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#C8C8C8  ',
      stroke: 'gray',
      lineWidth: 1,
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var textOptions = { font: new PhetFont( 12 ), fill: '#FFFFFF', fontWeight: 600 };

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var neon = { label: new Text( neonString, textOptions ), icon: createNeonIcon() };
    var argon = { label: new Text( argonString, textOptions ), icon: createArgonIcon() };
    var water = { label: new Text( waterString, textOptions ), icon: createWaterIcon() };
    var oxygen = { label: new Text( oxygenString, textOptions ), icon: createOxygenIcon() };
    var adjustableAttraction = {
      label: new Text( adjustableAttractionString,
        textOptions ), icon: createAdjustableAttractionIcon()
    };

    // compute the maximum item width
    var widestItemSpec = _.max( [ neon, argon, water, oxygen, adjustableAttraction ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 17;
        return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };

    var radioButtonContent = [
      { value: StatesOfMatterConstants.NEON, node: createItem( neon ) },
      { value: StatesOfMatterConstants.ARGON, node: createItem( argon ) },
      { value: StatesOfMatterConstants.DIATOMIC_OXYGEN, node: createItem( oxygen ) },
      { value: StatesOfMatterConstants.WATER, node: createItem( water ) }
    ];

    var radioButtonGroup = new RadioButtonGroup( moleculeTypeProperty, radioButtonContent, {
      orientation: 'vertical',
      spacing: 1,
      cornerRadius: 5,
      baseColor: 'black',
      disabledBaseColor: 'black',
      selectedLineWidth: 1,
      selectedStroke: '#FFFCD3',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1
    } );

    var radioButtonPanel = new Panel( radioButtonGroup, {
      stroke: 'black',
      lineWidth: 0
    } );

    var background = new Rectangle( 0, -4,
      radioButtonPanel.width, radioButtonPanel.height + inset,
      options.cornerRadius, options.cornerRadius, {
        stroke: '#FFFCD3',
        lineWidth: options.lineWidth,
        fill: 'black'
      }
    );

    this.addChild( background );
    this.addChild( radioButtonGroup );

    var titleText = new Text( titleString,
      {
        font: new PhetFont( 14 ),
        fill: '#FFFFFF',
        fontWeight: 600
      } );

    var titleBackground = new Rectangle( background.centerX + 4, background.top - 10,
      titleText.width + 5, titleText.height,
      {
        fill: 'black'
      } );
    titleText.centerX = background.centerX;
    titleBackground.centerX = titleText.centerX;
    var tittleNode = new Node( { children: [ titleBackground, titleText ] } );
    this.addChild( tittleNode );

    this.mutate( options );
  }

  //Create an icon for the adjustable attraction  button
  var createAdjustableAttractionIcon = function() {
    return new Circle( 6, { fill: '#CC66CC' } );
  };

  //Create an icon for the neon  button
  var createNeonIcon = function() {
    return new Circle( 5, { fill: '#1AFFFB' } );
  };

  //Create an icon for the argon  button
  var createArgonIcon = function() {
    return new Circle( 6, { fill: '#FFAFAF' } );
  };
  //Create an icon for the water  button
  var createWaterIcon = function() {
    var dot1 = new Circle( 5, { fill: '#D91200' } );
    var dot2 = new Circle( 3, { fill: 'white', stroke: 'white', bottom: dot1.top + 5, right: dot1.left + 5 } );
    var dot3 = new Circle( 3, {
      fill: 'white', stroke: 'white', bottom: dot1.top + 5, left: dot1.right - 5
    } );

    return new Node( { children: [ dot3, dot1, dot2 ] } );

  };

  //Create an icon for the oxygen  button
  var createOxygenIcon = function() {
    var dot1 = new Circle( 5, { fill: '#DA1300' } );
    var dot2 = new Circle( 5, { fill: '#DA1300', left: dot1.right - 4 } );
    return new Node( { children: [ dot1, dot2 ] } );
  };


  return inherit( Node, SolidLiquidGasMoleculesControlPanel );
} );
