// Copyright 2002-2011, University of Colorado
/**
 * Control panel for the Solid, Liquid, and Gas module.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Component = require( 'java.awt.Component' );
  var FlowLayout = require( 'java.awt.FlowLayout' );
  var Font = require( 'SCENERY/util/Font' );
  var GridLayout = require( 'java.awt.GridLayout' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var BufferedImage = require( 'java.awt.image.BufferedImage' );
  var BorderFactory = require( 'javax.swing.BorderFactory' );
  var ButtonGroup = require( 'javax.swing.ButtonGroup' );
  var ImageIcon = require( 'javax.swing.ImageIcon' );
  var JButton = require( 'javax.swing.JButton' );
  var JLabel = require( 'javax.swing.JLabel' );
  var JPanel = require( 'javax.swing.JPanel' );
  var JRadioButton = require( 'javax.swing.JRadioButton' );
  var BevelBorder = require( 'javax.swing.border.BevelBorder' );
  var TitledBorder = require( 'javax.swing.border.TitledBorder' );
  var ControlPanel = require( 'edu.colorado.phet.common.phetcommon.view.ControlPanel' );
  var VerticalLayoutPanel = require( 'edu.colorado.phet.common.phetcommon.view.VerticalLayoutPanel' );
  var BufferedImageUtils = require( 'edu.colorado.phet.common.phetcommon.view.util.BufferedImageUtils' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterResources = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterResources' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------

  //private
  var BUTTON_FONT = new PhetFont( Font.PLAIN, 16 );

  //private
  var MATTER_STATE_ICON_HEIGHT = 32;

  // static class: MoleculeSelectionPanel
  var MoleculeSelectionPanel =
  /**
   * This class defines the selection panel that allows the user to choose
   * the type of molecule.
   */

    //private
    define( function( require ) {
      function MoleculeSelectionPanel( model ) {

        //private
        this.m_neonRadioButton;

        //private
        this.m_argonRadioButton;

        //private
        this.m_oxygenRadioButton;

        //private
        this.m_waterRadioButton;
        var baseBorder = BorderFactory.createRaisedBevelBorder();
        var titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.MOLECULE_TYPE_SELECT_LABEL, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
        setBorder( titledBorder );
        m_oxygenRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.OXYGEN_SELECTION_LABEL, model, StatesOfMatterConstants.DIATOMIC_OXYGEN );
        var oxygenLabel = new MoleculeImageLabel( StatesOfMatterConstants.DIATOMIC_OXYGEN, model );
        m_neonRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.NEON_SELECTION_LABEL, model, StatesOfMatterConstants.NEON );
        var neonLabel = new MoleculeImageLabel( StatesOfMatterConstants.NEON, model );
        m_argonRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.ARGON_SELECTION_LABEL, model, StatesOfMatterConstants.ARGON );
        var argonLabel = new MoleculeImageLabel( StatesOfMatterConstants.ARGON, model );
        m_waterRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.WATER_SELECTION_LABEL, model, StatesOfMatterConstants.WATER );
        var waterLabel = new MoleculeImageLabel( StatesOfMatterConstants.WATER, model );
        // Put the buttons into a button group.
        var buttonGroup = new ButtonGroup();
        buttonGroup.add( m_neonRadioButton );
        buttonGroup.add( m_argonRadioButton );
        buttonGroup.add( m_oxygenRadioButton );
        buttonGroup.add( m_waterRadioButton );
        m_neonRadioButton.setSelected( true );
        // Add the buttons and their icons.
        setLayout( new GridLayout( 4, 1 ) );
        add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
          initializer: function() {
            add( m_neonRadioButton );
            add( neonLabel );
          }
        } ) );
        add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
          initializer: function() {
            add( m_argonRadioButton );
            add( argonLabel );
          }
        } ) );
        add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
          initializer: function() {
            add( m_oxygenRadioButton );
            add( oxygenLabel );
          }
        } ) );
        add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
          initializer: function() {
            add( m_waterRadioButton );
            add( waterLabel );
          }
        } ) );
      }

      return inherit( JPanel, MoleculeSelectionPanel, {
        setMolecule: function( molecule ) {
          switch( molecule ) {
            case StatesOfMatterConstants.ARGON:
              m_argonRadioButton.setSelected( true );
              break;
            case StatesOfMatterConstants.NEON:
              m_neonRadioButton.setSelected( true );
              break;
            case StatesOfMatterConstants.DIATOMIC_OXYGEN:
              m_oxygenRadioButton.setSelected( true );
              break;
            case StatesOfMatterConstants.WATER:
              m_waterRadioButton.setSelected( true );
              break;
          }
        }
      } );
    } );
  ;
  // static class: MoleculeSelectorButton
  var MoleculeSelectorButton =
  /**
   * Convenience class that creates the radio button with the label and adds
   * the listener.
   */

    //private
    define( function( require ) {

      //private
      var LABEL_FONT = new PhetFont( Font.PLAIN, 14 );

      //private
      function MoleculeSelectorButton( text, model, moleculeID ) {
        JRadioButton.call( this, text );
        setFont( LABEL_FONT );
        addActionListener( new ActionListener().withAnonymousClassBody( {
          actionPerformed: function( e ) {
            if ( model.getMoleculeType() != moleculeID ) {
              model.setMoleculeType( moleculeID );
            }
          }
        } ) );
      }

      return inherit( JRadioButton, MoleculeSelectorButton, {
      } );
    } );
  ;
  /**
   * Constructor.
   *
   * @param solidLiquidGasModule
   */
  function SolidLiquidGasControlPanel( solidLiquidGasModule ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    this.m_model;
    this.m_stateSelectionPanel;
    this.m_moleculeSelectionPanel;

    // non-static inner class: ChangeStateControlPanel
    var ChangeStateControlPanel =
    /**
     * This class defines the panel that allows the user to immediately change
     * the state of the current molecules.
     */

      //private
      define( function( require ) {
        function ChangeStateControlPanel() {

          //private
          this.m_solidButton;

          //private
          this.m_liquidButton;

          //private
          this.m_gasButton;
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          var titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.FORCE_STATE_CHANGE, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
          setBorder( titledBorder );
          var image = StatesOfMatterResources.getImage( StatesOfMatterConstants.ICE_CUBE_IMAGE );
          var scaleFactor = (MATTER_STATE_ICON_HEIGHT / (image.getHeight()));
          image = BufferedImageUtils.rescaleFractional( image, scaleFactor, scaleFactor );
          var solidIcon = new ImageIcon( image );
          image = StatesOfMatterResources.getImage( StatesOfMatterConstants.LIQUID_IMAGE );
          scaleFactor = (MATTER_STATE_ICON_HEIGHT / (image.getHeight()));
          image = BufferedImageUtils.rescaleFractional( image, scaleFactor, scaleFactor );
          var liquidIcon = new ImageIcon( image );
          image = StatesOfMatterResources.getImage( StatesOfMatterConstants.GAS_IMAGE );
          scaleFactor = (MATTER_STATE_ICON_HEIGHT / (image.getHeight()));
          image = BufferedImageUtils.rescaleFractional( image, scaleFactor, scaleFactor );
          var gasIcon = new ImageIcon( image );
          m_solidButton = new JButton( StatesOfMatterStrings.PHASE_STATE_SOLID, solidIcon );
          m_solidButton.setFont( BUTTON_FONT );
          m_solidButton.setAlignmentX( Component.CENTER_ALIGNMENT );
          m_solidButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setPhase( MultipleParticleModel.PHASE_SOLID );
            }
          } ) );
          m_liquidButton = new JButton( StatesOfMatterStrings.PHASE_STATE_LIQUID, liquidIcon );
          m_liquidButton.setFont( BUTTON_FONT );
          m_liquidButton.setAlignmentX( Component.CENTER_ALIGNMENT );
          m_liquidButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setPhase( MultipleParticleModel.PHASE_LIQUID );
            }
          } ) );
          m_gasButton = new JButton( StatesOfMatterStrings.PHASE_STATE_GAS, gasIcon );
          m_gasButton.setFont( BUTTON_FONT );
          m_gasButton.setAlignmentX( Component.CENTER_ALIGNMENT );
          m_gasButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setPhase( MultipleParticleModel.PHASE_GAS );
            }
          } ) );
          // Add the buttons to the panel.
          add( m_solidButton );
          add( m_liquidButton );
          add( m_gasButton );
        }

        return inherit( VerticalLayoutPanel, ChangeStateControlPanel, {
        } );
      } );
    ControlPanel.call( this );
    m_model = solidLiquidGasModule.getMultiParticleModel();
    // Register for model events that may affect us.
    m_model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      moleculeTypeChanged: function() {
        m_moleculeSelectionPanel.setMolecule( m_model.getMoleculeType() );
      }
    } ) );
    // Set the control panel's minimum width.
    var minimumWidth = StatesOfMatterResources.getInt( "int.minControlPanelWidth", 215 );
    setMinimumWidth( minimumWidth );
    // Add the panel that allows the user to select molecule type.
    m_moleculeSelectionPanel = new MoleculeSelectionPanel( m_model );
    addControlFullWidth( m_moleculeSelectionPanel );
    // Add the panel that allows the user to select the phase state.
    m_stateSelectionPanel = new ChangeStateControlPanel();
    addControlFullWidth( m_stateSelectionPanel );
  }

  return inherit( ControlPanel, SolidLiquidGasControlPanel, {
  } );
} );

