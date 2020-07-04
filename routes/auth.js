const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const { Router } = require('express')

const {
  registerValidators,
  loginValidators,
  resetPasswordValidators,
  setNewPasswordValidators
} = require('../utils/validators')

const router = Router()

const User = require('../models/user')
const keys = require('../keys')

const registerEmailTemplate = require('../emails/registration')
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
    error: req.flash('resetPasswordError')
  })
})

router.get('/set-new-password/:token', async (req, res) => {
  const resetToken = req.params.token
  if (!resetToken) {
    return res.redirect('/auth/login#login')
  }

  try {
    const user = await User.findOne({
      resetToken,
      resetTokenExpire: { $gt: Date.now() } // $gt - greater
    })

    if (!user) {
      return res.redirect('/auth/login#login')
    } else {
      res.render('auth/set-new-password', {
        title: 'Set new password',
        error: req.flash('setNewPassError'),
        userId: user._id.toString(),
        token: resetToken
      })
    }
  } catch (error) {
    console.error(error)
  }
})

router.post('/login', loginValidators, async (req, res) => {
  try {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      req.flash('loginError', validationErrors.array()[0].msg)
      return res.status(422).render('auth/login', {
        title: 'Log in',
        isOnLoginPage: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
      })
    }

    const user = await User.findOne({ email: req.body.email })
    req.session.user = user
    req.session.isAuthenticated = true

    req.session.save(error => {
      if (error) {
        throw error
      }
      res.redirect('/')
    })
  } catch (error) {
    console.error(error)
  }
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      req.flash('registerError', validationErrors.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }

    const { name, email, password } = req.body
    const encryptedPassword = await bcrypt.hash(password, 10)
    const user = new User({
      name,
      email,
      password: encryptedPassword,
      cart: { items: [] }
    })

    await user.save()
    res.redirect('/auth/login#login')
    await transporter.sendMail(registerEmailTemplate(email))
  } catch (error) {
    console.error(error)
  }
})

router.post('/reset-password', resetPasswordValidators, (req, res) => {
  try {
    crypto.randomBytes(32, async (error, buffer) => {
      if (error) {
        req.flash('resetPasswordError', 'Something went wrong, try again later')
        return res.redirect('/auth/reset-password')
      }

      const validationErrors = validationResult(req)
      if (!validationErrors.isEmpty()) {
        req.flash('resetPasswordError', validationErrors.array()[0].msg)
        return res.status(422).redirect('/auth/reset-password')
      }

      const user = await User.findOne({ email: req.body.email })
      const resetToken = buffer.toString('hex')
      user.resetToken = resetToken

      const HOUR_IN_MS = 3600000
      user.resetTokenExpire = Date.now() + HOUR_IN_MS

      await user.save()
      await transporter.sendMail(resetPasswordEmailTemplate(user.email, resetToken))
      res.redirect('/auth/login#login')
    })
  } catch (error) {
    console.error(error)
  }
})

router.post('/set-new-password', setNewPasswordValidators, async (req, res) => {
  try {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      req.flash('setNewPassError', validationErrors.array()[0].msg)
      return res.status(422).redirect('/auth/login#login')
    }

    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExpire: { $gt: Date.now() } // $gt - greater
    })

    user.password = await bcrypt.hash(req.body.password, 10)
    user.resetToken = undefined
    user.resetTokenExpire = undefined

    await user.save()
    res.redirect('/auth/login#login')
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
