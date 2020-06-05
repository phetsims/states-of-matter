// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */

import statesOfMatter from '../statesOfMatter.js';

const SOMQueryParameters = QueryStringMachine.getAll( {

  // Default to displaying degrees Celsius instead of Kelvin, requested by user(s), see
  // https://github.com/phetsims/states-of-matter/issues/216
  defaultCelsius: {
    type: 'flag',
    public: true
  },

  // make the burners sticky
  // @public, see https://github.com/phetsims/states-of-matter/issues/295
  stickyBurners: {
    type: 'flag',
    public: true
  }

} );

statesOfMatter.register( 'SOMQueryParameters', SOMQueryParameters );

export default SOMQueryParameters;