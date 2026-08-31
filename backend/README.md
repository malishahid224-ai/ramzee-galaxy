# Real Estate Admin API

This API lets an administrator manage property listings in MongoDB. A sample listing is added automatically when the `properties` collection is empty.

## Start it

1. Copy `.env.example` to `.env`, set `MONGODB_URI` to your MongoDB Atlas connection string, and change the default secret and admin password.
2. Run `npm install` inside this `backend` folder.
3. Run `npm run dev`.

The server starts at `http://localhost:5000`.

## Admin workflow

First, call `POST /api/auth/admin/login`:

```json
{ "email": "admin@ramzeegalaxy.com", "password": "RamzeeAdmin#2026!" }
```

Use the received token on every admin request:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Use |
| --- | --- | --- |
| GET | `/api/properties` | Public, published listings. Supports `purpose=sale|rent` and `search=`. |
| GET | `/api/admin/properties` | Admin list, including drafts. |
| POST | `/api/admin/properties` | Create a property. |
| PATCH | `/api/admin/properties/:id` | Update a property. |
| DELETE | `/api/admin/properties/:id` | Delete a property. |

A property needs `title`, `location`, `price`, `purpose` (`sale` or `rent`), and `areaUnit`. Optional fields are `currency`, `beds`, `baths`, `area`, `image`, `description`, and `status` (`published` or `draft`).
