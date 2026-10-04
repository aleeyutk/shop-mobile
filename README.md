# NovaShop Mobile — HNG 15 Lesson 3 Companion App

A modern, high-performance mobile application for **NovaShop** built with **React Native (Expo SDK 57)** and **TypeScript**, engineered for seamless real-time cart synchronisation with the live web storefront.

- **Live Web Storefront:** [https://hng15-shop-aleeyu.fly.dev/](https://hng15-shop-aleeyu.fly.dev/)
- **Live Backend API:** [https://hng15-shop-aleeyu.fly.dev/api/health](https://hng15-shop-aleeyu.fly.dev/api/health)
- **GitHub Repository:** [https://github.com/aleeyutk/shop-mobile](https://github.com/aleeyutk/shop-mobile)
- **Author:** Aliyu Tukur (`@Haidara`)

---

## 🚀 Key Features

1. **Shared Authentication:**
   - Sign in using the same user account on both the web storefront and the mobile companion app.
   - Built-in **1-Click Demo Login** (`alex.rivera@example.com` / Alex Rivera) matching the web storefront demo user.
   - Supports custom email login and Bearer token persistence via `@react-native-async-storage/async-storage`.

2. **Real-time Bidirectional Cart Synchronisation:**
   - Adding an item to the cart on the website reflects **instantly** in the mobile app.
   - Adjusting quantities (+/-) or removing items on the mobile app updates the web storefront in real time.
   - 2-second background polling cycle + instant synchronization on app focus / foregrounding.
   - Clear visual status banner indicating connection health and last sync timestamp.

3. **Product Catalog & Details:**
   - Full catalog synced directly from PostgreSQL database (14 curated tech products).
   - Category filtering (Electronics, Audio, Apparel, Home & Living, Fitness, etc.).
   - Instant search by title and description.
   - Stock level badges, customer ratings, reviews count, and high-resolution product imagery.

4. **Synchronized Checkout & Orders History:**
   - Seamless multi-item order placement with simulated credit card payment (`VISA •••• 4242`).
   - Automated server-side cart clearing upon order completion.
   - Orders list showing receipt IDs, timestamps, delivery address, and line-item breakdown.

5. **Dynamic Backend Configuration:**
   - Defaults out-of-the-box to the live Fly.io deployment (`https://hng15-shop-aleeyu.fly.dev`).
   - Configurable in the **Profile** tab for testing against local development servers (`http://<LAN-IP>:8000`).

---

## 📱 How to Run on a Physical Phone

### Prerequisites
1. Install **Expo Go** from Google Play Store (Android) or App Store (iOS) on your physical smartphone.
2. Ensure your computer and smartphone are connected to the internet (since the backend runs on Fly.io HTTPS, LAN bridging is not required).

### Steps
1. Navigate to the `shop-mobile` directory:
   ```bash
   cd /home/haidara/Desktop/HNG/hng15/shop-mobile
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Open the **Expo Go** app on your phone:
   - **Android:** Scan the QR code displayed in the terminal.
   - **iOS:** Open the native Camera app and scan the QR code to launch in Expo Go.

4. **Verify Real-Time Synchronization:**
   - On your laptop browser, visit [https://hng15-shop-aleeyu.fly.dev/](https://hng15-shop-aleeyu.fly.dev/).
   - Click **Demo** in the top navigation bar to log in as **Alex Rivera**.
   - On the mobile app, tap **1-Click Demo Login** (Alex Rivera).
   - On the web storefront, click **Add** on any product (e.g. *Aura Pro Wireless ANC Headphones*).
   - Look at your phone: the item and badge count **instantly appear** in your mobile cart!
   - Increase or decrease quantity on your phone: watch the website update automatically.

---

## 🛠 Tech Stack

- **Framework:** React Native / Expo (SDK 57)
- **Language:** TypeScript
- **Navigation:** React Navigation (Native Stack + Bottom Tabs)
- **State Management:** React Context API (`AuthContext`, `CartContext`)
- **Storage:** `@react-native-async-storage/async-storage`
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Backend API:** FastAPI + SQLAlchemy + PostgreSQL (Fly.io)
