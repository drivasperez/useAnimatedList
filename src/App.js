import React from "react";
import "./styles.css";
import { useAnimatedList } from "./useAnimatedList";

const initialState = ["First", "Second", "Third", "Fourth"];

export default function App() {
  const [counter, setCounter] = React.useState(1);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [items, setItems] = React.useState(initialState);

  const addOne = () => {
    setItems((p) => [`new item ${counter}`, ...p]);
    setCounter((p) => p + 1);
  };
  const remove = (i) => () =>
    setItems((p) => [...p.slice(0, i), ...p.slice(i + 1)]);

  const reset = () => setItems(initialState);
  const toggleReduceMotion = () => setReduceMotion((p) => !p);

  return (
    <div className="App">
      <h1>Animated list</h1>
      <div className="Buttons">
        <button onClick={() => setItems((p) => [...p].reverse())}>
          Reverse
        </button>
        <button onClick={addOne}>Add one</button>
        <button onClick={reset}>Reset</button>
        <button onClick={toggleReduceMotion}>
          {reduceMotion ? "Activate animation" : "Deactivate animation"}
        </button>
      </div>

      <AnimatedList skip={reduceMotion}>
        {items.map((item, i) => (
          <div className="Item" key={item}>
            {item}
            <button onClick={remove(i)}>-</button>
          </div>
        ))}
      </AnimatedList>
    </div>
  );
}

function AnimatedList({ children = [], skip }) {
  const [bindContainer, bindChild] = useAnimatedList(children, {
    skip,

    translate: "vertical"
  });

  return (
    <div {...bindContainer}>
      {children.map((child) => (
        <div {...bindChild(child.key)} key={child.key}>
          {child}
        </div>
      ))}
    </div>
  );
}
