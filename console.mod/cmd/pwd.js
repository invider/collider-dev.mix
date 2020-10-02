'use strict'

function pwd(args, line, con) {
    if (con.cur && isFun(con.cur.path)) {
        return con.cur.path()
    } else {
        return 'unknown'
    }
}

pwd.info = 'show current frame'
pwd.args = ''
