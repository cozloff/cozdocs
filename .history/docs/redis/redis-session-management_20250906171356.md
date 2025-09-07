---
sidebar_position: 8
---

# MSAL Node + Redis — Token Cache & Session Management

This paper highlights how I used **MSAL Node with certificate-based authentication** and a **Redis-backed token cache** to provide a secure, scalable, and reliable solution for **multi-tenant authentication and session management**.

It also demonstrates why **Redis caching for MSAL** is critical in a **distributed container apps environment**, enabling consistent user sessions across replicas.

---

## 🚩 Challenge

Authentication with Microsoft Entra can get complicated at scale:

- **Tenant switching**: Different tenants require different authorities.
- **Session persistence**: In a containerized environment, ephemeral pods lose session state without a shared cache.
- **Operations visibility**: Debugging live sessions across containers is nearly impossible without a centralized view.

**Solution:** build a **Redis-backed token cache layer for MSAL** to unify session persistence, security, and visibility.

---

## ⚡ Solution

Week 9/6/2025, I introduced the following improvements:

### 1. Confidential Client with Certificate Auth

I use **MSAL Node’s ConfidentialClientApplication** with certificates pulled from **Azure Key Vault**, ensuring secure client credential flow.

This is still **OIDC-compliant** (using OAuth2/OpenID Connect under the hood) — MSAL abstracts the complexity and handles silent refreshes, authority validation, and multi-tenant login.

```ts
  const cca = new msal.ConfidentialClientApplication({
    auth: {
      clientId,
      authority: tenantAuthority,
      clientCertificate: { thumbprint, privateKey },
      knownAuthorities: [new URL(tenantAuthority).hostname], // force trust for CIAM
    },
    cache: { cachePlugin: makeRedisCachePlugin(tenantKey) },
    system: {
        [ Confidential ]
      },
    },
  });

  ccaInstances[tenantKey] = cca;
  return cca;
};
```

---

### 2. Redis Token Cache Plugin

A **custom Redis cache plugin** stores access tokens (AT) and refresh tokens (RT).  
Each tenant has its own cache key (`msal-cache:tenantId`), isolating tokens per tenant for security.

```ts
export const makeRedisCachePlugin = (tenantKey: string): ICachePlugin => ({
  beforeCacheAccess: async (ctx) => {
    const key = cacheKey(tenantKey);
    const data = await redis.get(key); // Get by cache key
    if (data) {
      ctx.tokenCache.deserialize(data); // Deserialize the session
    }
  },
  afterCacheAccess: async (ctx) => {
    if (!ctx.cacheHasChanged) return;
    const serialized = ctx.tokenCache.serialize(); // Serialie the cache

    // Parsing and validation steps here . . .

    // key (authority-user) - value (serialized session)
    await redis.set(cacheKey(tenantKey), serialized);
  },
});
```

Benefits:

- **Security**: Refresh tokens never leave Redis.
- **Simplicity**: MSAL automatically handles silent refresh using cached RTs.
- **Speed**: Redis read/write operations are extremely fast, even under load.
- **Session management**: All user sessions are centralized, visible in **RedisInsight UI**.

---

### 3. Smarter Refresh Strategy

Instead of refreshing tokens on every request, I only refresh **when the access token is expired**, using the RT as a buffer.  
This reduces unnecessary calls and provides a natural logout mechanism when RTs are gone.

```ts
if (jwt && isTokenExpiring(jwt, 0)) {
  const result = await refreshAccessToken(
    session.get("tenantId") as string,
    account.homeAccountId,
    [`${session.get("audience")}/User.Read`]
  );
  if (result?.accessToken) {
    session.set("jwtToken", result.accessToken);
  }
}
```

---

## 🏆 Results

:::tip Operational Gain
**With Redis + MSAL:**

- Secure token lifecycle
- Stable user sessions across container replicas
- Real-time session visibility in RedisInsight
- Faster, simpler, and safer than in-memory caching
  :::

- **Security**: Tokens isolated per tenant; refresh tokens stored only in Redis.
- **Simplicity**: Centralized session logic removes complexity from app code.
- **Speed**: Sub-millisecond Redis access accelerates silent refresh.
- **Session Management**: RedisInsight UI lets ops/debug teams inspect active sessions directly.

---

## 📚 Key Takeaways

**Build on Entra with MSAL, don’t re-invent OAuth.**  
The **OIDC flows are handled by MSAL**, freeing us to focus on higher-level session logic.

**Redis is the best fit**: secure, simple, fast, and observable.

**Optimize once, reuse everywhere.**  
**Token caching and session persistence** should live in a **shared cache layer**, not in every container instance.

---

:::info Other Contributors

- **Minh Phan** — Suggested smarter token refresh strategy (using RT as a buffer).
- **You** — Architected Redis integration into Terraform, isolated caches per client for stronger security.  
  :::
