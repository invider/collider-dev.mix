


export const cache = {

    data: {},
    index: {},
    results: {},
    links: {},

    identify: function(id) {
        if (this.index) return this.index[id]
    },

    buildIndex: function index(meta) {
        if (!meta) return
        if (meta.link) return
        if (this.index[meta.id]) return

        this.index[meta.id] = meta
        if (meta.path) this.index[meta.path] = meta

        const cache = this
        if (meta.dir) Object.values(meta.dir).forEach(submeta => {
            cache.buildIndex(submeta)
        })
    },

    updateData: function(data) {
        this.data = data
        this.index = {}
        this.results = {}
        this.buildIndex(data.scene)

        Object.values(data.pages).forEach(p => cache.buildIndex(p))
    },

    forEachMeta: function(fn) {

        function apply(meta, fn) {
            if (!meta) return

            fn(meta)

            if (meta.dir) Object.values(meta.dir).forEach(submeta => {
                apply(submeta, fn)
            })
        }

        if (this.data.scene) {
            apply(this.data.scene, fn)
        }
        if (this.data.pages) {
            Object.values(this.data.pages).forEach(p => apply(p, fn))
        }
    },
}
