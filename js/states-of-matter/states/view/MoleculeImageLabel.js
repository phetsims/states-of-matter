// Copyright 2002-2011, University of Colorado
/**
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MouseAdapter = require( 'java.awt.event.MouseAdapter' );
  var MouseEvent = require( 'java.awt.event.MouseEvent' );
  var ImageIcon = require( 'javax.swing.ImageIcon' );
  var JLabel = require( 'javax.swing.JLabel' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );
  var WaterMoleculeStructure = require( 'STATES_OF_MATTER/states-of-matter/model/engine/WaterMoleculeStructure' );
  var ArgonAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/ArgonAtom' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/ConfigurableStatesOfMatterAtom' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/HydrogenAtom' );
  var NeonAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/OxygenAtom' );
  var ModelViewTransform = require( 'STATES_OF_MATTER/states-of-matter/view/ModelViewTransform' );
  var ParticleNode = require( 'STATES_OF_MATTER/states-of-matter/view/ParticleNode' );
  var Node = require( 'SCENERY/nodes/Node' );


  //private
  var PARTICLE_MVT = new ModelViewTransform( 300, 300, 0, 0, false, true );

  //private
  var PARTICLE_SCALING_FACTOR = 0.05;

  function MoleculeImageLabel( moleculeID, model ) {
    var particleNode;
    switch( moleculeID ) {
      case StatesOfMatterConstants.ARGON:
        particleNode = new ParticleNode( new ArgonAtom( 0, 0 ), PARTICLE_MVT, false, true, false );
        break;
      case StatesOfMatterConstants.NEON:
        particleNode = new ParticleNode( new NeonAtom( 0, 0 ), PARTICLE_MVT, false, true, false );
        break;
      case StatesOfMatterConstants.DIATOMIC_OXYGEN:
        // transform used here was empirically determined.
        var oxygenMvt = new ModelViewTransform( 300, 300, 0, 0, false, true );
        particleNode = new Node();
        particleNode.addChild( new ParticleNode( new OxygenAtom( -StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2, 0 ), oxygenMvt, false, true, false ) );
        particleNode.addChild( new ParticleNode( new OxygenAtom( StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2, 0 ), oxygenMvt, false, true, false ) );
        break;
      case StatesOfMatterConstants.WATER:
        // transform used here was empirically determined.
        var waterMvt = new ModelViewTransform( 500, 500, 0, 0, false, true );
        var wms = WaterMoleculeStructure.getInstance();
        particleNode = new Node();
        particleNode.addChild( new ParticleNode( new HydrogenAtom( wms.getStructureArrayX()[1], wms.getStructureArrayY()[1] ), waterMvt, false, true, false ) );
        particleNode.addChild( new ParticleNode( new OxygenAtom( wms.getStructureArrayX()[0], wms.getStructureArrayY()[0] ), waterMvt, false, true, false ) );
        particleNode.addChild( new ParticleNode( new HydrogenAtom( wms.getStructureArrayX()[2], wms.getStructureArrayY()[2] ), waterMvt, false, true, false ) );
        break;
      case StatesOfMatterConstants.USER_DEFINED_MOLECULE:
        particleNode = new ParticleNode( new ConfigurableStatesOfMatterAtom( 0, 0 ), PARTICLE_MVT, false, true, false );
        break;
      default:
        // Should never get here, fix if it does.
        assert && assert( false );
        particleNode = new ParticleNode( new OxygenAtom( 0, 0 ), PARTICLE_MVT, false, true, false );
    }
    // scaling operation is needed.
    particleNode.setScale( PARTICLE_SCALING_FACTOR );
    setIcon( new ImageIcon( particleNode.toImage() ) );
    //When the user clicks on the image label, also set the model to choose that atom/molecule
    addMouseListener( new MouseAdapter().withAnonymousClassBody( {
      mousePressed: function( e ) {
        if ( model.getMoleculeType() != moleculeID ) {
          model.setMoleculeType( moleculeID );
        }
      }
    } ) );
  }

  return inherit( JLabel, MoleculeImageLabel, {
  } );
} );

