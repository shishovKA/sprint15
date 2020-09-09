const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => res.status(400).send({ message: err.message }));
};

module.exports.checkOwner = (req, res, next) => {
  const { cardId } = req.params;
  Card.findById(cardId)
    .then((card) => {
      if (!card) return res.status(404).send({ message: 'карточка не найдена' });
      if (!card.owner.equals(req.user._id)) return res.status(403).send({ message: 'вы не можете удалять чужую карточку' });
      next();
      return true;
    })
    .catch(() => res.status(404).send({ message: 'карточка не найдена' }));
};

module.exports.delCardById = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) return res.status(404).send({ message: 'карточка не найдена' });
      return res.send({ data: card });
    })
    .catch(() => res.status(404).send({ message: 'карточка не найдена' }));
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) return res.status(404).send({ message: 'карточка не найдена' });
      return res.send({ data: card });
    })
    .catch(() => res.status(404).send({ message: 'карточка не найдена' }));
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) return res.status(404).send({ message: 'карточка не найдена' });
      return res.send({ data: card });
    })
    .catch(() => res.status(404).send({ message: 'карточка не найдена' }));
};
