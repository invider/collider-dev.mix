import { cache } from './cache.js'

import { parentPath } from './util.js'

function metaTag(meta) {
    let res = `<div class="tag" onclick="location.href='#.${meta.path}';">`

    let path = parentPath(meta.path)
    if (meta.kind === 'page' || !path) path = ''

    res += `<div class="tagPath">${path}</div>`
        + `<div class="tagTitle">${meta.name}</div>`
        + `<div>`

    return res
}

export function metaSummary(meta) {
    if (meta.link) {
        const linkMeta = cache.identify(meta.link)
        if (linkMeta) meta = linkMeta
        else meta.type = 'link'
    }

    const type = meta.kind? meta.kind : meta.type

    let res = `<a href="#.${meta.path}">`
        + type + ' <b>' + meta.name + '</b>'
        + (meta.data && meta.data.head? ' - ' + meta.data.head : '')
        + '</a>'
    return res
}

export function pageToHtml(page) {
    const res = {}

    /*
    res.tag = `<div class="tag"><a href="#.${page.path}">${page.title}</a></div>`
    */
    res.tag = metaTag(page)

    let body = `<div id=".${page.path}" class="meta">`
    
    const head = `${page.name}`
    body += `<div class="metaHead">${head}</div>` 
    body += '<hr>'
    body += `<pre>${page.body}</pre>`
    body += '</div>'
    cache.links[page.id] = page
    cache.links[page.path] = page

    res.body = body
    return res
}

export function metaToHtml(meta) {
    const res = {}

    res.tag = metaTag(meta)

    let body = `<div id=".${meta.path}" class="meta">`
    cache.links[meta.id] = meta
    cache.links[meta.path] = meta

    const upPath = parentPath(meta.path)
    if (upPath) {
       body +=  `<div class="path">`
            + `<a href="#.${upPath}" class="pathLink">`
            + `${upPath}</a></div>`
    } else {
        //body += `<div class="path">${meta.path}</div>`
    }

    let head = ''
    if (meta.type === 'object' && meta.kind) {
        head += meta.kind + ' <b>' + meta.name + '</b>'
    } else if (meta.type === 'object' && meta.proto) {
        head += meta.proto + ' <b>' + meta.name + '</b>'
    } else {
        head += meta.type + ' <b>' + meta.name + '</b>'
    }
    head += (meta.data && meta.data.head? ' - ' + meta.data.head : '')

    let headClass = meta.data? 'metaHead' : 'missingHead'
    body += `<div class="${headClass}">${head}</div>`

    if (meta.data && meta.data.usage) {
        body += `<hr><div class="metaSection">Usage</div>`
                + `<pre>${meta.data.usage}</pre>`
    }

    if (meta.data && meta.data.details) {
        body += `<hr><div class="metaSection">Details</div>`
                + `<pre>${meta.data.details}</pre>`
    }

    if (meta.dir) {
        const vals = Object.values(meta.dir)
        if (vals.length > 0) {
            body += '<hr>'
            vals.forEach(n => {
                body += '<li>' + metaSummary(n)
            })
        }
    }

    if (meta.data && meta.data.notes) {
        body += `<hr><div class="metaSection">Notes</div>`
                + `<pre>${meta.data.notes}</pre>`
    }

    body += '</div>'
    /*
    body =
    meta.path + '<br>'
        + meta.type + ' <b>' + meta.name + '</b>'
        + (meta.data? ' - ' + meta.data.head : ''))
    */

    res.body = body
    return res
}

export function toHtml(meta) {
    if (meta.kind === 'page') return pageToHtml(meta)
    else return metaToHtml(meta)
}

export function preformat() {
    cache.forEachMeta(meta => {
        if (meta.link) return
        meta.html = toHtml(meta)
    })
}
