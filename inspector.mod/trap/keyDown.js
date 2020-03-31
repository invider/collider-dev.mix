function keyDown(e) {
    if (e.altKey || e.ctrlKey) {
        switch(e.code) {
            case 'ArrowUp':
                lab.hud.inspector.switchLayout(0)
                break;
            case 'ArrowDown':
                lab.hud.inspector.switchLayout(1)
                break;
        }
    } else {
        switch(e.code) {
            case 'KeyS': case 'End':
                lab.hud.inspector.syncTarget()
                break
        }
    }
}
