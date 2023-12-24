import { JSXElement, ParentProps, createEffect, createMemo, onCleanup, useContext } from "solid-js";
import { DockViewContext, PanelContentRendererParams } from "./context";
import { Portal } from "solid-js/web";
import { AddPanelOptions, AddPanelPositionOptions, DockviewComponent, DockviewPanel } from "dockview-core";
import { createCloseButton } from "dockview-core/dist/esm/svg";
import { panelStateLUT, PanelState } from "./global-api";
import { watch, withReactiveProps } from "./utils";

export type DockPanelEvent<T> = {
  panel: DockviewPanel;
  dockview: DockviewComponent;
} & T;

export type DockPanelProps = ParentProps<{
  /** Optional, once set, cannot change! */
  id?: string;
  title: string | JSXElement;

  /** custom class name for content wrapper. default: "solid-dockview-panel-content" */
  class?: string;

  /** custom class name for content wrapper. default: "default-tab" */
  tabClass?: string;

  /** set to false to hide closing button */
  closeable?: boolean;

  /** one or more buttons before "close button", typically is `<div class="tab-action"> ... </div>` */
  actions?: JSXElement | JSXElement[];

  floating?: AddPanelOptions["floating"];
  position?: AddPanelPositionOptions;

  onCreate?: (event: DockPanelEvent<{}>) => void;
  onOpen?: (event: DockPanelEvent<{}>) => void;
  onClose?: (event: DockPanelEvent<{}>) => void;
  onDispose?: (event: DockPanelEvent<{}>) => void;
  onVisibilityChange?: (event: DockPanelEvent<{ visible: boolean }>) => void;
}>;

let anonymousCounter = 0;

export function DockPanel(props: DockPanelProps) {
  const context = useContext(DockViewContext)!;
  const dockview = context.dockview;

  const contentPlaceholder = document.createElement("div");
  const tabPlaceholder = document.createElement("div");

  contentPlaceholder.style.display = "contents";
  tabPlaceholder.style.display = "contents";

  const panel = context.dockview.addPanel({
    id: props.id || `anonymous-${anonymousCounter++}`,
    component: "default",
    tabComponent: "default",
    title: String(props.title),
    position: props.position,
    floating: props.floating as any,
    params: {
      contentElement: contentPlaceholder,
      tabElement: tabPlaceholder,
      props,
    } satisfies PanelContentRendererParams,
  });

  // for global api
  const panelState = withReactiveProps<PanelState>(
    {
      context,
      panel,
      props,

      isOpen: true,
    },
    ["isOpen"],
  );
  panelStateLUT.set(panel, panelState);

  setupEvents(panelState);
  const tab = setupTab(props, panel, tabPlaceholder);

  props.onCreate?.({ panel, dockview });
  onCleanup(() => {
    props.onDispose?.({ panel, dockview });
    context.dockview.removePanel(panel);
  });

  return (
    <Portal
      mount={contentPlaceholder}
      ref={(div) => {
        const className = createMemo(() => props.class || "solid-dockview-panel-content");
        createEffect(() => (div.className = className()));
      }}
    >
      {tab()}
      {props.children}
    </Portal>
  );
}

function setupEvents(panelState: PanelState) {
  const { panel, context, props } = panelState;
  const { dockview } = context;

  createEffect(() => {
    const callback = props.onVisibilityChange;
    if (typeof callback !== "function") return;

    const disposable = panel.api.onDidVisibilityChange((visible) => {
      callback({ visible: visible.isVisible, panel, dockview });
    });
    onCleanup(() => disposable.dispose());
  });

  // event of panel open/close
  watch(
    () => !!panelState.isOpen,
    (isOpen) => {
      if (isOpen) props.onOpen?.({ panel, dockview });
      else props.onClose?.({ panel, dockview });
    },
  );
}

function setupTab(props: DockPanelProps, panel: DockviewPanel, placeholder: HTMLElement) {
  const closeButton = createCloseButton();

  const computedTitle = createMemo(() => props.title);
  watch(computedTitle, (title) => {
    if (title instanceof HTMLElement) {
      const sync = () => panel.setTitle(title.textContent?.trim() || "");
      const observer = new MutationObserver(sync);
      observer.observe(title, { childList: true, subtree: true, characterData: true });
      onCleanup(() => observer.disconnect());
      sync();
    } else {
      panel.setTitle(String(title));
    }
  });

  const className = createMemo(() => props.tabClass || "default-tab");
  return createMemo(() => (
    <Portal
      mount={placeholder}
      ref={(div) => {
        createEffect(() => (div.className = className()));
      }}
    >
      {/* <div class="default-tab"> */}
      <div class="tab-content">{computedTitle()}</div>
      <div class="action-container" onMouseDown={(e) => e.preventDefault()}>
        <ul class="tab-list">
          {props.actions}
          {!!(props.closeable ?? true) && (
            <div
              class="tab-action"
              onClick={(e) => {
                panel.api.close();
                e.preventDefault();
              }}
            >
              {closeButton}
            </div>
          )}
        </ul>
      </div>
      {/* </div> */}
    </Portal>
  ));
}
