# solid-dockview

Docking Layout for Solid.js, based on dockview-core

[GitHub](https://github.com/lyonbot/solid-dockview) | [Example](https://lyonbot.github.io/solid-dockview/) | [Documentation](https://lyonbot.github.io/solid-dockview/)

## Get Started

```
npm install solid-dockview dockview-core
```

```jsx
import { DockPanel, DockView } from "solid-dockview";
import "dockview-core/dist/styles/dockview.css";

const App = () => {
  return (
    <DockView class="dockview-theme-dracula" style="height: 80vh">
      <DockPanel title="Hello">World</DockPanel>
      <DockPanel title="Panel2">Hey</DockPanel>
    </DockView>
  );
};
```

## Caveats

### controlling APIs

`solid-dockview` is a wrapper around `dockview-core`, and you can gain the original `DockviewComponent` or `DockPanelComponent` instances.

You can find documentation for `dockview-core`:

- [Dockview API](https://dockview.dev/docs/components/dockview/#dockview-api)
- [Dockview Panel API](https://dockview.dev/docs/components/dockview/#dockview-panel-api)

```jsx
<DockView
  class="dockview-theme-light"
  onReady={({ dockview }) => {
    console.log("dockview ready", dockview);
    // TODO: store `dockview` and use its APIs

    // Note: default panels are not created yet.
    // to wait them, use onMount(() => { ... })
  }}
>
  <DockPanel
    title="Hello"
    onCreate={({ panel, dockview }) => {
      console.log("panel created", panel, dockview);
      panel.api.setSize({ width: 300 });
      // TODO: store `panel` and use its APIs through panel.api.
    }}
  >
    World
  </DockPanel>
</DockView>
```

### panel content overflow

By default `dockview` doesn't restrict the content area's style, thus your content can overflow the panel.

To fix this, inside the `<DockPanel>`, you can wrap your content with `<div style="width: 100%; height: 100%; overflow: auto">`

However, it could be tedious to do this for every panel. If you want to apply this style to all panels, you can add the following to your css:

```css
.solid-dockview-panel-content {
  display: block;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;
}
```

And for specific panels, you can still override the class name with `<DockPanel class="my-panel-content-style">`
