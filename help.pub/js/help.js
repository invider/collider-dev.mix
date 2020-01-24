'use strict'

import { toHtml, preformat } from './format.js'
import { cache } from './cache.js'
import { find } from './filter.js'
import { clear } from './util.js'

const HELP_DATA_URL = '../help/data'

const FIELD = 'searchField'

const DATA_MISSING = 'Missing help data!<br>'
                + 'Make sure jam is running '
                + 'in debug and dynamic mode:<br>'
                + '<pre><code>    jam -d</code></pre>'
                + 'and you have loaded project page after.'

let gfield

var state = {}

function print(content) {
    const help = document.getElementById('help')
    help.innerHTML += '<p>' + content + '</p>'
}

function printTag(content) {
    const tags = document.getElementById('tags')
    tags.innerHTML += content
}

function printResults(res) {

    if (res.html) {
        const help = document.getElementById('help')
        const tags = document.getElementById('tags')
        help.innerHTML = res.html
        tags.innerHTML = res.tags
        cache.links = res.links

    } else {
        cache.links = {}

        res.forEach(meta => {
            printTag(meta.html.tag)
            print(meta.html.body)
            cache.links[meta.path] = true
            /*
            const out = toHtml(meta)
            printTag(out.tag)
            print(out.body)
            */
        })

        // buffer the rendering
        const tags = document.getElementById('tags')
        const help = document.getElementById('help')
        res.tags = tags.innerHTML
        res.html = help.innerHTML
        res.links = cache.links
    }

    //printTag(`<b>Total Results: ${res.length}</b>`)
}

function open(locator) {
    const meta = cache.index[locator]
    if (!meta) return

    const res = [ meta ]
    clear()
    printResults(res)

    state.result = res
    state.searchString = '#.' + locator
    cache.results[state.searchString] = res

    return meta
}

function search(string) {
    if (state.searchString === string) return

    clear()

    const res = find(string)
    printResults(res)
    state.result = res
    state.searchString = string

    cache.results[string] = res
}

function setSearch(string) {
    location.hash = encodeURI(string)
}

function update(data) {
    // TODO make meta processing more generic with recursive tree
    cache.updateData(data)
    preformat()
    //search('')
    syncHash()
}

function showError(msg) {
    clear()
    print(`<h3>${msg}</h3>`)
}

function loadMeta() {

    fetch(HELP_DATA_URL).then(res => {
        if (res.status !== 200) return
        return res.json()
    }).then(json => {
        if (json) {
            update(json)
        } else {
            // TODO handle various errors with proper messages
            showError(DATA_MISSING)
        }
    }).catch(err => {
        console.dir(err)
        showError(DATA_MISSING)
    })
}

function setup() {
    const field = document.getElementById(FIELD)

    field.onkeyup = function(e) {
        if (e.code === 'Enter') {
            setSearch(field.value)
            field.blur()
            //field.value = ''
        } else {
            search(field.value)
        }
    }

    if (!location.hash.startsWith('#.')) {
        field.value = decodeURI(location.hash.substring(1))
    }

    loadMeta()
}


function syncHash() {
    if (!cache.data) {
        // no metadata yet
        setTimeout(syncHash, 100)
        return
    }

    if (!location.hash.startsWith('#.')) {
        const searchString = decodeURI(location.hash.substring(1))

        if (searchString !== cache.searchString) {
            search(searchString)
        }

    } else {
        const link = location.hash.substring(2)

        if (!cache.links) {
            // nothing is printed - just open
            const meta = open(link)
            return
        }

        if (!cache.links[link]) {
            // looks like the object is not printed
            // need to search and show it by id
            const meta = open(link)
        }
    }
}

window.onload = setup

window.onhashchange = syncHash 

window.onkeydown = function(e) {
    if (e.repeat) return

    if (e.code === 'Escape') {

        const field = document.getElementById(FIELD)

        if (document.activeElement === field) {
            field.value = ''
            setSearch('')
        } else {
            field.focus()
        }
    }
}
