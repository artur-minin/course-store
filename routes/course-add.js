const { Router } = require('express')
const router = Router()

const authMiddleware = require('../middlewares/auth')

const Course = require('../models/course')

router.get('/', authMiddleware, (req, res) => {
  res.render('course-add', { title: 'Add Course', isOnAddCoursePage: true })
})

router.post('/', authMiddleware, async (req, res) => {
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
