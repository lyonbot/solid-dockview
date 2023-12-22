import type { DockviewPanel } from "dockview-core";
import type { createDockViewContext } from "./context";
import type { DockPanelProps } from "./DockPanel";

export interface PanelState {
  panel: DockviewPanel;
  context: ReturnType<typeof createDockViewContext>;
  props: DockPanelProps;

  isOpen: boolean;
}

export const panelStateLUT = new WeakMap<DockviewPanel, PanelState>();

/**
 * Open a closed panel in current group
 *
 * @param panel
 */
export function openPanel(panel: DockviewPanel) {
  const state = panelStateLUT.get(panel);
  if (!state) return;

  const { dockview } = state.context;
  let activeGroup = dockview.activeGroup;
  if (!activeGroup) {
    // all panels are gone
    activeGroup = dockview.addGroup();
  }

  activeGroup.model.openPanel(panel);
}
