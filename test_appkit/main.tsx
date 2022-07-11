/** @jsx AppKit.createElement */

import {
  AppKit,
  Button,
  mainloop,
  NSApp,
  TextField,
  useState,
  Window,
} from "./mod.ts";

function App() {
  const [label1, setLabel1] = useState(null);
  const [label2, setLabel2] = useState(null);

  let btn1 = 0,
    btn2 = 0;

  return (
    <Window title="Deno Obj-C" contentRect={[100, 100, 300, 300]}>
      <TextField
        bind={setLabel1}
        frame={[50, 80, 150, 20]}
        value="Button 1 clicked 0 times"
        editable={false}
        bezeled={false}
        drawsBackground={false}
      />
      <Button
        frame={[50, 225, 90, 25]}
        title="Button 1"
        onClick={() =>
          label1().setStringValue(`Button 1 clicked ${++btn1} times`)}
      />
      <TextField
        bind={setLabel2}
        frame={[50, 50, 150, 20]}
        value="Button 2 clicked 0 times"
        editable={false}
        bezeled={false}
        drawsBackground={false}
      />
      <Button
        frame={[50, 125, 200, 75]}
        title="Button 2"
        onClick={() =>
          label2().setStringValue(`Button 2 clicked ${++btn2} times`)}
      />
    </Window>
  );
}

const window = App();
window.makeKeyAndOrderFront(NSApp);

addEventListener("launched", () => {
  console.log("Launched 🚀");
});

mainloop();
