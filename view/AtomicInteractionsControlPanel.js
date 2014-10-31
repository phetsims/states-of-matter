// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class implements the control panel for the Interaction Potential
 * portion of this simulation.
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
  var Image = require( 'java.awt.Image' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var MouseAdapter = require( 'java.awt.event.MouseAdapter' );
  var MouseEvent = require( 'java.awt.event.MouseEvent' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var Hashtable = require( 'java.util.Hashtable' );
  var BorderFactory = require( 'javax.swing.BorderFactory' );
  var Box = require( 'javax.swing.Box' );
  var BoxLayout = require( 'javax.swing.BoxLayout' );
  var ButtonGroup = require( 'javax.swing.ButtonGroup' );
  var Icon = require( 'javax.swing.Icon' );
  var ImageIcon = require( 'javax.swing.ImageIcon' );
  var JButton = require( 'javax.swing.JButton' );
  var JComponent = require( 'javax.swing.JComponent' );
  var JLabel = require( 'javax.swing.JLabel' );
  var JPanel = require( 'javax.swing.JPanel' );
  var JRadioButton = require( 'javax.swing.JRadioButton' );
  var BevelBorder = require( 'javax.swing.border.BevelBorder' );
  var TitledBorder = require( 'javax.swing.border.TitledBorder' );
  var ChangeEvent = require( 'javax.swing.event.ChangeEvent' );
  var ChangeListener = require( 'javax.swing.event.ChangeListener' );
  var ControlPanel = require( 'edu.colorado.phet.common.phetcommon.view.ControlPanel' );
  var VerticalLayoutPanel = require( 'edu.colorado.phet.common.phetcommon.view.VerticalLayoutPanel' );
  var AbstractValueControl = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.AbstractValueControl' );
  var ILayoutStrategy = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.ILayoutStrategy' );
  var LinearValueControl = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.LinearValueControl' );
  var BufferedImageUtils = require( 'edu.colorado.phet.common.phetcommon.view.util.BufferedImageUtils' );
  var EasyGridBagLayout = require( 'edu.colorado.phet.common.phetcommon.view.util.EasyGridBagLayout' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var ArrowNode = require( 'edu.colorado.phet.common.piccolophet.nodes.ArrowNode' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterResources = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterResources' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var AtomType = require( 'STATES_OF_MATTER/states-of-matter/model/AtomType' );
  var DualAtomModel = require( 'STATES_OF_MATTER/states-of-matter/model/DualAtomModel' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/StatesOfMatterAtom' );
  var ParticleForceNode = require( 'STATES_OF_MATTER/states-of-matter/view/ParticleForceNode' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------

  //private
  var LABEL_FONT = new PhetFont( Font.PLAIN, 14 );

  //private
  var BOLD_LABEL_FONT = new PhetFont( Font.BOLD, 14 );

  //private
  var ENABLED_TITLE_COLOR = Color.BLACK;
// In pixels.

  //private
  var PIN_ICON_WIDTH = 30;
// In pixels.

  //private
  var PIN_ICON_HEIGHT = 32;

  /**
   * Constructor.
   */
  function AtomicInteractionsControlPanel( solidLiquidGasModule, enableHeterogeneousAtoms ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_model;

    //private
    this.m_canvas;

    //private
    this.m_moleculeSelectionPanel;

    //private
    this.m_atomDiameterControlPanel;

    //private
    this.m_interactionStrengthControlPanel;

    //private
    this.m_forceControlPanel;

    // non-static inner interface: AtomSelectionPanel
    var AtomSelectionPanel =

      //private
      define( function( require ) {

        return inherit( Object, AtomSelectionPanel, {
          updateMoleculeType: function() {}
        } );
      } );
    // non-static inner class: HomogeneousAtomSelectionPanel
    var HomogeneousAtomSelectionPanel =
    /**
     * This class defines the selection panel that allows the user to choose
     * the type of molecule when both are the same.
     */

      //private
      define( function( require ) {
        function HomogeneousAtomSelectionPanel() {

          //private
          this.m_neonRadioButton;

          //private
          this.m_argonRadioButton;

          //private
          this.m_adjustableAttractionRadioButton;
          setLayout( new GridLayout( 0, 1 ) );
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          var titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.INTERACTION_POTENTIAL_ATOM_SELECT_LABEL, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
          setBorder( titledBorder );
          m_neonRadioButton = new JRadioButton( StatesOfMatterStrings.NEON_SELECTION_LABEL );
          m_neonRadioButton.setFont( LABEL_FONT );
          m_neonRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              if ( m_model.getFixedAtomType() != AtomType.NEON ) {
                m_model.setBothAtomTypes( AtomType.NEON );
                updateLjControlSliderState();
              }
            }
          } ) );
          m_argonRadioButton = new JRadioButton( StatesOfMatterStrings.ARGON_SELECTION_LABEL );
          m_argonRadioButton.setFont( LABEL_FONT );
          m_argonRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              if ( m_model.getFixedAtomType() != AtomType.ARGON ) {
                m_model.setBothAtomTypes( AtomType.ARGON );
                updateLjControlSliderState();
              }
            }
          } ) );
          m_adjustableAttractionRadioButton = new JRadioButton( StatesOfMatterStrings.ADJUSTABLE_ATTRACTION_SELECTION_LABEL );
          m_adjustableAttractionRadioButton.setFont( LABEL_FONT );
          m_adjustableAttractionRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              if ( m_model.getFixedAtomType() != AtomType.ADJUSTABLE ) {
                m_model.setBothAtomTypes( AtomType.ADJUSTABLE );
                updateLjControlSliderState();
              }
            }
          } ) );
          var buttonGroup = new ButtonGroup();
          buttonGroup.add( m_neonRadioButton );
          buttonGroup.add( m_argonRadioButton );
          buttonGroup.add( m_adjustableAttractionRadioButton );
          m_neonRadioButton.setSelected( true );
          add( m_neonRadioButton );
          add( m_argonRadioButton );
          add( m_adjustableAttractionRadioButton );
          updateLjControlSliderState();
        }

        return inherit( JPanel, HomogeneousAtomSelectionPanel, {
          /**
           * Update the selected molecule to match whatever the model believes
           * it to be.
           */
          updateMoleculeType: function() {
            var moleculeType = m_model.getFixedAtomType();
            if ( moleculeType == AtomType.NEON ) {
              m_neonRadioButton.setSelected( true );
            }
            else if ( moleculeType == AtomType.ARGON ) {
              m_argonRadioButton.setSelected( true );
            }
            else {
              m_adjustableAttractionRadioButton.setSelected( true );
            }
            updateLjControlSliderState();
          },
          /**
           * Update the state (i.e. enabled or disabled) of the sliders that
           * control the Lennard-Jones parameters.
           */

          //private
          updateLjControlSliderState: function() {
            m_atomDiameterControlPanel.setVisible( m_model.getFixedAtomType() == AtomType.ADJUSTABLE );
            m_interactionStrengthControlPanel.setVisible( m_model.getFixedAtomType() == AtomType.ADJUSTABLE );
          }
        } );
      } );
    // non-static inner class: HeterogeneousAtomSelectionPanel
    var HeterogeneousAtomSelectionPanel =
    /**
     * Allows user to select from a fixed list of heterogeneous and
     * homogeneous combinations of atoms.
     */

      //private
      define( function( require ) {
        /**
         * Constructor.
         */
        function HeterogeneousAtomSelectionPanel() {

          //private
          this.m_neonNeonRadioButton;

          //private
          this.m_argonArgonRadioButton;

          //private
          this.m_oxygenOxygenRadioButton;

          //private
          this.m_neonArgonRadioButton;

          //private
          this.m_neonOxygenRadioButton;

          //private
          this.m_argonOxygenRadioButton;

          //private
          this.m_adjustableInteractionRadioButton;
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          var titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.INTERACTION_POTENTIAL_ATOM_SELECT_LABEL, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
          setBorder( titledBorder );
          m_neonNeonRadioButton = new JRadioButton( StatesOfMatterStrings.NEON_SELECTION_LABEL );
          m_neonNeonRadioButton.setFont( LABEL_FONT );
          m_neonNeonRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              setFixedAtom( AtomType.NEON );
              setMovableAtom( AtomType.NEON );
              updateLjControlSliderState();
            }
          } ) );
          m_neonArgonRadioButton = new JRadioButton( StatesOfMatterStrings.NEON_SELECTION_LABEL );
          m_neonArgonRadioButton.setFont( LABEL_FONT );
          m_neonArgonRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              setFixedAtom( AtomType.NEON );
              setMovableAtom( AtomType.ARGON );
              updateLjControlSliderState();
            }
          } ) );
          m_neonOxygenRadioButton = new JRadioButton( StatesOfMatterStrings.NEON_SELECTION_LABEL );
          m_neonOxygenRadioButton.setFont( LABEL_FONT );
          m_neonOxygenRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              setFixedAtom( AtomType.NEON );
              setMovableAtom( AtomType.OXYGEN );
              updateLjControlSliderState();
            }
          } ) );
          m_argonArgonRadioButton = new JRadioButton( StatesOfMatterStrings.ARGON_SELECTION_LABEL );
          m_argonArgonRadioButton.setFont( LABEL_FONT );
          m_argonArgonRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setBothAtomTypes( AtomType.ARGON );
              updateLjControlSliderState();
            }
          } ) );
          m_argonOxygenRadioButton = new JRadioButton( StatesOfMatterStrings.ARGON_SELECTION_LABEL );
          m_argonOxygenRadioButton.setFont( LABEL_FONT );
          m_argonOxygenRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              setFixedAtom( AtomType.ARGON );
              setMovableAtom( AtomType.OXYGEN );
              updateLjControlSliderState();
            }
          } ) );
          m_oxygenOxygenRadioButton = new JRadioButton( StatesOfMatterStrings.OXYGEN_SELECTION_LABEL );
          m_oxygenOxygenRadioButton.setFont( LABEL_FONT );
          m_oxygenOxygenRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setBothAtomTypes( AtomType.OXYGEN );
              updateLjControlSliderState();
            }
          } ) );
          m_adjustableInteractionRadioButton = new JRadioButton( StatesOfMatterStrings.ADJUSTABLE_ATTRACTION_SELECTION_LABEL );
          m_adjustableInteractionRadioButton.setFont( LABEL_FONT );
          m_adjustableInteractionRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setBothAtomTypes( AtomType.ADJUSTABLE );
              updateLjControlSliderState();
            }
          } ) );
          var buttonGroup = new ButtonGroup();
          buttonGroup.add( m_neonNeonRadioButton );
          buttonGroup.add( m_argonArgonRadioButton );
          buttonGroup.add( m_oxygenOxygenRadioButton );
          buttonGroup.add( m_neonArgonRadioButton );
          buttonGroup.add( m_neonOxygenRadioButton );
          buttonGroup.add( m_argonOxygenRadioButton );
          buttonGroup.add( m_adjustableInteractionRadioButton );
          m_neonNeonRadioButton.setSelected( true );
          var pinImage = StatesOfMatterResources.getImage( StatesOfMatterConstants.PUSH_PIN_IMAGE );
          var scaledPinImage = pinImage.getScaledInstance( PIN_ICON_WIDTH, PIN_ICON_HEIGHT, Image.SCALE_SMOOTH );
          var pinIcon = new ImageIcon( scaledPinImage );
          var fixedAtomLabel = new JLabel( StatesOfMatterStrings.FIXED_ATOM_LABEL, pinIcon, JLabel.LEFT );
          fixedAtomLabel.setFont( BOLD_LABEL_FONT );
          var movableAtomLabel = new JLabel( StatesOfMatterStrings.MOVABLE_ATOM_LABEL );
          movableAtomLabel.setFont( BOLD_LABEL_FONT );
          var labelPanel = new JPanel();
          labelPanel.setLayout( new GridLayout( 1, 2, 0, 0 ) );
          labelPanel.add( fixedAtomLabel );
          labelPanel.add( movableAtomLabel );
          var selectionPanel = new JPanel();
          selectionPanel.setLayout( new GridLayout( 0, 2 ) );
          selectionPanel.add( m_neonNeonRadioButton );
          selectionPanel.add( new PhetJLabel( StatesOfMatterStrings.NEON_SELECTION_LABEL ) );
          selectionPanel.add( m_argonArgonRadioButton );
          selectionPanel.add( new PhetJLabel( StatesOfMatterStrings.ARGON_SELECTION_LABEL ) );
          selectionPanel.add( m_oxygenOxygenRadioButton );
          selectionPanel.add( new PhetJLabel( StatesOfMatterStrings.OXYGEN_SELECTION_LABEL ) );
          selectionPanel.add( m_neonArgonRadioButton );
          selectionPanel.add( new PhetJLabel( StatesOfMatterStrings.ARGON_SELECTION_LABEL ) );
          selectionPanel.add( m_neonOxygenRadioButton );
          selectionPanel.add( new PhetJLabel( StatesOfMatterStrings.OXYGEN_SELECTION_LABEL ) );
          selectionPanel.add( m_argonOxygenRadioButton );
          selectionPanel.add( new PhetJLabel( StatesOfMatterStrings.OXYGEN_SELECTION_LABEL ) );
          // adjustable selection.
          var spacePanel = new JPanel();
          spacePanel.setLayout( new BoxLayout( spacePanel, BoxLayout.Y_AXIS ) );
          spacePanel.add( Box.createVerticalStrut( 12 ) );
          // mess up the grid layout.
          var adjustableInteractionPanel = new JPanel();
          adjustableInteractionPanel.setLayout( new GridLayout( 0, 1 ) );
          adjustableInteractionPanel.add( m_adjustableInteractionRadioButton );
          // Add everything to the main panel.
          add( labelPanel );
          add( selectionPanel );
          add( spacePanel );
          add( adjustableInteractionPanel );
          // Make some updates.
          updateMoleculeType();
          updateLjControlSliderState();
        }

        return inherit( VerticalLayoutPanel, HeterogeneousAtomSelectionPanel, {
          updateMoleculeType: function() {
            var fixedMoleculeType = m_model.getFixedAtomType();
            var movableMoleculeType = m_model.getMovableAtomType();
            if ( fixedMoleculeType == AtomType.NEON && movableMoleculeType == AtomType.NEON ) {
              m_neonNeonRadioButton.setSelected( true );
            }
            else if ( fixedMoleculeType == AtomType.NEON && movableMoleculeType == AtomType.ARGON ) {
              m_neonArgonRadioButton.setSelected( true );
            }
            else if ( fixedMoleculeType == AtomType.NEON && movableMoleculeType == AtomType.OXYGEN ) {
              m_neonOxygenRadioButton.setSelected( true );
            }
            else if ( fixedMoleculeType == AtomType.ARGON && movableMoleculeType == AtomType.ARGON ) {
              m_argonArgonRadioButton.setSelected( true );
            }
            else if ( fixedMoleculeType == AtomType.ARGON && movableMoleculeType == AtomType.OXYGEN ) {
              m_argonOxygenRadioButton.setSelected( true );
            }
            else if ( fixedMoleculeType == AtomType.OXYGEN && movableMoleculeType == AtomType.OXYGEN ) {
              m_oxygenOxygenRadioButton.setSelected( true );
            }
            else if ( fixedMoleculeType == AtomType.ADJUSTABLE && movableMoleculeType == AtomType.ADJUSTABLE ) {
              m_adjustableInteractionRadioButton.setSelected( true );
            }
            else {
            }
            updateLjControlSliderState();
          },

          //private
          updateLjControlSliderState: function() {
            m_atomDiameterControlPanel.setVisible( m_model.getFixedAtomType() == AtomType.ADJUSTABLE );
            m_interactionStrengthControlPanel.setVisible( m_model.getFixedAtomType() == AtomType.ADJUSTABLE );
          },

          //private
          setFixedAtom: function( atomType ) {
            if ( m_model.getMovableAtomType() == AtomType.ADJUSTABLE ) {
              // Can't have one adjustable and the other not, so we need to set both.
              m_model.setBothAtomTypes( atomType );
            }
            else {
              m_model.setFixedAtomType( atomType );
            }
          },

          //private
          setMovableAtom: function( atomType ) {
            if ( m_model.getFixedAtomType() == AtomType.ADJUSTABLE ) {
              // Can't have one adjustable and the other not, so we need to set both.
              m_model.setBothAtomTypes( atomType );
            }
            else {
              m_model.setMovableAtomType( atomType );
            }
          }
        } );
      } );
    // non-static inner class: AtomDiameterControlPanel
    var AtomDiameterControlPanel =
    /**
     * This class represents the control slider for the atom diameter.
     */

      //private
      define( function( require ) {
        function AtomDiameterControlPanel( model ) {

          //private
          this.LABEL_FONT = new PhetFont( 14, false );

          //private
          this.m_atomDiameterControl;

          //private
          this.m_model;

          //private
          this.m_titledBorder;

          //private
          this.m_leftLabel;

          //private
          this.m_rightLabel;
          m_model = model;
          setLayout( new GridLayout( 0, 1 ) );
          // Create the border.
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          m_titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.ATOM_DIAMETER_CONTROL_TITLE, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), ENABLED_TITLE_COLOR );
          setBorder( m_titledBorder );
          // Add the control slider.
          m_atomDiameterControl = new LinearValueControl( StatesOfMatterConstants.MIN_SIGMA, StatesOfMatterConstants.MAX_SIGMA, "", "0", "", new SliderLayoutStrategy() );
          m_atomDiameterControl.setValue( m_model.getSigma() );
          m_atomDiameterControl.setUpDownArrowDelta( 0.01 );
          m_atomDiameterControl.addChangeListener( new ChangeListener().withAnonymousClassBody( {
            stateChanged: function( e ) {
              m_model.setAdjustableAtomSigma( m_atomDiameterControl.getValue() );
            }
          } ) );
          m_atomDiameterControl.getSlider().addMouseListener( new MouseAdapter().withAnonymousClassBody( {
            mousePressed: function( e ) {
              m_model.setMotionPaused( true );
            },
            mouseReleased: function( e ) {
              m_model.setMotionPaused( false );
            }
          } ) );
          var diameterControlLabelTable = new Hashtable();
          m_leftLabel = new JLabel( StatesOfMatterStrings.ATOM_DIAMETER_SMALL );
          m_leftLabel.setFont( LABEL_FONT );
          diameterControlLabelTable.put( m_atomDiameterControl.getMinimum(), m_leftLabel );
          m_rightLabel = new JLabel( StatesOfMatterStrings.ATOM_DIAMETER_LARGE );
          m_rightLabel.setFont( LABEL_FONT );
          diameterControlLabelTable.put( m_atomDiameterControl.getMaximum(), m_rightLabel );
          m_atomDiameterControl.setTickLabels( diameterControlLabelTable );
          m_atomDiameterControl.setValue( m_model.getSigma() );
          add( m_atomDiameterControl );
          // Register as a listener with the model for relevant events.
          m_model.addListener( new DualAtomModel.Adapter().withAnonymousClassBody( {
            fixedAtomDiameterChanged: function() {
              m_atomDiameterControl.setValue( m_model.getSigma() );
            },
            movableAtomDiameterChanged: function() {
              m_atomDiameterControl.setValue( m_model.getSigma() );
            }
          } ) );
        }

        return inherit( JPanel, AtomDiameterControlPanel, {
          setEnabled: function( enabled ) {
            super.setEnabled( enabled );
            m_atomDiameterControl.setEnabled( enabled );
            m_leftLabel.setEnabled( enabled );
            m_rightLabel.setEnabled( enabled );
            if ( enabled ) {
              m_titledBorder.setTitleColor( ENABLED_TITLE_COLOR );
            }
            else {
              m_titledBorder.setTitleColor( Color.LIGHT_GRAY );
            }
          }
        } );
      } );
    // non-static inner class: InteractionStrengthControlPanel
    var InteractionStrengthControlPanel =
    /**
     * This class represents the control slider for the interaction strength.
     */

      //private
      define( function( require ) {
        function InteractionStrengthControlPanel( model ) {

          //private
          this.LABEL_FONT = new PhetFont( 14, false );

          //private
          this.m_interactionStrengthControl;

          //private
          this.m_model;

          //private
          this.m_titledBorder;

          //private
          this.m_leftLabel;

          //private
          this.m_rightLabel;
          m_model = model;
          setLayout( new GridLayout( 0, 1 ) );
          // Create the border.
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          m_titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.INTERACTION_STRENGTH_CONTROL_TITLE, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), ENABLED_TITLE_COLOR );
          setBorder( m_titledBorder );
          // Add the control slider.
          m_interactionStrengthControl = new LinearValueControl( StatesOfMatterConstants.MIN_EPSILON, StatesOfMatterConstants.MAX_EPSILON, "", "0", "", new SliderLayoutStrategy() );
          m_interactionStrengthControl.setValue( m_model.getEpsilon() );
          m_interactionStrengthControl.setUpDownArrowDelta( 0.01 );
          m_interactionStrengthControl.addChangeListener( new ChangeListener().withAnonymousClassBody( {
            stateChanged: function( e ) {
              // Set the interaction strength in the model.
              m_model.setEpsilon( m_interactionStrengthControl.getValue() );
            }
          } ) );
          m_interactionStrengthControl.getSlider().addMouseListener( new MouseAdapter().withAnonymousClassBody( {
            mousePressed: function( e ) {
              m_model.setMotionPaused( true );
            },
            mouseReleased: function( e ) {
              m_model.setMotionPaused( false );
            }
          } ) );
          var diameterControlLabelTable = new Hashtable();
          m_leftLabel = new JLabel( StatesOfMatterStrings.INTERACTION_STRENGTH_WEAK );
          m_leftLabel.setFont( LABEL_FONT );
          diameterControlLabelTable.put( m_interactionStrengthControl.getMinimum(), m_leftLabel );
          m_rightLabel = new JLabel( StatesOfMatterStrings.INTERACTION_STRENGTH_STRONG );
          m_rightLabel.setFont( LABEL_FONT );
          diameterControlLabelTable.put( m_interactionStrengthControl.getMaximum(), m_rightLabel );
          m_interactionStrengthControl.setTickLabels( diameterControlLabelTable );
          // settings for potential are changed.
          m_model.addListener( new DualAtomModel.Adapter().withAnonymousClassBody( {
            interactionPotentialChanged: function() {
              m_interactionStrengthControl.setValue( m_model.getEpsilon() );
            }
          } ) );
          add( m_interactionStrengthControl );
        }

        return inherit( JPanel, InteractionStrengthControlPanel, {
          setEnabled: function( enabled ) {
            super.setEnabled( enabled );
            m_interactionStrengthControl.setEnabled( enabled );
            m_leftLabel.setEnabled( enabled );
            m_rightLabel.setEnabled( enabled );
            if ( enabled ) {
              m_titledBorder.setTitleColor( ENABLED_TITLE_COLOR );
            }
            else {
              m_titledBorder.setTitleColor( Color.LIGHT_GRAY );
            }
          }
        } );
      } );
    // non-static inner class: ForceControlPanel
    var ForceControlPanel =

      //private
      define( function( require ) {
        function ForceControlPanel() {

          //private
          this.m_noForcesButton;

          //private
          this.m_totalForcesButton;

          //private
          this.m_componentForceButton;

          //private
          this.m_attractiveForceLegendEntry;

          //private
          this.m_repulsiveForceLegendEntry;
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          var titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.INTERACTION_POTENTIAL_SHOW_FORCES, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
          setBorder( titledBorder );
          m_noForcesButton = new JRadioButton( StatesOfMatterStrings.INTERACTION_POTENTIAL_HIDE_FORCES );
          m_noForcesButton.setFont( LABEL_FONT );
          m_noForcesButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_canvas.setShowAttractiveForces( false );
              m_canvas.setShowRepulsiveForces( false );
              m_canvas.setShowTotalForces( false );
            }
          } ) );
          m_totalForcesButton = new JRadioButton( StatesOfMatterStrings.INTERACTION_POTENTIAL_TOTAL_FORCES );
          m_totalForcesButton.setFont( LABEL_FONT );
          m_totalForcesButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_canvas.setShowAttractiveForces( false );
              m_canvas.setShowRepulsiveForces( false );
              m_canvas.setShowTotalForces( true );
            }
          } ) );
          var totalForceButtonPanel = new JPanel();
          totalForceButtonPanel.setLayout( new java.awt.FlowLayout( java.awt.FlowLayout.LEFT, 0, 0 ) );
          totalForceButtonPanel.add( m_totalForcesButton );
          totalForceButtonPanel.add( new JLabel( createArrowIcon( ParticleForceNode.TOTAL_FORCE_COLOR, false ) ) );
          m_componentForceButton = new JRadioButton( StatesOfMatterStrings.INTERACTION_POTENTIAL_COMPONENT_FORCES );
          m_componentForceButton.setFont( LABEL_FONT );
          m_componentForceButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_canvas.setShowAttractiveForces( true );
              m_canvas.setShowRepulsiveForces( true );
              m_canvas.setShowTotalForces( false );
            }
          } ) );
          // Group the buttons logically (not physically) together and set initial state.
          var buttonGroup = new ButtonGroup();
          buttonGroup.add( m_noForcesButton );
          buttonGroup.add( m_totalForcesButton );
          buttonGroup.add( m_componentForceButton );
          m_noForcesButton.setSelected( true );
          var spacePanel = new JPanel();
          spacePanel.setLayout( new BoxLayout( spacePanel, BoxLayout.X_AXIS ) );
          spacePanel.add( Box.createHorizontalStrut( 14 ) );
          var attractiveForceLegendEntry = new JPanel();
          attractiveForceLegendEntry.setLayout( new java.awt.FlowLayout( java.awt.FlowLayout.LEFT ) );
          m_attractiveForceLegendEntry = new JLabel( StatesOfMatterStrings.ATTRACTIVE_FORCE_KEY, createArrowIcon( ParticleForceNode.ATTRACTIVE_FORCE_COLOR, false ), JLabel.LEFT );
          attractiveForceLegendEntry.add( spacePanel );
          attractiveForceLegendEntry.add( m_attractiveForceLegendEntry );
          spacePanel = new JPanel();
          spacePanel.setLayout( new BoxLayout( spacePanel, BoxLayout.X_AXIS ) );
          spacePanel.add( Box.createHorizontalStrut( 14 ) );
          var repulsiveForceLegendEntry = new JPanel();
          repulsiveForceLegendEntry.setLayout( new java.awt.FlowLayout( java.awt.FlowLayout.LEFT ) );
          m_repulsiveForceLegendEntry = new JLabel( StatesOfMatterStrings.REPULSIVE_FORCE_KEY, createArrowIcon( ParticleForceNode.REPULSIVE_FORCE_COLOR, true ), JLabel.LEFT );
          repulsiveForceLegendEntry.add( spacePanel );
          repulsiveForceLegendEntry.add( m_repulsiveForceLegendEntry );
          // Add the components to the main panel.
          add( m_noForcesButton );
          add( totalForceButtonPanel );
          add( m_componentForceButton );
          add( attractiveForceLegendEntry );
          add( repulsiveForceLegendEntry );
        }

        return inherit( VerticalLayoutPanel, ForceControlPanel, {

          //private
          reset: function() {
            m_noForcesButton.setSelected( true );
            m_canvas.setShowAttractiveForces( false );
            m_canvas.setShowRepulsiveForces( false );
            m_canvas.setShowTotalForces( false );
          },

          //private
          createArrowIcon: function( color, pointRight ) {
            var arrowNode = new ArrowNode( new Vector2( 0, 0 ), new Vector2( 20, 0 ), 10, 15, 6 );
            arrowNode.setPaint( color );
            var arrowImage = arrowNode.toImage();
            if ( !pointRight ) {
              arrowImage = BufferedImageUtils.flipX( BufferedImageUtils.toBufferedImage( arrowImage ) );
            }
            return (new ImageIcon( arrowImage ));
          }
        } );
      } );
    // non-static inner class: SliderLayoutStrategy
    var SliderLayoutStrategy =
    /**
     * Layout strategy for sliders.
     */
      define( function( require ) {
        function SliderLayoutStrategy() {
        }

        return inherit( Object, SliderLayoutStrategy, {
          doLayout: function( valueControl ) {
            // Get the components that will be part of the layout
            var slider = valueControl.getSlider();
            var layout = new EasyGridBagLayout( valueControl );
            valueControl.setLayout( layout );
            layout.addFilledComponent( slider, 1, 0, GridBagConstraints.HORIZONTAL );
          }
        } );
      } );
    // non-static inner class: PhetJLabel
    var PhetJLabel =
      define( function( require ) {
        function PhetJLabel( text ) {
          JLabel.call( this, text );
          setFont( LABEL_FONT );
        }

        return inherit( JLabel, PhetJLabel, {
        } );
      } );
    m_model = solidLiquidGasModule.getDualParticleModel();
    m_canvas = solidLiquidGasModule.getCanvas();
    m_model.addListener( new DualAtomModel.Adapter().withAnonymousClassBody( {
      fixedAtomAdded: function( particle ) {
        m_moleculeSelectionPanel.updateMoleculeType();
      },
      movableAtomAdded: function( particle ) {
        m_moleculeSelectionPanel.updateMoleculeType();
      }
    } ) );
    // Set the control panel's minimum width.
    var minimumWidth = StatesOfMatterResources.getInt( "int.minControlPanelWidth", 215 );
    setMinimumWidth( minimumWidth );
    // Create the panel for controlling the atom diameter.
    m_atomDiameterControlPanel = new AtomDiameterControlPanel( m_model );
    // Create the panel for controlling the interaction strength.
    m_interactionStrengthControlPanel = new InteractionStrengthControlPanel( m_model );
    // Create the panel that allows the user to select molecule type.
    if ( enableHeterogeneousAtoms ) {
      m_moleculeSelectionPanel = new HeterogeneousAtomSelectionPanel();
    }
    else {
      m_moleculeSelectionPanel = new HomogeneousAtomSelectionPanel();
    }
    // shown on the atoms.
    m_forceControlPanel = new ForceControlPanel();
    // Add the panels we just created.
    addControlFullWidth( m_moleculeSelectionPanel );
    addControlFullWidth( m_atomDiameterControlPanel );
    addControlFullWidth( m_interactionStrengthControlPanel );
    addControlFullWidth( m_forceControlPanel );
    // Add a reset button.
    addVerticalSpace( 10 );
    var resetButton = new JButton( StatesOfMatterStrings.RESET );
    resetButton.addActionListener( new ActionListener().withAnonymousClassBody( {
      actionPerformed: function( event ) {
        m_model.reset();
        if ( m_model.getClock().isPaused() ) {
          // pressed, it must be explicitly un-paused.
          m_model.getClock().setPaused( false );
        }
        m_forceControlPanel.reset();
      }
    } ) );
    addControl( resetButton );
  }

  return inherit( ControlPanel, AtomicInteractionsControlPanel, {
  } );
} );

