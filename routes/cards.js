const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
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
    link: Joi.string().required().uri(),
  }),
});

router.get('/', getCards);
router.post('/', cardValid, createCard);
router.delete('/:cardId', checkOwner, delCardById);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
