const highPriorityMessage = require("../model/highPriorityMessage");
const lowPriorityMessage = require("../model/lowPriorityMessage");
const midPriorityMessage = require("../model/midPriorityMessage");

const totalPendingQuery = (req, res, next) => {
    const totalPendingQuery = [];
    lowPriorityMessage.find({ ans: "" }).countDocuments().then((data) => {
        totalPendingQuery.push(data);
        midPriorityMessage.find({ ans: "" }).countDocuments().then((data) => {
            totalPendingQuery.push(data);
            highPriorityMessage.find({ ans: "" }).countDocuments().then((data) => {
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

module.exports = { totalPendingQuery };