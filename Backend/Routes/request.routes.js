import express from 'express';
import { Request } from '../Mongoose/RequestSchema';
import { requestValidationSchema } from '../Utils/RequestValidationSchema';
import { checkSchema, validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from "uuid";

const router = express.Router()

const generateRequestNumber = () => {
    return "REQ-" + uuidv4().slice(0, 8)
}

router.get('/request', async (req, res) => {

    try {
        const requests = await Request.find()
        res.json(requests)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

router.get("/requests/:id", async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post(
    "/requests",
    checkSchema(requestValidationSchema),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });

        const data = matchedData(req);

        try {
            const request = new Request({
                ...data,
                request_number: generateRequestNumber()
            });

            await request.save();
            res.status(201).json({ message: "Request created", request });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

router.put("/requests/:id/approve", async (req, res) => {
    try {
        const request = await Request.findByIdAndUpdate(
            req.params.id,
            {
                status: "approved",
                approved_by: req.user?.id
            },
            { new: true }
        );

        if (!request) return res.status(404).json({ message: "Request not found" });
        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



