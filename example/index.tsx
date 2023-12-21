import { createSignal, onCleanup } from "solid-js";
import { render } from "solid-js/web";
import { DockPanel, DockView } from "../src";
import "dockview-core/dist/styles/dockview.css";

const App = () => {
  return (
    <div>
      rendering
      <DockView class="dockview-theme-dracula" style={{ width: "80vw", height: "500px" }}>
        <DockPanel title="测试123">hello world</DockPanel>
        <DockPanel id="t1" title="t1">
          hello world2
        </DockPanel>

        <DockPanel title="测试456" style="background: #ff9" position={{ referencePanel: "t1", direction: "right" }}>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. At, voluptatem. Reiciendis officiis debitis
            perspiciatis earum fuga veniam assumenda optio non sed sapiente, quibusdam deserunt natus alias praesentium?
            Consequuntur, ut iste.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. At, voluptatem. Reiciendis officiis debitis
            perspiciatis earum fuga veniam assumenda optio non sed sapiente, quibusdam deserunt natus alias praesentium?
            Consequuntur, ut iste.
          </p>
        </DockPanel>
      </DockView>
    </div>
  );
};

render(App, document.body);
