// Copyright 2015-2020, University of Colorado Boulder

/**
 * This class displays a control panel for controlling the display of attractive, repulsive, and total force.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BracketNode from '../../../../scenery-phet/js/BracketNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../scenery/js/nodes/VBox.js';
import VStrut from '../../../../scenery/js/nodes/VStrut.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatterStrings from '../../states-of-matter-strings.js';
import statesOfMatter from '../../statesOfMatter.js';
import ForceDisplayMode from '../model/ForceDisplayMode.js';

//strings
const attractiveString = statesOfMatterStrings.attractive;
const electronOverlapString = statesOfMatterStrings.electronOverlap;
const forcesString = statesOfMatterStrings.forces;
const hideForcesString = statesOfMatterStrings.hideForces;
const repulsiveString = statesOfMatterStrings.repulsive;
const totalForceString = statesOfMatterStrings.totalForce;
const vanderwaalsString = statesOfMatterStrings.vanderwaals;

// constants
const TEXT_LABEL_MAX_WIDTH = 175; // max width of text label in the panel
const RADIO_BUTTON_RADIUS = 6;
const ICON_PADDING = 25; // empirically determined to put the icons in a good position on the panel

/**
 * @param {Property<string>} forcesProperty that determines which forces to display
 * @param {Property<boolean>} forceControlPanelExpandProperty -true to use force panel expand, false if not
 * @param {Object} [options] for various panel display properties
 * @constructor
 */
