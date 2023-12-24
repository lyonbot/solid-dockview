import { Accessor, JSXElement, createContext, createSignal, onCleanup } from "solid-js";
import { DockviewComponent, DockviewComponentOptions, DockviewPanel } from "dockview-core";

import { useSyncDOMAttrs } from "./dom-attrs";
import { dockviewEventNames } from "./events";
import type { DockPanelProps, DockViewProps } from "./index";
import { keyedDebounce, watch } from "./utils";
import { panelStateLUT } from "./global-api";
import { dockViewPropKeys } from "./DockView";
import {
  PanelContentRenderer,
  PanelTabRenderer,
  createGroupHeaderComponent,
  createWatermarkComponent,
} from "./glue-component";

export const DockViewContext = createContext<ReturnType<typeof createDockViewContext>>();

export function createDockViewContext(props: DockViewProps) {
  const element = document.createElement("div");
  useSyncDOMAttrs(element, props, dockViewPropKeys);

  const [extraRenders, updateExtraRenders] = createSignal<Accessor<JSXElement>[]>([]);
  const addExtraRender = (render: Accessor<JSXElement>) => {
    updateExtraRenders((x) => x.concat(render));
    return () => {
      updateExtraRenders((arr) => arr.filter((x) => x !== render));
    };
  };

  const options: DockviewComponentOptions = {
    parentElement: element,
    components: {
      default: PanelContentRenderer,
    },
    tabComponents: {
      default: PanelTabRenderer,
    },
    singleTabMode: props.singleTabMode,
    watermarkComponent: createWatermarkComponent(props, addExtraRender),
    createPrefixHeaderActionsElement: createGroupHeaderComponent(props, "prefixHeaderActionsComponent", addExtraRender),
    createLeftHeaderActionsElement: createGroupHeaderComponent(props, "leftHeaderActionsComponent", addExtraRender),
    createRightHeaderActionsElement: createGroupHeaderComponent(props, "rightHeaderActionsComponent", addExtraRender),
  };

  props.onBeforeCreate?.(options, props);
  const dockview = new DockviewComponent(options);

  // add event listeners
  dockviewEventNames.forEach((eventName) => {
    watch(
      () => props[eventName],
      (listener: any) => {
        if (typeof listener !== "function") return;

        const disposable = dockview[eventName](listener);
        onCleanup(() => disposable.dispose());
      },
    );
  });

  const setPanelOpenStatus = keyedDebounce(
    (panel: DockviewPanel, isOpen: boolean) => (panelStateLUT.get(panel)!.isOpen = isOpen),
  );
  dockview.onDidAddPanel((panel) => setPanelOpenStatus(panel as DockviewPanel, true));
  dockview.onDidRemovePanel((panel) => setPanelOpenStatus(panel as DockviewPanel, false));

  return {
    element,
    dockview,
    extraRenders,
    props,
  };
}

export interface PanelContentRendererParams {
  contentElement: HTMLElement;
  tabElement: HTMLElement;
  props: DockPanelProps;
}
