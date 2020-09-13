const router = require('express').Router();
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users.js');

const avatarValid = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((value, helper) => {
      if (!validator.isURL(value)) {
        return helper.message('поле avatar должно быть корректной ссылкой');
      }
      return value;
    }),
  }),
});

const userUpdateValid = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.patch('/me', userUpdateValid, updateUser);
router.patch('/me/avatar', avatarValid, updateUserAvatar);

module.exports = router;
