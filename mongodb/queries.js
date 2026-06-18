// ============================================================
// Chinese Auction – שאילתות MongoDB
// הכתיבה היא של הסטודנטית – לא AI
// ============================================================

use("chinese_auction");



db.gifts.find({ "category.name": "אלקטרוניקה" })



db.users.find({ $or: [ { name: "שרה כהן" }, { email: "israel@example.com" } ] })


db.gifts.find({ $and: [ { ticketPrice: { $gte: 18 } }, { ticketPrice: { $lte: 80 } } ] })

db.users.find({})



db.gifts.find({ ticketPrice: { $gte: 30 } })


db.gifts.aggregate([
  { $group: { _id: "$category.name", totalGifts: { $sum: 1 } } },
  { $sort: { totalGifts: -1 } }
])
