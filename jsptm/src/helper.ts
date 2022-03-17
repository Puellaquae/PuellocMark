function easyMap<K>(map: Map<K, unknown> = new Map()) {
    return {
        map,
        get: (key: K) => map.get(key),
        set: (key: K, value: unknown) => map.set(key, value),
        has: (key: K) => map.has(key),
        forEach: (callbackfn: (value: unknown, key: K, map: Map<K, unknown>) => void, thisArg?: any) => map.forEach(callbackfn, thisArg),
        values: () => map.values(),
        keys: () => map.keys(),
        entries: () => map.entries(),
        size: () => map.size,
        clear: () => map.clear(),
        delete: (key: K) => map.delete(key),
        entry<V>(prop: K) {
            return {
                __mapRef: this.map as Map<K, unknown>,
                or(val: V) {
                    if (!this.__mapRef.has(prop)) {
                        this.__mapRef.set(prop, val);
                    }
                    return {
                        __superMapRef: this.__mapRef,
                        get val(): V {
                            return this.__superMapRef.get(prop) as V;
                        },
                        set val(v: V) {
                            this.__superMapRef.set(prop, v);
                        }
                    }
                },
                set val(v: V) {
                    this.__mapRef.set(prop, v);
                }
            }
        }
    }
}

export { easyMap };