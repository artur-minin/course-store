module.exports = function (req, res, next) {
  const isNotAuthenticated = !req.session.isAuthenticated
  if (isNotAuthenticated) {
    return res.redirect('/auth/login#login')
  }

  next()
}
