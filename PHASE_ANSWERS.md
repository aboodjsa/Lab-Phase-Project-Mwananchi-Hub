# Phase answers – ServiceHub (copy each into the matching phase)

## Phase 1: Project Setup and Backend Configuration
I created a MERN project with separate `server` and `client` folders. On the backend I installed Express, Mongoose, dotenv, cors, bcryptjs and jsonwebtoken, connected to MongoDB Atlas (with a cached connection for serverless hosting), and designed six models: User, Category, Provider, Booking, Review and Notification. I built the base REST API (categories CRUD), an error-handling middleware, and tested the endpoints in Postman. Everything is version-controlled on GitHub. Evidence: repo link, terminal showing the server running, Postman screenshots.

## Phase 2: User Authentication and Authorization
I implemented registration and login with bcrypt-hashed passwords and JWT tokens (7-day expiry). There are three roles: customer, provider and admin. A `protect` middleware verifies the token and an `allow(...roles)` middleware restricts routes: only admins manage categories and users, only customers create bookings, and only the owning provider updates its bookings. On the frontend, an AuthContext stores the session and protected routes redirect unauthenticated users to the login page. Evidence: screenshots of register, login, a 401 response without a token, and a 403 for the wrong role.

## Phase 3: Creation and Listing
Providers create a public profile (service category, bio, experience, hourly rate, city). Customers browse providers, open a provider page and submit a booking request (description, address, date). Each user's dashboard lists their own bookings, and providers see requests sent to them. Notifications are created and listed for new bookings. Evidence: screenshots of the Browse page, provider profile, booking form and dashboards.

## Phase 4: Update and Deletion
Providers update booking status through the workflow pending → accepted/rejected → in-progress → completed. Customers can cancel or delete bookings, and providers can edit their profile. After a completed job customers leave a 1–5 star review, and the provider's average rating updates automatically. Admins can delete users, categories and bookings. Every change is saved in MongoDB and reflected in the UI, and the other party gets a notification. Evidence: screenshots before/after a status change, a deleted booking, and a review.

## Phase 5: Filtering and Sorting
The provider search supports free-text search (name, bio, category), filters by category, city and minimum rating, and sorting by top rated, lowest price, most experienced or newest. Filtering runs on the server via query parameters, e.g. `/api/providers?category=...&minRating=4&sort=price`. Evidence: screenshots of different filter and sort combinations and the matching Postman requests.

## Phase 6: Deployment and Finalization
I pushed the code to GitHub and deployed two Vercel projects from the same repository: the Express API (root directory `server`, serverless entry in `api/index.js`) and the React client (root directory `client`). MongoDB Atlas hosts the database, and environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL, VITE_API_URL) are set in Vercel. I ran a final test pass on the live URLs: register, login, book, accept, complete, review, filter, admin actions, and mobile layout. Evidence: both live URLs, GitHub link, and screenshots of the tested flow.
