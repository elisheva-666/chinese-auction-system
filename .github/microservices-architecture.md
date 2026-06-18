# Microservices Architecture Plan — Chinese Auction System

> **Status: Planning Only** — This document describes a *future* architecture. Nothing here has been implemented. The system currently runs as a monolith (`ChineseAuction.Api`).

---

## Why Microservices?

The current monolith works well and is the right choice for an early-stage project. Microservices become valuable when:
- Independent teams need to deploy different parts separately
- One feature (e.g. the lottery engine) needs to scale independently of others
- Specific services have different reliability or performance requirements

This plan serves as a blueprint for when that moment arrives.

---

## Proposed Services

### 1. Identity Service (שירות זהות)
**Responsibility**: User registration, login, JWT issuance

**Owns these entities**: `User`

**Current source**: `AuthController`, `AuthService`, `IUserRepository`, `UsersController`, `UserService`

**API**:
- `POST /identity/register`
- `POST /identity/login`
- `GET  /identity/me`
- `PUT  /identity/me`

**Tech notes**:
- Issues JWT tokens consumed by all other services
- All other services validate the JWT but do NOT call the Identity Service on each request — they trust the signed token
- Should be the only service that stores passwords

**Database**: Separate SQL Server database — `IdentityDB` (tables: `Users`)

---

### 2. Catalog Service (שירות קטלוג)
**Responsibility**: Manage the gift catalog, categories, and donors

**Owns these entities**: `Gift`, `Category`, `Donor`

**Current source**: `GiftController`, `GiftService`, `IGiftRepository`, `CategoryController`, `CategoryService`, `ICategoryRepository`, `DonorController`, `DonorService`, `IDonorRepository`

**API**:
- `GET  /catalog/gifts` — public gift listing
- `GET  /catalog/gifts/{id}`
- `GET  /catalog/gifts/sort-by-price`
- `GET  /catalog/gifts/sort-by-category`
- `GET  /catalog/gifts/admin` — admin view
- `POST /catalog/gifts/admin/add-to-donor/{donorId}`
- `PUT  /catalog/gifts/{id}`
- `DELETE /catalog/gifts/{id}`
- Full CRUD for `/catalog/categories` and `/catalog/donors`

**Database**: `CatalogDB` (tables: `Gifts`, `Categories`, `Donors`)

**Async events published**:
- `GiftDeleted` — consumed by Order Service to handle orphaned order items
- `GiftPriceChanged` — consumed by Order Service to recalculate totals

---

### 3. Order Service (שירות הזמנות)
**Responsibility**: Shopping cart and order management

**Owns these entities**: `Order`, `OrderItem`

**Current source**: `OrdersController`, `OrderService`, `IOrderRepository`

**API**:
- `GET  /orders/my-cart`
- `POST /orders/add-item`
- `POST /orders/confirm`
- `GET  /orders/admin`
- `GET  /orders/admin/by-gifts`

**Database**: `OrdersDB` (tables: `Orders`, `OrderItems`)

**Reads gift data from**: Catalog Service (via HTTP or cached locally)

**Async events consumed**:
- `GiftDeleted` → remove corresponding order items
- `GiftPriceChanged` → update item prices in draft orders

**Async events published**:
- `OrderConfirmed` — consumed by Lottery Service to register ticket holders

---

### 4. Lottery Service (שירות הגרלה)
**Responsibility**: Run raffles, select winners, generate reports

**Owns these entities**: `Winner`

**Current source**: `LotteryController`, `LotteryService`, `ILotteryRepository`

**API**:
- `POST /lottery/draw/{giftId}`
- `POST /lottery/draw-all`

**Algorithm**: Weighted random selection — a user with N tickets has N times the probability of winning compared to a user with 1 ticket.

**Database**: `LotteryDB` (tables: `Winners`)

**Reads from**: Order Service (to build the ticket pool per gift)

**Emits after draw**:
- Writes `Winners.csv` and `Revenue.csv` to shared storage (or object storage like MinIO/Azure Blob)
- Publishes `WinnerSelected` event → consumed by Notification Service

---

### 5. Notification Service (שירות התראות)
**Responsibility**: Send emails to lottery winners

