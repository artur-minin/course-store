const bcrypt = require('bcryptjs')
const { Router } = require('express')
const router = Router()

const User = require('../models/user')

router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Log in',
    isOnLoginPage: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
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
    const { email, password } = req.body
    const candidate = await User.findOne({ email })

    if (candidate) {
      const arePasswordsSame = await bcrypt.compare(password, candidate.password)

      if (arePasswordsSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true

        req.session.save(error => {
          if (error) {
            throw error
          }
          res.redirect('/')
        })
      } else {
        req.flash('loginError', `Wrong password`)
        res.redirect('/auth/login#login')
      }
    } else {
      req.flash('loginError', `User with email address "${email}" doesn't exist`)
      res.redirect('/auth/login#login')
    }
  } catch (error) {
    console.error(error)
  }
})

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, repeatPassword } = req.body
    const isEmailRegistered = await User.findOne({ email })

    if (isEmailRegistered) {
      req.flash('registerError', 'Email is already registered')
      res.redirect('/auth/login#register')
    } else if (password !== repeatPassword) {
      req.flash('registerError', 'Password mismatch')
      res.redirect('/auth/login#register')
    } else {
      const encryptedPassword = await bcrypt.hash(password, 10)
      const user = new User({
        name,
        email,
        password: encryptedPassword,
        cart: { items: [] }
      })

      await user.save()
      res.redirect('/auth/login#login')
    }
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
