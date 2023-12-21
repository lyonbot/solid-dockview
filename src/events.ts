import { DockviewComponent } from "dockview-core";
import { Event } from "dockview-core/dist/cjs/events";

export const dockviewEventNames = [
  "onWillDragPanel",
  "onWillDragGroup",
  "onDidDrop",

  "onDidAddPanel",
  "onDidRemovePanel",
  "onDidActivePanelChange",

  "onDidAddGroup",
  "onDidRemoveGroup",
  "onDidActiveGroupChange",

  "onDidLayoutChange",
  "onDidLayoutFromJSON",
] as const;

export type DockviewEventName = (typeof dockviewEventNames)[number];
export type DockviewEventMap = { [ev in DockviewEventName]: DockviewComponent[ev] extends Event<infer T> ? T : any };
export type DockviewEventListeners = { [ev in DockviewEventName]: (ev: DockviewEventMap[ev]) => void };
