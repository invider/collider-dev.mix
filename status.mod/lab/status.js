'use strict'

return {
    Z: 101,
    hidden: true,

    lineSpacing: 32,
    font: '24px moon',
    color: '#c0d040',

    time: 0,
    fps: 50,
    last: 0,
    smoothing: 0.99,

    init: function() {
        this.last = Date.now()
    },
    evo: function(dt) {
        this.time += dt
    },
    draw: function() {
        let t = Date.now()
        let d = (t - this.last)/1000
        if (d > 0) {
            let f = 1/d
            this.fps = (this.fps * this.smoothing) + (f * (1-this.smoothing))
        }

        ctx.textAlign = 'right'
        ctx.font = this.font
        ctx.fillStyle = this.color
        let x = ctx.width - 20

        let y = 20
        ctx.textBaseline = 'top'
        ctx.fillText('Time: ' + Math.floor(this.time), x, y)
        ctx.fillText('FPS: ' + Math.round(this.fps), x, y + this.lineSpacing) 

        ctx.textBaseline = 'bottom'
        y = ctx.height - 20
        let hshift = 0

        if (_$.env.statusInfo) {
            Object.keys(_$.env.statusInfo).forEach(key => {
                ctx.fillText(key + ': ' + _$.env.statusInfo[key], x, y - hshift)
                hshift += this.lineSpacing
            })
        }

        this.last = t
    },
}
