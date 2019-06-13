'use strict'

const STORAGE = 'explorer-state'

function extractState(e) {
    return {
        x: e.x,
        y: e.y,
        w: e.w,
        h: e.h,
        path: e.lastPath,
    }
}

function restoreExplorer(st) {
    const target = _$.selectOne(st.path)
    if (!target) target = _$
    const explorer = lab.hud.spawn('hud/gadget/Explorer', {
        x: st.x,
        y: st.y,
        w: st.w,
        h: st.h,
    })
    explorer.open(target)
}

function loadState() {
    let state
    const rawState = window.localStorage.getItem(STORAGE)

    if (rawState) {
        state = JSON.parse(rawState)
        if (state && state.length > 0) {
            state.forEach(st => restoreExplorer(st))
        }
    }
}

module.exports = function setup() {
    _.hidden = true

    const hud = lab.spawn('hud/Hud', {
        name: 'hud',
        molden: true,
    })

    const exploreButton = lab.hud.spawn('hud/gadget/Button', {
        x: 20,
        y: 20,
        w: 120,
        h: 40,
        text: 'Explore',

        onClick: function() {
            trap('explore')
        }
    })

    const pinButton = lab.hud.spawn('hud/gadget/Button', {
        x: 160,
        y: 20,
        w: 120,
        h: 40,
        text: 'Pin',

        onClick: function() {
            const state = lab.hud._ls
                .filter(e => e instanceof _$.dna.hud.gadget.Explorer)
                .map(e => extractState(e))

            log.dump(state)
            window.localStorage.setItem(STORAGE, JSON.stringify(state))
        }
    })

    loadState()
}

