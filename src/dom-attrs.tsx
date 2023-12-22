import { JSX, createEffect, splitProps } from "solid-js";
import { assign as assignDomAttrs$1 } from "solid-js/web";

export type HTMLDomAttrs = JSX.HTMLAttributes<HTMLElement>;
export function useSyncDOMAttrs(el: HTMLElement, props: any, excludeKeys: readonly string[]) {
  const [, doms] = splitProps(props, excludeKeys);
  const assignDomAttrs = assignDomAttrs$1 as (
    element: HTMLElement,
    props: Record<string, any>,
    isSVG?: boolean,
    skipChildren?: boolean,
    prevProps?: Record<string, any>,
  ) => void;

  const prevProps = {} as any;
  createEffect(() => assignDomAttrs(el, doms, false, true, prevProps));
}
