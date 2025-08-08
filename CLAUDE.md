# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## States of Matter Simulation

This is a PhET Interactive Simulation that teaches concepts about states of matter (solid, liquid, gas) and atomic interactions. It's part of the larger PhET ecosystem with a TypeScript codebase that has been recently migrated from JavaScript (as of commit 951ca66).

## Development Commands

Run all commands from the `states-of-matter/` directory:

```bash
# TypeScript transpilation (REQUIRED during development)
grunt output-js-project --live  # Watch mode for auto-transpilation

# Testing
npm test                        # Runs full test suite (playwright + type-check + lint)
playwright test                 # Run playwright tests only
grunt type-check               # TypeScript type checking
grunt lint                     # ESLint checking
grunt lint --fix              # Auto-fix lint errors

# Building
grunt                          # Build for phet brand
grunt --brands=phet,phet-io    # Build multiple brands
grunt --brands=adapted-from-phet # Build specific brand
```

## Architecture & Key Components

### Simulation Structure
- **3 Screens**: States, Phase Changes, and Atomic Interactions
- **Model-View Pattern**: Models in `js/*/model/`, Views in `js/*/view/`
- **Common Components**: Shared code in `js/common/` for particles, thermometers, containers

### Core Physics Systems

**Verlet Algorithm Implementations** (`js/common/model/engine/`):
- `MonatomicVerletAlgorithm` - Single atom motion
- `DiatomicVerletAlgorithm` - Two-atom molecules  
- `WaterVerletAlgorithm` - Water molecule specific behavior
- Each has corresponding `PhaseStateChanger` and `AtomPositionUpdater`

**Particle System** (`js/common/model/`):
- `MultipleParticleModel` - Main particle container and physics engine
- `MoleculeForceAndMotionDataSet` - Force calculations and motion data
- `LjPotentialCalculator` - Lennard-Jones potential calculations
- Uses Andersen/Isokinetic thermostats for temperature control

### Key PhET Patterns Used

**Property System**: Uses axon Properties for reactive state:
```typescript
property.link( value => { /* observer */ } );
property.lazyLink( value => { /* skip initial */ } );
// Must unlink to prevent memory leaks!
```

**Canvas Rendering**: Performance-critical particle rendering uses Canvas nodes:
- `ParticleImageCanvasNode` - Renders particle positions
- `InteractionPotentialCanvasNode` - Draws potential energy diagrams

## Testing

- **Snapshot Tests**: `test/snapshot-comparison-test.js` validates visual regression
- **Playwright Config**: Tests run with viewport 1280x720, headless mode
- Expected snapshot hash: `210c3b`

## TypeScript Migration Notes

- Recently migrated from JavaScript (see issue #368)
- All `.js` files renamed to `.ts` in commit 951ca66
- Uses TypeScript project references for dependencies
- Extends `perennial-alias/tsconfig/tsconfig-browser.json`
- Transpilation required via `grunt output-js-project`

## Build System

- Uses chipper's grunt tasks via `Gruntfile.cjs`
- Supports brands: `phet`, `phet-io`, `adapted-from-phet`
- Build outputs to `build/{brand}/` directory
- PhET-iO overrides in `js/states-of-matter-phet-io-overrides.js`