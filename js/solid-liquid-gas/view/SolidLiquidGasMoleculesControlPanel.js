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
  var oxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  var titleString = require( 'string!STATES_OF_MATTER/AtomsMolecules' );

  //constants
  var MAX_WIDTH = 118;


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
    var textOptions = { font: new PhetFont( 12 ), fill: '#FFFFFF' };

    var neonText = new Text( neonString, textOptions );
    if ( neonText.width > MAX_WIDTH ) {
      neonText.setFont( new PhetFont( 12 * MAX_WIDTH / neonText.width ) );
    }
    var argonText = new Text( argonString, textOptions );
    if ( argonText.width > MAX_WIDTH ) {
      argonText.setFont( new PhetFont( 12 * MAX_WIDTH / argonText.width ) );
    }
    var waterText = new Text( waterString, textOptions );
    if ( waterText.width > MAX_WIDTH ) {
      waterText.setFont( new PhetFont( 12 * MAX_WIDTH / waterText.width ) );
    }
    var oxygenText = new Text( oxygenString, textOptions );
    if ( oxygenText.width > MAX_WIDTH ) {
      oxygenText.setFont( new PhetFont( 12 * MAX_WIDTH / oxygenText.width ) );
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

    var titleText = {
      label: title
    };

    // compute the maximum item width
    var widestItemSpec = _.max( [ neon, argon, water, oxygen, titleText ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 36;
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
      spacing: 3,
      cornerRadius: 5,
      baseColor: 'black',
      disabledBaseColor: 'black',
      selectedLineWidth: 1,
      selectedStroke: 'white',
      deselectedLineWidth: 0,
      deselectedContentOpacity: 1
    } );

    var radioButtonPanel = new Panel( radioButtonGroup, {
      yMargin: 10,
      stroke: 'white',
      align: 'center',
      lineWidth: options.lineWidth,
      fill: 'black',
      minWidth: 166
    } );
    this.addChild( radioButtonPanel );

    var titleBackground = new Rectangle( 0, 0,
      titleText.label.width + 5, titleText.label.height, {
        fill: 'black'
      } );
    titleBackground.centerX = radioButtonPanel.centerX;
    titleBackground.centerY = radioButtonPanel.top;
    titleText.label.centerX = titleBackground.centerX;
    titleText.label.centerY = titleBackground.centerY;
    var tittleNode = new Node( { children: [ titleBackground, titleText.label ] } );
    this.addChild( tittleNode );

    this.mutate( options );
  }

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
      fill: StatesOfMatterConstants.HYDROGEN_COLOR, stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: dot1.top + 5, left: dot1.right - 5
    } );

    return new Node( { children: [ dot3, dot1, dot2 ] } );

  };

  //Create an icon for the oxygen  button
  var createOxygenIcon = function() {
    var dot1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
    var dot2 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR, left: dot1.right - 4 } );
    return new Node( { children: [ dot1, dot2 ] } );
  };


  return inherit( Node, SolidLiquidGasMoleculesControlPanel );
} );