function ForcesControlPanel( forcesProperty, forceControlPanelExpandProperty, options ) {

  options = merge( {
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
    maxWidth: Number.POSITIVE_INFINITY,
    tandem: Tandem.REQUIRED
  }, options );

  Node.call( this );
  const accordionContent = new Node();
  const arrowEndX = 20;
  const arrowStartX = 0;
  const arrowY = 0;
  const arrowNodeOptions = {
    headHeight: 10,
    headWidth: 14,
    tailWidth: 6
  };

  const totalForceArrow = new ArrowNode( arrowEndX, arrowY, arrowStartX, arrowY, merge( {
    fill: '#49B649'
  }, arrowNodeOptions ) );

  const attractiveArrow = new ArrowNode( arrowEndX, arrowY, arrowStartX, arrowY, merge( {
    fill: '#FC9732'
  }, arrowNodeOptions ) );

  const repulsiveArrow = new ArrowNode( arrowStartX, arrowY, arrowEndX, arrowY, merge( {
    fill: '#FD17FF'
  }, arrowNodeOptions ) );

  const createText = function( string, width, fontSize ) {
    const text = new Text( string, { font: new PhetFont( fontSize ), fill: options.textFill } );
    if ( text.width > width ) {
      text.scale( width / text.width );
    }
    return text;
  };

  const hideForcesText = { label: createText( hideForcesString, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ) };

  const totalForceText = {
    label: createText( totalForceString, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ),
    icon: totalForceArrow
  };

  const attractiveText = {
    label: createText( attractiveString, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
    icon: attractiveArrow
  };

  const vanderwaalsText = {
    label: createText( vanderwaalsString, TEXT_LABEL_MAX_WIDTH * 0.8, 11 )
  };

  const repulsiveText = {
    label: createText( repulsiveString, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
    icon: repulsiveArrow
  };

  const electronOverlapText = {
    label: createText( electronOverlapString, TEXT_LABEL_MAX_WIDTH * 0.8, 11 )
  };

  // compute the maximum item width
  const widestItem = _.maxBy( [ hideForcesText, totalForceText, attractiveText, vanderwaalsText, repulsiveText,
    electronOverlapText ], function( item ) {
    return item.label.width + ( ( item.icon ) ? item.icon.width + ICON_PADDING : 0 );
  } );
  const maxWidth = widestItem.label.width + ( ( widestItem.icon ) ? widestItem.icon.width + ICON_PADDING : 0 );

  // inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width
  const createConsistentlySpacedLabel = function( labelSpec ) {
    if ( labelSpec.icon ) {
      const strutWidth = maxWidth - labelSpec.label.width - labelSpec.icon.width;
      return new HBox( { children: [ labelSpec.label, new HStrut( strutWidth ), labelSpec.icon ] } );
    }
    else {
      return new HBox( { children: [ labelSpec.label ] } );
    }
  };

  const componentForceText = new VBox( {
    spacing: 3,
    children: [
      createConsistentlySpacedLabel( attractiveText ),
      createConsistentlySpacedLabel( vanderwaalsText ),
      createConsistentlySpacedLabel( repulsiveText ),
      createConsistentlySpacedLabel( electronOverlapText ) ],
    align: 'left'
  } );

  // the bracket at the left - this is tweaked a bit for optimal appearance
  const bracket = new VBox( {
    spacing: 0,
    children: [
      new VStrut( 4 ),
      new BracketNode( {
        orientation: 'left',
        bracketLength: componentForceText.height,
        bracketLineWidth: 2,
        bracketStroke: options.textFill,
        bracketTipPosition: 0.475
      } )
    ]
  } );

  const bracketToTextSpacing = 2;
  const componentForce = new HBox( {
    spacing: bracketToTextSpacing,
    children: [ bracket, componentForceText ]
  } );
  const totalForceStrutWidth = maxWidth - totalForceText.label.width - totalForceText.icon.width + bracket.width + bracketToTextSpacing;
  const totalForceItem = new HBox( {
    children: [ totalForceText.label,
      new HStrut( totalForceStrutWidth ),
      totalForceText.icon ]
  } );

  const totalForce = new HBox( { spacing: 2, children: [ totalForceItem ] } );
  const hideForce = new HBox( { spacing: 2, children: [ createConsistentlySpacedLabel( hideForcesText ) ] } );

  const hideForcesRadioButton = new AquaRadioButton( forcesProperty, ForceDisplayMode.HIDDEN, hideForce, {
    radius: RADIO_BUTTON_RADIUS,
    tandem: options.tandem.createTandem( 'hideForcesRadioButton' )
  } );
  const totalForceRadioButton = new AquaRadioButton( forcesProperty, ForceDisplayMode.TOTAL, totalForce, {
    radius: RADIO_BUTTON_RADIUS,
    tandem: options.tandem.createTandem( 'totalForceRadioButton' )
  } );
  const componentForceRadioButton = new AquaRadioButton( forcesProperty, ForceDisplayMode.COMPONENTS, componentForce, {
    radius: RADIO_BUTTON_RADIUS,
    tandem: options.tandem.createTandem( 'componentForceRadioButton' )
  } );

  const radioButtonGroup = new VBox( {
    children: [ hideForcesRadioButton, totalForceRadioButton, componentForceRadioButton ],
    align: 'left',
    spacing: 3,
    left: 8 // indented a bit
  } );
  accordionContent.addChild( radioButtonGroup );

  // expand the touch areas of the radio buttons so that they are easier to work with on touch-based devices
  const xDilation = 8;
  const yDilation = 1.5;
  hideForcesRadioButton.touchArea = hideForcesRadioButton.localBounds.dilatedXY( xDilation, yDilation );
  totalForceRadioButton.touchArea = totalForceRadioButton.localBounds.dilatedXY( xDilation, yDilation );

  // show white stroke around the force panel within SOM full version  else  show black stroke
  const accordionBox = new AccordionBox( accordionContent, {
    titleNode: createText( forcesString, TEXT_LABEL_MAX_WIDTH * 0.9, 14 ),
    fill: options.fill,
    stroke: options.stroke,
    lineWidth: options.lineWidth,
    expandedProperty: forceControlPanelExpandProperty,
    contentAlign: 'left',
    titleAlignX: 'left',
    buttonAlign: options.buttonAlign,
    cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
    minWidth: options.minWidth,
    maxWidth: options.maxWidth,
    contentYSpacing: 1,
    contentXSpacing: 3,
    contentXMargin: 10,
    buttonYMargin: 4,
    buttonXMargin: 10,
    expandCollapseButtonOptions: {
      touchAreaXDilation: 8,
      touchAreaYDilation: 3
    },
    showTitleWhenExpanded: options.showTitleWhenExpanded,
    tandem: options.tandem.createTandem( 'accordionBox' )
  } );
  this.addChild( accordionBox );

  this.mutate( options );
}

statesOfMatter.register( 'ForcesControlPanel', ForcesControlPanel );

inherit( Node, ForcesControlPanel );
export default ForcesControlPanel;