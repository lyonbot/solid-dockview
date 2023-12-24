import {
  Accessor,
  JSXElement,
  createComponent,
  createContext,
  createSignal,
  getOwner,
  onCleanup,
  runWithOwner,
} from "solid-js";
import {
  DockviewComponent,
  DockviewGroupPanel,
  DockviewPanel,
  IContentRenderer,
  IGroupPanelInitParameters,
  ITabRenderer,
  IWatermarkRenderer,
  WatermarkRendererInitParameters,
} from "dockview-core";

import { useSyncDOMAttrs } from "./dom-attrs";
import { dockviewEventNames } from "./events";
import type { DockPanelProps, DockViewProps } from "./index";
import { keyedDebounce, watch } from "./utils";
import { panelStateLUT } from "./global-api";
import { dockViewPropKeys } from "./DockView";
import { Portal } from "solid-js/web";

export const DockViewContext = createContext<ReturnType<typeof createDockViewContext>>();

export interface DockViewWatermarkProps extends WatermarkRendererInitParameters {
  /** if this watermark places in an empty group, close it. */
  close(): void;
}

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

  const owner = getOwner();
  const dockview = new DockviewComponent({
    parentElement: element,
    components: {
      default: PanelContentRenderer,
    },
    tabComponents: {
      default: PanelTabRenderer,
    },
    watermarkComponent: class WatermarkComponent implements IWatermarkRenderer {
      _element!: HTMLElement;
      _remove?: () => void;

      get element() {
        return this._element;
      }

      init(params: WatermarkRendererInitParameters): void {
        const outerElement = document.createElement("div");
        outerElement.style.display = "contents";
        this._element = outerElement;

        const watermarkProps: DockViewWatermarkProps = {
          ...params,
          close() {
            if (params.group) {
              params.containerApi.removeGroup(params.group);
            }
          },
        };

        runWithOwner(owner, () => {
          // must be a render function, or <DockView> will not correctly handle user's watermark component's lifecycle
          // (maybe the signal containing <Portal>, must be created and initialized at the moment that <For> renders a new item?)
          const jsxRender = () => (
            <Portal
              mount={outerElement}
              ref={(div) => {
                div.style.display = "contents";
              }}
            >
              {!!props.watermarkComponent && createComponent(props.watermarkComponent, watermarkProps)}
            </Portal>
          );

          const dispose = addExtraRender(jsxRender);
          this._remove = dispose;
        });
      }

      dispose(): void {
        this._remove?.();
      }

      updateParentGroup(_group: DockviewGroupPanel, _visible: boolean): void {
        // noop yet
      }
    },
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
    extraRenders,
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
}

class PanelTabRenderer implements ITabRenderer {
  private _params!: PanelContentRendererParams;

  get element(): HTMLElement {
    return this._params.tabElement;
  }

  init(params: IGroupPanelInitParameters): void {
    this._params = params.params as PanelContentRendererParams;
  }
}
