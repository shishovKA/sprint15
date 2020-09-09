const router = require('express').Router();
const {
  getCards,
  createCard,
  delCardById,
  likeCard,
  dislikeCard,
  checkOwner,
} = require('../controllers/cards.js');

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', checkOwner, delCardById);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
