// Copyright 2016-2018, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  const SOMQueryParameters = QueryStringMachine.getAll( {

    // Default to displaying degrees Celsius instead of Kelvin, requested by user(s), see
    // https://github.com/phetsims/states-of-matter/issues/216
    defaultCelsius: { type: 'flag' }
  } );

  statesOfMatter.register( 'SOMQueryParameters', SOMQueryParameters );

  return SOMQueryParameters;
} );
