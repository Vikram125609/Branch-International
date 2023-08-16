const highPriorityMessage = require("../model/highPriorityMessage");
const lowPriorityMessage = require("../model/lowPriorityMessage");
const midPriorityMessage = require("../model/midPriorityMessage");

const totalPendingQuery = (req, res, next) => {
    const totalPendingQuery = [];
    lowPriorityMessage.find({ ans: [] }).countDocuments().then((data) => {
        totalPendingQuery.push(data);
        midPriorityMessage.find({ ans: [] }).countDocuments().then((data) => {
            totalPendingQuery.push(data);
            highPriorityMessage.find({ ans: [] }).countDocuments().then((data) => {
                totalPendingQuery.push(data);
                res.status(200).json({
                    success: true,
                    message: 'Total Pending Query',
                    totalPendingQuery: totalPendingQuery
                })
            })
        })
    })
};

const replyToClient = (req, res, next) => {
    let collection
    const { ans, messageId, replyMessagePriority } = req.body;
    if (replyMessagePriority === '0') {
        collection = require('./../model/highPriorityMessage');
        try {
            collection.findByIdAndUpdate(messageId, {
                $push: {
                    'ans': ans
                }
            }).then(() => { });
        } catch (error) {
            console.log(error);
        }
    }
    else if (replyMessagePriority === '1') {
        collection = require('./../model/midPriorityMessage');
        try {
            collection.findByIdAndUpdate(messageId, {
                $push: {
                    'ans': ans
                }
            }).then(() => { });
        } catch (error) {
            console.log(error);
        }
    }
    else {
        collection = require('./../model/lowPriorityMessage');
        try {
            collection.findByIdAndUpdate(messageId, {
                $push: {
                    'ans': ans
                }
            }).then(() => { });
        } catch (error) {
            console.log(error);
        }
    }
    res.status(200).json({
        success: true,
    })
};

module.exports = { totalPendingQuery, replyToClient };