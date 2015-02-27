// Copyright 2002-2014, University of Colorado Boulder

/**
 * This class displays a control panel for controlling the display of attractive, repulsive and total force.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SUN/HStrut' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  //strings
  var forcesString = require( 'string!ATOMIC_INTERACTIONS/forces' );
  var hideForcesString = require( 'string!ATOMIC_INTERACTIONS/hideForces' );
  var totalForceString = require( 'string!ATOMIC_INTERACTIONS/totalForce' );
  var attractiveString = require( 'string!ATOMIC_INTERACTIONS/attractive' );
  var repulsiveString = require( 'string!ATOMIC_INTERACTIONS/repulsive' );
  var vanderwaalsString = require( 'string!ATOMIC_INTERACTIONS/vanderwaals' );
  var electronOverlapString = require( 'string!ATOMIC_INTERACTIONS/electronOverlap' );

  /**
   *
   * @param {Property<String>} forcesProperty that determines which forces to display
   * @param {Property<Boolean>} forceControlPanelExpandProperty -true to use force panel expand,false if not
   * @param {Object} options for various panel display properties
   * @constructor
   */

  function ForcesControlPanel( forcesProperty, forceControlPanelExpandProperty, options ) {

    options = _.extend( {
      xMargin: 5,
      yMargin: 8,
      fill: '#D1D2FF',
      stroke: 'gray',
      tickTextColor: 'black',
      textColor: 'black',
      buttonAlign: 'left',
      lineWidth: 1,
      totalForceArrowColor: '#49B649',
      attractiveArrowColor: '#FC9732',
      repulsiveArrowColor: '#FD17FF',
      showTitleWhenExpand: true,
      panelMinWidth: 168,
      backgroundColor: '#D1D2FF',
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var accordionContent = new Node();
    var arrowHeadHeight = 12;
    var arrowTailWidth = 8;
    var arrowHeadWidth = 20;
    var arrowEndX = 25;
    var arrowStartX = 0;
    var arrowY = 0;
    var totalForceArrow = new ArrowNode( arrowEndX, arrowY, arrowStartX, arrowY, {
      fill: options.totalForceArrowColor,
      headHeight: arrowHeadHeight,
      headWidth: arrowHeadWidth,
      tailWidth: arrowTailWidth
    } );
    var attractiveArrow = new ArrowNode( arrowEndX, arrowY, arrowStartX, arrowY, {
      fill: options.attractiveArrowColor,
      headHeight: arrowHeadHeight,
      headWidth: arrowHeadWidth,
      tailWidth: arrowTailWidth
    } );

    var repulsiveArrow = new ArrowNode( arrowStartX, arrowY, arrowEndX, arrowY, {
      fill: options.repulsiveArrowColor,
      headHeight: arrowHeadHeight,
      headWidth: arrowHeadWidth,
      tailWidth: arrowTailWidth
    } );

    var textOptions = { font: new PhetFont( 12 ), fill: options.textColor };
    var hideForcesText = { label: new Text( hideForcesString, textOptions ) };
    var totalForceText = {
      label: new Text( totalForceString, textOptions ),
      icon: totalForceArrow
    };
    var attractiveText = {
      label: new Text( attractiveString, { font: new PhetFont( 11 ), fill: options.textColor } ),
      icon: attractiveArrow
    };
    var vanderwaalsText = {
      label: new Text( vanderwaalsString,
        { font: new PhetFont( 10 ), fill: options.textColor } )
    };
    var repulsiveText = {
      label: new Text( repulsiveString, { font: new PhetFont( 11 ), fill: options.textColor } ),
      icon: repulsiveArrow
    };
    var electronOverlapText = {
      label: new Text( electronOverlapString,
        { font: new PhetFont( 10 ), fill: options.textColor } )
    };

    // compute the maximum item width
    var widestItem = _.max( [ hideForcesText, totalForceText, attractiveText, vanderwaalsText, repulsiveText,
      electronOverlapText ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItem.label.width + ((widestItem.icon) ? widestItem.icon.width : 0);

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width;
        return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ itemSpec.label ] } );
      }
    };

    var componentForceText = new VBox( {
      children: [ createItem( attractiveText ),
        createItem( vanderwaalsText ),
        createItem( repulsiveText ),
        createItem( electronOverlapText ) ],
      align: 'left'
    } );

    // the big left curly brace
    var curveShape = new Path( new Shape()
        .moveTo( 8, 8 )
        .lineTo( 3, 8 )
        .lineTo( 3, componentForceText.height / 2 - 3 )
        .lineTo( 0, componentForceText.height / 2 )
        .lineTo( 3, componentForceText.height / 2 + 3 )
        .lineTo( 3, componentForceText.height - 8 )
        .lineTo( 8, componentForceText.height - 8 ), {
        stroke: options.textColor,
        lineWidth: 2
      }
    );

    var componentForce = new HBox( {
      spacing: 2,
      children: [ curveShape, componentForceText ]
    } );
    var totalForceStrutWidth = maxWidth - totalForceText.label.width -
                               totalForceText.icon.width + curveShape.width;
    var totalForceItem = new HBox( {
      children: [ totalForceText.label,
        new HStrut( totalForceStrutWidth ),
        totalForceText.icon ]
    } );

    var totalForce = new HBox( {
      spacing: 2,
      children: [ totalForceItem ]
    } );
    var hideForce = new HBox( {
      spacing: 2,
      children: [ createItem( hideForcesText ) ]
    } );

    var hideForcesRadio = new AquaRadioButton( forcesProperty, 'hideForces', hideForce,
      { radius: 8 } );
    var totalForceRadio = new AquaRadioButton( forcesProperty, 'totalForce', totalForce,
      { radius: 8 } );
    var componentForceRadio = new AquaRadioButton( forcesProperty, 'componentForce', componentForce,
      { radius: 8 } );

    var radioButtonGroup = new VBox( {
      children: [ hideForcesRadio, totalForceRadio, componentForceRadio ],
      align: 'left',
      spacing: 3
    } );

    radioButtonGroup.setTranslation( 10, 0 );
    accordionContent.addChild( radioButtonGroup );

    var accordionBox = new AccordionBox( accordionContent,
      {
        titleNode: new Text( forcesString, { fill: options.textColor, font: new PhetFont( { size: 14 } ) } ),
        fill: options.backgroundColor,
        stroke: 'white',
        expandedProperty: forceControlPanelExpandProperty,
        contentAlign: 'left',
        titleAlign: 'left',
        buttonAlign: options.buttonAlign,
        cornerRadius: 4,
        minWidth: options.panelMinWidth,
        contentYSpacing: 1,
        contentXSpacing: 3,
        contentXMargin: 12,
        buttonYMargin: 4,
        buttonXMargin: 10,
        showTitleWhenExpanded: options.showTitleWhenExpand
      } );
    this.addChild( accordionBox );

    this.mutate( options );

  }

  return inherit( Node, ForcesControlPanel );
} );

