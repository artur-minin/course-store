const { validationResult } = require('express-validator')
const { Router } = require('express')

const authMiddleware = require('../middlewares/auth')

const { courseValidators } = require('../utils/validators')

const router = Router()

const Course = require('../models/course')

router.get('/', authMiddleware, (req, res) => {
  res.render('course-add', { title: 'Add Course', isOnAddCoursePage: true })
})

router.post('/', authMiddleware, courseValidators, async (req, res) => {
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    return res.status(422).render('course-add', {
      title: 'Add Course',
      isOnAddCoursePage: true,
      error: validationErrors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        imageURL: req.body.imageURL
      }
    })
  }

  const course = new Course({
    title: req.body.title,
    price: req.body.price,
    imageURL: req.body.imageURL,
    userId: req.user._id
  })

  try {
    await course.save()
    res.redirect('/courses')
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
