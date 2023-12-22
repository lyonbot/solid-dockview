import { createContext, onCleanup } from "solid-js";
import {
  DockviewComponent,
  DockviewPanel,
  IContentRenderer,
  IGroupPanelInitParameters,
  ITabRenderer,
  PanelUpdateEvent,
  Parameters,
} from "dockview-core";

import { useSyncDOMAttrs } from "./dom-attrs";
import { dockviewEventNames } from "./events";
import type { DockPanelProps, DockViewProps } from "./index";
import { keyedDebounce, watch } from "./utils";
import { panelStateLUT } from "./global-api";
import { dockViewPropKeys } from "./DockView";

export const DockViewContext = createContext<ReturnType<typeof createDockViewContext>>();

export function createDockViewContext(props: DockViewProps) {
  const element = document.createElement("div");
  useSyncDOMAttrs(element, props, dockViewPropKeys);

  const dockview = new DockviewComponent({
    components: {
      default: PanelContentRenderer,
    },
    tabComponents: {
      default: PanelTabRenderer,
    },
    parentElement: element,
  });

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
    props,
  };
}

export interface PanelContentRendererParams {
  contentElement: HTMLElement;
  tabElement: HTMLElement;
  props: DockPanelProps;
}

class PanelContentRenderer implements IContentRenderer {
  private _params!: PanelContentRendererParams;

  get element(): HTMLElement {
    return this._params.contentElement;
  }

  init(params: IGroupPanelInitParameters): void {
    this._params = params.params as PanelContentRendererParams;
  }

  // update(event: PanelUpdateEvent<Parameters>): void {
  //   // this._element.textContent = event.params.title;
  // }
}

class PanelTabRenderer implements ITabRenderer {
  private _params!: PanelContentRendererParams;

  get element(): HTMLElement {
    return this._params.tabElement;
  }

  init(params: IGroupPanelInitParameters): void {
    this._params = params.params as PanelContentRendererParams;
  }

  // update(event: PanelUpdateEvent<Parameters>): void {
  //   // this._element.textContent = event.params.title;
  // }
}
