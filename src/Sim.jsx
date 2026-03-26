import { forwardRef } from "react";

const Sim = forwardRef((props, ref) => {
  return <div className="sim" ref={ref}></div>;
});

Sim.displayName = "Sim";
export default Sim;
