function setup() {
    _.hidden = true
    
    const hud = lab.spawn('hud/Hud', {
        name: 'hud',
    })

    const inspector = lab.hud.spawn('hud/Inspector', {
        x: 0,
        y: 0,
        w: rx(1),
        h: ry(.5),
    })
}
