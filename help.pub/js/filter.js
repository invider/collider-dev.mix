
import { cache } from './cache.js'

function flatResult(r) {
    return r.exact.concat( r.tag.concat( r.path.concat( r.misc)))
}

function match(meta, criteria, res) {

    if (meta.kind === 'page' && meta.path && criteria.match(meta.path)) {
        // dirty rule - intro page should always be first
        if (meta.path === 'intro') res.exact.unshift(meta)
        else res.exact.push(meta)
    
    } else if (meta.kind === 'page' && meta.body && criteria.match(meta.body)) {
        res.misc.push(meta)

    } else if (meta.name && criteria.match(meta.name)) {
        res.exact.push(meta)
    } else if (meta.tags && criteria.match(meta.tags)) {
        res.path.push(meta)
    } else if (meta.path && criteria.match(meta.path)) {
        res.path.push(meta)
    } else if (meta.details && criteria.match(meta.details)) {
        res.misc.push(meta)
    } else if (meta.notes && criteria.match(meta.notes)) {
        res.misc.push(meta)
    } else if (meta.type && criteria.match(meta.type)) {
        res.misc.push(meta)
    } else if (meta.kind && criteria.match(meta.kind)) {
        res.misc.push(meta)
    }
}

function filter(data, criteria) {
    const res = {
        exact: [],
        tag: [],
        path: [],
        misc: [],
    }

    function filterPages(dir) {
        // now processing flat without subfolders
        Object.values(dir).forEach(page => {

            match(page, criteria, res)
            /*
            if (criteria.match(page.path)) {
            }
            */
        })
    }

    function subfilter(meta) {
        if (!meta) return

        if (meta.kind === 'Frame' || meta.dir) {
            match(meta, criteria, res)

            Object.values(meta.dir).forEach(submeta => {
                subfilter(submeta)
            })

        } else if (meta.type === 'function') {
            match(meta, criteria, res)

        } else {
            /*
            console.dir(meta)
            console.log('ignoring ' + meta.name + ' - ' + meta.type
            + ' - ' + meta.link)
            */
        }
    }

    filterPages(data.pages)
    subfilter(data.scene)

    return flatResult(res)
}

function extractCriteria(searchString) {

    const criteria = {
        words: [],
        tags: [],

        match: function(str) {
            if (!str) return false
            str = str.trim().toLowerCase()

            for (const word of this.words) {
                if (str.includes(word)) return true
            }
            return false
        },

        matchTags: function(tags) {
            if (!tags) return false

            for (const tag of this.tags) {
                if (tags.includes(tag)) return true
            }
            return false
        },
    }

    searchString.trim().toLowerCase().split(' ').forEach(word => {
        if (word.startsWith('#')) {
            criteria.tags.push(word.substring(1))
        } else {
            criteria.words.push(word)
        }
    })
    return criteria
}

export function find(searchString) {
    let res
    if (cache.results[searchString]) {
        res = cache.results[searchString]
        //console.log('found in cache')
    } else {
        res = filter(cache.data, extractCriteria(searchString))

        res.search = searchString
        cache.results[searchString] = res
    }
    return res
}
