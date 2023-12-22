import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { DockPanel, DockView, openPanel } from "../src";
import "dockview-core/dist/styles/dockview.css";
import { StarSVG } from "./icons";

const App = () => {
  const [inevitableOpenTimes, setInevitableOpenTimes] = createSignal(0);

  return (
    <div>
      <h1>solid-dockview</h1>
      <p>
        <a href="https://github.com/lyonbot/solid-dockview">GitHub</a>
      </p>
      <DockView
        class="dockview-theme-light"
        style={{ height: "500px", border: "1px solid #ccc" }}
        onReady={({ dockview }) => {
          console.log("dockview ready", dockview);
          window.dockview = dockview;
        }}
      >
        {/* simple panel */}
        <DockPanel title="First Panel">
          <p>hello world</p>
        </DockPanel>

        {/* panel with events */}
        <DockPanel
          id="inevitable"
          title="Inevitable"
          onClose={({ panel }) => setTimeout(() => openPanel(panel), 500)}
          onOpen={() => setInevitableOpenTimes((c) => c + 1)}
        >
          <p>You can't close this panel - it always come back</p>
          <p>Opened: {inevitableOpenTimes()} times</p>
        </DockPanel>

        {/* panel with custom tab */}
        <DockPanel
          title="Third"
          position={{ referencePanel: "inevitable", direction: "right" }}
          onCreate={({ panel }) => {
            panel.api.setSize({ width: 300 });
          }}
        >
          with a smaller default width
        </DockPanel>

        {/* complex example. see below */}
        <ComplexExamplePanel />

        {/* floating at create */}
        <DockPanel title="Floating" floating={{ width: 400, height: 200, x: 300, y: 100 }}>
          <p>Default Floating</p>
        </DockPanel>
      </DockView>
    </div>
  );
};

function ComplexExamplePanel(props: {}) {
  const [title, setTitle] = createSignal("hello");
  const [closable, setClosable] = createSignal(true);
  const [starred, setStarred] = createSignal(false);

  return (
    <DockPanel
      position={{ referencePanel: "inevitable", direction: "below" }}
      title={
        // title with nyan cat inside
        <div>
          <img src="./nyancat.ico" /> {title()}
        </div>
      }
      closeable={closable()}
      actions={[
        <button class="tab-action" onClick={() => setStarred((v) => !v)} title="Toggle Star">
          <StarSVG filled={starred()} />
        </button>,
      ]}
    >
      <div style="padding: 4px 8px">
        <p>
          <label>
            {"title: "}
            <input
              type="text"
              value={title()}
              onInput={(e) => {
                setTitle(e.currentTarget.value);
              }}
            />
          </label>
        </p>
        <p>
          <label>
            {"closeable: "}
            <input
              type="checkbox"
              checked={closable()}
              onChange={(e) => {
                setClosable(e.currentTarget.checked);
              }}
            />
          </label>
        </p>
      </div>
    </DockPanel>
  );
}

render(App, document.body);
