function error(req, res) {
    res.render('error.ejs', { err : res.locals.error || 404});
}

module.exports = { error }