// Copyright 2002-2011, University of Colorado
/**
 * This class implements a simple slider with the appropriate labels for
 * controlling the gravity level in the multi-particle model.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Font = require( 'SCENERY/util/Font' );
  var GridBagConstraints = require( 'java.awt.GridBagConstraints' );
  var GridLayout = require( 'java.awt.GridLayout' );
  var Hashtable = require( 'java.util.Hashtable' );
  var BorderFactory = require( 'javax.swing.BorderFactory' );
  var JComponent = require( 'javax.swing.JComponent' );
  var JLabel = require( 'javax.swing.JLabel' );
  var JPanel = require( 'javax.swing.JPanel' );
  var BevelBorder = require( 'javax.swing.border.BevelBorder' );
  var TitledBorder = require( 'javax.swing.border.TitledBorder' );
  var ChangeEvent = require( 'javax.swing.event.ChangeEvent' );
  var ChangeListener = require( 'javax.swing.event.ChangeListener' );
  var AbstractValueControl = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.AbstractValueControl' );
  var ILayoutStrategy = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.ILayoutStrategy' );
  var LinearValueControl = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.LinearValueControl' );
  var EasyGridBagLayout = require( 'edu.colorado.phet.common.phetcommon.view.util.EasyGridBagLayout' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );


  //private
  var LABEL_FONT = new PhetFont( 14, true );

  function GravityControlPanel( model ) {

    //private
    this.m_gravityControl;

    //private
    this.m_model;

    // non-static inner class: GravitySliderLayoutStrategy
    var GravitySliderLayoutStrategy =
    /**
     * Layout strategy for gravity slider.
     */
      define( function( require ) {
        function GravitySliderLayoutStrategy() {
        }

        return inherit( Object, GravitySliderLayoutStrategy, {
          doLayout: function( valueControl ) {
            // Get the components that will be part of the layout
            var slider = valueControl.getSlider();
            var layout = new EasyGridBagLayout( valueControl );
            valueControl.setLayout( layout );
            layout.addFilledComponent( slider, 1, 0, GridBagConstraints.HORIZONTAL );
          }
        } );
      } );
    m_model = model;
    setLayout( new GridLayout( 0, 1 ) );
    // Create the border.
    var baseBorder = BorderFactory.createRaisedBevelBorder();
    var titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.GRAVITY_CONTROL_TITLE, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.GRAY );
    setBorder( titledBorder );
    // Add the gravity control slider.
    m_gravityControl = new LinearValueControl( 0, MultipleParticleModel.MAX_GRAVITATIONAL_ACCEL, "", "0", "", new GravitySliderLayoutStrategy() );
    m_gravityControl.setValue( m_model.getGravitationalAcceleration() );
    m_gravityControl.setUpDownArrowDelta( 0.01 );
    m_gravityControl.addChangeListener( new ChangeListener().withAnonymousClassBody( {
      stateChanged: function( e ) {
        m_model.setGravitationalAcceleration( m_gravityControl.getValue() );
      }
    } ) );
    var gravityControlLabelTable = new Hashtable();
    var leftLabel = new JLabel( StatesOfMatterStrings.GRAVITY_CONTROL_NONE );
    leftLabel.setFont( LABEL_FONT );
    gravityControlLabelTable.put( m_gravityControl.getMinimum(), leftLabel );
    var rightLabel = new JLabel( StatesOfMatterStrings.GRAVITY_CONTROL_LOTS );
    rightLabel.setFont( LABEL_FONT );
    gravityControlLabelTable.put( m_gravityControl.getMaximum(), rightLabel );
    m_gravityControl.setTickLabels( gravityControlLabelTable );
    // reset.
    m_model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      resetOccurred: function() {
        m_gravityControl.setValue( m_model.getGravitationalAcceleration() );
      }
    } ) );
    add( m_gravityControl );
  }

  return inherit( JPanel, GravityControlPanel, {
  } );
} );

