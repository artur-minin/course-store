const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpire: Date,
  cart: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true
        }
      }
    ]
  }
})

userSchema.methods.addToCart = function (courseToAdd) {
  const items = [...this.cart.items]
  const courseToAddIndex = items.findIndex(course => {
    return course.courseId.toString() === courseToAdd._id.toString()
  })

  const isCourseAlreadyInCart = !!items[courseToAddIndex]

  if (isCourseAlreadyInCart) {
    items[courseToAddIndex].count = items[courseToAddIndex].count + 1
  } else {
    items.push({ courseId: courseToAdd._id, count: 1 })
  }

  this.cart = { items }
  return this.save()
}

userSchema.methods.deleteFromCart = function (courseToDeleteId) {
  let items = [...this.cart.items]
  const courseToDeleteIndex = items.findIndex(
    ({ courseId }) => courseId.toString() === courseToDeleteId.toString()
  )

  if (items[courseToDeleteIndex].count === 1) {
    items = items.filter(({ courseId }) => courseId.toString() !== courseToDeleteId.toString())
  } else {
    items[courseToDeleteIndex].count--
  }

  this.cart = { items }
  return this.save()
}

userSchema.methods.clearCart = function () {
  this.cart = {
    items: []
  }
  return this.save()
}

module.exports = model('User', userSchema)
