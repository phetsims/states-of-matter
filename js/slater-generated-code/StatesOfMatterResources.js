// Copyright 2002-2014, University of Colorado Boulder
/**
 * StatesOfMatterResources is a wrapper around the PhET resource loader.
 * If we decide to use a different technique to load resources in the
 * future, all changes will be encapsulated here.
 *
 * @author Chris Malley, John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var BufferedImage = require( 'java.awt.image.BufferedImage' );
  var PhetCommonResources = require( 'edu.colorado.phet.common.phetcommon.resources.PhetCommonResources' );
  var PhetResources = require( 'edu.colorado.phet.common.phetcommon.resources.PhetResources' );
  var PImage = require( 'edu.umd.cs.piccolo.nodes.PImage' );


  //private
  var RESOURCES = new PhetResources( "states-of-matter" );
  /* Not intended for instantiation. */

  //private
  function StatesOfMatterResources() {
  }

  return inherit( Object, StatesOfMatterResources, {
    getResourceLoader: function() {
      return RESOURCES;
    },
    getString: function( name ) {
      return RESOURCES.getLocalizedString( name );
    },
    getChar: function( name, defaultValue ) {
      return RESOURCES.getLocalizedChar( name, defaultValue );
    },
    getInt: function( name, defaultValue ) {
      return RESOURCES.getLocalizedInt( name, defaultValue );
    },
    getImage: function( name ) {
      return RESOURCES.getImage( name );
    },
    getImageNode: function( name ) {
      return new PImage( RESOURCES.getImage( name ) );
    },
    getCommonString: function( name ) {
      return PhetCommonResources.getInstance().getLocalizedString( name );
    },
    getCommonImage: function( name ) {
      return PhetCommonResources.getInstance().getImage( name );
    }
  } );
} );

