import { ParentProps, createSignal, on, JSXElement, onCleanup, useContext } from "solid-js";
import { HTMLDomAttrs, useSyncDOMAttrs } from "./dom-attrs";
import { createDockViewContext, DockViewContext } from "./context";
import { AddPanelOptions, AddPanelPositionOptions, DockviewComponent } from "dockview-core";
import { Portal } from "solid-js/web";
import { DockviewEventListeners } from "./events";

export type DockViewProps = ParentProps<
  HTMLDomAttrs &
    Partial<DockviewEventListeners> & {
      // dom attrs
      // wtf
    }
>;

export function DockView(props: DockViewProps) {
  const context = createDockViewContext(props);

  onCleanup(() => {
    context.dockview.dispose();
  });

  return (
    <DockViewContext.Provider value={context}>
      {props.children}
      {context.element}
    </DockViewContext.Provider>
  );
}

export type DockPanelProps = ParentProps<
  HTMLDomAttrs & {
    /** Optional, once set, cannot change! */
    id?: string;
    title: string;

    floating?: AddPanelOptions["floating"];
    position?: AddPanelPositionOptions;
  }
>;

let anonymousCounter = 0;

export function DockPanel(props: DockPanelProps) {
  const context = useContext(DockViewContext)!;
  const contentElement = document.createElement("div");
  useSyncDOMAttrs(contentElement, props);

  const panel = context.dockview.addPanel({
    id: props.id || `anonymous-${anonymousCounter++}`,
    component: "default",
    title: props.title,
    position: props.position,
    floating: props.floating as any,
    params: {
      contentElement,
    },
  });

  onCleanup(() => {
    context.dockview.removePanel(panel);
  });

  return <Portal mount={contentElement}>{props.children}</Portal>;
}
