// Copyright 2014-2020, University of Colorado Boulder

/**
 * an accordion box that holds an interactive potential diagram
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import inherit from '../../../../phet-core/js/inherit.js';
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
import EpsilonControlInteractionPotentialDiagram from './EpsilonControlInteractionPotentialDiagram.js';

const interactionPotentialString = statesOfMatterStrings.interactionPotential;

/**
 * @param {number} sigma - atom diameter
 * @param {number} epsilon - interaction strength
 * @param {boolean} wide - true if the wide screen version of the graph is needed, false if not.
 * @param {MultipleParticleModel} multipleParticleModel - model of the simulation
 * @param {Object} [options] that can be passed on to the underlying node
 * @constructor
 */
function InteractionPotentialAccordionBox( sigma, epsilon, wide, multipleParticleModel, options ) {

  options = merge( { tandem: Tandem.REQUIRED }, options );

  this.diagram = new EpsilonControlInteractionPotentialDiagram(
    sigma,
    epsilon,
    wide,
    multipleParticleModel,
    { tandem: options.tandem.createTandem( 'diagram' ) }
  );

  const accordionContent = new Node();

  accordionContent.addChild( this.diagram.centerAxis );
  accordionContent.addChild( this.diagram.horizontalAxisLabel );
  accordionContent.addChild( this.diagram.horizontalAxis );
  accordionContent.addChild( this.diagram.verticalAxisLabel );
  accordionContent.addChild( this.diagram.verticalAxis );
  accordionContent.addChild( this.diagram.interactionPotentialCanvasNode );
  accordionContent.addChild( this.diagram.ljPotentialGraph );

  const accordionContentHBox = new HBox( { children: [ accordionContent ] } );
  const titleNode = new Text( interactionPotentialString, {
    fill: SOMColorProfile.controlPanelTextProperty,
    font: new PhetFont( { size: 13 } )
  } );
  if ( titleNode.width > this.diagram.horizontalAxis.width ) {
    titleNode.scale( this.diagram.horizontalAxis.width / titleNode.width );
  }
  AccordionBox.call( this, accordionContentHBox, merge( {
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
}

statesOfMatter.register( 'InteractionPotentialAccordionBox', InteractionPotentialAccordionBox );
export default inherit( AccordionBox, InteractionPotentialAccordionBox, {

  // pass through to diagram
  setMolecular( molecular ) {
    this.diagram.setMolecular( molecular );
  }
} );