**Current source**: `IEmailSender`, `SmtpEmailSender` (currently embedded in `LotteryService`)

**API**: Internal only — no public HTTP endpoints

**Consumes events**:
- `WinnerSelected` → sends winner notification email via SMTP

**Config**: Gmail SMTP credentials from environment variables

**Why separate?**: Email sending is slow and can fail. Decoupling it lets the lottery draw complete instantly, with emails sent asynchronously and retried on failure.

---

### 6. AI Service (שירות AI)
**Responsibility**: AI chatbot (GPT-4o-mini) for gift recommendations

**Current source**: `AiController`, `AiService` / `OpenAiService`

**API**:
- `POST /ai/ask`

**Database**: Stateless — no database

**Reads from**: Catalog Service (to include current gift list in the GPT context)

**Why separate?**: OpenAI calls can be slow and expensive. This service can be scaled independently, rate-limited separately, or swapped for a different AI provider without touching the rest of the system.

---

## Communication Patterns

| Type              | When to use                                          | Technology     |
|-------------------|------------------------------------------------------|----------------|
| Synchronous HTTP  | User is waiting for a response (reads, user actions) | REST / gRPC    |
| Async messaging   | Fire-and-forget, event propagation, retries needed   | Redis Streams or RabbitMQ |

### Synchronous calls (HTTP):
- API Gateway → any service
- AI Service → Catalog Service (get gift list)
- Order Service → Catalog Service (verify gift exists, get price)

### Async events (message bus):
- Order Service → Lottery Service: `OrderConfirmed`
- Lottery Service → Notification Service: `WinnerSelected`
- Catalog Service → Order Service: `GiftDeleted`, `GiftPriceChanged`

---

## Infrastructure

### API Gateway
A single entry point for all client requests. Responsibilities:
- Route requests to the correct microservice
- Validate JWT tokens (so individual services don't need to)
- Apply rate limiting globally
- CORS

Options: **YARP** (Yet Another Reverse Proxy — built-in .NET), Nginx, or Kong.

### Service Discovery
Each service registers itself. The gateway looks up service addresses dynamically.
Options: Consul, or Kubernetes DNS if running in K8s.

### Containerization
Each service gets its own `Dockerfile` and is orchestrated with Docker Compose (development) or Kubernetes (production).

```
services:
  identity-service:    port 5001
  catalog-service:     port 5002
  order-service:       port 5003
  lottery-service:     port 5004
  notification-service: port 5005
  ai-service:          port 5006
  api-gateway:         port 80 / 443
  redis:               port 6379
  sql-server:          port 1433
```

---

## Database Strategy

| Service              | Database         | Notes                              |
|----------------------|------------------|------------------------------------|
| Identity Service     | IdentityDB       | Users table only                   |
| Catalog Service      | CatalogDB        | Gifts, Categories, Donors          |
| Order Service        | OrdersDB         | Orders, OrderItems                 |
| Lottery Service      | LotteryDB        | Winners                            |
| Notification Service | —                | Stateless, no DB                   |
| AI Service           | —                | Stateless, no DB                   |

Each service owns its own database schema. **Cross-service joins are forbidden** — if Service A needs data from Service B, it must call Service B's API or subscribe to its events.

---

## Migration Path (Monolith → Microservices)

The recommended "Strangler Fig" approach — extract one service at a time without a big-bang rewrite:

1. **Phase 1** — Extract Identity Service (lowest coupling, clear boundary)
2. **Phase 2** — Extract Notification Service (already nearly independent via `IEmailSender`)
3. **Phase 3** — Extract AI Service (stateless, easy to isolate)
4. **Phase 4** — Extract Catalog Service (most data, but no event dependencies yet)
5. **Phase 5** — Extract Order Service (depends on Catalog events)
6. **Phase 6** — Extract Lottery Service (last — depends on Order data)

At each phase: the monolith continues running, the new service is added alongside it, and the monolith routes one endpoint at a time to the new service via the API gateway.

---

## What Stays the Same

- JWT format and claims — all services validate the same token structure
- DTO shapes — public-facing API contracts should not change during extraction
- Angular frontend — the API Gateway maintains the same URL structure the frontend already uses
- Business logic — the lottery algorithm, order flow, and auth rules move as-is into their new homes
