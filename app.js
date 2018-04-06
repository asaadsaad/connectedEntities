const http = require("http");
const express = require("express");
const loremIpsum = require('lorem-ipsum')
const mongoose = require("mongoose");

const UserModel = require("./user");
const EventModel = require("./event");

const app = express();

mongoose.connect("mongodb://localhost:27017/connectedEntities?authSource=admin").then(_ => console.log(`connected successfully to MongoDB Server`)).catch(err => console.log(err));

app.get('/', async (req, res) => {
    const user_id = mongoose.Types.ObjectId();
    try {
        const user = await new UserModel({
            _id: user_id,
            firstname: loremIpsum({ count: 2, units: 'words', format: 'plain' }),
            lastname: loremIpsum({ count: 2, units: 'words', format: 'plain' })
        }).save();
        const event1 = await new EventModel({
            _id: mongoose.Types.ObjectId(),
            user_id: user_id,
            description: loremIpsum({ count: 1, units: 'sentences', format: 'plain' })
        }).save();
        const event2 = await new EventModel({
            _id: mongoose.Types.ObjectId(),
            user_id: user_id,
            description: loremIpsum({ count: 1, units: 'sentences', format: 'plain' })
        }).save();


        // populate from Mongoose
        // EventModel.find({ user_id: user_id })
        //     .select('user_id description -_id')
        //     .populate({
        //         path: 'user_id',
        //         match: { _id: user_id },
        //         select: 'firstname -_id',
        //         options: { limit: 1 }
        //     })
        //     .skip(0)
        //     .limit(2)
        //     .exec()
        //     .then(results => {
        //         res.status(200).json({ data: results });
        //     })
        //     .catch(err => {
        //         res.status(400).json({ error: err });
        //     });


        // no population, send request link to client to fetch later
        EventModel.find({ user_id: user_id })
            .select('user_id description -_id')
            .skip(0)
            .limit(2)
            .exec()
            .then(results => {
                res.status(200).json({
                    count: results.length,
                    data: results.map(result => {
                        return {
                            description: result.description,
                            request: {
                                type: 'GET',
                                url: `http://localhost:4000/user/${result.user_id}`
                            }
                        };
                    })
                });
            })
            .catch(err => {
                res.status(400).json({ error: err.message });
            });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})



app.get('/user/:user_id', async (req, res) => {
    try {
        UserModel.findOne({ _id: req.params.user_id })
            .select('firstname lastname -_id')
            .exec()
            .then(user => {
                res.status(200).json({ data: user });
            })
            .catch(err => {
                res.status(400).json({ error: err.message });
            });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
})

const port = process.env.PORT || 4000;
http.createServer(app).listen(port, _ => console.log('Listening on', port))