const { Router } = require('express')

const authMiddleware = require('../middlewares/auth')

const User = require('../models/user')

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  res.render('profile', {
    title: 'My profile',
    isOnProfilePage: true,
    user: req.user.toObject()
  })
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const toChange = {
      name: req.body.name
    }

    if (req.file) {
      toChange.avatarURL = req.file.path
    }

    Object.assign(user, toChange)
    await user.save()
    res.redirect('/profile')
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
