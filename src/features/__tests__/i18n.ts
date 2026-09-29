import { loadMessages } from '@/src/i18n/messages';
import type { Translate } from '@/src/i18n/types';

const idMessages = loadMessages('id');

function resolve(path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (node, segment) =>
        node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
      idMessages,
    );
}

function format(template: string, values?: Record<string, string | number | Date>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    values[name] !== undefined ? String(values[name]) : `{${name}}`,
  );
}

/** Build an id-locale translator scoped to a namespace, for pure helper tests. */
export function testTranslate(namespace: string): Translate {
  const prefix = `${namespace}.`;
  return (key, values) => {
    const value = resolve(`${prefix}${key}`);
    return format(typeof value === 'string' ? value : key, values);
  };
}
