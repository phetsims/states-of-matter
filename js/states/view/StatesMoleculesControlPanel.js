// Copyright 2002-2015, University of Colorado Boulder

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
  var HStrut = require( 'SCENERY/nodes/HStrut' );
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
  var diatomicOxygenString = require( 'string!STATES_OF_MATTER/diatomicOxygen' );
  var atomsAndMoleculesString = require( 'string!STATES_OF_MATTER/AtomsAndMolecules' );

  // constants
  var MAX_WIDTH = 118;

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
   * @param {Property<number>} moleculeTypeProperty that tracks the molecule type selected in the panel
   * @param {Object} [options] for various panel display properties
   * @constructor
   */
  function StatesMoleculesControlPanel( moleculeTypeProperty, options ) {

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
      neonText.scale( MAX_WIDTH / neonText.width );
    }
    var argonText = new Text( argonString, textOptions );
    if ( argonText.width > MAX_WIDTH ) {
      argonText.scale( MAX_WIDTH / argonText.width );
    }
    var waterText = new Text( waterString, textOptions );
    if ( waterText.width > MAX_WIDTH ) {
      waterText.scale( MAX_WIDTH / waterText.width );
    }
    var oxygenText = new Text( diatomicOxygenString, textOptions );
    if ( oxygenText.width > MAX_WIDTH ) {
      oxygenText.scale( MAX_WIDTH / oxygenText.width );
    }
    var title = new Text( atomsAndMoleculesString, {
      font: new PhetFont( 14 ),
      fill: '#FFFFFF'
    } );
    if ( title.width > MAX_WIDTH ) {
      title.scale( MAX_WIDTH / title.width );
    }

    // itemSpec describes the pieces that make up an item in the control panel,
    // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
    var neon = { label: neonText, icon: NEON_ICON };
    var argon = { label: argonText, icon: ARGON_ICON };
    var water = { label: waterText, icon: WATER_ICON };
    var oxygen = { label: oxygenText, icon: OXYGEN_ICON };

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

    var titleBackground = new Rectangle( 0, 0, titleText.label.width + 5, titleText.label.height, {
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

  return inherit( Node, StatesMoleculesControlPanel );
} );
