// Copyright 2015-2025, University of Colorado Boulder

/**
 * This class displays a control panel for controlling the display of attractive, repulsive, and total force.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BracketNode from '../../../../scenery-phet/js/BracketNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import HStrut from '../../../../scenery/js/nodes/HStrut.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import VStrut from '../../../../scenery/js/nodes/VStrut.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import AquaRadioButtonGroup from '../../../../sun/js/AquaRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import ForceDisplayMode from '../model/ForceDisplayMode.js';

//strings
const attractiveStringProperty = StatesOfMatterStrings.attractiveStringProperty;
const electronOverlapStringProperty = StatesOfMatterStrings.electronOverlapStringProperty;
const forcesStringProperty = StatesOfMatterStrings.forcesStringProperty;
const hideForcesStringProperty = StatesOfMatterStrings.hideForcesStringProperty;
const repulsiveStringProperty = StatesOfMatterStrings.repulsiveStringProperty;
const totalForceStringProperty = StatesOfMatterStrings.totalForceStringProperty;
const vanderwaalsStringProperty = StatesOfMatterStrings.vanderwaalsStringProperty;

// constants
const TEXT_LABEL_MAX_WIDTH = 175; // max width of text label in the panel
const RADIO_BUTTON_RADIUS = 6;
const ICON_PADDING = 35; // empirically determined to put the icons in a good position on the panel

type SelfOptions = {
  tickTextColor?: string;
  textFill?: string;
  xMargin?: number;
  yMargin?: number;
  fill?: string;
  stroke?: string;
};

type ForcesAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

class ForcesAccordionBox extends AccordionBox {

  /**
   * @param forcesProperty that determines which forces to display
   * @param forceControlPanelExpandProperty -true to use force panel expand, false if not
   * @param providedOptions for various panel display properties
   */
  public constructor( forcesProperty: Property<string>, forceControlPanelExpandProperty: Property<boolean>, providedOptions?: ForcesAccordionBoxOptions ) {

    const options = optionize<ForcesAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {

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
    }, providedOptions );

    // convenience function for creating text with the attributes needed by this panel
    const createTextNode = ( string: TReadOnlyProperty<string>, width: number, fontSize: number ) => {
      return new Text( string, {
        font: new PhetFont( fontSize ),
        fill: options.textFill,
        maxWidth: width
      } );
    };

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

    const hideForcesText = { label: createTextNode( hideForcesStringProperty, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ) };

    const totalForceText = {
      label: createTextNode( totalForceStringProperty, TEXT_LABEL_MAX_WIDTH * 0.65, 12 ),
      icon: totalForceArrow
    };

    const attractiveText = {
      label: createTextNode( attractiveStringProperty, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
      icon: attractiveArrow
    };

    const vanderwaalsText = {
      label: createTextNode( vanderwaalsStringProperty, TEXT_LABEL_MAX_WIDTH * 0.8, 11 )
    };

    const repulsiveText = {
      label: createTextNode( repulsiveStringProperty, TEXT_LABEL_MAX_WIDTH * 0.6, 12 ),
      icon: repulsiveArrow
    };

    const electronOverlapText = {
      label: createTextNode( electronOverlapStringProperty, TEXT_LABEL_MAX_WIDTH * 0.8, 11 )
    };

    // compute the maximum item width
    const widestItem = _.maxBy( [ hideForcesText, totalForceText, attractiveText, vanderwaalsText, repulsiveText,
      electronOverlapText ], ( item: { label: Node; icon?: Node } ) => {

      return item.label.width + ( ( item.icon ) ? item.icon.width + ICON_PADDING : 0 );
    } );

    // @ts-expect-error
    const maxWidth = widestItem.label.width + ( ( widestItem.icon ) ? widestItem.icon.width + ICON_PADDING : 0 );

    // inserts a spacing node (HStrut) so that the text, space and image together occupy a certain fixed width
    const createConsistentlySpacedLabel = ( labelSpec: { label: Node; icon?: Node } ) => {
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
    options.titleNode = createTextNode( forcesStringProperty, TEXT_LABEL_MAX_WIDTH * 0.9, 14 );

    super( accordionContent, options );
  }

  public override dispose(): void {
    super.dispose();
  }
}

statesOfMatter.register( 'ForcesAccordionBox', ForcesAccordionBox );
export default ForcesAccordionBox;