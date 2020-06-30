const { Router } = require('express')
const router = Router()

const User = require('../models/user')

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Log in', isOnLoginPage: true })
})

router.get('/logout', (req, res) => {
  try {
    req.session.destroy(error => {
      if (error) {
        throw error
      }
      res.redirect('/auth/login#login')
    })
  } catch (error) {
    console.error(error)
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findById('5ef90814e66c6122e07f0b05')
    req.session.user = user
    req.session.isAuthenticated = true

    req.session.save(error => {
      if (error) {
        throw error
      }

      res.redirect('/')
    })
  } catch (erroe) {
    console.error(error)
  }
})

router.post('/register', async (req, res) => {
  req.session.isAuthenticated = true
  res.redirect('/')
})

module.exports = router
