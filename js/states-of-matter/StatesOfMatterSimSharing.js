// Copyright 2002-2011, University of Colorado
/**
 * Sim-sharing enums that are specific to this sim.
 *
 * @author Chris Malley (cmalley@pixelzoom.com)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var IUserComponent = require( 'edu.colorado.phet.common.phetcommon.simsharing.messages.IUserComponent' );


  // enum UserComponents implements IUserComponent 
  var UserComponents = {
    stoveSlider: 'stoveSlider'
  };

  return inherit( Object, StatesOfMatterSimSharing, {
  } );
} );

