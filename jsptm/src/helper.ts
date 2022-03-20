function easyMap<M>(map: Map<string, unknown> = new Map()) {
    type Filter<T, U> = T extends U ? T : never;
    type Keys = Filter<keyof M, string>;
    return {
        map,
        get<K extends Keys, V = M[K]>(key: K): V { return map.get(key) as V },
        set<K extends Keys, V = M[K]>(key: K, value: V) { map.set(key, value) },
        has: (key: string) => map.has(key),
        forEach: (callbackfn: (value: unknown, key: string, map: Map<string, unknown>) => void, thisArg?: any) => map.forEach(callbackfn, thisArg),
        values: () => map.values(),
        keys: () => map.keys(),
        entries: () => map.entries(),
        size: () => map.size,
        clear: () => map.clear(),
        delete<K extends Keys>(key: K) { map.delete(key) },
        entry<K extends Keys, V = M[K]>(prop: K) {
            return {
                __mapRef: this.map as Map<string, unknown>,
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