
import { cache } from './cache.js'
import { md2html } from './markdown.js'
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

    let type = meta.kind? meta.kind : meta.type
    if (type === 'function' && meta.inherited) {
        type = 'inherited function'
    }

    let usage = ''
    if (meta.type === 'function') {
        usage = (meta.data && meta.data.usage)? `${meta.data.usage}` : '()'
    }

    const head = (meta.data && meta.data.head)?
                ' - ' + md2html(meta.data.head, true) : ''

    let res = `<a href="#.${meta.path}">`
        + type + ' <b>' + meta.name + usage + '</b></a>'
        + head
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

    const content = md2html(page.body)
    body += `${content}`
    body += '</div>'

    res.body = body
    return res
}

export function metaToHtml(meta) {
    const res = {}

    res.tag = metaTag(meta)

    let body = `<div id=".${meta.path}" class="meta">`

    // format parent path
    const upPath = parentPath(meta.path)
    if (upPath) {
       body +=  `<div class="path">`
            + `<a href="#.${upPath}" class="pathLink">`
            + `${upPath}</a></div>`
    } else {
        //body += `<div class="path">${meta.path}</div>`
    }

    // format the title
    let usage = ''
    if (meta.type === 'function') {
        usage = (meta.data && meta.data.usage)? `${meta.data.usage}` : '()'
    }

    let title = ''
    if (meta.type === 'object' && meta.kind) {
        title += meta.kind + ' <b>' + meta.name + '</b>'
    } else if (meta.type === 'object' && meta.proto) {
        title += meta.proto + ' <b>' + meta.name + '</b>'
    } else if (meta.kind) {
        title += meta.kind + ' <b>' + meta.name + usage + '</b>'
    } else {
        title += meta.type + ' <b>' + meta.name + usage + '</b>'
    }

    let headClass = meta.data? 'metaTitle' : 'missingTitle'
    body += `<div class="${headClass}">${title}</div>`

    if (meta.data && meta.data.at) {
        // format tags
        meta.data.at.forEach(at => {
            let nextTag
            if (at.id === 'param') {
                nextTag = at.name
                if (at.type) nextTag += ': ' + at.type
                if (at.line) nextTag += ' - ' + at.line
            } else if (at.id === 'returns') {
                nextTag = 'returns'
                if (at.type) nextTag += ' ' + at.type
                if (at.line) nextTag += ' - ' + at.line
            }
            if (nextTag) {
                body += `<div class="metaAt">${nextTag}</div>`
            }
        })
    }

    const subtitle = (meta.data && meta.data.head)?
                            md2html(meta.data.head) : ''
    body += `<div class="metaSubtitle">${subtitle}</div>`


    if (meta.data && meta.data.details) {
        const details = md2html(meta.data.details)
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
    if (meta.idir) {
        body += '<h4>Inherited</h4>'
        const vals = Object.values(meta.idir)
        if (vals.length > 0) {
            vals.forEach(n => {
                body += '<li>' + metaSummary(n)
            })
        }
    }

    if (meta.data && meta.data.notes) {
        const notes = md2html(meta.data.notes)
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
