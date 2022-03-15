class EasyMap<K> extends Map<K, unknown> {
    constructor(map: Map<K, unknown> = new Map()) {
        super(map);
    }
    entry<V>(prop: K) {
        return {
            __mapRef: this as Map<K, unknown>,
            or(val: V) {
                if (!this.__mapRef.has(prop)) {
                    this.__mapRef.set(prop, val);
                }
                return {
                    __superMapRef: this.__mapRef,
                    get val() : V {
                        return this.__superMapRef.get(prop) as V;
                    },
                    set val(v : V) {
                        this.__superMapRef.set(prop, v);
                    }
                }
            },
            set val(v : V) {
                this.__mapRef.set(prop, v);
            }
        }
    }
}

export { EasyMap };