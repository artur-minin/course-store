const { Router } = require('express')
const router = Router()

const authMiddleware = require('../middlewares/auth')

const Order = require('../models/order')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const order = await Order.find({ 'user.userId': req.user._id }).populate('user.userId')

    res.render('order', {
      title: 'My Order',
      isOnOrderPage: true,
      order: order.map(({ courses, _doc }) => ({
        ..._doc,
        totalPrice: courses.reduce((total, { count, course }) => (total += count * course.price), 0)
      }))
    })
  } catch (error) {
    console.error(error)
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId').execPopulate()

    const courses = user.cart.items.map(({ courseId, count }) => ({
      course: { ...courseId._doc },
      count
    }))

    const order = new Order({
      user: {
        userId: req.user._id,
        name: req.user.name
      },
      courses
    })

    await order.save()
    await req.user.clearCart()

    res.redirect('/order')
  } catch (error) {
    console.error(error)
  }
})

module.exports = router
