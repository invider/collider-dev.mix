
import { cache } from './cache.js'
import { markdownToHtml } from './markdown.js'
import { parentPath } from './util.js'

function metaTag(meta) {
    let res = `<div class="tag" onclick="location.href='#.${meta.path}';">`

    let path = parentPath(meta.path)
    if (meta.kind === 'page' || !path) path = ''

    res += `<div class="tagPath">${path}</div>`
        + `<div class="tagTitle">${meta.name}</div>`
        + `</div>`

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
    body += `<div class="metaTitle">${head}</div>` 
    body += '<hr>'

    const content = markdownToHtml(page.body)
    body += `${content}`
    body += '</div>'

    res.body = body
    return res
}

export function metaToHtml(meta) {
    const res = {}

    res.tag = metaTag(meta)

    let body = `<div id=".${meta.path}" class="meta">`

    const upPath = parentPath(meta.path)
    if (upPath) {
       body +=  `<div class="path">`
            + `<a href="#.${upPath}" class="pathLink">`
            + `${upPath}</a></div>`
    } else {
        //body += `<div class="path">${meta.path}</div>`
    }

    let title = ''
    if (meta.type === 'object' && meta.kind) {
        title += meta.kind + ' <b>' + meta.name + '</b>'
    } else if (meta.type === 'object' && meta.proto) {
        title += meta.proto + ' <b>' + meta.name + '</b>'
    } else if (meta.kind) {
        title += meta.kind + ' <b>' + meta.name + '</b>'
    } else {
        title += meta.type + ' <b>' + meta.name + '</b>'
    }

    let headClass = meta.data? 'metaTitle' : 'missingTitle'
    body += `<div class="${headClass}">${title}</div>`

    body += (meta.data && meta.data.head?
        `<div class="metaSubtitle">${meta.data.head}</div>` : '')

    if (meta.data && meta.data.usage) {
        body += `<hr><div class="metaSection">Usage</div>`
                + `<pre>${meta.data.usage}</pre>`
    }

    if (meta.data && meta.data.details) {
        const details = markdownToHtml(meta.data.details)
        body += `<hr><div class="metaSection">Details</div>${details}`
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
        const notes = markdownToHtml(meta.data.notes)
        body += `<hr><div class="metaSection">Notes</div>${notes}`
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
