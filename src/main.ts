import shadow from "./shadow";
import haunted from "./haunted";
import tick from "./light";

const learning = {
  light: tick,
  shadow: shadow,
  haunted: haunted,
};
learning.haunted();
