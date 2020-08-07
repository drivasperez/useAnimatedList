import React from "react";

export function useAnimatedList(
  items,
  {
    entry: elem = { time: 500, easing: "ease-in" },
    moving = { time: 200, easing: "ease-in-out" },
    skip = false,
    translate = "both",
    animateOnFirstRender = false
  } = {}
) {
  const ref = React.useRef();
  const prevBoxes = React.useRef(new Map());

  const shouldAnimate = React.useRef(animateOnFirstRender);
  const runningAnimations = React.useRef(new Set());
  // Counter could be used to disable controls while animating, or trigger
  // a callback on all ended etc.
  const animationCounter = React.useRef(0);

  if (runningAnimations.current.size > 0) {
    // Render has been called again, while animations were in flight.
    // Reset the transforms before the layoutEffect runs.
    // This doesn't work very well currently, I'm missing something!
    const batchedOperations = [];
    for (elem of runningAnimations.current.keys()) {
      batchedOperations.push(() => {
        elem.style.transition = "";
        elem.style.transform = "";
      });
    }
    runningAnimations.current.clear();
    while (batchedOperations.length > 0) {
      batchedOperations.pop()();
    }
  }

  React.useEffect(() => {
    // Clear the cache if we set skip to true.
    if (skip) {
      prevBoxes.current.clear();
      shouldAnimate.current = animateOnFirstRender;
    }
  }, [skip, animateOnFirstRender]);

  React.useLayoutEffect(() => {
    if (skip || !ref.current) return;
    const batchedOperations = [];
    const list = ref.current;
    const { children: domChildren } = list;
    for (const domChild of domChildren) {
      const oldBox = prevBoxes.current.get(domChild.dataset.animationKey);
      const box = domChild.getBoundingClientRect();

      if (box && shouldAnimate.current) {
        if (oldBox) {
          const dx =
            translate === "both" || translate === "horizontal"
              ? oldBox.left - box.left
              : 0;
          const dy =
            translate === "both" || translate === "vertical"
              ? oldBox.top - box.top
              : 0;

          if (dx === 0 && dy === 0) return;

          batchedOperations.push(() => {
            requestAnimationFrame(() => {
              domChild.style.transform = `translate(${dx}px, ${dy}px)`;
              domChild.style.transition = "transform 0s";

              requestAnimationFrame(() => {
                domChild.style.transform = "";
                domChild.style.transition = `transform ${moving.time}ms ${moving.easing}`;
                runningAnimations.current.add(domChild);
                animationCounter.current += 1;
                domChild.addEventListener(
                  "transitionend",
                  () => {
                    runningAnimations.current.delete(domChild);
                    animationCounter.current -= 1;
                  },
                  {
                    once: true
                  }
                );
              });
            });
          });
        } else {
          batchedOperations.push(() => {
            requestAnimationFrame(() => {
              domChild.style.opacity = 0;
              domChild.style.transition = "opacity 0s";
              requestAnimationFrame(() => {
                domChild.style.opacity = 1;
                domChild.style.transition = `opacity ${elem.time}ms ${elem.easing}`;
              });
            });
          });
        }
      }
      prevBoxes.current.set(
        domChild.dataset.animationKey,
        domChild.getBoundingClientRect()
      );
    }
    shouldAnimate.current = true;
    while (batchedOperations.length) {
      batchedOperations.pop()();
    }
  }, [
    items,
    elem.easing,
    elem.time,
    moving.easing,
    moving.time,
    skip,
    translate
  ]);

  const bindChild = (key) => ({
    "data-animation-key": key
  });

  return [{ ref }, bindChild];
}
