# Subscription Strategy & Implementation Plan

## 1. Business Strategy & Pricing Model

**The Vision**
Building a highly profitable, scalable app requires a delicate balance between user acquisition and monetization. The transition to a "Millionaire Company" mindset means focusing on **LTV (Life Time Value)** and **MRR (Monthly Recurring Revenue)**.

**Pricing: $4/month**
*   **Highly Competitive & Accessible:** $4/month (or equivalent like $3.99) is an impulse-buy price point. It's cheaper than a cup of coffee. The friction to subscribe is incredibly low.
*   **Psychological Advantage:** For niche spaces like religious/spiritual apps or habit trackers, users are highly loyal if the core value is delivered. $4 doesn't demand overthinking, which will lead to a higher conversion rate.
*   *Recommended Upsell:* Always offer a yearly plan (e.g., $39.99/year), which gives them a small discount but secures cash flow upfront and drastically improves retention metrics.

**The 7-Day Free Trial (Urgency & Habit)**
*   **Industry Standard:** 15 or 10 days is too long and diffuses urgency. The data from millionaire tech companies (Headspace, Calm, Duolingo) proves that **7 days** is the ultimate sweet spot. It creates an immediate sense of urgency while giving just enough time to experience the core value.
*   **Lock-in Effect:** By day 7, the user has customized their app, saved their favorites, read several chapters, and has personal writings. The "cost of leaving" is higher than the $4 to stay.
*   **Early Conversion:** We will place an "Upgrade Now" banner in the Settings/Profile so convinced users don't have to wait 7 days to give us their money.

## 2. Feature Gating (The "Hard Paywall" Strategy)

We have chosen **Option A: The Hard Paywall**.
*   **Days 1-7:** Full VIP access. The user gets addicted to the premium experience (AI, offline, audio).
*   **Day 8 onwards:** The app locks down completely upon opening. They are presented with a highly polished, un-skippable paywall. This drastically increases conversion rates because the user *must* make a decision. No free-riding allowed.

## 3. Technical Architecture & Decisions

To handle subscriptions professionally, securely, and scale to millions of users without reinventing the wheel with Apple/Google billing APIs:

**Primary Tool: RevenueCat**
*   **Why RevenueCat?** It is the industry standard for React Native / Expo apps. It abstracts away the massive headaches of dealing with Apple's StoreKit and Google Play Billing. It provides a single API to know if a user `isPro`.
*   **Backend Validation:** RevenueCat uses webhooks to notify our Spring Boot backend when a user pays, cancels, or successfully renews.

**Database Changes (Spring Boot Backend)**
We need to update our `users` table to track subscription status:
*   `trial_start_date` (TIMESTAMP)
*   `is_premium` (BOOLEAN)
*   `subscription_end_date` (TIMESTAMP)
*   `stripe_customer_id` OR `revenuecat_user_id` (VARCHAR)

## 4. Implementation Roadmap

### Phase 1: Infrastructure & Backend
1. **RevenueCat Setup:** Create projects in Apple App Store Connect and Google Play Console. Link them to a new RevenueCat account.
2. **Database Migration:** Add the subscription fields to the `users` table via a new Flyway migration.
3. **Backend API Logic:** 
    *   Update the `/auth/me` endpoint to return the user's trial status (days remaining) and premium status.
    *   Implement RevenueCat Webhooks in Spring Boot to automatically update `is_premium` when a payment succeeds.

### Phase 2: Frontend Setup (Expo cross-platform)
1. **Install SDK:** `react-native-purchases` (RevenueCat SDK). This handles BOTH Apple App Store and Google Play Store automatically.
2. **Subscription Context:** Create a `SubscriptionContext.tsx` that wraps the app and constantly knows if the user is in the trial, premium, or expired.
3. **Paywall UI Design:** Design a premium, highly-converting Paywall screen that shows the benefits of the app, the 7-day trial, and the $4/mo price.
4. **Settings Hub:** The golden button will trigger the Native Payment Sheet (Apple Pay or Google Pay) depending on the phone.

## 4. How Cancellations & Billing Actually Work (For the User & CEO)

