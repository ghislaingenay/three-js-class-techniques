import shadow from "./shadow";
import haunted from "./haunted";
import tick from "./light";
import particle from "./particle";

const learning = {
  light: tick,
  shadow: shadow,
  haunted: haunted,
  particle: particle,
  galaxy: () => {
    import("./galaxy").then((module) => {
      module.default();
    });
  },
  scrollAnimation: () => {
    import("./scroll_animation").then((module) => {
      module.default();
    });
  },
};

learning.scrollAnimation();
