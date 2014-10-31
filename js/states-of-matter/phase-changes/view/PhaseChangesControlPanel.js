// Copyright 2002-2011, University of Colorado
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension = require( 'java.awt.Dimension' );
  var FlowLayout = require( 'java.awt.FlowLayout' );
  var Font = require( 'SCENERY/util/Font' );
  var GridBagConstraints = require( 'java.awt.GridBagConstraints' );
  var GridLayout = require( 'java.awt.GridLayout' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var MouseAdapter = require( 'java.awt.event.MouseAdapter' );
  var MouseEvent = require( 'java.awt.event.MouseEvent' );
  var ArrayList = require( 'java.util.ArrayList' );
  var Hashtable = require( 'java.util.Hashtable' );
  var List = require( 'java.util.List' );
  var BorderFactory = require( 'javax.swing.BorderFactory' );
  var Box = require( 'javax.swing.Box' );
  var BoxLayout = require( 'javax.swing.BoxLayout' );
  var ButtonGroup = require( 'javax.swing.ButtonGroup' );
  var JButton = require( 'javax.swing.JButton' );
  var JComponent = require( 'javax.swing.JComponent' );
  var JLabel = require( 'javax.swing.JLabel' );
  var JPanel = require( 'javax.swing.JPanel' );
  var JRadioButton = require( 'javax.swing.JRadioButton' );
  var BevelBorder = require( 'javax.swing.border.BevelBorder' );
  var TitledBorder = require( 'javax.swing.border.TitledBorder' );
  var ChangeEvent = require( 'javax.swing.event.ChangeEvent' );
  var ChangeListener = require( 'javax.swing.event.ChangeListener' );
  var ClockAdapter = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter' );
  var ClockEvent = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockEvent' );
  var ControlPanel = require( 'edu.colorado.phet.common.phetcommon.view.ControlPanel' );
  var AbstractValueControl = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.AbstractValueControl' );
  var ILayoutStrategy = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.ILayoutStrategy' );
  var LinearValueControl = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.LinearValueControl' );
  var EasyGridBagLayout = require( 'edu.colorado.phet.common.phetcommon.view.util.EasyGridBagLayout' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var PhetPCanvas = require( 'edu.colorado.phet.common.piccolophet.PhetPCanvas' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var StatesOfMatterResources = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterResources' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );
  var CloseRequestListener = require( 'STATES_OF_MATTER/states-of-matter/module/CloseRequestListener' );
  var MoleculeImageLabel = require( 'STATES_OF_MATTER/states-of-matter/module/solidliquidgas/MoleculeImageLabel' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------

  //private
  var BUTTON_LABEL_FONT = new PhetFont( 14 );

  //private
  var ENABLED_TITLE_COLOR = Color.BLACK;

  //private
  var INTERACTION_POTENTIAL_DIAGRAM_WIDTH = 200;

  //private
  var INTERACTION_POTENTIAL_DIAGRAM_HEIGHT = (INTERACTION_POTENTIAL_DIAGRAM_WIDTH * 0.8);
// Constants used when mapping the model pressure and temperature to the phase diagram.

  //private
  var TRIPLE_POINT_TEMPERATURE_IN_MODEL = MultipleParticleModel.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;

  //private
  var TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM = 0.375;

  //private
  var CRITICAL_POINT_TEMPERATURE_IN_MODEL = MultipleParticleModel.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;

  //private
  var CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM = 0.8;

  //private
  var SLOPE_IN_1ST_REGION = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM / TRIPLE_POINT_TEMPERATURE_IN_MODEL;

  //private
  var SLOPE_IN_2ND_REGION = (CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM - TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM) / (CRITICAL_POINT_TEMPERATURE_IN_MODEL - TRIPLE_POINT_TEMPERATURE_IN_MODEL);

  //private
  var OFFSET_IN_2ND_REGION = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM - (SLOPE_IN_2ND_REGION * TRIPLE_POINT_TEMPERATURE_IN_MODEL);
// Used for calculating moving averages needed to mellow out the graph
// behavior.  Value empirically determined.

  //private
  var MAX_NUM_HISTORY_SAMPLES = 100;

  //private
  var PRESSURE_FACTOR = 35;

  /**
   * Constructor.
   *
   * @param phaseChangesModule
   * @param advanced           - Flag to indicate whether basic or advanced mode is to
   *                           be used.  Advanced mode shows the interaction potential stuff, basic
   *                           mode does not.
   */
  function PhaseChangesControlPanel( phaseChangesModule, advanced ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_model;

    //private
    this.m_phaseDiagramPanel;

    //private
    this.m_phaseDiagramVisible;

    //private
    this.m_phaseDiagramCtrlButton;

    //private
    this.m_phaseDiagram;

    //private
    this.m_moleculeSelectionPanel;

    //private
    this.m_interactionDiagramPanel;

    //private
    this.m_interactionDiagramVisible;

    //private
    this.m_interactionDiagramCtrlButton;

    //private
    this.m_interactionPotentialDiagram;

    //private
    this.m_interactionStrengthControlPanel;

    //private
    this.m_preInteractionButtonSpacer;

    //private
    this.m_postInteractionButtonSpacer;

    //private
    this.m_prePhaseButtonSpacer;

    //private
    this.m_postPhaseButtonSpacer;

    //private
    this.m_advanced;

    //private
    this.m_modelTemperatureHistory = new ArrayList( MAX_NUM_HISTORY_SAMPLES );

    // non-static inner class: MoleculeSelectionPanel
    var MoleculeSelectionPanel =

      //private
      define( function( require ) {
        function MoleculeSelectionPanel( showConfigurableAtom ) {

          //private
          this.m_neonRadioButton;

          //private
          this.m_argonRadioButton;

          //private
          this.m_oxygenRadioButton;

          //private
          this.m_waterRadioButton;

          //private
          this.m_configurableRadioButton;
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          var titledBorder = BorderFactory.createTitledBorder( baseBorder, StatesOfMatterStrings.MOLECULE_TYPE_SELECT_LABEL, TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
          setBorder( titledBorder );
          m_oxygenRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.OXYGEN_SELECTION_LABEL, m_model, StatesOfMatterConstants.DIATOMIC_OXYGEN, true );
          var oxygenImageLabel = new MoleculeImageLabel( StatesOfMatterConstants.DIATOMIC_OXYGEN, m_model );
          m_neonRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.NEON_SELECTION_LABEL, m_model, StatesOfMatterConstants.NEON, false );
          var neonImageLabel = new MoleculeImageLabel( StatesOfMatterConstants.NEON, m_model );
          m_argonRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.ARGON_SELECTION_LABEL, m_model, StatesOfMatterConstants.ARGON, false );
          var argonImageLabel = new MoleculeImageLabel( StatesOfMatterConstants.ARGON, m_model );
          m_waterRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.WATER_SELECTION_LABEL, m_model, StatesOfMatterConstants.WATER, true );
          var waterImageLabel = new MoleculeImageLabel( StatesOfMatterConstants.WATER, m_model );
          m_configurableRadioButton = new MoleculeSelectorButton( StatesOfMatterStrings.ADJUSTABLE_ATTRACTION_SELECTION_LABEL, m_model, StatesOfMatterConstants.USER_DEFINED_MOLECULE, true );
          var configurableAtomImageLabel = new MoleculeImageLabel( StatesOfMatterConstants.USER_DEFINED_MOLECULE, m_model );
          var buttonGroup = new ButtonGroup();
          buttonGroup.add( m_neonRadioButton );
          buttonGroup.add( m_argonRadioButton );
          buttonGroup.add( m_oxygenRadioButton );
          buttonGroup.add( m_waterRadioButton );
          buttonGroup.add( m_configurableRadioButton );
          m_neonRadioButton.setSelected( true );
          // just to the right of the corresponding label.
          setLayout( new GridLayout( 5, 1 ) );
          add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
            initializer: function() {
              add( m_neonRadioButton );
              add( neonImageLabel );
            }
          } ) );
          add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
            initializer: function() {
              add( m_argonRadioButton );
              add( argonImageLabel );
            }
          } ) );
          add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
            initializer: function() {
              add( m_oxygenRadioButton );
              add( oxygenImageLabel );
            }
          } ) );
          add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
            initializer: function() {
              add( m_waterRadioButton );
              add( waterImageLabel );
            }
          } ) );
          if ( showConfigurableAtom ) {
            add( new JPanel( new FlowLayout( FlowLayout.LEFT ) ).withAnonymousClassBody( {
              initializer: function() {
                add( m_configurableRadioButton );
                add( configurableAtomImageLabel );
              }
            } ) );
          }
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
              case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
                m_configurableRadioButton.setSelected( true );
                break;
            }
          }
        } );
      } );
    // non-static inner class: MoleculeSelectorButton
    var MoleculeSelectorButton =
    /**
     * Convenience class that creates the radio button with the label and adds
     * the listener.
     */

      //private
      define( function( require ) {

        //private
        function MoleculeSelectorButton( text, model, moleculeID, isMolecular ) {

          //private
          this.LABEL_FONT = new PhetFont( Font.PLAIN, 14 );
          JRadioButton.call( this, text );
          setFont( LABEL_FONT );
          addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              if ( model.getMoleculeType() != moleculeID ) {
                model.setMoleculeType( moleculeID );
                m_interactionPotentialDiagram.setMolecular( isMolecular );
                m_phaseDiagram.setDepictingWater( moleculeID == StatesOfMatterConstants.WATER );
                updateVisibilityStates();
              }
            }
          } ) );
        }

        return inherit( JRadioButton, MoleculeSelectorButton, {
        } );
      } );
    // non-static inner class: SliderLayoutStrategy
    var SliderLayoutStrategy =
    /**
     * Layout strategy for slider.
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
          m_interactionStrengthControl = new LinearValueControl( MultipleParticleModel.MIN_ADJUSTABLE_EPSILON, MultipleParticleModel.MAX_ADJUSTABLE_EPSILON, "", "0", "", new SliderLayoutStrategy() );
          m_interactionStrengthControl.setUpDownArrowDelta( 0.01 );
          m_interactionStrengthControl.addChangeListener( new ChangeListener().withAnonymousClassBody( {
            stateChanged: function( e ) {
              // Set the interaction strength in the model if the molecule is correct.
              if ( m_model.getMoleculeType() == StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
                m_model.setEpsilon( m_interactionStrengthControl.getValue() );
              }
            }
          } ) );
          m_interactionStrengthControl.getSlider().addMouseListener( new MouseAdapter().withAnonymousClassBody( {
            mousePressed: function( e ) {
            },
            mouseReleased: function( e ) {
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
          m_model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
            interactionStrengthChanged: function() {
              var epsilon = m_model.getEpsilon();
              epsilon = Math.min( epsilon, MultipleParticleModel.MAX_ADJUSTABLE_EPSILON );
              epsilon = Math.max( epsilon, MultipleParticleModel.MIN_ADJUSTABLE_EPSILON );
              m_interactionStrengthControl.setValue( epsilon );
              updatePhaseDiagram();
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
    ControlPanel.call( this );
    m_model = phaseChangesModule.getMultiParticleModel();
    m_advanced = advanced;
    m_phaseDiagramVisible = advanced;
    m_interactionDiagramVisible = advanced;
    m_model.getClock().addClockListener( new ClockAdapter().withAnonymousClassBody( {
      clockTicked: function( clockEvent ) {
        // Update the phase diagram at each clock tick.
        updatePhaseDiagram();
      }
    } ) );
    // Register with the model for events that affect the diagrams on this panel.
    m_model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      moleculeTypeChanged: function() {
        m_interactionPotentialDiagram.setLjPotentialParameters( m_model.getSigma(), m_model.getEpsilon() );
        m_moleculeSelectionPanel.setMolecule( m_model.getMoleculeType() );
        m_modelTemperatureHistory.clear();
      },
      resetOccurred: function() {
        m_phaseDiagramVisible = m_advanced;
        m_interactionDiagramVisible = m_advanced;
        m_modelTemperatureHistory.clear();
        updateVisibilityStates();
      }
    } ) );
    // Set the control panel's minimum width.
    var minimumWidth = StatesOfMatterResources.getInt( "int.minControlPanelWidth", 215 );
    setMinimumWidth( minimumWidth );
    // Add the panel that allows the user to select molecule type.
    m_moleculeSelectionPanel = new MoleculeSelectionPanel( advanced );
    addControlFullWidth( m_moleculeSelectionPanel );
    // Create the panel for controlling the interaction strength.
    m_interactionStrengthControlPanel = new InteractionStrengthControlPanel( m_model );
    addControlFullWidth( m_interactionStrengthControlPanel );
    // Add a little spacing.
    addVerticalSpace( 10 );
    // Add additional spacing before the interaction potential control button.
    m_preInteractionButtonSpacer = createVerticalSpacerPanel( 20 );
    addControlFullWidth( m_preInteractionButtonSpacer );
    m_preInteractionButtonSpacer.setVisible( !m_interactionDiagramVisible );
    // Add the button that allows the user to turn the interaction diagram on/off.
    m_interactionDiagramCtrlButton = new JButton();
    m_interactionDiagramCtrlButton.setFont( BUTTON_LABEL_FONT );
    m_interactionDiagramCtrlButton.setText( StatesOfMatterStrings.INTERACTION_POTENTIAL_BUTTON_LABEL );
    addControl( m_interactionDiagramCtrlButton );
    m_interactionDiagramCtrlButton.addActionListener( new ActionListener().withAnonymousClassBody( {
      actionPerformed: function( e ) {
        m_interactionDiagramVisible = true;
        updateVisibilityStates();
      }
    } ) );
    m_interactionDiagramCtrlButton.setVisible( !m_interactionDiagramVisible );
    var buttonWidth = m_interactionDiagramCtrlButton.getPreferredSize().getWidth();
    var buttonHeight = m_interactionDiagramCtrlButton.getPreferredSize().getHeight();
    // Add additional spacing after the interaction potential diagram control button.
    m_postInteractionButtonSpacer = createVerticalSpacerPanel( 20 );
    addControlFullWidth( m_postInteractionButtonSpacer );
    m_postInteractionButtonSpacer.setVisible( !m_interactionDiagramVisible );
    // Add the interaction potential diagram.
    m_interactionDiagramPanel = new JPanel();
    var interactionDiagramCanvas = new PhetPCanvas();
    interactionDiagramCanvas.setPreferredSize( new Dimension( INTERACTION_POTENTIAL_DIAGRAM_WIDTH, INTERACTION_POTENTIAL_DIAGRAM_HEIGHT ) );
    interactionDiagramCanvas.setBackground( StatesOfMatterConstants.CONTROL_PANEL_COLOR );
    interactionDiagramCanvas.setBorder( null );
    m_interactionPotentialDiagram = new EpsilonControlInteractionPotentialDiagram( m_model.getSigma(), m_model.getEpsilon(), false, m_model );
    m_interactionPotentialDiagram.setBackgroundColor( StatesOfMatterConstants.CONTROL_PANEL_COLOR );
    interactionDiagramCanvas.addWorldChild( m_interactionPotentialDiagram );
    m_interactionDiagramPanel.add( interactionDiagramCanvas );
    addControlFullWidth( m_interactionDiagramPanel );
    m_interactionDiagramPanel.setVisible( m_interactionDiagramVisible );
    // Create and register the handler for user requests to close the interaction potential diagram.
    var interactionPotentialDiagramCloseListener = new CloseRequestListener().withAnonymousClassBody( {
      closeRequestReceived: function() {
        // it invisible.
        m_interactionDiagramVisible = false;
        updateVisibilityStates();
      }
    } );
    m_interactionPotentialDiagram.addListener( interactionPotentialDiagramCloseListener );
    // Add additional spacing before the phase diagram control button.
    m_prePhaseButtonSpacer = createVerticalSpacerPanel( 20 );
    addControlFullWidth( m_prePhaseButtonSpacer );
    m_prePhaseButtonSpacer.setVisible( !m_phaseDiagramVisible );
    // Add the button that allows the user to turn the phase diagram on/off.
    m_phaseDiagramCtrlButton = new JButton();
    m_phaseDiagramCtrlButton.setFont( BUTTON_LABEL_FONT );
    m_phaseDiagramCtrlButton.setText( StatesOfMatterStrings.PHASE_DIAGRAM_BUTTON_LABEL );
    addControl( m_phaseDiagramCtrlButton );
    m_phaseDiagramCtrlButton.addActionListener( new ActionListener().withAnonymousClassBody( {
      actionPerformed: function( e ) {
        m_phaseDiagramVisible = true;
        updateVisibilityStates();
      }
    } ) );
    m_phaseDiagramCtrlButton.setVisible( !m_phaseDiagramVisible );
    // Set the two buttons to be the same size.
    buttonWidth = Math.max( buttonWidth, m_phaseDiagramCtrlButton.getPreferredSize().getWidth() );
    buttonHeight = Math.max( buttonHeight, m_phaseDiagramCtrlButton.getPreferredSize().getHeight() );
    var buttonSize = new Dimension( Math.round( buttonWidth ), Math.round( buttonHeight ) );
    m_phaseDiagramCtrlButton.setPreferredSize( buttonSize );
    m_interactionDiagramCtrlButton.setPreferredSize( buttonSize );
    // Add additional spacing after the phase diagram control button.
    m_postPhaseButtonSpacer = createVerticalSpacerPanel( 20 );
    addControlFullWidth( m_postPhaseButtonSpacer );
    m_postInteractionButtonSpacer.setVisible( !m_phaseDiagramVisible );
    // Add the phase diagram.
    m_phaseDiagramPanel = new JPanel();
    m_phaseDiagram = new PhaseDiagram();
    m_phaseDiagramPanel.add( m_phaseDiagram );
    addControlFullWidth( m_phaseDiagramPanel );
    m_phaseDiagramPanel.setVisible( m_phaseDiagramVisible );
    // Create and register the handler for user requests to close the phase diagram.
    var phaseDiagramCloseListener = new CloseRequestListener().withAnonymousClassBody( {
      closeRequestReceived: function() {
        // it invisible.
        m_phaseDiagramVisible = false;
        updateVisibilityStates();
      }
    } );
    m_phaseDiagram.addListener( phaseDiagramCloseListener );
    // Update the visibility of the controls based on current model state.
    updateVisibilityStates();
  }

  return inherit( ControlPanel, PhaseChangesControlPanel, {
//----------------------------------------------------------------------------
// Private Methods
//----------------------------------------------------------------------------
    /**
     * Update the position of the marker on the phase diagram based on the
     * temperature and pressure values within the model.
     */

    //private
    updatePhaseDiagram: function() {
      // If the container has exploded, don't bother showing the dot.
      if ( m_model.getContainerExploded() ) {
        m_phaseDiagram.setStateMarkerVisible( false );
      }
      else {
        m_phaseDiagram.setStateMarkerVisible( true );
        var movingAverageTemperature = updateMovingAverageTemperature( m_model.getTemperatureSetPoint() );
        var modelPressure = m_model.getModelPressure();
        var mappedTemperature = mapModelTemperatureToPhaseDiagramTemperature( movingAverageTemperature );
        var mappedPressure = mapModelTempAndPressureToPhaseDiagramPressureAlternative1( modelPressure, movingAverageTemperature );
        m_phaseDiagram.setStateMarkerPos( mappedTemperature, mappedPressure );
      }
    },

    //private
    updateMovingAverageTemperature: function( newTemperatureValue ) {
      if ( m_modelTemperatureHistory.size() == MAX_NUM_HISTORY_SAMPLES ) {
        m_modelTemperatureHistory.remove( 0 );
      }
      m_modelTemperatureHistory.add( newTemperatureValue );
      var totalOfAllTemperatures = 0;
      for ( var temperature in m_modelTemperatureHistory ) {
        totalOfAllTemperatures += temperature;
      }
      return totalOfAllTemperatures / m_modelTemperatureHistory.size();
    },

    //private
    mapModelTemperatureToPhaseDiagramTemperature: function( modelTemperature ) {
      var mappedTemperature;
      if ( modelTemperature < TRIPLE_POINT_TEMPERATURE_IN_MODEL ) {
        mappedTemperature = SLOPE_IN_1ST_REGION * modelTemperature;
      }
      else {
        mappedTemperature = modelTemperature * SLOPE_IN_2ND_REGION + OFFSET_IN_2ND_REGION;
      }
      return Math.min( mappedTemperature, 1 );
    },

    //private
    mapModelTempAndPressureToPhaseDiagramPressure: function( modelPressure, modelTemperature ) {
      var mappedTemperature = mapModelTemperatureToPhaseDiagramTemperature( modelTemperature );
      var mappedPressure;
      if ( modelTemperature < TRIPLE_POINT_TEMPERATURE_IN_MODEL ) {
        mappedPressure = 1.4 * (Math.pow( mappedTemperature, 2 )) + PRESSURE_FACTOR * Math.pow( modelPressure, 2 );
      }
      else if ( modelTemperature < CRITICAL_POINT_TEMPERATURE_IN_MODEL ) {
        mappedPressure = 0.19 + 1.2 * (Math.pow( mappedTemperature - TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM, 2 )) + PRESSURE_FACTOR * Math.pow( modelPressure, 2 );
      }
      else {
        mappedPressure = 0.43 + (0.43 / 0.81) * (mappedTemperature - 0.81) + PRESSURE_FACTOR * Math.pow( modelPressure, 2 );
      }
      return Math.min( mappedPressure, 1 );
    },
