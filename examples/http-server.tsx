import type { Join, PartialTuple } from './types';

/**
 * A safe, typed, enumerable bidirectional map that ensures unique values and supports
 * compound keys.
 *
 * @template K - A tuple representing the structure of the compound key, composed of
 *   strings or numbers.
 * @template V - The type of the values stored in the map. Defaults to `string`.
 * @template S - The type of the separator string used to join keys. Defaults to `' '`.
 */
export class UbiMap<
  K extends (string | number)[],
  V extends string | number = string,
  const S extends string = ' '
> {
  /** Internal map for storing keys mapped to values. */
  private kmap: Record<Join<K, S>, V> = Object.create(null);

  /** Internal map for storing values mapped to keys. */
  private vmap: Record<V, Join<K, S>> = Object.create(null);

  /**
   * Creates a new instance of `UbiMap`.
   *
   * @param data - An optional initial dataset for the map, where keys are joined strings
   *   and values are of type `V`.
   * @param separator - The string used to separate components of compound keys. Defaults
   *   to `' '`.
   */
  constructor(
    data?: Record<Join<K, S>, V>,
    private readonly separator: S = ' ' as S
  ) {
    if (data) {
      for (const [key, value] of Object.entries<V>(data)) {
        this.set(key as Join<K, S>, value);
      }
    }
  }

  /**
   * Adds a new key-value pair to the map. Both keys and values must be unique.
   *
   * @example
   *
   * ```ts
   * const ubimap = new UbiMap<[string, string]>();
   *
   * // Keys as separate arguments
   * ubimap.set('key1', 'key2', 'value');
   *
   * // Key in a single string
   * ubimap.set('key1 key2', 'value');
   * ```
   *
   * @param input - A tuple containing the components of the key followed by the value.
   * @throws Will throw an error if the key or value already exists in the map.
   */
  set(...input: [...keys: K | [Join<K, S>], value: V]): void {
    const value = input.pop() as V;
    const keys = input.join(this.separator) as Join<K, S>;

    if (this.kmap[keys]) {
      throw new Error(`Key ${keys} already exists in map`);
    }

    if (this.vmap[value]) {
      throw new Error(`Value ${value} already exists in map`);
    }

    this.kmap[keys] = value;
    this.vmap[value] = keys;
  }

  /**
   * Removes a key-value pair from the map.
   *
   * This method uses `delete` under the hood since this map was designed be a fast access
   * map and not a volatile one.
   *
   * @param key - The components of the compound key.
   * @returns A boolean indicating whether the key was removed.
   */
  remove(...key: K | [Join<K, S>]): boolean {
    const keys = key.join(this.separator) as Join<K, S>;

    if (!this.kmap[keys]) {
      return false;
    }

    return delete this.vmap[this.kmap[keys]] && delete this.kmap[keys];
  }

  /**
   * Retrieves the value associated with a compound key.
   *
   * ```ts
   * const ubimap = new UbiMap<[string, string]>();
   *
   * // Keys as separate arguments
   * ubimap.get('key1', 'key2');
   *
   * // Key in a single string
   * ubimap.set('key1 key2');
   * ```
   *
   * @param key - The components of the compound key.
   * @returns The value associated with the key.
   */
  get(...key: K | [Join<K, S>]): V {
    return this.kmap[key.join(this.separator) as Join<K, S>];
  }

  /**
   * Retrieves the compound key associated with a value.
   *
   * @example
   *
   * ```ts
   * const ubimap = new UbiMap<[string, string]>();
   *
   * ubimap.set('a', 'b', 'value');
   *
   * console.log(ubimap.getKey('value')); // 'a b'
   * ```
   *
   * @param value - The value to look up.
   * @returns The joined key corresponding to the value, or `undefined` if the value does
   *   not exist.
   */
  getKey(value: V): Join<K, S> | undefined {
    return this.vmap[value];
  }

  /**
   * Lists all keys in the map that start with the specified prefixes.
   *
   * @example
   *
   * ```ts
   * const ubimap = new UbiMap<[string, string]>();
   *
   * ubimap.set('a', 'b', 'value1');
   * ubimap.set('a', 'c', 'value2');
   * ubimap.set('b', 'c', 'value3');
   *
   * console.log(ubimap.keys('a')); // ['a b', 'a c']
   * ```
   *
   * @param prefixes - A partial tuple representing the key prefix to filter by.
   * @returns An array of keys matching the prefix.
   */
  keys<P extends PartialTuple<K>>(...prefixes: P): Extract<Join<K, S>, Join<P, S>>[] {
    const prefix = prefixes.join(this.separator);

    return Object.keys(this.kmap).filter((key) => key.startsWith(prefix)) as Extract<
      Join<K, S>,
      Join<P, S>
    >[];
  }

  /**
   * Lists all values in the map whose associated keys start with the specified prefixes.
   *
   * @example
   *
   * ```ts
   * const ubimap = new UbiMap<[string, string]>();
   *
   * ubimap.set('a', 'b', 'value1');
   * ubimap.set('a', 'c', 'value2');
   * ubimap.set('b', 'c', 'value3');
   *
   * console.log(ubimap.values('a')); // ['value1', 'value2']
   * console.log(ubimap.values()); // ['value1', 'value2', 'value3']
   * ```
   *
   * @param prefixes - A partial tuple representing the key prefix to filter by.
   * @returns An array of values corresponding to the matching keys.
   */
  values(...prefixes: PartialTuple<K>): V[] {
    const prefix = prefixes.join(this.separator);
    return Object.keys(this.vmap).filter((value) => value.startsWith(prefix)) as V[];
  }

  /** Iterates over all key-value pairs in the map. */
  *[Symbol.iterator]() {
    for (const key in this.kmap) {
      yield [key, this.kmap[key as Join<K, S>]];
    }
  }
}
