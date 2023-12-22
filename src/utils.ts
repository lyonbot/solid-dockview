import { createEffect, createMemo, createSignal, on } from "solid-js";

type Diff<A, B> = Exclude<A, B> | Exclude<B, A>;

/**
 * nothing in JavaScript, just a TypeScript trick to ensure all keys of A are present
 *
 * @example const keys = strictKeys<PanelState>()(["panel", "context", "props", "isOpen"]);
 */
export const strictKeys =
  <A>() =>
  <T>(a: readonly (keyof T & keyof A)[]) =>
    a as unknown as Diff<keyof T, keyof A> extends never
      ? readonly (keyof T)[]
      : {
          miss: string & Exclude<keyof A, keyof T>;
        };

/**
 * behave like Vue's watch function, with `equals` checking
 */
export function watch<T>(
  expr: () => T,
  callback: (value: T, oldValue?: T) => void,
  defer?: boolean,
  equals?: (a: T, b: T) => boolean,
) {
  createEffect(on(createMemo(expr, undefined, { equals }), callback, { defer }));
}

/**
 * note: when execute, only newest args will be used
 */
export function keyedDebounce<U, T extends any[]>(fn: (key: U, ...args: T) => void) {
  const delay = 0;
  const pending = new Map<U, { timer: any; args: T }>();

  const outFn = (key: U, ...newArgs: T) => {
    const prev = pending.get(key);
    if (prev) {
      prev.args = newArgs;
    } else {
      const timer = setTimeout(() => {
        pending.delete(key);
        fn(key, ...t.args);
      }, delay);

      const t = { timer, args: newArgs };
      pending.set(key, t);
    }
  };
  outFn.cancel = (key: U) => {
    const prev = pending.get(key);
    if (!prev) return;

    clearTimeout(prev.timer);
    pending.delete(key);
  };
  return outFn;
}

export function withReactiveProps<T>(obj: T, keys: (keyof T)[]): T {
  keys.forEach((key) => {
    const [get, set] = createSignal(obj[key]);
    Object.defineProperty(obj, key, { get, set });
  });
  return obj;
}