No tienes que programar un sistema complejo de "gestión de tarjetas de crédito" o un "botón para cancelar cuenta bancaria". Como es una aplicación móvil, Apple y Google asumen el 100% de esa responsabilidad:

1. **Cuando pulsan el botón dorado:** Surge el popup nativo de su teléfono (Apple FaceID o el popup verde de Google Play). Ellos aceptan con doble clic lateral.
2. **Apple/Google retienen el dinero:** Una vez cobran, se quedan su comisión (el 15% o 30%) y el resto del dinero te lo guardan a ti en tu cuenta de desarrollador, pagándote mensualmente.
3. **¿Cómo se cancela?:** En absolutamente todas las apps móviles nativas, el usuario NO cancela desde dentro de tu app. Tienen que ir a los ajustes de su propio iPhone (`Ajustes > ID de Apple > Suscripciones`) o a la app de la `Google Play Store > Pagos y suscripciones`. Allí ven tu app de la Biblia Católica y le dan a "Cancelar suscripción". 
4. **¿Cómo nos enteramos nosotros si cancelan?:** Aquí es donde hace magia **RevenueCat**. RevenueCat está conectado a los cerebros de Apple y Google. Si un usuario de Andoid o iOS decide cancelar su suscripción hoy, RevenueCat se entera en milisegundos y nos manda una notificación silenciosa a nuestro Backend (Spring Boot). Automáticamente, nuestro backend le pone a ese usuario `is_premium = false` en la base de datos para que al día siguiente la app se le vuelva a bloquear. ¡Nosotros no hacemos nada manual!

## 5. Next Steps for Us
1. **Onboarding:** When the user registers, start the 7-day trial and show a celebratory modal: "Welcome! Your 7-day full VIP access starts now."
2. **Early Upgrade Hook:** Add a premium, golden "Upgrade to VIP" button in the Settings tab.
3. **Trial Reminders:** Show subtle banners in the home screen: "3 days left in trial" -> "1 day left".
4. **The Lock-out:** If day 8 is reached and `is_premium` is false, present the hard paywall on app startup. No bypass.

## 5. Frontend UI/UX Strategy (The "Millionaire Company" Look)

Para vender un software de forma pasiva a escala masiva, la presencia de la marca "Premium" debe ser elegante, nada invasiva, pero omnipresente.

1. **La Corona/Estrella VIP Permanente (Header):**
   En la navegación principal o en la cabecera (Header) de la aplicación, implementaremos un pequeño icono brillante (una coronita 👑 o un diamante 💎 dorado). Al pulsarlo en cualquier momento, se despliega instantáneamente el Muro de Pago. Esta es la técnica principal de apps como Tinder, Duolingo o Chess.com.
2. **La Tarjeta "Black/Gold" en el Perfil:**
   En la pantalla de Perfil (`AccountScreen`), no pondremos "un botón simple". Colocaremos una tarjeta gráfica (como una tarjeta de crédito negra u oro) en la parte superior que diga *"Bible VIP - Desbloquea tu potencial espiritual"*. 
3. **El Banner Sutil de Conteo (Trial):**
   Mientras estén en sus 7 días de prueba, verán un pequeño listón en inicio que dice: *"6 días restantes de tu prueba VIP"*. Genera aversión a la pérdida sin ser tóxico.
4. **El Paywall Inmersivo (La gran pantalla de ventas):**
   El Muro de Pago no será un popup cutre. Será una vista completa (Modal Full-Screen) muy premium (fondos oscuros o blancos prístinos con degradados dorados). Tendrá:
   - Los 3 principales beneficios con iconos (IA, Offline, Audio).
   - Dos opciones de precios: **Mensual** ($4.99/mo) y **Anual** ($39.99/year - *Destacada como "Best Value"*).
   - Un botón gigante inferior para confirmar con Apple/Google Pay.

## 6. Next Steps for Us
1. Preparar la migración de la base de datos Backend para soportar los campos del trial de 7 días.
2. Preparar el código en Spring Boot (Backend) para crear endpoints que gestionen validaciones.
3. Crear el diseño Frontend de estas coronas y muros de pago en React Native.
