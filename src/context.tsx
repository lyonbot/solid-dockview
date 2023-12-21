import { createContext, createEffect, on, onCleanup } from "solid-js";
import {
  DockviewComponent,
  IContentRenderer,
  IGroupPanelInitParameters,
  PanelUpdateEvent,
  Parameters,
} from "dockview-core";

import { useSyncDOMAttrs } from "./dom-attrs";
import { DockViewProps } from "./components";
import { dockviewEventNames } from "./events";

export const DockViewContext = createContext<ReturnType<typeof createDockViewContext>>();

export function createDockViewContext(props: DockViewProps) {
  const element = document.createElement("div");
  useSyncDOMAttrs(element, props);

  const dockview = new DockviewComponent({
    components: {
      default: DefaultPanel,
    },
    parentElement: element,
  });

  dockviewEventNames.forEach((eventName) => {
    createEffect(
      on(
        () => props[eventName],
        (listener: any) => {
          if (typeof listener !== "function") return;

          const disposable = dockview[eventName](listener);
          onCleanup(() => disposable.dispose());
        },
      ),
    );
  });

  return {
    element,
    dockview,
    props,
  };
}

class DefaultPanel implements IContentRenderer {
  private _element!: HTMLElement;

  get element(): HTMLElement {
    return this._element;
  }

  init(params: IGroupPanelInitParameters): void {
    this._element = params.params.contentElement;
  }

  update(event: PanelUpdateEvent<Parameters>): void {
    // this._element.textContent = event.params.title;
  }
}
