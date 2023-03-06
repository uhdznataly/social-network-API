const { Thought, User } = require('../models');

const thoughtCount = async() => 
    Thought.aggregate()
    .count('thoughtCount')
    .then((numberOfThoughts) => numberOfThoughts);

module.exports = {

    getThoughts(req, res) {
        Thought.find()
        .then(async (thoughts) => {
        const thoughtObj = {
            thoughts,
            thoughtCount: await thoughtCount(),
        };
        return res.json(thoughtObj);
    })
    .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
    });
    },
// get a single thought by _id
    getSingleThought(req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
        .select('-__v')
        .then((thought) =>
        !thought 
        ? res.status(404).json({ message: 'No thought with that id!'}) 
        : res.json(thought)
        )
        .catch((err) => {
            console.log(err);
            return res.status(500).json(err)
        })
    },
// post to create a new thought
    createThought(req,res) {
        Thought.create(req.body)
        .then((thought) => {  
            return User.findOneAndUpdate( 
            { username: thought.username },
            { $addToSet: { thoughts: thought._id } },
            { new: true })
        })
        .then((user) =>
        !user
        ? res.status(404).json({ message: 'Thought created, but there is no user with that id!' })
        : res.json('Created thought!'))
        .catch((err) => res.status(500).json(err));
    },
// put to update thought by _id
    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { thoughtText: req.body.thoughtText },
            { new: true })
        .then(updatedThought => res.status(200).json(updatedThought))
        .catch(err => res.status(500).json(err))
    },

// delete to remove thought by _id
    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
        .then((thought) => res.json(thought))
        .catch((err) => res.status(500).json(err));
    },

// post to create a reaction stored in a single thought's reactions array field
    createReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { new: true }
        )
        .then((thought) => {
        !thought
            ? res.status(404).json({ message: 'No thought found with that id!' })
            : res.json(thought)
        })
        .catch((err) => res.status(500).json(err));
    },
// delete to pull and remove a reaction by the reaction's reactionId value
    deleteReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { new: true }
            )
        .then((thought) => {
            !thought
            ? res.status(404).json({ message: 'No thought found with that id!' })
            : res.json(thought)
        })
        .catch(err => res.status(500).json(err))   
    }
};