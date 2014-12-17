// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * View for the panel for selecting the atoms/molecules
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
  var Property = require( 'AXON/Property' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );

  // strings
  var neonString = require( 'string!STATES_OF_MATTER/neon' );
  var argonString = require( 'string!STATES_OF_MATTER/argon' );
  var oxygenString = require( 'string!STATES_OF_MATTER/oxygen' );
  var adjustableAttractionString = require( 'string!STATES_OF_MATTER/adjustableAttraction' );
  var tittleString = require( 'string!STATES_OF_MATTER/AtomsMolecules' );

  var NEON_NEON = 'NEON_NEON';
  var ARGON_ARGON = 'ARGON_ARGON';
  var OXYGEN_OXYGEN = 'OXYGEN_OXYGEN';
  var NEON_ARGON = 'NEON_ARGON';
  var NEON_OXYGEN = 'NEON_OXYGEN';
  var ARGON_OXYGEN = 'ARGON_OXYGEN';
  var ADJUSTABLE = 'ADJUSTABLE';

  /**
   *
   * @param model
   * @param enableHeterogeneousAtoms
   * @param options
   * @constructor
   */
  function AtomicInteractionsControlPanel( model, enableHeterogeneousAtoms, options ) {

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
    if ( enableHeterogeneousAtoms ) {
      textOptions = {font: new PhetFont( 12 ), fill: options.textColor};

      var neonAndNeon = [ new Text( neonString, textOptions ), new Text( neonString, textOptions ) ];
      var argonAndArgon = [  new Text( argonString, textOptions ), new Text( argonString, textOptions ) ];
      var oxygenAndOxygen = [ new Text( oxygenString, textOptions ), new Text( oxygenString, textOptions )];
      var neonAndArgon = [ new Text( neonString, textOptions ), new Text( argonString, textOptions )];
      var neonAndOxygen = [ new Text( neonString, textOptions ), new Text( oxygenString, textOptions )];
      var argonAndOxygen = [ new Text( argonString, textOptions ), new Text( oxygenString, textOptions )];
      var adjustableAttraction = new Text( adjustableAttractionString, textOptions );

      /*var maxWidth = Math.max(
       _.max( [neonAndNeon, argonAndArgon, oxygenAndOxygen, neonAndArgon, neonAndOxygen, argonAndOxygen],
       function( items ) {
       return items[0].width + items[1].width;
       } ),
       adjustableAttraction.width
       ) / 2;*/

      var maxWidth = adjustableAttraction.width / 2;

      // pad inserts a spacing node (HStrut) so that the rows occupy a certain fixed width.
      var createItem = function( itemSpec ) {

        var strutWidth1 = maxWidth - itemSpec[0].width + 15;
        var strutWidth2 = maxWidth - itemSpec[1].width;
        return new HBox( { children: [ itemSpec[0], new HStrut( strutWidth1 ),
                                       itemSpec[1], new HStrut( strutWidth2 ) ] } );
      };

      var neonNeonRadio = new AquaRadioButton( model.moleculeTypeProperty, NEON_NEON,
        createItem( neonAndNeon ), { radius: 8 } );
      var argonArgonRadio = new AquaRadioButton( model.moleculeTypeProperty, ARGON_ARGON,
        createItem( argonAndArgon ), { radius: 8 } );
      var oxygenOxygenRadio = new AquaRadioButton( model.moleculeTypeProperty, OXYGEN_OXYGEN,
        createItem( oxygenAndOxygen ), { radius: 8 } );
      var neonArgonRadio = new AquaRadioButton( model.moleculeTypeProperty, NEON_ARGON,
        createItem( neonAndArgon ), { radius: 8 } );
      var neonOxygenRadio = new AquaRadioButton( model.moleculeTypeProperty, NEON_OXYGEN,
        createItem( neonAndOxygen ), { radius: 8 } );
      var argonOxygenRadio = new AquaRadioButton( model.moleculeTypeProperty, ARGON_OXYGEN,
        createItem( argonAndOxygen ), { radius: 8 } );
      var adjustableAttractionRadio = new AquaRadioButton( model.moleculeTypeProperty, ADJUSTABLE,
        new HBox( { children: [adjustableAttraction] } ), { radius: 8 } );

      var radioButtonGroup = new VBox( {
        children: [ neonNeonRadio, argonArgonRadio, oxygenOxygenRadio,
                    neonArgonRadio, neonOxygenRadio, argonOxygenRadio, adjustableAttractionRadio],
        align: 'left',
        spacing: 2
      } );

    }

    else {
      textOptions = {font: new PhetFont( 12 ), fill: "#FFFFFF"};

      // itemSpec describes the pieces that make up an item in the control panel,
      // conforms to the contract: { label: {Node}, icon: {Node} (optional) }
      var neon = { label: new Text( neonString, textOptions ), icon: createNeonIcon() };
      var argon = { label: new Text( argonString, textOptions ), icon: createArgonIcon()};
      adjustableAttraction = { label: new Text( adjustableAttractionString,
        textOptions ), icon: createAdjustableAttractionIcon()};

      // compute the maximum item width
      var widestItemSpec = _.max( [ neon, argon, adjustableAttraction ], function( item ) {
        return item.label.width + ((item.icon) ? item.icon.width : 0);
      } );
      maxWidth = widestItemSpec.label.width + ((widestItemSpec.icon) ? widestItemSpec.icon.width : 0);

      // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
      createItem = function( itemSpec ) {
        if ( itemSpec.icon ) {
          var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 17;
          return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
        }
        else {
          return new HBox( { children: [ itemSpec.label] } );
        }
      };

      var radioButtonContent = [
        { value: 'NEON', node: createItem( neon ) },
        { value: 'ARGON', node: createItem( argon )},
        { value: 'ADJUSTABLE', node: createItem( adjustableAttraction )}
      ];
      radioButtonGroup = new RadioButtonGroup( model.moleculeTypeProperty, radioButtonContent, {
        orientation: 'vertical',
        spacing: 1,
        cornerRadius: 5,
        baseColor: 'black',
        disabledBaseColor: 'black',
        selectedLineWidth: 3,
        selectedStroke: '#FFFCD3',
        deselectedLineWidth: 0,
        deselectedContentOpacity: 1
      } );
      var titleText = new Text( tittleString,
        { font: new PhetFont( 14 ),
          fill: '#FFFFFF',
          fontWeight: 'bold'
        } );
      var titleBackground = new Rectangle( 0, 0,
          titleText.width + 5, titleText.height,
        {
          fill: 'black'
        } );
      titleText.centerX = background.centerX + titleText.width / 2;
      titleBackground.centerX = titleText.centerX;
      titleBackground.centerY = titleText.centerY;
      var tittleNode = new Node( {children: [titleBackground, titleText]} );
      this.addChild( tittleNode );
      //  tittleNode.centerX = background.centerX + titleText.width / 2;
    }

    var atomDiameterTitle = new Text( 'Atom Diameter (\u03C3)', textOptions );
    atomDiameterTitle.centerX = radioButtonGroup.centerX;
    atomDiameterTitle.top = radioButtonGroup.bottom + 10;
    model.atomDiameterProperty.value = model.getSigma();
    var atomDiameterSlider = new HSlider( model.atomDiameterProperty,
      { min: 2 * StatesOfMatterConstants.MIN_SIGMA, max: StatesOfMatterConstants.MAX_SIGMA },
      {
        trackSize: new Dimension2( 100, 5 ),
        trackFill: 'white',
        thumbSize: new Dimension2( 15, 30 ),
        majorTickLength: 15,
        majorTickStroke: 'black',
        trackStroke: 'black',
        centerX: radioButtonGroup.centerX
      } );
    atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MIN_SIGMA,
      new Text( 'small', {fill: options.tickTextColor } ) );
    atomDiameterSlider.addMajorTick( StatesOfMatterConstants.MAX_SIGMA,
      new Text( 'large', {fill: options.tickTextColor } ) );
    atomDiameterSlider.centerX = atomDiameterTitle.centerX;
    atomDiameterSlider.top = atomDiameterTitle.bottom + 5;
    //atomDiameter.setVisible(false);
    var atomDiameter = new Node( {
      children: [atomDiameterTitle, atomDiameterSlider]
    } );

    var interactionStrengthTitle = new Text( 'Interaction Strength (\u03B5)', textOptions );
    interactionStrengthTitle.centerX = atomDiameterSlider.centerX;
    interactionStrengthTitle.top = atomDiameterSlider.bottom + 5;
    model.interactionStrengthProperty.value = model.getEpsilon();
    var interactionStrengthSlider = new HSlider( model.interactionStrengthProperty,
      { min: StatesOfMatterConstants.MIN_EPSILON, max: StatesOfMatterConstants.MAX_EPSILON },
      {
        trackSize: new Dimension2( 100, 5 ),
        trackFill: 'white',
        thumbSize: new Dimension2( 15, 30 ),
        majorTickLength: 15,
        majorTickStroke: 'black',
        trackStroke: 'black',
        centerX: radioButtonGroup.centerX
      } );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MIN_EPSILON,
      new Text( 'weak', { fill: options.tickTextColor } ) );
    interactionStrengthSlider.addMajorTick( StatesOfMatterConstants.MAX_EPSILON,
      new Text( 'strong', { fill: options.tickTextColor } ) );
    interactionStrengthSlider.centerX = interactionStrengthTitle.centerX;
    interactionStrengthSlider.top = interactionStrengthTitle.bottom + 5;
    //interactionStrength.setVisible(false);
    var interactionStrength = new Node( {
      children: [interactionStrengthTitle, interactionStrengthSlider]
    } );
    var radioButtonPanel = new Panel( radioButtonGroup, {
      stroke: 'black',
      lineWidth: 0
    } );

    // Update the text when the value or units changes.
    Property.multilink( [model.moleculeTypeProperty],
      function( moleculeType ) {
        switch( moleculeType ) {
          case NEON_NEON:
            model.setBothAtomTypes( AtomType.NEON );
            break;

          case ARGON_ARGON:
            model.setBothAtomTypes( AtomType.ARGON );
            break;

          case OXYGEN_OXYGEN:
            model.setBothAtomTypes( AtomType.OXYGEN );
            break;

          case NEON_ARGON:
            model.settingBothAtomTypes = true;
            model.setFixedAtomType( AtomType.NEON );
            model.setMovableAtomType( AtomType.ARGON );
            model.settingBothAtomTypes = false;
            break;

          case NEON_OXYGEN:
            model.settingBothAtomTypes = true;
            model.setFixedAtomType( AtomType.NEON );
            model.setMovableAtomType( AtomType.OXYGEN );
            model.settingBothAtomTypes = false;
            break;

          case ARGON_OXYGEN:
            model.settingBothAtomTypes = true;
            model.setFixedAtomType( AtomType.ARGON );
            model.setMovableAtomType( AtomType.OXYGEN );
            model.settingBothAtomTypes = false;
            break;
        } //end of switch

        if ( moleculeType === ADJUSTABLE ) {
          // add atom diameter slider and interaction
          atomicInteractionsControlPanel.addChild( atomDiameter );
          atomicInteractionsControlPanel.addChild( interactionStrength );
          var backgroundShape1 = new Shape().roundRect(
            0,
            -4,
            (radioButtonPanel.width + 10 ),
            (radioButtonPanel.height + atomDiameter.height + interactionStrength.height + 20 ),
            options.cornerRadius, options.cornerRadius
          );
          background.setShape( backgroundShape1 );
        }
        else {
          //if  atom and interaction slider
          if ( atomicInteractionsControlPanel.isChild( atomDiameter ) ||
               atomicInteractionsControlPanel.isChild( interactionStrength ) ) {
            atomicInteractionsControlPanel.removeChild( atomDiameter );
            atomicInteractionsControlPanel.removeChild( interactionStrength );
          }
          var backgroundShape2 = new Shape().roundRect(
            0,
            -4,
            (radioButtonPanel.width + 10 ),
            (radioButtonPanel.height + 10 ),
            options.cornerRadius, options.cornerRadius
          );
          background.setShape( backgroundShape2 );
        }


      }
    );


    this.addChild( radioButtonGroup );


    this.mutate( options );
  }

  //Create an icon for the adjustable attraction  button
  var createAdjustableAttractionIcon = function() {
    var dot1 = new Circle( 5, {fill: '#B15AFF' } );
    return new Node( {children: [ dot1 ]} );
  };

  //Create an icon for the neon  button
  var createNeonIcon = function() {
    var dot1 = new Circle( 5, { fill: '#1AFFFB' } );
    return new Node( {children: [  dot1 ]} );
  };

  //Create an icon for the argon  button
  var createArgonIcon = function() {
    var dot1 = new Circle( 5, {fill: '#FF8A75'} );
    return new Node( {children: [ dot1 ]} );
  };


  return inherit( Node, AtomicInteractionsControlPanel );
} );

