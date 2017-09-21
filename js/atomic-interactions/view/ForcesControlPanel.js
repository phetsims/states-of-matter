// Copyright 2015-2017, University of Colorado Boulder

/**
 * This class displays a control panel for controlling the display of attractive, repulsive, and total force.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var BracketNode = require( 'SCENERY_PHET/BracketNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  //strings
  var attractiveString = require( 'string!STATES_OF_MATTER/attractive' );
  var electronOverlapString = require( 'string!STATES_OF_MATTER/electronOverlap' );
  var forcesString = require( 'string!STATES_OF_MATTER/forces' );
  var hideForcesString = require( 'string!STATES_OF_MATTER/hideForces' );
  var repulsiveString = require( 'string!STATES_OF_MATTER/repulsive' );
  var totalForceString = require( 'string!STATES_OF_MATTER/totalForce' );
  var vanderwaalsString = require( 'string!STATES_OF_MATTER/vanderwaals' );

  // constants
  var TEXT_LABEL_MAX_WIDTH = 130; // max width of text label in the panel
  var RADIO_BUTTON_RADIUS = 6;
  var ICON_PADDING = 25; // empirically determined to put the icons in a good position on the panel

  /**
   * @param {Property<string>} forcesProperty that determines which forces to display
   * @param {Property<boolean>} forceControlPanelExpandProperty -true to use force panel expand, false if not
   * @param {Object} [options] for various panel display properties
   * @constructor
   */
  function ForcesControlPanel( forcesProperty, forceControlPanelExpandProperty, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: 'black',
      stroke: 'white',
      tickTextColor: 'black',
      textFill: 'black',
      buttonAlign: 'left',
      lineWidth: 1,
      showTitleWhenExpanded: true,
      minWidth: 0,
      maxWidth: Number.POSITIVE_INFINITY
    }, options );

    Node.call( this );
    var accordionContent = new Node();
    var arrowEndX = 20;
    var arrowStartX = 0;
    var arrowY = 0;
    var arrowNodeOptions = {
      headHeight: 10,
      headWidth: 14,
      tailWidth: 6
    };

    var totalForceArrow = new ArrowNode( arrowEndX, arrowY, arrowStartX, arrowY, _.extend( {
      fill: '#49B649'
    }, arrowNodeOptions ) );

    var attractiveArrow = new ArrowNode( arrowEndX, arrowY, arrowStartX, arrowY, _.extend( {
      fill: '#FC9732'
    }, arrowNodeOptions ) );

    var repulsiveArrow = new ArrowNode( arrowStartX, arrowY, arrowEndX, arrowY, _.extend( {
      fill: '#FD17FF'
    }, arrowNodeOptions ) );

    var createText = function( string, width, fontSize ) {
      var text = new Text( string, { font: new PhetFont( fontSize ), fill: options.textFill } );
      if ( text.width > width ) {
        text.scale( width / text.width );
      }
      return text;
    };

    var hideForcesText = { label: createText( hideForcesString, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ) };

    var totalForceText = {
      label: createText( totalForceString, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ),
      icon: totalForceArrow
    };

    var attractiveText = {
      label: createText( attractiveString, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
      icon: attractiveArrow
    };

    var vanderwaalsText = {
      label: createText( vanderwaalsString, TEXT_LABEL_MAX_WIDTH * 0.7, 11 )
    };

    var repulsiveText = {
      label: createText( repulsiveString, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
      icon: repulsiveArrow
    };

    var electronOverlapText = {
      label: createText( electronOverlapString, TEXT_LABEL_MAX_WIDTH * 0.7, 11 )
    };

    // compute the maximum item width
    var widestItem = _.maxBy( [ hideForcesText, totalForceText, attractiveText, vanderwaalsText, repulsiveText,
      electronOverlapText ], function( item ) {
      return item.label.width + ( ( item.icon ) ? item.icon.width + ICON_PADDING : 0 );
    } );
    var maxWidth = widestItem.label.width + ( ( widestItem.icon ) ? widestItem.icon.width + ICON_PADDING : 0 );

    // inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width
    var createConsistentlySpacedLabel = function( labelSpec ) {
      if ( labelSpec.icon ) {
        var strutWidth = maxWidth - labelSpec.label.width - labelSpec.icon.width;
        return new HBox( { children: [ labelSpec.label, new HStrut( strutWidth ), labelSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ labelSpec.label ] } );
      }
    };

    var componentForceText = new VBox( {
      spacing: 2,
      children: [
        createConsistentlySpacedLabel( attractiveText ),
        createConsistentlySpacedLabel( vanderwaalsText ),
        createConsistentlySpacedLabel( repulsiveText ),
        createConsistentlySpacedLabel( electronOverlapText ) ],
      align: 'left'
    } );

    // the bracket at the left - this is tweaked a bit for optimal appearance
    var bracket = new VBox( {
      spacing: 0,
      children: [
        new VStrut( 4 ),
        new BracketNode( {
          orientation: 'left',
          bracketLength: componentForceText.height,
          bracketLineWidth: 2,
          bracketStroke: options.textFill,
          bracketTipLocation: 0.475
        } )
      ]
    } );

    var bracketToTextSpacing = 2;
    var componentForce = new HBox( {
      spacing: bracketToTextSpacing,
      children: [ bracket, componentForceText ]
    } );
    var totalForceStrutWidth = maxWidth - totalForceText.label.width - totalForceText.icon.width + bracket.width + bracketToTextSpacing;
    var totalForceItem = new HBox( {
      children: [ totalForceText.label,
        new HStrut( totalForceStrutWidth ),
        totalForceText.icon ]
    } );

    var totalForce = new HBox( { spacing: 2, children: [ totalForceItem ] } );
    var hideForce = new HBox( { spacing: 2, children: [ createConsistentlySpacedLabel( hideForcesText ) ] } );

    var hideForcesRadio = new AquaRadioButton( forcesProperty, 'hideForces', hideForce, {
      radius: RADIO_BUTTON_RADIUS
    } );
    var totalForceRadio = new AquaRadioButton( forcesProperty, 'totalForce', totalForce, {
      radius: RADIO_BUTTON_RADIUS
    } );
    var componentForceRadio = new AquaRadioButton( forcesProperty, 'componentForce', componentForce, {
      radius: RADIO_BUTTON_RADIUS
    } );

    var radioButtonGroup = new VBox( {
      children: [ hideForcesRadio, totalForceRadio, componentForceRadio ],
      align: 'left',
      spacing: 3,
      left: 8 // indented a bit
    } );
    accordionContent.addChild( radioButtonGroup );

    // expand the touch areas of the radio buttons so that they are easier to work with on touch-based devices
    var xDilation = 8;
    var yDilation = 1.5;
    hideForcesRadio.touchArea = hideForcesRadio.localBounds.dilatedXY( xDilation, yDilation );
    totalForceRadio.touchArea = totalForceRadio.localBounds.dilatedXY( xDilation, yDilation );

    // show white stroke around the force panel within SOM full version  else  show black stroke
    var accordionBox = new AccordionBox( accordionContent, {
      titleNode: createText( forcesString, TEXT_LABEL_MAX_WIDTH / 2, 14 ),
      fill: options.fill,
      stroke: options.stroke,
      lineWidth: options.lineWidth,
      expandedProperty: forceControlPanelExpandProperty,
      contentAlign: 'left',
      titleAlignX: 'left',
      buttonAlign: options.buttonAlign,
      cornerRadius: StatesOfMatterConstants.PANEL_CORNER_RADIUS,
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
      contentYSpacing: 1,
      contentXSpacing: 3,
      contentXMargin: 10,
      buttonYMargin: 4,
      buttonXMargin: 10,
      buttonTouchAreaXDilation: 8,
      buttonTouchAreaYDilation: 3,
      showTitleWhenExpanded: options.showTitleWhenExpanded
    } );
    this.addChild( accordionBox );

    this.mutate( options );
  }

  statesOfMatter.register( 'ForcesControlPanel', ForcesControlPanel );

  return inherit( Node, ForcesControlPanel );
} );

