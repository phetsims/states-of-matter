// Copyright 2002-2012, University of Colorado
/**
 * This class represents a particle in the model portion of the States of
 * Matter simulation.
 *
 * @author John De Goes, John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var ArrayList = require( 'java.util.ArrayList' );
  var Vector2 = require( 'DOT/Vector2' );
  var AtomType = require( 'STATES_OF_MATTER/states-of-matter/model/AtomType' );


  // static interface: Listener
  var Listener =
    define( function( require ) {

      return inherit( Object, Listener, {
        /**
         * Inform listeners that the position of this particle has changed.
         */
        positionChanged: function() {},
        /**
         * Inform listeners that the velocity of this particle has changed.
         */
        velocityChanged: function() {},
        /**
         * Inform listeners that the acceleration of this particle has changed.
         */
        accelerationChanged: function() {},
        /**
         * Inform listeners that this particle has been removed from the
         * model.
         */
        particleRemoved: function( particle ) {},
        /**
         * Inform listeners that the radius of this particle has been changed.
         */
        radiusChanged: function() {}
      } );
    } );
  ;
  // static class: Adapter
  var Adapter =
    define( function( require ) {

      return inherit( Object, Adapter, {
        positionChanged: function() {
        },
        velocityChanged: function() {
        },
        accelerationChanged: function() {
        },
        particleRemoved: function( particle ) {
        },
        radiusChanged: function() {
        }
      } );
    } );
  ;
  function StatesOfMatterAtom( x, y, radius, mass ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    // In picometers.

    //private
    this.m_position = new Vector2();
    // In meters/sec

    //private
    this.m_velocity = new Vector2();
    // In meters/(sec * sec)

    //private
    this.m_accel = new Vector2();
    // In picometers.
    this.m_radius;
    // In atomic mass units.

    //private
    this.m_mass;

    //private
    this.m_listeners = [];
    this( x, y, radius, mass, 0.0, 0.0, 0.0, 0.0 );
    if ( mass <= 0.0 ) {
      throw new IllegalArgumentException( "Mass is out of range" );
    }
    if ( radius <= 0.0 ) {
      throw new IllegalArgumentException( "Radius is out of range" );
    }
  }

  //private
  function StatesOfMatterAtom( x, y, radius, mass, vx, vy, ax, ay ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------
    // In picometers.

    //private
    this.m_position = new Vector2();
    // In meters/sec

    //private
    this.m_velocity = new Vector2();
    // In meters/(sec * sec)

    //private
    this.m_accel = new Vector2();
    // In picometers.
    this.m_radius;
    // In atomic mass units.

    //private
    this.m_mass;

    //private
    this.m_listeners = [];
    m_position.setLocation( x, y );
    m_velocity.setComponents( vx, vy );
    m_accel.setComponents( ax, ay );
    this.m_mass = mass;
    this.m_radius = radius;
  }

  return inherit( Object, StatesOfMatterAtom, {
//----------------------------------------------------------------------------
// Accessor Methods
//----------------------------------------------------------------------------
    getType: function() {},
    getX: function() {
      return m_position.x;
    },
    getY: function() {
      return m_position.y;
    },
    setPosition: function( x, y ) {
      m_position.x = x;
      m_position.y = y;
      notifyPositionChanged();
    },
    getVy: function() {
      return m_velocity.getY();
    },
    setVy: function( vy ) {
      m_velocity.setY( vy );
      notifyVelocityChanged();
    },
    getVx: function() {
      return m_velocity.getX();
    },
    setVx: function( vx ) {
      m_velocity.setX( vx );
      notifyVelocityChanged();
    },
    getAx: function() {
      return m_accel.getX();
    },
    getAy: function() {
      return m_accel.getY();
    },
    setAx: function( ax ) {
      m_accel.setX( ax );
      notifyAccelerationChanged();
    },
    setAy: function( ay ) {
      m_accel.setY( ay );
      notifyAccelerationChanged();
    },
    getMass: function() {
      return m_mass;
    },
    getRadius: function() {
      return m_radius;
    },
    getPositionReference: function() {
      return m_position;
    },
    getVelocity: function() {
      return m_velocity;
    },
    getAccel: function() {
      return m_accel;
    },
//----------------------------------------------------------------------------
// Other Public Methods
//----------------------------------------------------------------------------
    equals: function( o ) {
      if ( this == o ) {
        return true;
      }
      if ( o == null || getClass() != o.getClass() ) {
        return false;
      }
      var that = o;
      if ( Number.compare( that.m_mass, m_mass ) != 0 ) {
        return false;
      }
      if ( Number.compare( that.m_radius, m_radius ) != 0 ) {
        return false;
      }
      if ( Number.compare( that.getVx(), getVx() ) != 0 ) {
        return false;
      }
      if ( Number.compare( that.getVy(), getVy() ) != 0 ) {
        return false;
      }
      if ( Number.compare( that.getX(), getX() ) != 0 ) {
        return false;
      }
      if ( Number.compare( that.getY(), getY() ) != 0 ) {
        return false;
      }
      if ( Number.compare( that.getAx(), getAx() ) != 0 ) {
        return false;
      }
      if ( Number.compare( that.getAy(), getAy() ) != 0 ) {
        return false;
      }
      return true;
    },
    clone: function() /*throws CloneNotSupportedException*/ {
      try {
        var p = super.clone();
        p.m_position = new Vector2( getX(), getY() );
        p.m_velocity = new Vector2( getVx(), getVy() );
        p.m_accel = new Vector2( getAx(), getAy() );
        return p;
      }
      catch( /*CloneNotSupportedException*/ e ) {
        throw new InternalError();
      }
    },
    toString: function() {
      return getClass().getName() + "[x=" + getX() + ",y=" + getY() + ",radius=" + m_radius + ",mass=" + m_mass + ",vx=" + getVx() + ",vy=" + getVy() + ",ax=" + getAx() + ",ay=" + getAy() + "]";
    },
    addListener: function( listener ) {
      if ( m_listeners.contains( listener ) ) {
        // Don't bother re-adding.
        return;
      }
      m_listeners.add( listener );
    },
    removeListener: function( listener ) {
      return m_listeners.remove( listener );
    },
    /**
     * Notify the particle that it has been removed from the model so that it
     * can get rid of any memory references (for garbage collection purposes)
     * and can let any listeners know that is has been removed.
     */
    removedFromModel: function() {
      notifyParticleRemoved();
      m_listeners.clear();
    },

    //private
    notifyPositionChanged: function() {
      for ( var listener in m_listeners ) {
        (listener).positionChanged();
      }
    },

    //private
    notifyVelocityChanged: function() {
      for ( var listener in m_listeners ) {
        (listener).velocityChanged();
      }
    },

    //private
    notifyAccelerationChanged: function() {
      for ( var listener in m_listeners ) {
        (listener).accelerationChanged();
      }
    },

    //private
    notifyParticleRemoved: function() {
      for ( var listener in m_listeners ) {
        (listener).particleRemoved( this );
      }
    },
    notifyRadiusChanged: function() {
      for ( var listener in m_listeners ) {
        (listener).radiusChanged();
      }
    },
  } );
} );

