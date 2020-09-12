const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserAvatar,
} = require('../controllers/users.js');

const avatarValid = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().uri(),
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
