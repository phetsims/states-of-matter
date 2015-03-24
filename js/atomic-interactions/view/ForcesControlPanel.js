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
  var forcesString = require( 'string!STATES_OF_MATTER/forces' );
  var hideForcesString = require( 'string!STATES_OF_MATTER/hideForces' );
  var totalForceString = require( 'string!STATES_OF_MATTER/totalForce' );
  var attractiveString = require( 'string!STATES_OF_MATTER/attractive' );
  var repulsiveString = require( 'string!STATES_OF_MATTER/repulsive' );
  var vanderwaalsString = require( 'string!STATES_OF_MATTER/vanderwaals' );
  var electronOverlapString = require( 'string!STATES_OF_MATTER/electronOverlap' );

  //constants
  var MAX_WIDTH = 130; // max width of text label  in the panel

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
      showTitleWhenExpand: true,
      panelMinWidth: 168,
      backgroundColor: '#D1D2FF',
      cornerRadius: 5 // radius of the rounded corners on the background
    }, options );

    Node.call( this );
    var accordionContent = new Node();
    var arrowEndX = 25;
    var arrowStartX = 0;
    var arrowY = 0;
    var arrowNodeOptions = {
      headHeight: 12,
      headWidth: 20,
      tailWidth: 8
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
      var text = new Text( string, { font: new PhetFont( fontSize ), fill: options.textColor } );
      if ( text.width > width ) {
        text.setFont( new PhetFont( fontSize * width / text.width ) );
      }
      return text;
    };

    // hide forces
    var hideForcesText = { label: createText( hideForcesString, MAX_WIDTH / 2, 12 ) };

    // total force
    var totalForceText = {
      label: createText( totalForceString, MAX_WIDTH / 2, 12 ),
      icon: totalForceArrow
    };
    var attractiveText = {
      label: createText( attractiveString, MAX_WIDTH / 2, 11 ),
      icon: attractiveArrow
    };
    var vanderwaalsText = {
      label: createText( vanderwaalsString, MAX_WIDTH / 2, 10 )
    };
    var repulsiveText = {
      label: createText( repulsiveString, MAX_WIDTH / 2, 11 ),
      icon: repulsiveArrow
    };
    var electronOverlapText = {
      label: createText( electronOverlapString, MAX_WIDTH / 2, 10 )
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

    var totalForce = new HBox( { spacing: 2, children: [ totalForceItem ] } );
    var hideForce = new HBox( { spacing: 2, children: [ createItem( hideForcesText ) ] } );

    var hideForcesRadio = new AquaRadioButton( forcesProperty, 'hideForces', hideForce, { radius: 8 } );
    var totalForceRadio = new AquaRadioButton( forcesProperty, 'totalForce', totalForce, { radius: 8 } );
    var componentForceRadio = new AquaRadioButton( forcesProperty, 'componentForce', componentForce, {
      radius: 8
    } );

    var radioButtonGroup = new VBox( {
      children: [ hideForcesRadio, totalForceRadio, componentForceRadio ],
      align: 'left',
      spacing: 3
    } );
    // panel width of atomic interaction and  atomic interaction in SOM full version is different
    var panelMinWidth = options.showTitleWhenExpand ? 178 : 185;
    radioButtonGroup.setTranslation( 10, 0 );
    accordionContent.addChild( radioButtonGroup );
    // show white stroke around the force panel within SOM  full version  else  show black stroke
    var panelStroke = options.showTitleWhenExpand ? 'white' : 'black';
    var accordionBox = new AccordionBox( accordionContent,
      {
        titleNode: createText( forcesString, MAX_WIDTH / 2, 14 ),
        fill: options.backgroundColor,
        stroke: panelStroke,
        expandedProperty: forceControlPanelExpandProperty,
        contentAlign: 'left',
        titleAlignX: 'left',
        buttonAlign: options.buttonAlign,
        cornerRadius: 4,
        minWidth: panelMinWidth,
        contentYSpacing: 1,
        contentXSpacing: 3,
        contentXMargin: 12,
        buttonYMargin: 4,
        buttonXMargin: 10,
        buttonTouchAreaDilatedX: 15,
        buttonTouchAreaDilatedY: 6,
        showTitleWhenExpanded: options.showTitleWhenExpand
      } );
    this.addChild( accordionBox );

    this.mutate( options );

  }

  return inherit( Node, ForcesControlPanel );
} );

