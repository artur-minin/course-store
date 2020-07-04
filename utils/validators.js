const bcrypt = require('bcryptjs')
const { body } = require('express-validator')

const User = require('../models/user')

module.exports.registerValidators = [
  body('email', 'Enter correct email')
    .isEmail()
    .custom(async value => {
      try {
        const isEmailRegistered = await User.findOne({ email: value })

        if (isEmailRegistered) {
          return Promise.reject('Email is already registered')
        }
      } catch (error) {
        console.error(error)
      }
    }),
  body('password', 'Password length must be from 6 and 60').isLength({ min: 6, max: 60 }),
  body('repeatPassword').custom((repeatPassword, { req }) => {
    if (repeatPassword !== req.body.password) {
      throw new Error('Password mismatch')
    }
    return true
  })
]

exports.loginValidators = [
  body('email', 'Enter correct email')
    .isEmail()
    .custom(async email => {
      try {
        const candidate = await User.findOne({ email })
        if (!candidate) {
          return Promise.reject(`User with email address "${email}" doesn't exist`)
        }
      } catch (error) {
        console.error(error)
      }
    }),
  body('password').custom(async (password, { req }) => {
    try {
      const candidate = await User.findOne({ email: req.body.email })
      const arePasswordsNotSame = !(await bcrypt.compare(password, candidate.password))
      if (arePasswordsNotSame) {
        return Promise.reject('Wrong password')
      }
    } catch (error) {
      console.error(error)
    }
  })
]

exports.resetPasswordValidators = [
  body('email', 'Enter correct email')
    .isEmail()
    .custom(async email => {
      try {
        const emailNotRegistered = !(await User.findOne({ email }))

        if (emailNotRegistered) {
          return Promise.reject(`Email (${email}) isn't registered`)
        }
      } catch (error) {
        console.error(error)
      }
    })
]

exports.setNewPasswordValidators = [
  body('password', 'Password length must be from 6 and 60')
    .isLength({ min: 6, max: 60 })
    .custom(async (_, { req }) => {
      try {
        const isTokenExpired = !(await User.findOne({
          _id: req.body.userId,
          resetToken: req.body.token,
          resetTokenExpire: { $gt: Date.now() } // $gt - greater
        }))

        if (isTokenExpired) {
          return Promise.reject('Token expired')
        }
      } catch (error) {
        console.error(error)
      }
    })
]

exports.courseValidators = [
  body('title', 'Title must be longer than 2 characters').isLength({ min: 3 }),
  body('price', 'Enter correct price').isNumeric(),
  body('imageURL', 'Enter correct image URL').isURL()
]
