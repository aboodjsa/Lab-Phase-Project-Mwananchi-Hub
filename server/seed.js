require("dotenv").config();
const bcrypt = require("bcryptjs"), mongoose = require("mongoose");
const { User, Category, Provider } = require("./models");
const mkUser = async (d) => (await User.findOne({ email: d.email })) || User.create({ ...d, password: await bcrypt.hash(d.password, 10) });
const CATS = [["Plumbing", "🔧"], ["Electrical", "⚡"], ["Cleaning", "🧹"], ["AC Repair", "❄️"], ["Carpentry", "🪚"], ["Painting", "🎨"], ["Gardening", "🌿"], ["Moving", "🚚"]];
const face = (g, n) => `https://randomuser.me/api/portraits/${g}/${n}.jpg`;
// name, email, category, years, KSh/hr, city, photo, headline, rating, reviews
const PROS = [
  ["Omar Hassan", "omar@servicehub.com", "Plumbing", 12, 1500, "Nairobi", face("men", 32), "Licensed plumber for leaks and installations", 4.9, 48],
  ["Grace Wanjiku", "grace@servicehub.com", "Cleaning", 6, 900, "Nairobi", face("women", 44), "Deep cleaning for homes and offices", 4.8, 63],
  ["Peter Otieno", "peter@servicehub.com", "Electrical", 9, 1800, "Kisumu", face("men", 45), "Certified electrician, wiring and lighting", 4.7, 35],
  ["Amina Yusuf", "amina@servicehub.com", "Painting", 7, 1200, "Mombasa", face("women", 68), "Interior and exterior painting", 4.9, 29],
  ["Daniel Mwangi", "daniel@servicehub.com", "Carpentry", 15, 2000, "Nairobi", face("men", 75), "Custom furniture and repairs", 4.6, 41],
  ["Faith Achieng", "faith@servicehub.com", "Gardening", 4, 800, "Kisumu", face("women", 12), "Garden design and lawn care", 4.5, 18],
  ["Joseph Kamau", "joseph@servicehub.com", "AC Repair", 10, 1600, "Mombasa", face("men", 22), "AC installation, servicing and repair", 4.8, 52],
  ["Brian Odhiambo", "brian@servicehub.com", "Moving", 5, 2500, "Nairobi", face("men", 52), "Careful home and office moving", 4.4, 22],
];
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const [name, icon] of CATS) await Category.updateOne({ name }, { name, icon }, { upsert: true });
  await mkUser({ name: "Admin", email: "admin@servicehub.com", password: "Admin123!", role: "admin" });
  await mkUser({ name: "Demo Customer", email: "customer@servicehub.com", password: "Customer123!", role: "customer", city: "Nairobi" });
  for (const [name, email, cat, years, rate, city, photo, headline, rating, n] of PROS) {
    const u = await mkUser({ name, email, password: "Provider123!", role: "provider", city });
    const c = await Category.findOne({ name: cat });
    await Provider.updateOne({ user: u._id }, { user: u._id, category: c._id, experienceYears: years, hourlyRate: rate, city, photo, headline, averageRating: rating, numReviews: n, bio: `${headline}. ${years} years of experience serving ${city} and nearby areas.` }, { upsert: true });
  }
  console.log("Seed complete.\nAdmin: admin@servicehub.com / Admin123!\nCustomer: customer@servicehub.com / Customer123!\nProvider: omar@servicehub.com / Provider123!");
  process.exit(0);
})();
