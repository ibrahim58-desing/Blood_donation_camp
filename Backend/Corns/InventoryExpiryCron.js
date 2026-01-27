import cron from 'node-cron'
import { Inventory } from '../Mongoose/Model/InventorySchema.js'

console.log("Inventory expiry cron loaded ✅");

cron.schedule("0 0 * * *", async () => {
    try {
        const today = new Date()

        const result = await Inventory.updateMany({

            expiry_date: { $lt: today },
            status: { $in: ['available', 'reserved'] }
        },
            { status: 'expired' }

        )

        console.log(
            `[CRON] Expired units updated: ${result.modifiedCount}`
        );
    } catch (err) {
        console.error("[CRON ERROR]", err.message);

    } 
})