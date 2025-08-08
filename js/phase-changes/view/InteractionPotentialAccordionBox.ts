// Copyright 2014-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * an accordion box that holds an interactive potential diagram
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import MultipleParticleModel from '../../common/model/MultipleParticleModel.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMColors from '../../common/view/SOMColors.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import EpsilonControlPotentialGraph from './EpsilonControlPotentialGraph.js';

const interactionPotentialString = StatesOfMatterStrings.interactionPotential;

class InteractionPotentialAccordionBox extends AccordionBox {

  /**
   * @param sigma - atom diameter
   * @param epsilon - interaction strength
   * @param multipleParticleModel - model of the simulation
   * @param options - that can be passed on to the underlying node
   */
  public constructor( sigma: number, epsilon: number, multipleParticleModel: MultipleParticleModel, options?: Object ) {

    options = merge( { tandem: Tandem.REQUIRED }, options );

    const graph = new EpsilonControlPotentialGraph(
      sigma,
      epsilon,
      multipleParticleModel,
      { tandem: options.tandem.createTandem( 'graph' ) }
    );

    const accordionContent = new Node();

    accordionContent.addChild( graph.centerAxis );
    accordionContent.addChild( graph.horizontalAxisLabel );
    accordionContent.addChild( graph.horizontalAxis );
    accordionContent.addChild( graph.verticalAxisLabel );
    accordionContent.addChild( graph.verticalAxis );
    accordionContent.addChild( graph.interactionPotentialCanvasNode );
    accordionContent.addChild( graph.ljPotentialGraph );

    const accordionContentHBox = new HBox( { children: [ accordionContent ] } );
    const titleNode = new Text( interactionPotentialString, {
      fill: SOMColors.controlPanelTextProperty,
      font: new PhetFont( { size: 13 } )
    } );
    if ( titleNode.width > graph.horizontalAxis.width ) {
      titleNode.scale( graph.horizontalAxis.width / titleNode.width );
    }
    super( accordionContentHBox, merge( {
      titleNode: titleNode,
      fill: SOMColors.controlPanelBackgroundProperty,
      stroke: SOMColors.controlPanelStrokeProperty,
      expandedProperty: multipleParticleModel.interactionPotentialExpandedProperty,
      contentAlign: 'center',
      titleAlignX: 'center',
      buttonAlign: 'left',
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      contentYSpacing: -3,
      contentYMargin: 5,
      contentXMargin: 6,
      contentXSpacing: 6,
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
      buttonYMargin: 4,
      buttonXMargin: 6,
      expandCollapseButtonOptions: {
        sideLength: 12,
        touchAreaXDilation: 15,
        touchAreaYDilation: 10
      }
    }, options ) );

    // @public {EpsilonControlPotentialGraph}
    this.graph = graph;
  }

  /**
   * pass through to graph
   */
  public setMolecular( molecular: boolean ): void {
    this.graph.setMolecular( molecular );
  }
}

statesOfMatter.register( 'InteractionPotentialAccordionBox', InteractionPotentialAccordionBox );
export default InteractionPotentialAccordionBox;