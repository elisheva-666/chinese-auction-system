---
applyTo: "**/Repositories/**"
---

# Repositories — Chinese Auction System

This file is loaded when working on repository code. Repositories are in `chinese-auction-api/ChineseAuction.Api/Repositories/`.

Each repository has an **interface** (e.g. `IGiftRepository`) and an **implementation** (e.g. `GiftRepository`). All implementations inject `AppDbContext` and use EF Core for data access. All methods are `async`.

Repositories are registered as **Scoped** in `Program.cs`:
```csharp
builder.Services.AddScoped<IGiftRepository, GiftRepository>();
// etc.
```

---

## 1. IGiftRepository / GiftRepository

Handles all database operations for the `Gift` entity.

```csharp
public interface IGiftRepository
{
    Task<IEnumerable<Gift>> GetAllAsync();
    Task<IEnumerable<Gift>> GetAllWithDetailsAsync();       // includes Category + Donor
    Task<IEnumerable<Gift>> GetAllSortedByPriceAsync(bool ascending);
    Task<IEnumerable<Gift>> GetAllSortedByCategoryAsync();
    Task<IEnumerable<Gift>> SearchGiftsInternalAsync(string? name, string? donor, int? minPurchasers);
    Task<Gift?> GetByIdAsync(int id);
    Task<Gift?> GetByIdWithDetailsAsync(int id);            // includes Category + Donor
    Task<Gift> AddAsync(Gift gift);
    Task<Gift> UpdateAsync(Gift gift);
    Task DeleteAsync(int id);
    Task<bool> DonorExistsAsync(int donorId);
    Task<bool> ExistsAsync(int id);
}
```

**Key implementation details:**
- `GetAllWithDetailsAsync` uses `.Include(g => g.Category).Include(g => g.Donor)` to eagerly load navigation properties.
- `GetAllSortedByPriceAsync(ascending)` uses `.OrderBy` / `.OrderByDescending` on `TicketPrice`.
- `GetAllSortedByCategoryAsync` groups/orders by `Category.Name`.
- `SearchGiftsInternalAsync` builds a dynamic LINQ query — filters are applied conditionally (null = skip that filter).
- `DonorExistsAsync(donorId)` is called by `GiftService` before adding a gift to a donor.

---

## 2. ICategoryRepository / CategoryRepository

```csharp
public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(int id);
    Task<Category?> GetByNameAsync(string name);
    Task<Category> AddAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
```

`GetByNameAsync` is used to prevent duplicate category names.

---

## 3. IDonorRepository / DonorRepository

```csharp
public interface IDonorRepository
{
    Task<IEnumerable<Donor>> GetAllAsync();
    Task<Donor?> GetByIdAsync(int id);
    Task<Donor?> GetByEmailAsync(string email);
    Task<Donor> AddAsync(Donor donor);
    Task<Donor> UpdateAsync(Donor donor);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
```

`GetByEmailAsync` is available for duplicate detection, though currently donors may share emails (the `Email` column is not unique in the schema).

---

## 4. IUserRepository / UserRepository

```csharp
public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> AddAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> ExistsAsync(int id);
}
```

**Key details:**
- `GetByEmailAsync` is the primary lookup for authentication — called by `AuthService.LoginAsync`.
- Passwords are stored as bcrypt hashes. Password verification is done in `AuthService`, not in the repository.
- `User.Role` is stored as an enum (`Admin` | `Purchaser`) and mapped to an int column.

---

## 5. IOrderRepository / OrderRepository

```csharp
public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetAllAsync();
    Task<IEnumerable<Order>> GetAllWithDetailsAsync();      // includes User + OrderItems + Gifts
    Task<Order?> GetByIdAsync(int id);
    Task<Order?> GetByIdWithDetailsAsync(int id);
    Task<Order?> GetLatestDraftOrderAsync(int userId);      // current shopping cart
    Task<IEnumerable<Order>> GetConfirmedOrdersAsync();
    Task<IEnumerable<OrderItem>> GetByGiftIdAsync(int giftId); // all purchases for a gift
    Task<Order> AddAsync(Order order);
    Task<Order> UpdateAsync(Order order);
}
```

**Key details:**
- `GetLatestDraftOrderAsync(userId)` returns the most recent `IsDraft` order for a user. This is the "shopping cart". If none exists, `OrderService` creates one.
- `GetByGiftIdAsync(giftId)` is used by `LotteryService` to build the weighted ticket pool for a gift's draw.
- `GetConfirmedOrdersAsync` filters by `Status == OrderStatus.IsConfirmed`.

---

## 6. ILotteryRepository / LotteryRepository

```csharp
public interface ILotteryRepository
{
    Task<Winner?> GetWinnerByGiftIdAsync(int giftId);
    Task<Winner> SaveWinnerAsync(Winner winner);
    Task<decimal> GetTotalRevenueAsync();
    Task<bool> GiftAlreadyDrawnAsync(int giftId);
}
```

**Key details:**
- `SaveWinnerAsync` inserts a `Winner` record. `Winner.GiftId` has a unique constraint, so a gift can only be drawn once.
- `GiftAlreadyDrawnAsync(giftId)` is checked before running a draw to prevent redrawing.
- `GetTotalRevenueAsync` sums all `Order.TotalAmount` for confirmed orders — used in the revenue CSV report.

---

## AppDbContext

**File**: `Data/AppDbContext.cs`

```csharp
public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Donor> Donors { get; set; }
    public DbSet<Gift> Gifts { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Winner> Winners { get; set; }
}
```

Entity configurations (value constraints, unique indexes, etc.) are defined in `OnModelCreating` using the Fluent API.

---

## Patterns & Conventions

**Always use async/await:**
```csharp
// Correct
public async Task<Gift?> GetByIdAsync(int id)
    => await _context.Gifts.FindAsync(id);

// Wrong — never block on async
public Gift? GetById(int id)
    => _context.Gifts.Find(id);
```

**Eager loading vs lazy loading:** This project uses explicit `.Include()` — lazy loading is disabled. Only load navigation properties when the calling service actually needs them (check what the service uses before adding `.Include()`).

**No business logic in repositories.** If you find yourself writing an `if` statement based on a domain rule, move that logic to the service layer and let the repository execute a simple query.

**SaveChanges:** Each repository method calls `await _context.SaveChangesAsync()` after mutations. Do not call it in the service — only once per unit of work at the repository level.

---

## Adding a New Repository

1. Create `Repositories/IXxxRepository.cs` (interface)
2. Create `Repositories/XxxRepository.cs` (implementation)
   - Constructor: `public XxxRepository(AppDbContext context) => _context = context;`
3. Register in `Program.cs`:
   ```csharp
   builder.Services.AddScoped<IXxxRepository, XxxRepository>();
   ```
4. Inject `IXxxRepository` into the corresponding service — never the concrete class.
