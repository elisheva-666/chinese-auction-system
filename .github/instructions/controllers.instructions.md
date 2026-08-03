---
applyTo: "**/Controllers/**"
---

# Controllers — Chinese Auction System

This file is loaded when working on controller code. Controllers are in `chinese-auction-api/ChineseAuction.Api/Controllers/`.

All controllers follow the same pattern:
- `[ApiController]` + `[Route("api/[controller]")]`
- Constructor injects the corresponding service interface
- No business logic — delegate everything to the service layer
- Return `ActionResult<T>` or `IActionResult`

---

## 1. AuthController

**File**: `Controllers/AuthController.cs`
**Service**: `IAuthService`
**Auth**: No `[Authorize]` — public endpoints

| Method | Route                    | Body / Params     | Returns              |
|--------|--------------------------|-------------------|----------------------|
| POST   | `/api/auth/register`     | `RegisterDto`     | `AuthResponseDto`    |
| POST   | `/api/auth/login`        | `LoginRequestDto` | `AuthResponseDto`    |
| POST   | `/api/auth/logout`       | —                 | 200 OK               |

`AuthResponseDto` contains the JWT token, user name, and role.

---

## 2. GiftController

**File**: `Controllers/GiftController.cs`
**Service**: `IGiftService`
**Auth**: Mixed — public GET, `[Authorize(Roles="Admin")]` for write operations

| Method | Route                                       | Body / Params                        | Returns                   | Auth         |
|--------|---------------------------------------------|--------------------------------------|---------------------------|--------------|
| GET    | `/api/gift`                                 | —                                    | `List<GiftDetailDto>`     | Public       |
| GET    | `/api/gift/sort-by-price?ascending=true`    | `ascending` (bool query)             | `List<GiftDetailDto>`     | Public       |
| GET    | `/api/gift/sort-by-category`               | —                                    | `List<GiftDetailDto>`     | Public       |
| GET    | `/api/gift/{id}`                            | `id` (int route)                     | `GiftDetailDto`           | Public       |
| GET    | `/api/gift/admin`                           | —                                    | `List<GiftAdminDto>`      | Admin        |
| GET    | `/api/gift/admin/search`                    | `name`, `donor`, `minPurchasers` (query) | `List<GiftAdminDto>`  | Admin        |
| POST   | `/api/gift/admin/add-to-donor/{donorId}`   | `GiftCreateUpdateDto` (multipart)    | `GiftDetailDto`           | Admin        |
| PUT    | `/api/gift/{id}`                            | `GiftCreateUpdateDto` (multipart)    | `GiftDetailDto`           | Admin        |
| DELETE | `/api/gift/{id}`                            | `id` (int route)                     | 204 No Content            | Admin        |

`GiftCreateUpdateDto` is sent as `multipart/form-data` because it includes an optional `IFormFile ImageFile`.

---

## 3. CategoryController

**File**: `Controllers/CategoryController.cs`
**Service**: `ICategoryService`
**Auth**: Public GET, `[Authorize(Roles="Admin")]` for write

| Method | Route                    | Body / Params   | Returns              |
|--------|--------------------------|-----------------|----------------------|
| GET    | `/api/category`          | —               | `List<CategoryDto>`  |
| GET    | `/api/category/{id}`     | `id` (int)      | `CategoryDto`        |
| POST   | `/api/category`          | `CategoryDto`   | `CategoryDto`        |
| PUT    | `/api/category/{id}`     | `CategoryDto`   | `CategoryDto`        |
| DELETE | `/api/category/{id}`     | `id` (int)      | 204 No Content       |

---

## 4. DonorController

**File**: `Controllers/DonorController.cs`
**Service**: `IDonorService`
**Auth**: `[Authorize(Roles="Admin")]` for all endpoints

| Method | Route                    | Body / Params   | Returns              |
|--------|--------------------------|-----------------|----------------------|
| GET    | `/api/donor`             | —               | `List<DonorDto>`     |
| GET    | `/api/donor/{id}`        | `id` (int)      | `DonorDto`           |
| POST   | `/api/donor`             | `DonorDto`      | `DonorDto`           |
| PUT    | `/api/donor/{id}`        | `DonorDto`      | `DonorDto`           |
| DELETE | `/api/donor/{id}`        | `id` (int)      | 204 No Content       |

---

## 5. OrdersController

**File**: `Controllers/OrdersController.cs`
**Service**: `IOrderService`
**Auth**: `[Authorize]` for user routes, `[Authorize(Roles="Admin")]` for admin routes

| Method | Route                             | Body / Params       | Returns                     | Auth  |
|--------|-----------------------------------|---------------------|-----------------------------|-------|
| GET    | `/api/orders/my-cart`             | —                   | `OrderResponseDto`          | User  |
| POST   | `/api/orders/add-item`            | `OrderCreateDto`    | `OrderResponseDto`          | User  |
| POST   | `/api/orders/confirm`             | —                   | `OrderResponseDto`          | User  |
| GET    | `/api/orders/admin`               | —                   | `List<OrderResponseDto>`    | Admin |
| GET    | `/api/orders/admin/by-gifts`      | —                   | `List<GiftPurchasesDto>`    | Admin |

`UserId` is extracted from the JWT token inside the controller (`User.FindFirst(ClaimTypes.NameIdentifier)`).

---

## 6. LotteryController

**File**: `Controllers/LotteryController.cs`
**Service**: `ILotteryService`
**Auth**: `[Authorize(Roles="Admin")]`

| Method | Route                         | Body / Params   | Returns              |
|--------|-------------------------------|-----------------|----------------------|
| POST   | `/api/lottery/draw/{giftId}`  | `giftId` (int)  | `WinnerResultDto`    |
| POST   | `/api/lottery/draw-all`       | —               | `List<WinnerResultDto>` |

`draw-all` runs the full lottery: draws all gifts, saves results, generates CSV reports in `/Reports/`, and sends winner notification emails.

---

## 7. UsersController

**File**: `Controllers/UsersController.cs`
**Service**: `IUserService`
**Auth**: `[Authorize]`

| Method | Route               | Body / Params   | Returns    |
|--------|---------------------|-----------------|------------|
| GET    | `/api/users/me`     | —               | User info  |
| PUT    | `/api/users/me`     | User update DTO | Updated    |

---

## 8. AiController

**File**: `Controllers/AiController.cs`
**Service**: `IAiService` / `OpenAiService`
**Auth**: `[Authorize]`

| Method | Route           | Body             | Returns            |
|--------|-----------------|------------------|--------------------|
| POST   | `/api/ai/ask`   | `ChatRequestDto` | `ChatResponseDto`  |

The service sends a Hebrew system prompt to GPT-4o-mini, including the current gift list as context so the AI can give personalized recommendations.

---

## Error Handling

All unhandled exceptions are caught by `ExceptionMiddleware` which returns:
```json
{ "statusCode": 500, "message": "An unexpected error occurred." }
```

Controllers should throw exceptions and let the middleware handle them rather than catching and returning error responses manually.

---

## Adding a New Controller

1. Create `Controllers/XxxController.cs`
2. Inject `IXxxService` via constructor
3. Add `[ApiController]` and `[Route("api/[controller]")]`
4. Register `IXxxService` / `XxxService` as Scoped in `Program.cs`
5. All logic goes in the Service, not the Controller
