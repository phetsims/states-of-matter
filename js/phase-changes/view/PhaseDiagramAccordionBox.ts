// Copyright 2014-2025, University of Colorado Boulder

/**
 * a phase diagram in an accordion box
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Property from '../../../../axon/js/Property.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox, { type AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMColors from '../../common/view/SOMColors.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import PhaseDiagram from './PhaseDiagram.js';

const phaseDiagramString = StatesOfMatterStrings.phaseDiagram;

type SelfOptions = EmptySelfOptions;

type PhaseDiagramAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

class PhaseDiagramAccordionBox extends AccordionBox {

  // Make phase diagram available so that methods can access it
  private readonly phaseDiagram: PhaseDiagram;

  /**
   * @param expandedProperty - is to expand the phase diagram
   * @param providedOptions that can be passed on to the underlying node
   */
  public constructor( expandedProperty: Property<boolean>, providedOptions?: PhaseDiagramAccordionBoxOptions ) {

    const options = optionize<PhaseDiagramAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {
      fill: SOMColors.controlPanelBackgroundProperty,
      stroke: SOMColors.controlPanelStrokeProperty,
      expandedProperty: expandedProperty,
      contentAlign: 'center',
      titleAlignX: 'center',
      buttonAlign: 'left',
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      contentYSpacing: -1,
      contentYMargin: 5,
      contentXMargin: 5,
      buttonYMargin: 4,
      buttonXMargin: 5,
      maxWidth: 100,
      expandCollapseButtonOptions: {
        sideLength: 12,
        touchAreaXDilation: 15,
        touchAreaYDilation: 10
      },

      // @ts-expect-error
      tandem: providedOptions?.tandem.createTandem( 'accordionBox' ),
      visiblePropertyOptions: { phetioReadOnly: true }
    }, providedOptions );

    const phaseDiagram = new PhaseDiagram();

    const titleNode = new Text( phaseDiagramString, {
      fill: SOMColors.controlPanelTextProperty,
      font: new PhetFont( { size: 13 } ),

      // @ts-expect-error
      maxWidth: options.maxWidth * 0.75
    } );

    super( phaseDiagram, merge( options, { titleNode: titleNode } ) );

    this.phaseDiagram = phaseDiagram;
  }

  /**
   * Set the normalized position for this marker.
   * @param normalizedTemperature - Temperature (X position) value between 0 and 1 (inclusive).
   * @param normalizedPressure    - Pressure (Y position) value between 0 and 1 (inclusive).
   */
  public setStateMarkerPos( normalizedTemperature: number, normalizedPressure: number ): void {
    this.phaseDiagram.setStateMarkerPos( normalizedTemperature, normalizedPressure );
  }

  /**
   * Set the visibility of the state marker.
   */
  public setStateMarkerVisible( isVisible: boolean ): void {
    this.phaseDiagram.setStateMarkerVisible( isVisible );
  }

  /**
   * Set the phase diagram to be shaped such that it looks more like the phase diagram water, which is to say that the
   * solid-liquid line leans to the left rather than to the right.  Note that this is a very non-general approach - it
   * would be more general to allow the various points in the graph (e.g. triple point, critical point) to be
   * positioned anywhere, but currently it isn't worth the extra effort to do so.  Feel free if it is ever needed.
   */
  public setDepictingWater( depictingWater: boolean ): void {
    this.phaseDiagram.setDepictingWater( depictingWater );
  }
}

statesOfMatter.register( 'PhaseDiagramAccordionBox', PhaseDiagramAccordionBox );
export default PhaseDiagramAccordionBox;