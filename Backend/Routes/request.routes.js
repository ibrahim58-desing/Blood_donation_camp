import express, { request } from 'express';
import { Request } from '../Mongoose/Model/RequestSchema.js';
import { protect,authorize } from '../Middleware/Auth.js';
import { requestValidationSchema } from '../Utils/RequestValidationSchema.js';
import { checkSchema, validationResult, matchedData } from 'express-validator';
import { v4 as uuidv4 } from "uuid";

const router = express.Router()

const generateRequestNumber = () => {
    return "REQ-" + uuidv4().slice(0, 8)
}

router.get('/requests',protect, authorize('admin','technician'), async (req, res) => {

    try {
        const requests = await Request.find()
        res.json(requests)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

})

router.get("/requests/pending" ,protect, authorize('admin','technician'), async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/requests/urgent", async (req,res) => {

    try {
        const urgentcy = await Request.find({  
           urgency:{$in:["urgent","critical"]}
        })
        res.json(urgentcy)
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
    
})



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
                request_code: generateRequestNumber()
            });

            await request.save();
            res.status(201).json({ message: "Request created", request });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
);

router.put("/requests/:id/reject",protect, authorize('admin','technician'), async (req, res) => {

    try {
        const reject = await Request.findByIdAndUpdate(
            req.params.id,
            { status: "rejected" },
            { new: true }
        )

        res.json(reject)

    } catch (err) {
       res.status(500).json({ error: err.message });
    }

})

router.put("/requests/:id/approve",protect, authorize('admin','technician'), async (req, res) => {
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



router.put("/requests/:id/fulfill" ,protect, authorize('admin','technician'),async (req,res) => {

    try {
        const fulfill =await Request.findByIdAndUpdate(
            req.params.id,
            {status:"fulfilled"},
            {new:true}
        )
        res.json(fulfill)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
})

router.put("/requests/:id/cancel", async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put(
  "/requests/:id",protect, authorize('admin','technician'),
  checkSchema(requestValidationSchema),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const data = matchedData(req);

    try {
      const updatedRequest = await Request.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true }
      );

      if (!updatedRequest)
        return res.status(404).json({ message: "Request not found" });

      res.json(updatedRequest);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/requests/:id",protect, authorize('admin','technician'), async (req, res) => {
    try {
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



export default router

