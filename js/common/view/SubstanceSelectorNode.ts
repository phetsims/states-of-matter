// Copyright 2020-2025, University of Colorado Boulder

/**
 * SubstanceSelectorNode is a node with a label on the left and an icon - generally something that represents and atom
 * or molecule - on the right.  It maintains its initial width if the width of the label changes.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import statesOfMatter from '../../statesOfMatter.js';

class SubstanceSelectorNode extends HBox {

  private readonly disposeSubstanceSelectorNode: () => void;

  /**
   * @param width - width of this selector in screen coordinates
   */
  public constructor( label: Node, icon: Node, width: number ) {

    // set up the initial horizontal box
    const initialSpacerWidth = width - label.width - icon.width;
    assert && assert( initialSpacerWidth > 0 );
    const spacer = new Line( 0, 0, initialSpacerWidth, 0, {
      stroke: Color.TRANSPARENT // it can be helpful during debugging to changes this to a visible color
    } );
    super( {
      children: [ label, spacer, icon ],
      sizable: false
    } );

    // resize the spacer if the label size changes
    const updateSpacer = () => {
      const newSpacerWidth = Math.max( width - label.width - icon.width, 0.1 );
      spacer.setX2( newSpacerWidth );
      this.updateLayout();
    };
    label.localBoundsProperty.lazyLink( updateSpacer );

    // dispose function
    this.disposeSubstanceSelectorNode = () => {
      label.localBoundsProperty.unlink( updateSpacer );
    };
  }

  /**
   * release all memory to avoid memory leaks
   */
  public override dispose(): void {
    this.disposeSubstanceSelectorNode();
    super.dispose();
  }
}

statesOfMatter.register( 'SubstanceSelectorNode', SubstanceSelectorNode );
export default SubstanceSelectorNode;