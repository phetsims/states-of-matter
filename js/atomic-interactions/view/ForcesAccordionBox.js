// Copyright 2015-2023, University of Colorado Boulder

/**
 * This class displays a control panel for controlling the display of attractive, repulsive, and total force.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BracketNode from '../../../../scenery-phet/js/BracketNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Node, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import ForceDisplayMode from '../model/ForceDisplayMode.js';

//strings
const attractiveString = StatesOfMatterStrings.attractive;
const electronOverlapString = StatesOfMatterStrings.electronOverlap;
const forcesString = StatesOfMatterStrings.forces;
const hideForcesString = StatesOfMatterStrings.hideForces;
const repulsiveString = StatesOfMatterStrings.repulsive;
const totalForceString = StatesOfMatterStrings.totalForce;
const vanderwaalsString = StatesOfMatterStrings.vanderwaals;

// constants
const TEXT_LABEL_MAX_WIDTH = 175; // max width of text label in the panel
const RADIO_BUTTON_RADIUS = 6;
const ICON_PADDING = 35; // empirically determined to put the icons in a good position on the panel

class ForcesAccordionBox extends AccordionBox {

  /**
   * @param {Property.<string>} forcesProperty that determines which forces to display
   * @param {Property.<boolean>} forceControlPanelExpandProperty -true to use force panel expand, false if not
   * @param {Object} [options] for various panel display properties
   */
  constructor( forcesProperty, forceControlPanelExpandProperty, options ) {

    // convenience function for creating text with the attributes needed by this panel
    const createTextNode = ( string, width, fontSize ) => {
      return new Text( string, {
        font: new PhetFont( fontSize ),
        fill: options.textFill,
        maxWidth: width
      } );
    };

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
      expandedProperty: forceControlPanelExpandProperty,
      contentAlign: 'left',
      titleAlignX: 'left',
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      contentYSpacing: 1,
      contentXSpacing: 3,
      contentXMargin: 10,
      buttonYMargin: 4,
      buttonXMargin: 10,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 8,
        touchAreaYDilation: 3
      },
      tandem: Tandem.REQUIRED
    }, options );

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

    const hideForcesText = { label: createTextNode( hideForcesString, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ) };

    const totalForceText = {
      label: createTextNode( totalForceString, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ),
      icon: totalForceArrow
    };

    const attractiveText = {
      label: createTextNode( attractiveString, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
      icon: attractiveArrow
    };

    const vanderwaalsText = {
      label: createTextNode( vanderwaalsString, TEXT_LABEL_MAX_WIDTH * 0.8, 11 )
    };

    const repulsiveText = {
      label: createTextNode( repulsiveString, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
      icon: repulsiveArrow
    };

    const electronOverlapText = {
      label: createTextNode( electronOverlapString, TEXT_LABEL_MAX_WIDTH * 0.8, 11 )
    };

    // compute the maximum item width
    const widestItem = _.maxBy( [ hideForcesText, totalForceText, attractiveText, vanderwaalsText, repulsiveText,
      electronOverlapText ], item => {
      return item.label.width + ( ( item.icon ) ? item.icon.width + ICON_PADDING : 0 );
    } );
    const maxWidth = widestItem.label.width + ( ( widestItem.icon ) ? widestItem.icon.width + ICON_PADDING : 0 );

    // inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width
    const createConsistentlySpacedLabel = labelSpec => {
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
    const totalForceStrutWidth = maxWidth - totalForceText.label.width - totalForceText.icon.width + bracket.width + bracketToTextSpacing;
    const totalForceItem = new HBox( {
      children: [ totalForceText.label,
        new HStrut( totalForceStrutWidth ),
        totalForceText.icon ]
    } );

    const radioButtonGroup = new AquaRadioButtonGroup(
      forcesProperty,
      [
        {
          createNode: () => new HBox( { spacing: 2, children: [ createConsistentlySpacedLabel( hideForcesText ) ] } ),
          value: ForceDisplayMode.HIDDEN,
          tandemName: 'hideForceRadioButton'
        },
        {
          createNode: () => new HBox( { spacing: 2, children: [ totalForceItem ] } ),
          value: ForceDisplayMode.TOTAL,
          tandemName: 'totalForceRadioButton'
        },
        {
          createNode: () => new HBox( {
            spacing: bracketToTextSpacing,
            children: [ bracket, componentForceText ]
          } ),
          value: ForceDisplayMode.COMPONENTS,
          tandemName: 'componentForceRadioButton'
        }
      ],
      {
        radioButtonOptions: {
          radius: RADIO_BUTTON_RADIUS
        },
        tandem: options.tandem.createTandem( 'radioButtonGroup' )
      }
    );

    accordionContent.addChild( radioButtonGroup );
    options.titleNode = createTextNode( forcesString, TEXT_LABEL_MAX_WIDTH * 0.9, 14 );

    super( accordionContent, options );
  }

  /**
   * @public
   * @override
   */
  dispose() {
    super.dispose();
  }
}

statesOfMatter.register( 'ForcesAccordionBox', ForcesAccordionBox );
export default ForcesAccordionBox;