// Copyright 2002-2014, University of Colorado Boulder
/**
 * DeveloperControlsDialog is a dialog that contains "developer only" controls.
 * These controls will not be available to the user, and are not localized.
 *
 * @author Chris Malley (cmalley@pixelzoom.com), John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Font = require( 'SCENERY/util/Font' );
  var Frame = require( 'java.awt.Frame' );
  var GridLayout = require( 'java.awt.GridLayout' );
  var Insets = require( 'java.awt.Insets' );
  var ActionEvent = require( 'java.awt.event.ActionEvent' );
  var ActionListener = require( 'java.awt.event.ActionListener' );
  var DecimalFormat = require( 'java.text.DecimalFormat' );
  var BorderFactory = require( 'javax.swing.BorderFactory' );
  var ButtonGroup = require( 'javax.swing.ButtonGroup' );
  var JLabel = require( 'javax.swing.JLabel' );
  var JPanel = require( 'javax.swing.JPanel' );
  var JRadioButton = require( 'javax.swing.JRadioButton' );
  var BevelBorder = require( 'javax.swing.border.BevelBorder' );
  var EmptyBorder = require( 'javax.swing.border.EmptyBorder' );
  var TitledBorder = require( 'javax.swing.border.TitledBorder' );
  var ChangeEvent = require( 'javax.swing.event.ChangeEvent' );
  var ChangeListener = require( 'javax.swing.event.ChangeListener' );
  var Module = require( 'edu.colorado.phet.common.phetcommon.application.Module' );
  var ModuleEvent = require( 'edu.colorado.phet.common.phetcommon.application.ModuleEvent' );
  var ModuleObserver = require( 'edu.colorado.phet.common.phetcommon.application.ModuleObserver' );
  var PaintImmediateDialog = require( 'edu.colorado.phet.common.phetcommon.application.PaintImmediateDialog' );
  var PhetApplication = require( 'edu.colorado.phet.common.phetcommon.application.PhetApplication' );
  var VerticalLayoutPanel = require( 'edu.colorado.phet.common.phetcommon.view.VerticalLayoutPanel' );
  var LinearValueControl = require( 'edu.colorado.phet.common.phetcommon.view.controls.valuecontrol.LinearValueControl' );
  var EasyGridBagLayout = require( 'edu.colorado.phet.common.phetcommon.view.util.EasyGridBagLayout' );
  var PhetFont = require( 'edu.colorado.phet.common.phetcommon.view.util.PhetFont' );
  var SwingUtils = require( 'edu.colorado.phet.common.phetcommon.view.util.SwingUtils' );
  var GravityControlPanel = require( 'STATES_OF_MATTER/states-of-matter/control/GravityControlPanel' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/StatesOfMatterAtom' );
  var PhaseChangesModule = require( 'STATES_OF_MATTER/states-of-matter/module/phasechanges/PhaseChangesModule' );
  var SolidLiquidGasModule = require( 'STATES_OF_MATTER/states-of-matter/module/solidliquidgas/SolidLiquidGasModule' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------

  //private
  var NUMBER_FORMATTER = new DecimalFormat( "##0.000" );

  function StatesOfMaterDeveloperControlsDialog( owner, app ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_app;

    //private
    this.m_model;

    //private
    this.m_temperatureControl;

    //private
    this.m_containerWidthInfo;

    //private
    this.m_containerHeightInfo;

    //private
    this.m_numParticles;

    // non-static inner class: ThermostatSelectionPanel
    var ThermostatSelectionPanel =
    /**
     * This class defines the selection panel that allows the user to choose
     * the type of thermostat being used in the model.
     */

      //private
      define( function( require ) {
        function ThermostatSelectionPanel() {

          //private
          this.m_noThermostatRadioButton;

          //private
          this.m_isokineticThermostatRadioButton;

          //private
          this.m_andersenThermostatRadioButton;

          //private
          this.m_adaptiveThermostatRadioButton;
          setLayout( new GridLayout( 0, 1 ) );
          var baseBorder = BorderFactory.createRaisedBevelBorder();
          var titledBorder = BorderFactory.createTitledBorder( baseBorder, "Thermostat Type", TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
          setBorder( titledBorder );
          m_andersenThermostatRadioButton = new JRadioButton( "Andersen Thermostat" );
          m_andersenThermostatRadioButton.setFont( new PhetFont( Font.PLAIN, 14 ) );
          m_andersenThermostatRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setThermostatType( MultipleParticleModel.ANDERSEN_THERMOSTAT );
            }
          } ) );
          m_noThermostatRadioButton = new JRadioButton( "No Thermostat" );
          m_noThermostatRadioButton.setFont( new PhetFont( Font.PLAIN, 14 ) );
          m_noThermostatRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setThermostatType( MultipleParticleModel.NO_THERMOSTAT );
            }
          } ) );
          m_isokineticThermostatRadioButton = new JRadioButton( "Isokinetic Thermostat" );
          m_isokineticThermostatRadioButton.setFont( new PhetFont( Font.PLAIN, 14 ) );
          m_isokineticThermostatRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setThermostatType( MultipleParticleModel.ISOKINETIC_THERMOSTAT );
            }
          } ) );
          m_adaptiveThermostatRadioButton = new JRadioButton( "Adaptive Thermostat" );
          m_adaptiveThermostatRadioButton.setFont( new PhetFont( Font.PLAIN, 14 ) );
          m_adaptiveThermostatRadioButton.addActionListener( new ActionListener().withAnonymousClassBody( {
            actionPerformed: function( e ) {
              m_model.setThermostatType( MultipleParticleModel.ADAPTIVE_THERMOSTAT );
            }
          } ) );
          var buttonGroup = new ButtonGroup();
          buttonGroup.add( m_noThermostatRadioButton );
          buttonGroup.add( m_isokineticThermostatRadioButton );
          buttonGroup.add( m_andersenThermostatRadioButton );
          buttonGroup.add( m_adaptiveThermostatRadioButton );
          switch( m_model.getThermostatType() ) {
            case MultipleParticleModel.NO_THERMOSTAT:
              m_noThermostatRadioButton.setSelected( true );
              break;
            case MultipleParticleModel.ANDERSEN_THERMOSTAT:
              m_andersenThermostatRadioButton.setSelected( true );
              break;
            case MultipleParticleModel.ISOKINETIC_THERMOSTAT:
              m_isokineticThermostatRadioButton.setSelected( true );
              break;
            case MultipleParticleModel.ADAPTIVE_THERMOSTAT:
              m_adaptiveThermostatRadioButton.setSelected( true );
              break;
            default:
              assert && assert( false );
              break;
          }
          add( m_noThermostatRadioButton );
          add( m_isokineticThermostatRadioButton );
          add( m_andersenThermostatRadioButton );
          add( m_adaptiveThermostatRadioButton );
        }

        return inherit( JPanel, ThermostatSelectionPanel, {
        } );
      } );
    PaintImmediateDialog.call( this, owner, "Developer Controls" );
    setResizable( false );
    setModal( false );
    m_app = app;
    // Get a reference to the model.
    var activeModule = m_app.getActiveModule();
    if ( activeModule instanceof SolidLiquidGasModule ) {
      m_model = (activeModule).getMultiParticleModel();
    }
    else if ( activeModule instanceof PhaseChangesModule ) {
      m_model = (activeModule).getMultiParticleModel();
    }
    // Register with the application for module change events.
    m_app.addModuleObserver( new ModuleObserver().withAnonymousClassBody( {
      moduleAdded: function( event ) {
      },
      activeModuleChanged: function( event ) {
        // module, the controls should disappear if the module changes.
        StatesOfMaterDeveloperControlsDialog.this.dispose();
      },
      moduleRemoved: function( event ) {
      }
    } ) );
    // Register with the model for various events.
    m_model.addListener( new MultipleParticleModel.Adapter().withAnonymousClassBody( {
      temperatureChanged: function() {
        m_temperatureControl.setValue( m_model.getTemperatureSetPoint() );
      },
      resetOccurred: function() {
        updateAdditionalInfo();
      },
      particleAdded: function( particle ) {
        updateAdditionalInfo();
      }
    } ) );
    var inputPanel = createInputPanel();
    var panel = new VerticalLayoutPanel();
    panel.setFillHorizontal();
    panel.add( inputPanel );
    setContentPane( panel );
    pack();
    SwingUtils.centerDialogInParent( this );
  }

  return inherit( PaintImmediateDialog, StatesOfMaterDeveloperControlsDialog, {

    //private
    createInputPanel: function() {
      // Thermostat selection.
      var thermostatSelectionPanel = new ThermostatSelectionPanel();
      // Temperature control.
      m_temperatureControl = new LinearValueControl( MultipleParticleModel.MIN_TEMPERATURE, MultipleParticleModel.MAX_TEMPERATURE, "Temperature", "#.###", "Control" );
      m_temperatureControl.setUpDownArrowDelta( 0.05 );
      m_temperatureControl.setTextFieldEditable( true );
      m_temperatureControl.setFont( new PhetFont( Font.PLAIN, 14 ) );
      m_temperatureControl.setTickPattern( "0" );
      m_temperatureControl.setMajorTickSpacing( 100 );
      m_temperatureControl.setMinorTickSpacing( 10 );
      m_temperatureControl.setBorder( BorderFactory.createEtchedBorder() );
      m_temperatureControl.setValue( m_model.getTemperatureSetPoint() );
      m_temperatureControl.addChangeListener( new ChangeListener().withAnonymousClassBody( {
        stateChanged: function( e ) {
          var activeModule = m_app.getActiveModule();
          if ( activeModule instanceof SolidLiquidGasModule ) {
            (activeModule).getMultiParticleModel().setTemperature( m_temperatureControl.getValue() );
          }
          else if ( activeModule instanceof PhaseChangesModule ) {
            (activeModule).getMultiParticleModel().setTemperature( m_temperatureControl.getValue() );
          }
        }
      } ) );
      // Gravity control.
      var gravityControlPanel = new GravityControlPanel( m_model );
      // Create the "Additional Information" panel.
      var infoPanel = new JPanel();
      m_containerWidthInfo = new JLabel();
      infoPanel.add( m_containerWidthInfo );
      m_containerHeightInfo = new JLabel();
      infoPanel.add( m_containerHeightInfo );
      m_numParticles = new JLabel();
      infoPanel.add( m_numParticles );
      var baseBorder = BorderFactory.createRaisedBevelBorder();
      var titledBorder = BorderFactory.createTitledBorder( baseBorder, "Additional Info", TitledBorder.LEFT, TitledBorder.TOP, new PhetFont( Font.BOLD, 14 ), Color.BLACK );
      infoPanel.setBorder( titledBorder );
      updateAdditionalInfo();
      // Layout
      var panel = new JPanel();
      panel.setBorder( new EmptyBorder( 5, 5, 5, 5 ) );
      var layout = new EasyGridBagLayout( panel );
      layout.setInsets( new Insets( 3, 5, 3, 5 ) );
      panel.setLayout( layout );
      var row = 0;
      var column = 0;
      layout.addComponent( thermostatSelectionPanel, row++, column );
      layout.addComponent( m_temperatureControl, row++, column );
      layout.addComponent( gravityControlPanel, row++, column );
      layout.addComponent( infoPanel, row++, column );
      return panel;
    },

    //private
    updateAdditionalInfo: function() {
      m_containerWidthInfo.setText( "Lx = " + NUMBER_FORMATTER.format( m_model.getNormalizedContainerWidth() ) );
      m_containerHeightInfo.setText( "Ly = " + NUMBER_FORMATTER.format( m_model.getNormalizedContainerHeight() ) );
      m_numParticles.setText( "N = " + m_model.getNumMolecules() );
    }
  } );
} );

