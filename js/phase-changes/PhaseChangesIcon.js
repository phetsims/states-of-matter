// Copyright 2015-2022, University of Colorado Boulder

/**
 * Programmatically generated icon for the 'Phase Changes' screen.
 *
 * @author John Blanco
 */


// modules
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import merge from '../../../phet-core/js/merge.js';
import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import { Circle, Color, Node, Rectangle } from '../../../scenery/js/imports.js';
import SOMConstants from '../common/SOMConstants.js';
import statesOfMatter from '../statesOfMatter.js';

// constants
const PARTICLE_COLOR = SOMConstants.NEON_COLOR;
const CUBE_WIDTH = 5; // particles
const CUBE_HEIGHT = 5; // particles

class PhaseChangesIcon extends ScreenIcon {

  /**
   * {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      size: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE,
      maxIconWidthProportion: 0.9,
      maxIconHeightProportion: 0.9,
      fill: Color.BLACK
    }, options );

    // convenience var
    const size = options.size;

    // background
    const iconRootNode = new Rectangle( 0, 0, size.width, size.height, 0, 0, {
      fill: 'black'
    } );

    const particleRadius = size.width * 0.02;

    // create a node that will contain all particles and the arrow so that it can be turned into an image at the end
    const particlesAndArrowNode = new Node();

    // particles on left side in solid form
    const cubeStartX = size.width * 0.15;
    const cubeStartY = size.height * 0.35;
    _.times( CUBE_HEIGHT, row => {
      _.times( CUBE_WIDTH, column => {
        particlesAndArrowNode.addChild( new Circle( particleRadius, {
          fill: PARTICLE_COLOR,
          centerX: cubeStartX + column * particleRadius * 2.1 + ( row % 2 === 0 ? particleRadius * 1.05 : 0 ),
          centerY: cubeStartY + row * particleRadius * 2.1
        } ) );
      } );
    } );

    // arrow in center, the multipliers are empirically determined
    const arrow = new ArrowNode( 0, 0, size.width * 0.12, 0, {
        headWidth: size.height * 0.12,
        tailWidth: size.height * 0.05,
        headHeight: size.width * 0.05,
        fill: 'yellow',
        centerX: iconRootNode.width * 0.45,
        centerY: iconRootNode.height * 0.45
      }
    );
    particlesAndArrowNode.addChild( arrow );

    // particles on right side in gaseous form
    const gasCloudNode = new Node();
    const gasCloudRadius = size.height * 0.3;

    const createGasParticle = ( angle, radius ) => {
      return new Circle( particleRadius, {
        fill: PARTICLE_COLOR,
        centerX: radius * Math.cos( angle ),
        centerY: radius * Math.sin( angle )
      } );
    };

    // for the sake of getting this done quickly, the particles have simply been hand positioned
    gasCloudNode.addChild( createGasParticle( 0, 0 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.08, gasCloudRadius * 0.8 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.16, gasCloudRadius * 0.25 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.24, gasCloudRadius * 0.65 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.32, gasCloudRadius * 0.4 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.40, gasCloudRadius * 0.9 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.48, gasCloudRadius * 0.55 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.56, gasCloudRadius * 0.8 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.64, gasCloudRadius * 0.6 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.72, gasCloudRadius * 0.4 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.80, gasCloudRadius * 0.99 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.88, gasCloudRadius * 0.5 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 0.96, gasCloudRadius * 0.99 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.04, gasCloudRadius * 0.6 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.12, gasCloudRadius * 0.3 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.20, gasCloudRadius * 0.9 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.28, gasCloudRadius * 0.65 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.36, gasCloudRadius * 0.37 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.44, gasCloudRadius * 0.65 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.52, gasCloudRadius * 0.8 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.60, gasCloudRadius * 0.4 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.68, gasCloudRadius * 0.7 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.76, gasCloudRadius * 0.50 ) );
    gasCloudNode.addChild( createGasParticle( Math.PI * 1.94, gasCloudRadius * 0.7 ) );
    gasCloudNode.centerX = size.width * 0.75;
    gasCloudNode.centerY = size.height * 0.5;
    particlesAndArrowNode.addChild( gasCloudNode );

    // for faster rendering, turn the collection of particles and the arrow into an image node
    iconRootNode.addChild( particlesAndArrowNode.rasterized() );

    super( iconRootNode, options );
  }
}

statesOfMatter.register( 'PhaseChangesIcon', PhaseChangesIcon );
export default PhaseChangesIcon;