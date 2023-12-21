# solid-dockview

Docking Layout for Solid.js, based on dockview-core

## Using

```jsx
import { DockPanel, DockView } from "solid-dockview";
import "dockview-core/dist/styles/dockview.css";

const App = () => {
  return (
    <DockView class="dockview-theme-dracula" style={{ width: "500px", height: "500px" }}>
      <DockPanel title="Hello">World</DockPanel>
      <DockPanel title="Panel2">Hey</DockPanel>
    </DockView>
  );
};
```
