---
sidebar_position: 6
---

# Optimizing Entra Graph API Requests in ASP.NET

This paper highlights how I was able to significantly improve **Entra Graph API performance** and allow **efficient automation of identity administration**.

---

## 🚩 Challenge

- **Redundant requests**: I was fetching user objects multiple times while traversing group membership.
- **Race conditions**: Multi-threaded user retrieval caused occasional failures.
- **Graph throttling**: The API enforces a limit of 15 users per bulk request, so naïve batching led to errors and retries.

---

## ⚡ Solution

I introduced three main improvements:

### 1. Hash Map for User ↔ Role

Instead of fetching user objects repeatedly for each role group, I **parallelized group membership fetching** but stored results in a **dictionary** mapping `UserId → Role`.

```cs
// Build dictionary UserId → Role (single role only)
Dictionary<string, string> roleMap = userRoles
    .GroupBy(m => m.UserId)
    .ToDictionary(
        g => g.Key,
        g => g.First().Role
    );
```

---

### 2. Batch Processing to Avoid Throttling

The Graph API has a **hard 15-user batch limit**. To handle this, I processed user IDs in **chunks of 15**, calling the bulk endpoint only once per batch.

```csharp
// Process in batches of 15
for (int i = 0; i < userIds.Count; i += 15)
{
    List<string> batch = userIds.Skip(i).Take(15).ToList();

    // Bulk fetch all users by IDs
    string ids = string.Join(",", batch.Select(id => $"'{id}'"));
    Result<UserCollectionResponse> usersResponse =
        await _graphRepository.GetAllUsersInfo15Max(ids);

    // ...
}
```

---

### 3. Safe Parallelization + Race Condition Fix

Users are projected **in parallel** while avoiding shared state mutation. Instead of threads colliding, each batch aggregates safely, and results are flattened only after completion:

```csharp
IEnumerable<Task<UserInfo>> tasks = usersResponse.Value.Value.Select(
    async user =>
    {
        string role = roleMap.ContainsKey(user.Id) ? roleMap[user.Id] : string.Empty;
        string roleValue = MapRole(role);

        return new UserInfo
        {
            UserId = user.Id,
            Email = user.Mail ?? user.UserPrincipalName,
            FirstName = user.GivenName,
            LastName = user.Surname,
            Institution = user.CompanyName,
            Role = roleValue
        };
    });

UserInfo[] results = await Task.WhenAll(tasks);
allUsers.AddRange(results);
```

---

## 🏆 Results

- **Much faster user fetching**: No more redundant Graph calls.
- **Stable concurrency**: Race condition eliminated when parallelizing.
- **Resilient against throttling**: Clean batch processing aligned with Graph’s 15-user cap.

This enables **efficient automation of identity administration** in our ASP.NET applications, with Graph queries optimized for both speed and reliability.

---

## 📚 Key Takeaways

- Always **cache intermediate mappings** (like User → Role) before making downstream calls.
- Know your **API limits** (Graph’s 15-user bulk request) and design batching around them.
- Use **parallelization carefully**: isolate work per task and merge only at the end to avoid race conditions.

---
