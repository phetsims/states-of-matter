// Copyright 2014-2021, University of Colorado Boulder

/**
 * an accordion box that holds an interactive potential diagram
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMColorProfile from '../../common/view/SOMColorProfile.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
import statesOfMatter from '../../statesOfMatter.js';
import EpsilonControlPotentialGraph from './EpsilonControlPotentialGraph.js';

const interactionPotentialString = statesOfMatterStrings.interactionPotential;

class InteractionPotentialAccordionBox extends AccordionBox {

  /**
   * @param {number} sigma - atom diameter
   * @param {number} epsilon - interaction strength
   * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( sigma, epsilon, multipleParticleModel, options ) {

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
      fill: SOMColorProfile.controlPanelTextProperty,
      font: new PhetFont( { size: 13 } )
    } );
    if ( titleNode.width > graph.horizontalAxis.width ) {
      titleNode.scale( graph.horizontalAxis.width / titleNode.width );
    }
    super( accordionContentHBox, merge( {
      titleNode: titleNode,
      fill: SOMColorProfile.controlPanelBackgroundProperty,
      stroke: SOMColorProfile.controlPanelStrokeProperty,
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
   * @public
   */
  setMolecular( molecular ) {
    this.graph.setMolecular( molecular );
  }
}

statesOfMatter.register( 'InteractionPotentialAccordionBox', InteractionPotentialAccordionBox );
export default InteractionPotentialAccordionBox;