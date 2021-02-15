
// paneled nodes explorer

// @depends(dna/hud/Container
const Container = $.dna.hud.Container 

const explorerDefaults = {
    disabled: true,
    closable: false,
    resizable: false,
    movable: false,
}

function Inspector(st) {
    this.name = 'inspector'
    this.layoutMode = 0
    this.panelMode = 3
    this.panel = []

    Container.call(this, st)
}
Inspector.prototype = Object.create(Container.prototype)

Inspector.prototype.init = function() {
    const def = augment({}, explorerDefaults)

    const inspector = this
    def.hud = this.__
    def.onStateChange = function() {
        inspector.sync()
    }

    this.panel.push(this.spawn('hud/gadget/NodeInspector', augment({
        name: 'previous'
    }, def)))
    this.panel.push(this.spawn('hud/gadget/NodeInspector', augment({
        name: 'current'
    }, def)))
    this.panel.push(this.spawn('hud/gadget/NodeInspector', augment({
        name: 'selected'
    }, def)))
    this.panel.push(this.spawn('hud/gadget/NodeInspector', augment({
        name: 'target'
    }, def)))

    for (const p of this.panel) {
        p.onMove = function() {
            inspector.sync()
        }
    }

    this.panel[1].disabled = false
    this.adjust()
    this.sync()
}

Inspector.prototype.show = function() {
    this.disabled = false
    lab.hud.captureFocus(lab.hud.inspector)
    lab.hud.captureFocus(lab.hud.inspector.panel[1])
    lab.hud.captureFocus(lab.hud.inspector.panel[1].active)
}

Inspector.prototype.hide = function() {
    this.disabled = true
    lab.hud.releaseFocus(lab.hud.inspector)
    lab.hud.releaseFocus(lab.hud.inspector.panel[1])
    lab.hud.releaseFocus(lab.hud.inspector.panel[1].active)
}

Inspector.prototype.switchLayout = function(mode) {
    this.layoutMode = mode
    this.adjust()
}

Inspector.prototype.switchPanelMode = function(shift) {
    let mode = this.panelMode + shift
    if (mode < 0) {
        mode = 0
        if (this.layoutMode === 0) this.switchLayout(1)
    }
    if (mode > 3) {
        mode = 3
        if (this.layoutMode === 1) this.switchLayout(0)
    }
    if (this.panelMode !== mode) {
        this.panelMode = mode
        this.adjust()
    }
}

Inspector.prototype.sync = function() {
    const dir = this.panel[1].getDir()
    const node = this.panel[1].selectedNode()

    if (dir && dir.__) {
        this.panel[0].open(dir.__)
        this.panel[0].select(dir)

    } else {
        this.panel[0].open()
    }

    if (node) this.panel[2].open(node)
    else this.panel[2].open()
}

Inspector.prototype.adjust = function() {
    // adjust dimensions according to layout
    let h = ry(.5)
    let w = rx(1)
    switch(this.layoutMode) {
        case 1:
            h = ry(1)
            break
    }
    this.w = w
    this.h = h

    // place and adjust panels
    let n = this.panel.length
    if (n < 4) return

    switch(this.panelMode) {
        case 0:
            this.panel[0].hidden = true
            this.panel[1].hidden = false
            this.panel[2].hidden = true
            this.panel[3].hidden = true
            n = 1
            break
        case 1:
            this.panel[0].hidden = true
            this.panel[1].hidden = false
            this.panel[2].hidden = false
            this.panel[3].hidden = true
            n = 2
            break
        case 2:
            this.panel[0].hidden = false
            this.panel[1].hidden = false
            this.panel[2].hidden = false
            this.panel[3].hidden = true
            n = 3
            break
        case 3:
            this.panel[0].hidden = false
            this.panel[1].hidden = false
            this.panel[2].hidden = false
            this.panel[3].hidden = false
            break
    }
    const cw = rx(1)/n

    let x = 0
    this.panel.forEach(p => {
        if (!p.hidden) {
            p.x = x
            p.y = 0
            p.w = cw
            p.h = h
            x += cw
        }
    })

    Container.prototype.adjust.call(this)
}

Inspector.prototype.syncTarget = function() {
    const target = this.panel[1].dir
    this.panel[3].land(target)
}
