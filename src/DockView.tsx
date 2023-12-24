import { For, JSX, ParentProps, createSignal, onCleanup, onMount } from "solid-js";
import { HTMLDomAttrs } from "./dom-attrs";
import { createDockViewContext, DockViewContext, DockViewWatermarkProps } from "./context";
import { DockviewEventListeners, dockviewEventNames } from "./events";
import { strictKeys } from "./utils";
import style from "./style.scss?inline";
import type { DockviewComponent } from "dockview-core";

let styleLoadCounter = 0;

export type DockViewProps = ParentProps<
  Partial<DockviewEventListeners> & {
    // dom attrs
    // wtf

    onReady?: (event: { dockview: DockviewComponent }) => void;
    onDispose?: (event: { dockview: DockviewComponent }) => void;
    watermarkComponent?: (props: DockViewWatermarkProps) => JSX.Element;
  }
>;

export const dockViewPropKeys = strictKeys<DockViewProps>()([
  "children",
  // events
  ...dockviewEventNames,
  "onReady",
  "onDispose",
  "watermarkComponent",
]) satisfies readonly string[];

export function DockView(props: DockViewProps & HTMLDomAttrs) {
  const context = createDockViewContext(props);

  if (styleLoadCounter++ === 0) {
    const styleElement = document.createElement("style");
    const parent = document.head || document.body;
    styleElement.textContent = style;
    parent.appendChild(styleElement);
    onCleanup(() => {
      if (!--styleLoadCounter) parent.removeChild(styleElement);
    });
  }

  const [ready, setReady] = createSignal(false);
  onMount(() => {
    const { clientWidth, clientHeight } = context.element;
    context.dockview.layout(clientWidth, clientHeight);
    setReady(true);
    props.onReady?.({ dockview: context.dockview });
  });

  onCleanup(() => {
    props.onDispose?.({ dockview: context.dockview });
    context.dockview.dispose();
  });

  return (
    <DockViewContext.Provider value={context}>
      {context.element}
      {ready() && props.children}
      <For each={context.extraRenders()}>{(el) => el()}</For>
    </DockViewContext.Provider>
  );
}
