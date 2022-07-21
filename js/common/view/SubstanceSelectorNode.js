// Copyright 2020-2022, University of Colorado Boulder

/**
 * SubstanceSelectorNode is a node with a label on the left and an icon - generally something that represents and atom
 * or molecule - on the right.  It maintains its initial width if the width of the label changes.
 */

import { Color, HBox, Line } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';

class SubstanceSelectorNode extends HBox {

  /**
   * @param {Node} label
   * @param {Node} icon
   * @param {number} width - width of this selector in screen coordinates
   */
  constructor( label, icon, width ) {

    // set up the initial horizontal box
    const initialSpacerWidth = width - label.width - icon.width;
    assert && assert( initialSpacerWidth > 0 );
    const spacer = new Line( 0, 0, initialSpacerWidth, 0, {
      stroke: Color.TRANSPARENT // it can be helpful during debugging to changes this to a visible color
    } );
    super( {
      children: [ label, spacer, icon ]
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
   * @public
   */
  dispose() {
    this.disposeSubstanceSelectorNode();
    super.dispose();
  }
}

statesOfMatter.register( 'SubstanceSelectorNode', SubstanceSelectorNode );
export default SubstanceSelectorNode;