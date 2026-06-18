# Chinese Auction System — AI Instructions

This document gives an AI assistant (GitHub Copilot, Claude, etc.) the context needed to help develop this project. For detailed information on specific layers, see the linked files below.

---

## Project Overview

A **Chinese Auction / Raffle System** (מערכת הגרלות) with an e-commerce cart, weighted lottery engine, AI chatbot, and admin dashboard.

- **Backend**: ASP.NET Core 8, C# 12
- **Frontend**: Angular 20 with PrimeNG 20 and Angular Signals
- **Database**: SQL Server (Entity Framework Core 9)
- **Authentication**: JWT Bearer (HS256, 60-minute expiry)
- **Email**: SMTP via Gmail
- **AI Chatbot**: OpenAI GPT-4o-mini
- **Caching**: Redis 7 (Docker)
- **Logging**: Serilog (console + daily rolling file)
- **Mapping**: AutoMapper 12

---

## Folder Structure

```
chinese-auction-system/
├── .github/
│   ├── copilot-instructions.md        ← this file (main overview)
│   ├── instructions/
│   │   ├── repositories.instructions.md   ← repository layer details
│   │   └── controllers.instructions.md    ← API controller details
│   └── microservices-architecture.md  ← future architecture plan
│
├── chinese-auction-web/               ← Angular 20 frontend
│   └── src/app/
│       ├── components/    (Auth, Cart, Chat, Gift, Layout, Manager)
│       ├── pages/         (Home, About)
│       ├── services/      (API communication)
│       ├── models/        (TypeScript interfaces)
│       ├── app.routes.ts
│       └── app.config.ts
│
└── final final api/                   ← ASP.NET Core 8 backend
    └── ChineseAuction.Api/
        ├── Controllers/   (8 REST controllers)
        ├── Services/      (19 service classes)
        ├── Repositories/  (12 repository classes)
        ├── Models/        (7 entity models)
        ├── Dtos/          (9+ DTOs)
        ├── Data/          (AppDbContext + EF migrations)
        ├── Middleware/    (Exception, Logging, RateLimiting)
        ├── Mappings/      (AutoMapper profiles)
        ├── Program.cs
        └── appsettings.json
```

---

## Architecture Pattern

The backend uses a strict 3-layer architecture:

```
Controller → Service → Repository → Database
```

- **Controllers** handle HTTP routing, validation, and authorization only. See [`controllers.instructions.md`](.github/instructions/controllers.instructions.md).
- **Services** contain all business logic. Each domain has an interface (`IXxxService`) and implementation (`XxxService`).
- **Repositories** abstract database access. Each has an interface (`IXxxRepository`) and implementation. See [`repositories.instructions.md`](.github/instructions/repositories.instructions.md).
- **DTOs** are used for all data transfer — entities are never exposed directly.

---

## Database Entities

| Entity      | Key Fields                                              | Relations              |
|-------------|--------------------------------------------------------|------------------------|
| `User`      | Id, Name, Email (unique), PasswordHash, Role enum      | has many Orders        |
| `Category`  | Id, Name (max 50)                                      | has many Gifts         |
| `Donor`     | Id, Name, Email, Phone                                  | has many Gifts         |
| `Gift`      | Id, Name, Description, TicketPrice, ImageUrl, CategoryId, DonorId | has many OrderItems, one Winner |
| `Order`     | Id, OrderDate, Status (IsDraft/IsConfirmed), TotalAmount, UserId | has many OrderItems |
| `OrderItem` | Id, GiftId, OrderId, Quantity (1–1000)                 | belongs to Order + Gift |
| `Winner`    | Id, GiftId (unique), UserId                             | belongs to Gift + User |

`Role` enum: `Admin` | `Purchaser`
`Order.Status` enum: `IsDraft` | `IsConfirmed`

---

## Key Business Logic

### Lottery / Draw Engine (`LotteryService`)
- `DrawForGiftAsync(giftId)` — selects one winner for a single gift.
- `DrawAllAsync()` — draws all gifts, writes `Winners.csv` and `Revenue.csv` to `/Reports/`, then emails every winner.
- **Algorithm**: weighted random selection — a user with 3 tickets has 3× the chance of a user with 1 ticket.