// TODO: This was added by jblanco on 3/23/2012 as part of effort to
// improve phase diagram behavior, see #3287. If kept, it needs to be
// cleaned up, including deletion of the previous version of this method.
// Map the model temperature and pressure to a normalized pressure value
// suitable for use in setting the marker position on the phase chart.

    //private
    mapModelTempAndPressureToPhaseDiagramPressureAlternative1: function( modelPressure, modelTemperature ) {
      // world equations that define phases of matter.
      var cutOverTemperature = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM - 0.025;
      var mappedTemperature = mapModelTemperatureToPhaseDiagramTemperature( modelTemperature );
      var mappedPressure;
      if ( mappedTemperature < cutOverTemperature ) {
        mappedPressure = Math.pow( mappedTemperature, 1.5 );
      }
      else {
        mappedPressure = Math.pow( mappedTemperature - cutOverTemperature, 1.8 ) + 0.2;
      }
      return Math.min( mappedPressure, 1 );
    },

    //private
    createVerticalSpacerPanel: function( space ) {
      if ( space <= 0 ) {
        throw new IllegalArgumentException( "Can't have zero or negative space in spacer panel." );
      }
      var spacePanel = new JPanel();
      spacePanel.setLayout( new BoxLayout( spacePanel, BoxLayout.Y_AXIS ) );
      spacePanel.add( Box.createVerticalStrut( space ) );
      return spacePanel;
    },
    /**
     * Update the visibility of the various diagrams, buttons, and controls
     * based on the internal state and the state of the model.
     */

    //private
    updateVisibilityStates: function() {
      m_interactionDiagramPanel.setVisible( m_interactionDiagramVisible && m_advanced );
      m_interactionDiagramCtrlButton.setVisible( !m_interactionDiagramVisible && m_advanced );
      m_preInteractionButtonSpacer.setVisible( !m_interactionDiagramVisible );
      m_postInteractionButtonSpacer.setVisible( !m_interactionDiagramVisible );
      var userDefinedMoleculeSelected = m_model.getMoleculeType() == StatesOfMatterConstants.USER_DEFINED_MOLECULE;
      m_interactionStrengthControlPanel.setVisible( userDefinedMoleculeSelected );
      if ( userDefinedMoleculeSelected ) {
        // this case.
        m_phaseDiagramPanel.setVisible( false );
        m_phaseDiagramCtrlButton.setVisible( false );
        m_preInteractionButtonSpacer.setVisible( false );
        m_postInteractionButtonSpacer.setVisible( false );
      }
      else {
        m_phaseDiagramPanel.setVisible( m_phaseDiagramVisible );
        m_phaseDiagramCtrlButton.setVisible( !m_phaseDiagramVisible );
        m_prePhaseButtonSpacer.setVisible( !m_phaseDiagramVisible );
        m_postPhaseButtonSpacer.setVisible( !m_phaseDiagramVisible );
      }
    }
  } );
} );

