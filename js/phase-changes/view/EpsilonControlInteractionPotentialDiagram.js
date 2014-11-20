// Copyright (c) 2002 - 2014. University of Colorado Boulder

/**
 * This class extends the Interaction Potential diagram to allow the user to
 * adjust the interaction strength parameter (i.e. epsilon).
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  // var Dimension2 = require( 'DOT/Dimension2' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  // var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  //var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  //var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var InteractionPotentialDiagramNode = require( 'STATES_OF_MATTER/common/view/InteractionPotentialDiagramNode' );


// Size of handles as function of node width.
  //var RESIZE_HANDLE_SIZE_PROPORTION = 0.12;
// Position of handle as function of node width.

  //private
  var EPSILON_HANDLE_OFFSET_PROPORTION = 0.08;

  //private
  //var RESIZE_HANDLE_NORMAL_COLOR = 'green';

  //private
  //var RESIZE_HANDLE_HIGHLIGHTED_COLOR = 'yellow';

  //private
  var EPSILON_LINE_WIDTH = 1;


  //private
  // var EPSILON_LINE_STROKE = new BasicStroke( EPSILON_LINE_WIDTH );

  //private
//  var EPSILON_LINE_COLOR = RESIZE_HANDLE_NORMAL_COLOR;

  /**
   *
   * @param sigma
   * @param epsilon
   * @param wide - True if the widescreen version of the graph is needed, false if not.
   * @param model
   * @param options
   * @constructor
   */
  function EpsilonControlInteractionPotentialDiagram( sigma, epsilon, wide, model, options ) {

    this.model;
    this.epsilonResizeHandle = null;
    this.interactionPotentialDiagramNode = new InteractionPotentialDiagramNode( sigma, epsilon, wide );
    InteractionPotentialDiagramNode.call( this, sigma, epsilon, wide, true );
    this.model = model;

    this.accordinContent = new Node();

    /*model.property.link( function() {
     // should when molecule change
     this.updateInteractivityState();
     this.drawPotentialCurve();
     // call when interaction strength change
     this.setLjPotentialParameters( model.getSigma(), model.getEpsilon() );
     } );*/


    // Add the line that will indicate the value of epsilon.
    var epsilonLineLength = EPSILON_HANDLE_OFFSET_PROPORTION * this.widthOfGraph * 2.2;
    this.epsilonLine = new Path( new Shape().moveTo( 0, 0 )
      .lineTo( -epsilonLineLength / 3, 0 )
      .lineTo( epsilonLineLength / 2, 0 ), {
      fill: 'red'
    } );

    this.accordinContent.addChild( this.ljPotentialGraph );
    this.epsilonResizeHandle = new Path( new ArrowShape( 0, 0, 0, 30 ), { fill: 'green', doubleHead: true } );
    this.ljPotentialGraph.addChild( this.epsilonResizeHandle );

    //this.epsilonLine.addInputEventListener( new CursorHandler( Cursor.N_RESIZE_CURSOR ) );
    //this.epsilonLine.addInputEventListener( epsilonChangeHandler );
    // the epsilon parameter.
    /*  this.epsilonResizeHandle = new ResizeArrowNode( RESIZE_HANDLE_SIZE_PROPORTION * m_width, Math.PI / 2,
     RESIZE_HANDLE_NORMAL_COLOR, RESIZE_HANDLE_HIGHLIGHTED_COLOR );
     m_ljPotentialGraph.addChild( m_epsilonResizeHandle );*/
    this.ljPotentialGraph.addChild( this.epsilonLine );


    // the epsilon parameter.
    // this.epsilonResizeHandle = new ArrowNode( RESIZE_HANDLE_SIZE_PROPORTION * this.width,3, 5, 7,{fill:'blue'} );
    //this.ljPotentialGraph.addChild( this.epsilonResizeHandle );
    // this.epsilonResizeHandle.addInputEventListener( epsilonChangeHandler );
    var accordionBox = new AccordionBox( this.accordinContent,
      {
        titleNode: new Text( 'Interaction Diagram', { fill: "#FFFFFF", font: new PhetFont( { size: 14 } ) } ),
        fill: 'black',
        stroke: 'white',
        expandedProperty: model.interactionExpandedProperty,
        contentAlign: 'center',
        titleAlign: 'left',
        buttonAlign: 'left',
        cornerRadius: 4,
        contentYSpacing: 2,
        contentYMargin: 5,
        contentXMargin: 4,
        buttonYMargin: 4,
        buttonXMargin: 6,
        buttonLength: 12,
        minWidth: 200
      } );
    this.addChild( accordionBox );
    // Update interactivity state.
    this.drawPotentialCurve1();
    this.updateInteractivityState();
    this.mutate( options );
  }

  return inherit( InteractionPotentialDiagramNode, EpsilonControlInteractionPotentialDiagram, {

    /**
     * This is an override of the method in the base class that draws the
     * curve on the graph, and this override draws the controls that allow
     * the user to interact with the graph.
     */
    drawPotentialCurve1: function() {
      // The bulk of the drawing is done by the base class.
      this.drawPotentialCurve();
      // Now position the control handles.
      if ( this.epsilonResizeHandle !== null ) {
        var graphMin = this.getGraphMin();
        this.epsilonResizeHandle.setTranslation( graphMin.x + (this.width * EPSILON_HANDLE_OFFSET_PROPORTION), graphMin.y );
        // this.epsilonResizeHandle.setVisible( this.interactionEnabled );
        // epsilonResizeHandle.setPickable( interactionEnabled );
        // epsilonResizeHandle.setChildrenPickable( interactionEnabled );
        this.epsilonLine.setTranslation( graphMin.x, graphMin.y + EPSILON_LINE_WIDTH );
        // this.epsilonLine.setVisible( this.interactionEnabled );
        //epsilonLine.setPickable( interactionEnabled );
      }
    },

    //private
    updateInteractivityState: function() {
      this.interactionEnabled = ( this.model.getMoleculeType() === StatesOfMatterConstants.USER_DEFINED_MOLECULE );
    }
  } );
} );


