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
   * @param {Property<String>} forcesProperty that determines which forces to display
   * @param {Object} options for various panel display properties
   * @constructor
   */

  function ForcesControlPanel( forcesProperty, options ) {

    Node.call( this );
    this.accordinContent = new Node();

    var totalForceArrow = new ArrowNode( 25, 0, 0, 0, {
      fill: '#49B649',
      headHeight: 12,
      headWidth: 20,
      tailWidth: 8
    } );
    var attractiveArrow = new ArrowNode( 25, 0, 0, 0, {
      fill: '#FC9732',
      headHeight: 12,
      headWidth: 20,
      tailWidth: 8
    } );

    var repulsiveArrow = new ArrowNode( 0, 0, 25, 0, {
      fill: '#FD17FF',
      headHeight: 12,
      headWidth: 20,
      tailWidth: 8
    } );

    var textOptions = { font: new PhetFont( 12 ), fill: 'white' };
    var hideForcesText = { label: new Text( hideForcesString, textOptions ) };
    var totalForceText = { label: new Text( totalForceString, textOptions ), icon: totalForceArrow};
    var attractiveText = { label: new Text( attractiveString, textOptions ), icon: attractiveArrow};
    var vanderwaalsText = { label: new Text( vanderwaalsString, { font: new PhetFont( 10 ), fill: 'white' } )};
    var repulsiveText = { label: new Text( repulsiveString, textOptions ), icon: repulsiveArrow };
    var electronOverlapText = { label: new Text( electronOverlapString, { font: new PhetFont( 10 ), fill: 'white' } )};

    // compute the maximum item width
    var widestItem = _.max( [ hideForcesText, totalForceText, attractiveText, vanderwaalsText, repulsiveText,
                              electronOverlapText ], function( item ) {
      return item.label.width + ((item.icon) ? item.icon.width : 0);
    } );
    var maxWidth = widestItem.label.width + ((widestItem.icon) ? widestItem.icon.width : 0);

    // pad inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width.
    var createItem = function( itemSpec ) {
      if ( itemSpec.icon ) {
        var strutWidth = maxWidth - itemSpec.label.width - itemSpec.icon.width + 25;
        return new HBox( { children: [ itemSpec.label, new HStrut( strutWidth ), itemSpec.icon ] } );
      }
      else {
        return new HBox( { children: [ itemSpec.label] } );
      }
    };

    var componentForceText = new VBox( {
      children: [createItem( attractiveText ),
                 createItem( vanderwaalsText ),
                 createItem( repulsiveText ),
                 createItem( electronOverlapText )],
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
        stroke: 'white',
        lineWidth: 2
      }
    );

    var componentForce = new HBox( {
      spacing: 2,
      children: [curveShape, componentForceText]
    } );

    var hideForcesRadio = new AquaRadioButton( forcesProperty, 'hideForces', createItem( hideForcesText ),
      { radius: 8 } );
    var totalForceRadio = new AquaRadioButton( forcesProperty, 'totalForce', createItem( totalForceText ),
      { radius: 8 } );
    var componentForceRadio = new AquaRadioButton( forcesProperty, 'componentForce', componentForce,
      { radius: 8 } );

    var radioButtonGroup = new VBox( {
      children: [ hideForcesRadio, totalForceRadio, componentForceRadio],
      align: 'left'
    } );

    radioButtonGroup.setTranslation( 10, 0 );
    this.accordinContent.addChild( radioButtonGroup );

    var accordionBox = new AccordionBox( this.accordinContent,
      {
        titleNode: new Text( forcesString, { fill: "#FFFFFF", font: new PhetFont( { size: 14 } ) } ),
        fill: 'black',
        stroke: 'white',
        // expandedProperty: expandedProperty,
        contentAlign: 'center',
        titleAlign: 'left',
        buttonAlign: 'left',
        cornerRadius: 4,
        contentYSpacing: 1,
        buttonYMargin: 4,
        buttonXMargin: 10
      } );
    this.addChild( accordionBox );

    this.mutate( options );

  }

  return inherit( Node, ForcesControlPanel );
} );

