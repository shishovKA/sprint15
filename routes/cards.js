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

const cardIdValid = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
});

router.get('/', getCards);
router.post('/', cardValid, createCard);
router.delete('/:cardId', cardIdValid, checkOwner, delCardById);
router.put('/:cardId/likes', cardIdValid, likeCard);
router.delete('/:cardId/likes', cardIdValid, dislikeCard);

module.exports = router;
