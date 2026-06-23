# Socification Service

A standalone, Redis-free microservice built with **Node.js, Express, MongoDB (Mongoose), Socket.io, and TypeScript** designed to handle all notification persistence, real-time message notifications, and user websocket grouping for the SociTune ecosystem.

---

## Features

- **Real-Time Notification Delivery**: Uses Socket.io to push real-time updates directly to target users joined in `user:${userId}` rooms.
- **Connection Recovery**: Automatic socket state recovery in case of quick client disconnects.
- **MongoDB Aggregation**: Automatically aggregates repetitive notifications (like playlist likes) into single combined documents (e.g. "3 people liked your playlist") containing an `actors` details list.
- **Service Security**: All endpoints are secured using a shared service token verified via the `X-Service-Token` header.
- **Clean Architecture**: Written in structured, modern TypeScript using ES Modules.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=5001
MONGO_URI=mongodb+srv://.../socification_db
INTERNAL_SERVICE_TOKEN=your_secure_internal_token_here
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

- `PORT`: Port the microservice listens on.
- `MONGO_URI`: MongoDB connection string pointing to the dedicated `socification_db` database.
- `INTERNAL_SERVICE_TOKEN`: Secret token shared with the main backend to authenticate service-to-service requests.
- `CORS_ORIGIN`: Comma-separated origins allowed to make socket/CORS requests.

---

## Commands

### Install Dependencies
```bash
npm install
```

### Run in Development
```bash
npm run dev
```

### Build (Compile TypeScript)
```bash
npm run build
```

### Start in Production
```bash
npm run start
```

---

## API Specifications (Protected by `X-Service-Token`)

All requests require the header:
`X-Service-Token: <INTERNAL_SERVICE_TOKEN>`

### 1. Create Generic Notification
- **Path**: `POST /internal/notifications/create`
- **Body**:
```json
{
  "userId": "recipient_clerk_id",
  "senderId": "sender_clerk_id",
  "senderName": "Sender Full Name",
  "senderAvatar": "Sender Avatar URL",
  "type": "social | music | ai | system | PLAYLIST_LIKE",
  "title": "Notification Title",
  "message": "Notification Message",
  "entityId": "optional_playlist_or_song_id",
  "actor": {
    "userId": "actor_clerk_id",
    "name": "Actor Full Name",
    "avatar": "Actor Avatar URL"
  },
  "metadata": {}
}
```

### 2. Create Message Notification
- **Path**: `POST /internal/notifications/message`
- **Body**:
```json
{
  "senderId": "sender_clerk_id",
  "receiverId": "receiver_clerk_id",
  "senderName": "Sender Name",
  "senderAvatar": "Sender Avatar URL",
  "message": "Message text preview"
}
```

### 3. Read Message Notifications
- **Path**: `POST /internal/notifications/read-messages`
- **Body**:
```json
{
  "senderId": "sender_clerk_id",
  "receiverId": "receiver_clerk_id"
}
```

### 4. Read All Notifications
- **Path**: `POST /internal/notifications/read-all`
- **Body**:
```json
{
  "userId": "user_clerk_id"
}
```

### 5. Mark Single Notification Read
- **Path**: `POST /internal/notifications/mark-read`
- **Body**:
```json
{
  "userId": "user_clerk_id",
  "id": "notification_id"
}
```

### 6. Delete Notification
- **Path**: `POST /internal/notifications/delete`
- **Body**:
```json
{
  "userId": "user_clerk_id",
  "id": "notification_id"
}
```

---

## Architecture Integration in SociTune

1. The main backend's `socification.service.ts` client issues HTTP POST requests to this service.
2. The frontend joins Socket.io connections directed to the Socification host/port (e.g. `http://localhost:5001`).
3. Database states and counts stay perfectly synced.
