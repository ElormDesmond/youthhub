# 🧠 Project Brain & Memory: Global Evangelical Church Youth (Kasoa Branch)

**Last Updated:** 2026-09-02  
**Status:** Airplane Window Theme Controller (Light/Dark), Dynamic Notification Counter & Clean Hero Typography Complete & Verified (Production Ready ✅)  
**Workspace:** `/home/kali/Desktop/churchproject`

---

## ✈️ Airplane Window Theme Controller (Light & Dark Mode)
- **Interactive Component:** [`AirplaneWindowThemeToggle.jsx`](file:///home/kali/Desktop/churchproject/frontend/src/components/AirplaneWindowThemeToggle.jsx)
- **Light Mode (Window Slid Up / Open):**
  - Acrylic airplane cabin window with outer fuselage bezel, molded rim, inner glass bevel, and glare reflection.
  - Panoramic high-altitude view: Vibrant blue sky gradient (`#0284c7` to `#bae6fd`), glowing sun corona, atmospheric haze, and multi-layered fluffy white cumulus clouds drifting with smooth CSS animations.
- **Dark Mode (Window Slid Down / Closed):**
  - Textured sliding window blind with horizontal louvers, molded ergonomic bottom pull handle and finger grip.
  - Deep space night sky with crescent moon, stars, and dark cabin atmosphere.
- **State & Theme Engine:** Persisted in `localStorage`, synchronizing Tailwind `dark` class across the entire application (both Public Website and Executive Hub).

---

## 🔔 Interactive Notification Counter & Read Tracking
- **Dynamic Badge Counter:**
  - Displays unread notifications count on the bell icon.
  - Clicking any notification marks it as read and immediately decrements the counter by 1.
  - Once all notifications are read (`unreadCount === 0`), the badge number disappears completely from the icon.
  - Includes a "Mark all as read" 1-click action and persistent read states in `localStorage`.

---

## 🏛️ Church Identity & Typography
- **Hero Title:** *"Raising a Generation of Unshakable Faith, Vision & Excellence in Christ."* (The underline decoration on *"Unshakable Faith"* has been cleanly removed while preserving its bold, vibrant brand coloration).
- **Church Organization:** Global Evangelical Church Youth (Kasoa Branch)
- **Youth Motto:**
  - 🌟 *"Youth! - With a Mission"*
  - 🌟 *"Youth! - With a Vision"*
  - 🌟 *"Youth! - With a Difference"*

---

## 📱 Mobile Money (MoMo) & Hubtel Gateway
- **Supported Networks:** MTN Mobile Money (🟡), Telecel / Vodafone Cash (🔴), AT / AirtelTigo (🔵), Bank Card / Hubtel Direct (🟣).
- **Payment Categories:**
  - **Monthly Youth Dues** (GHS 50.00)
  - **Camp & Retreat Levies** (e.g. Mountain Retreat 2026 Fund)
  - **Fundraising / Special Projects** (Custom titles e.g. Youth Instruments & Sound Project, Community Food Drive).
- **USSD Prompt Simulator & Digital Receipts:** Generates verified transaction receipts with transaction ID, date, network, and church stamp.

---

## ⛪ Sunday Service Order & Communion Control
- **Morning 1st Service:** `7:00 AM - 9:00 AM`
- **2nd Youth/Empowerment Service:** `9:30 AM - 12:00 PM`
- **Joint Combined Service Mode:** Toggleable `8:00 AM - 11:30 AM`
- **Holy Communion Sunday Banner:** 🍷🥖 Dynamic bread & wine communion indicator.
- **Admin Control:** Updated live by the Pastor in the Admin Center.

---

## 📊 Visual Analytics & Batch Roster Auto-Import
- **Visual Pie Charts:**
  - Roll-call status breakdown (Present, Late, Absent, Excused) in Records Portal.
  - Media asset distribution (Photos, Videos, Banners, Flyers) in Media Portal.
  - Staff roles & executive distribution in Admin Portal.
- **Batch Roster Importer:** Drag & drop Excel, CSV, text, or photo of handwritten member list with instant spreadsheet-like correction preview before 1-click batch enrollment into the database!
- **Scalability & Performance:** Optimized for 400+ concurrent active youth.

---

## 🚀 Live Access URLs
- **Public Youth Website:** `http://localhost:3001`
- **Leader & Staff Login:** `http://localhost:3001` → Click **"Leader & Staff Portal"**
- **Backend API Server:** `http://localhost:5000`
- **API Health Check:** `http://localhost:5000/api/health`
- **Automated Tests:** `npm test` (8/8 Passed)
