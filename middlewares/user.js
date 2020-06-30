const User = require('../models/user')

module.exports = async function (req, res, next) {
  const sessionUserData = req.session.user
  if (!sessionUserData) {
    return next()
  }

  req.user = await User.findById(sessionUserData._id)
  next()
}
