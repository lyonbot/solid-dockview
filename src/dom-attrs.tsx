import { JSX, createEffect, splitProps } from "solid-js";
import { assign as assignDomAttrs$1 } from "solid-js/web";

const domAttrs = ["class", "style", "classList"] as const;
export type HTMLDomAttrs = Pick<JSX.HTMLAttributes<HTMLElement>, (typeof domAttrs)[number]>;
export function useSyncDOMAttrs<T extends HTMLDomAttrs>(el: HTMLElement, sourceProps: T) {
  const [doms, rest] = splitProps(sourceProps, domAttrs);
  const assignDomAttrs = assignDomAttrs$1 as (
    element: HTMLElement,
    props: Record<string, any>,
    isSVG?: boolean,
    skipChildren?: boolean,
    prevProps?: Record<string, any>,
  ) => void;

  const prevProps = {} as any;
  createEffect(() => assignDomAttrs(el, doms, false, true, prevProps));

  return rest;
}
