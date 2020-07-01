const { Router } = require('express')
const router = Router()

const authMiddleware = require('../middlewares/auth')

const Course = require('../models/course')

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'name email')
      .select('title price imageURL')

    res.render('courses', {
      title: 'Courses',
      isOnCoursesPage: true,
      userId: req.user ? req.user._id : null,
      courses
    })
  } catch (error) {
    console.error(error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    res.render('course', {
      layout: 'empty',
      title: course.title,
      course
    })
  } catch (error) {
    console.error(error)
  }
})

router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    const isCurrentUserCourse = course.userId.toString() === req.user._id.toString()

    if (isCurrentUserCourse) {
      return res.render('course-edit', {
        title: `Edit ${course.title}`,
        course
      })
    } else {
      return res.redirect('/courses')
    }
  } catch (error) {
    console.error(error)
  }
})

router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    const isCurrentUserCourse = course.userId.toString() === req.user._id.toString()

    if (isCurrentUserCourse) {
      await Course.findByIdAndUpdate(req.params.id, req.body)
      return res.redirect('/courses')
    } else {
      return res.redirect('/courses')
    }
  } catch (error) {
    console.error(error)
  }
})

router.post('/delete/:id', authMiddleware, async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.params.id, userId: req.user._id })
    res.redirect('/courses')
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
