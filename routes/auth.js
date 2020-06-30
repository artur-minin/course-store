const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const { Router } = require('express')
const router = Router()

const User = require('../models/user')
const keys = require('../keys')

const regEmailTemplate = require('../emails/registration')
const resetPasswordEmailTemplate = require('../emails/reset-password')

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY }
  })
)

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

router.get('/reset-password', (req, res) => {
  res.render('auth/reset-password', {
    title: 'Reset password',
    error: req.flash('reset-pass-error')
  })
})

router.get('/new-password/:token', async (req, res) => {
  const token = req.params.token
  if (!token) {
    return res.redirect('/auth/login#login')
  }

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() } // $gt - greater
    })

    if (!user) {
      return res.redirect('/auth/login#login')
    } else {
      res.render('auth/new-password', {
        title: 'Set new password',
        error: req.flash('new-pass-error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }
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
      await transporter.sendMail(regEmailTemplate(email))
    }
  } catch (error) {
    console.error(error)
  }
})

router.post('/reset-password', (req, res) => {
  try {
    crypto.randomBytes(32, async (error, buffer) => {
      if (error) {
        req.flash('reset-pass-error', 'Something went wrong, try again later')
        return res.redirect('/auth/reset-password')
      }

      const token = buffer.toString('hex')
      const candidate = await User.findOne({ email: req.body.email })

      if (candidate) {
        candidate.resetToken = token
        const HOUR_IN_MS = 3600000
        candidate.resetTokenExpire = Date.now() + HOUR_IN_MS

        await candidate.save()
        await transporter.sendMail(resetPasswordEmailTemplate(candidate.email, token))
        res.redirect('/auth/login#login')
      } else {
        req.flash('reset-pass-error', `Email (${req.body.email}) isn't registered`)
        res.redirect('/auth/reset-password')
      }
    })
  } catch (error) {
    console.error(error)
  }
})

router.post('/new-password', async (req, res) => {
  try {
    const { userId, token, password } = req.body
    const user = await User.findOne({
      _id: userId,
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() } // $gt - greater
    })

    if (user) {
      user.password = await bcrypt.hash(password, 10)
      user.resetToken = undefined
      user.resetTokenExpire = undefined

      await user.save()
      res.redirect('/auth/login#login')
    } else {
      req.flash('loginError', 'Token expired')
      res.redirect('/auth/login#login')
    }
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
