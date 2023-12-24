import {
  DockviewGroupPanel,
  IContentRenderer,
  IGroupPanelInitParameters,
  IHeaderActionsRenderer,
  ITabRenderer,
  IWatermarkRenderer,
  WatermarkRendererInitParameters,
} from "dockview-core";
import { PanelContentRendererParams } from "./context";
import { Accessor, JSXElement, createComponent, createMemo } from "solid-js";
import { Portal } from "solid-js/web";
import { DockViewProps } from "./DockView";
import { DockViewGroupHeaderComponentProps, DockViewWatermarkProps } from "./user-component";
import { withReactiveProps } from "./utils";

type AddExtraRender = (render: Accessor<JSXElement>) => () => void;

export function createWatermarkComponent(props: DockViewProps, addExtraRender: AddExtraRender) {
  return class WatermarkComponent implements IWatermarkRenderer {
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
    }

    dispose(): void {
      this._remove?.();
    }

    updateParentGroup(_group: DockviewGroupPanel, _visible: boolean): void {}
  };
}

export function createGroupHeaderComponent(
  props: DockViewProps,
  type: "leftHeaderActionsComponent" | "prefixHeaderActionsComponent" | "rightHeaderActionsComponent",
  addExtraRender: AddExtraRender,
): (group: DockviewGroupPanel) => IHeaderActionsRenderer {
  return (group) => {
    let remove!: () => void;
    const outerElement = document.createElement("div");
    outerElement.style.display = "contents";

    const renderer: IHeaderActionsRenderer = {
      element: outerElement,
      init(params) {
        remove = addExtraRender(() => {
          // setup reactivity

          const userProps: DockViewGroupHeaderComponentProps = {
            ...params,
            group,
            isGroupActive: group.api.isActive,
            activePanel: group.model.activePanel,
          };

          withReactiveProps(userProps, ["isGroupActive", "activePanel"]);
          params.api.onDidActiveChange(() => void (userProps.isGroupActive = group.api.isActive));
          group.model.onDidActivePanelChange(() => void (userProps.activePanel = group.model.activePanel));

          // prepare things
          const jsxEl = createMemo(() => {
            const comp = props[type];
            if (typeof comp !== "function") return null;
            return createComponent(comp, userProps);
          });

          return (
            <Portal
              mount={outerElement}
              ref={(div) => {
                div.style.display = "contents";
              }}
            >
              {jsxEl()}
            </Portal>
          );
        });
      },
      dispose() {
        remove();
      },
    };

    return renderer;
  };
}

export class PanelContentRenderer implements IContentRenderer {
  private _params!: PanelContentRendererParams;

  get element(): HTMLElement {
    return this._params.contentElement;
  }

  init(params: IGroupPanelInitParameters): void {
    this._params = params.params as PanelContentRendererParams;
  }
}

export class PanelTabRenderer implements ITabRenderer {
  private _params!: PanelContentRendererParams;

  get element(): HTMLElement {
    return this._params.tabElement;
  }

  init(params: IGroupPanelInitParameters): void {
    this._params = params.params as PanelContentRendererParams;
  }
}
