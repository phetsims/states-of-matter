Model Notes for States of Matter
================================

+ The model works by calculating the Lennard-Jones potential between all particles and, in the case of water, the
effects of the charge distribution of the molecules on their interaction and positions.  This works best for fairly
large numbers of molecules, roughly 15 or more.
+ The temperature is calculated as the overall energy of the system.  This is necessary because there aren't enough
particles to use the energy of the particles that are coming into contact with the thermometer to indicate the
temperature.  This works reasonably well, but it means that the temperature does not plateau at the phase interfaces,
e.g. when changing from solid to liquid.
+ For solid water, the charge interactions are somewhat overemphasized in order to make sure that spaces form in the ice
and that at least some hexagonal shapes are formed.  This is necessary because the model is two dimensional, and
water crystals are, of course, three dimensional.  A resource for exploring the actual crystal structure of ice can be
found at http://www.lsbu.ac.uk/water/ice1h.html.
+ The phase diagrams are shown qualitatively in the sim to help students get a general understanding of phase
diagrams.
+ The sim is not designed to be used as a comprehensive tool for learning about phase diagrams, instead the focus is on
phases of matter. The small number of particles shown and the simplicity of the underlying models makes it difficult to
map accurately the exact phase to the correct regions of the phase diagram. However, we felt there would be some
benefit to students being exposed to a simplified phase diagram. In the sim, the diagram marker remains on the
coexistence line between liquid/gas or solid/gas (and is extrapolated into the critical region).
+ The model uses the Van der Waals radius in its depiction of the relative sizes of the various atoms.  Please see
https://en.wikipedia.org/wiki/Van_der_Waals_radius.
