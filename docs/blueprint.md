# **App Name**: LabCab

## Core Features:

- QR & Credentials Enrollment: Streamlined student and teacher registration with immediate camera-based QR code linking for secure cabinet access.
- Kiosk-Optimized Auth: Secure dual-mode authentication via instant QR scan or traditional credentials featuring an integrated virtual keyboard tool for touchscreen use.
- Dynamic Inventory Engine: Live tracking of glassware and tools including beakers and flasks with real-time stock deductions and return logic stored in the database.
- Touch-First Inventory Grid: Large-format card interface for apparatus selection featuring responsive increment/decrement selectors designed for high-precision kiosk interaction.
- Managed Return Deadlines: A transactional logging system that calculates return windows (1hr to end-of-day) and provides countdown notifications for active borrowers.
- Cloud Activity Ledger: A centralized MongoDB-backed ledger that synchronizes kiosk transactions with a mobile-ready administrative management portal.
- Animated Brand Splash: A professional entry sequence featuring a smooth, animated rendering of the LabCab laboratory-themed logo.

## Style Guidelines:

- Primary color: Clinical Navy (#2D46B9), a professional and trustworthy hue that anchors the interface in a scientific context.
- Background: Surgical White (#F5F7FB), heavily desaturated to maintain a clean laboratory aesthetic.
- Accent color: Bright Oxygen Blue (#2DB2B9), used for primary call-to-actions and critical steps.
- Highlight color: Gradient Orange (#FF8C00 to #FFA500) for emphasizing active statuses, warnings, and urgent alerts.
- Primary and Body font: 'Poppins' for its contemporary geometric clarity and exceptional readability on kiosk displays.
- Glassmorphic icons with thick line-work, representing specific lab equipment to ensure quick recognition from a distance.
- Kiosk-first layout with high-impact center alignment, utilizing massive button tap targets for physical interaction.
- Tactile physics-based transitions using Framer Motion, including sliding-up drawers for the virtual keyboard and a smooth introductory logo fade-in.