const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const {
  getCards,
  createCard,
  delCardById,
  likeCard,
  dislikeCard,
  checkOwner,
} = require('../controllers/cards.js');

const cardValid = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom((value, helper) => {
      if (!validator.isURL(value)) {
        return helper.message('поле link должно быть корректной ссылкой');
      }
      return value;
    }),
  }),
});

router.get('/', getCards);
router.post('/', cardValid, createCard);
router.delete('/:cardId', checkOwner, delCardById);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