### Shopping Cart Flow
1. User adds items → `Order` created in `IsDraft` status.
2. User confirms → `ConfirmOrderAsync` moves order to `IsConfirmed`.
3. Admin views confirmed orders grouped by gift.

### AI Chatbot (`AiService` / `OpenAiService`)
- Endpoint: `POST /api/ai/ask`
- Uses OpenAI GPT-4o-mini with a Hebrew system prompt.
- Receives list of current gifts as context for recommendations.

---

## Authentication & Authorization

- Registration: `POST /api/auth/register` → returns JWT
- Login: `POST /api/auth/login` → returns JWT
- Token claims: `UserId`, `Email`, `Role`
- Admin routes use `[Authorize(Roles = "Admin")]`
- User routes use `[Authorize]`
- CORS: only `http://localhost:4200` is allowed

---

## Middleware Pipeline (in order)

1. Swagger/SwaggerUI (development only)
2. HTTPS Redirection
3. `ExceptionMiddleware` — structured error responses
4. `RequestLoggingMiddleware` — logs every request
5. `RateLimitingMiddleware` — 100 req/min per IP (HTTP 429 + Retry-After)
6. CORS
7. Authentication + Authorization
8. Static Files (wwwroot)
9. Controller Routes

---

## DTOs Reference

| DTO                    | Purpose                                      |
|------------------------|----------------------------------------------|
| `RegisterDto`          | New user registration                        |
| `LoginRequestDto`      | Login credentials                            |
| `AuthResponseDto`      | JWT token + user info returned on auth       |
| `CategoryDto`          | Category name                                |
| `DonorDto`             | Donor name, email, phone                     |
| `GiftCreateUpdateDto`  | Name, Description, TicketPrice, ImageFile, CategoryId |
| `GiftDetailDto`        | Full gift info including Category + Donor    |
| `GiftAdminDto`         | Admin view: adds DonorEmail, PurchasersCount |
| `GiftPurchasesDto`     | Gift with list of buyers                     |
| `OrderCreateDto`       | GiftId + Quantity                            |
| `OrderResponseDto`     | Order info returned to client                |
| `WinnerResultDto`      | GiftId, GiftName, WinnerUserId, WinnerName, WinnerEmail, TotalTickets, DrawDate |
| `ChatRequestDto`       | User message for AI chat                     |
| `ChatResponseDto`      | AI reply                                     |

---

## Frontend Services (Angular)

| Service              | Responsibility                              |
|----------------------|---------------------------------------------|
| `AuthService`        | Login, register, JWT storage, logout        |
| `GiftService`        | Fetch/CRUD gifts, caching with Signals      |
| `CartService`        | Shopping cart state                         |
| `LotteryService`     | Trigger raffle draws                        |
| `DonorService`       | Manage donors                               |
| `AdminOrderService`  | Admin order viewing                         |

Guards: `authGuard` (authenticated), `adminGuard` (Admin role only).
Interceptor: `authInterceptor` attaches JWT to every request.

---

## Configuration (appsettings.json)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ChineseAuctionDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": { "Key": "...", "Issuer": "ChineseAuction", "Audience": "ChineseAuctionClients", "ExpiryMinutes": 60 },
  "OpenAi": { "ApiKey": "...", "Model": "gpt-4o-mini" },
  "Smtp": { "Host": "smtp.gmail.com", "Port": "587", "Username": "...", "Password": "..." },
  "RateLimiting": { "RequestLimit": 100, "TimeWindowMinutes": 1 }
}
```

> **Security note**: API keys and passwords are currently in `appsettings.json`. In production, use environment variables or Azure Key Vault.

---

## Coding Conventions

- All services and repositories are registered as **Scoped** in DI.
- Always use interfaces (`IXxxService`, `IXxxRepository`) for DI — never concrete types.
- Async/await throughout — all repository and service methods are async.
- Entities are mapped to DTOs via AutoMapper profiles in `/Mappings/`.
- Images are uploaded via `IFileService` and stored in `wwwroot/`.
- Do not add business logic to controllers — keep it in the service layer.
- Hebrew is used in the AI chatbot system prompt and user-facing messages; English for all code identifiers.