
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
    this.panel = []

    Container.call(this, st)
}
Inspector.prototype = Object.create(Container.prototype)

Inspector.prototype.init = function() {
    const def = augment({}, explorerDefaults)

    const inspector = this
    def.onStateChange = function() {
        inspector.sync()
    }

    this.panel.push(this.spawn('hud/gadget/Explorer', def))
    this.panel.push(this.spawn('hud/gadget/Explorer', def))
    this.panel.push(this.spawn('hud/gadget/Explorer', def))
    this.panel.push(this.spawn('hud/gadget/Explorer', def))

    for (const p of this.panel) {
        p.pane.onMove = function() {
            inspector.sync()
        }
    }

    this.panel[1].disabled = false
    this.adjust()
}

Inspector.prototype.switchLayout = function(mode) {
    this.layoutMode = mode
    this.adjust()
}

Inspector.prototype.sync = function() {
    const dir = this.panel[1].dir
    const node = this.panel[1].selectedNode()

    if (dir && dir.__) this.panel[0].open(dir.__)
    if (node) this.panel[2].open(node)
}

Inspector.prototype.adjust = function() {
    let h = ry(.5)
    let w = rx(1)
    switch(this.layoutMode) {
        case 1:
            h = ry(1)
            break
    }

    this.w = w
    this.h = h

    const n = this.panel.length
    const cw = rx(1)/n

    let x = 0
    for (const e of this.panel) {
        e.x = x
        e.y = 0
        e.w = cw
        e.h = h
        x += cw
    }

    Container.prototype.adjust.call(this)
}
