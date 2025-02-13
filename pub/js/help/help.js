'use strict'

import { env } from './env.js'
import { toHtml, preformat } from './format.js'
import { cache } from './cache.js'
import { find } from './filter.js'
import { clear, render, wrapHtml, download, loadConfig, saveConfig } from './util.js'

const HELP_DATA_URL = '../help/data'

const FIELD = 'searchField'

const SEARCH_DELAY = 300
const PRINT_DELAY = 10

const DATA_MISSING = 'Missing help data!<br>'
                + 'Make sure jam is running '
                + 'in debug and dynamic mode:<br>'
                + '<pre><code>    jam -d</code></pre>'
                + 'and you have loaded project page after.'

const UNABLE_TO_PARSE_DATA = `Unable to parse help data!`

const themeData = [
    'default',      'Default',
    'solarized',    'Solarized',
    'eclipsed',      'Eclipsed',
    'dark',         'Dark',
    'dark-pixel',   'Dark Pixel',
]
const themes = themeData.filter((e, i) => i % 2 === 0)
const themeNames = themeData.filter((e, i) => i % 2 === 1)

var state = {}

function print(content) {
    const help = document.getElementById('help')
    help.innerHTML += content
}

function printTag(content) {
    const tags = document.getElementById('tags')
    tags.innerHTML += content
}

/*
function createLoadingLabel() {
    const loading = document.createElement('div')
    loading.id = 'loading'
    loading.innerHTML = 'Loading...'
    document.body.appendChild(loading)
}

function updateLoadingLabel(msg) {
    const loading = document.getElementById('loading')
    loading.innerHTML = msg
}

function removeLoadingLabel() {
    const loading = document.getElementById('loading')
    loading.remove()
}
*/

function printResults(res) {
    const field = document.getElementById(FIELD)
    const startTime = Date.now()

    if (res.html) {
        const help = document.getElementById('help')
        const tags = document.getElementById('tags')
        help.innerHTML = res.html
        tags.innerHTML = res.tags
        cache.links = res.links

    } else {
        cache.links = {}

        function cacheRendering() {
            const tags = document.getElementById('tags')
            const help = document.getElementById('help')
            res.tags = tags.innerHTML
            res.html = help.innerHTML
            res.links = cache.links
        }

        /*
        function printMore(i, index, body) {
            if (field.value !== res.search) {
                removeLoadingLabel()
                return // skip
            }

            if (i >= res.length) {
                cacheRendering()
                removeLoadingLabel()
                console.log('loaded ' + i + ' meta-objects')
                console.log('size: '
                    + Math.round(body.length/1000) + 'k')

            } else {
                const meta = res[i]
                //printTag(meta.html.tag)
                //print(meta.html.body)
                index += meta.html.tag
                body += meta.html.body
                render(index, body)
                cache.links[meta.path] = meta

                setTimeout(() => printMore(i+1, index, body), PRINT_DELAY)

                const elapsed = Math.ceil((Date.now() - startTime)/1000)
                updateLoadingLabel(`Loading ${i} [${elapsed}s]`)
            }
        }

        createLoadingLabel()
        printMore(0, '', '')
        */

        // compile result array (for index and body)
        const tags = []
        const bodies = []
        const N = res.length
        for (let i = 0; i < N; i++) {
            const meta = res[i]
            tags.push(meta.html.tag)
            bodies.push(meta.html.body)
            cache.links[meta.path] = meta
        }
        render(tags.join(''), bodies.join(''))
        cacheRendering()

        //res.forEach(meta => { })

    }
    //printTag(`<b>Total Results: ${res.length}</b>`)
}

function open(locator) {
    const meta = cache.index[locator]
    if (!meta) return

    const res = [ meta ]
    res.search = locator
    const field = document.getElementById(FIELD).value = locator

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

}

function scheduleSearch(string) {

    setTimeout(() => {
        const field = document.getElementById(FIELD)
        if (field.value === string) search(string)
    }, SEARCH_DELAY)
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
    print(`<div class='message'>${msg}</div>`)
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
        showError(UNABLE_TO_PARSE_DATA)
        throw err
    })
}

function boot() {
    if (loadConfig()) applyConfig()
}

function setup() {
    const field = document.getElementById(FIELD)

    field.onkeyup = function(e) {
        if (e.code === 'Enter') {
            setSearch(field.value)
            field.blur()
            //field.value = ''
        } else {
            //search(field.value)
            scheduleSearch(field.value)
        }
    }

    if (!location.hash.startsWith('#.')) {
        field.value = decodeURI(location.hash.substring(1))
    }

    loadMeta()
    normalSplit()
}

function scrollTo(elementId) {
    console.log('scrolling to [' + elementId + ']')
    const el = document.getElementById('.' + elementId)
    if (el) {
        el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
        })
    }
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
        // sync to #.sectionId
        const link = location.hash.substring(2)

        if (!cache.links) {
            // nothing is printed - just open
            const meta = open(link)

        } else if (!cache.links[link]) {
            // looks like the object is not printed
            // need to search and show it by id
            const meta = open(link)
        } else {
            scrollTo(link)
        }
    }
}

function normalSplit() {
    Split(['#tagsPanel', '#rightPanel'], {
        sizes: [27, 73],
        minSize: [150, 300],
        direction: 'horizontal',
        gutterAlign: 'center',
    })
}

function hiddenPanelSplit() {
    /*
    Split(['#rightPanel'], {
        sizes: [100],
        direction: 'horizontal',
        gutterAlign: 'center',
    })
    */
    const p = document.getElementById('rightPanel')
    const h = document.getElementById('help')
    p.style.float = 'center'
    p.style.overflow = 'visible'
    p.style.margin = 0
    p.style.width = '99%'
    p.style.border = '1px solid blue'

    h.style.float = 'center'
    h.style.width = '100%'
    h.style.margin = 0
    h.style.border = '1px solid red'
}

function togglePanel() {
    let e = document.getElementById('tagsPanel')
    if (e.style.display === "none") {
        e.style.display = "block"
        normalSplit()
    } else {
        e.style.display = "none"
        hiddenPanelSplit()
    }
}

function switchTheme(itheme, noSave) {
    if (itheme === undefined) {
        itheme = (env.config.itheme || 0) + 1
        if (itheme >= themes.length) itheme = 0
    } else {
        if (!Number.isInteger(itheme) || itheme < 0 || itheme >= themes.length) {
            throw `Wrong theme index: ${itheme}`
        }
    }

    const themeId = themes[itheme]
    const themeName = themeNames[itheme]
    console.log(`mood: @${themeId} - [${themeName}]`)
    document.documentElement.setAttribute('data-theme', themes[itheme])

    env.config.itheme = itheme
    if (!noSave) saveConfig()
}

function applyConfig() {
    switchTheme(env.config.itheme, true)
}

window.onload = setup

window.onhashchange = syncHash 

window.onkeydown = function(e) {
    if (e.repeat) return

    const field = document.getElementById(FIELD)

    if (e.ctrlKey) {
        switch(e.code) {
            case 'KeyM':
                switchTheme()
                break
        }

    } else {
        switch(e.code) {
            case 'Escape':

                if (document.activeElement === field) {
                    field.value = ''
                    setSearch('')
                } else {
                    field.focus()
                }
                break

            case 'F2':
                let name = help
                if (field.value !== '') name = field.value

                download( wrapHtml(help.innerHTML), name + '.html')
                break

            case 'F9':
                // TODO fix layout switching
                togglePanel()
                break
        }
    }
}

boot()
