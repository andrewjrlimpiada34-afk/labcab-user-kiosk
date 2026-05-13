
# LabCab | Smart Laboratory Cabinet

A modern kiosk-style application for managing laboratory equipment borrowing and returning at MARSU.

## 📊 Data Management (Firebase Console)

Buksan ang iyong [Firebase Console](https://console.firebase.google.com/) para makita ang mga sumusunod:

### 1. 🛡️ AUTHENTICATION (Login Credentials)
- **Tab**: Build > Authentication > Users.
- **Nilalaman**: Dito mo makikita ang listahan ng lahat ng Emails at UIDs. Kung nakalimutan ng user ang PIN, i-reset ang password dito.

### 2. 📂 FIRESTORE DATABASE (Profile & Inventory)
- **Tab**: Build > Firestore Database > Data.
- **Collections**:
  - **`users` (Automatic)**: Dito mase-save ang pangalan, Student ID, at QR code ng mga nag-register. Ang Document ID nito ay dapat pareho ng UID sa Auth tab.
  - **`apparatus` (MANUAL)**: Dito mo ilalagay ang mga gamit sa lab. **Kailangan itong i-fill up manual** sa console para magkaroon ng laman ang "Borrow" screen.
  - **`transactions` (Automatic)**: Logs ng bawat hiram at balik.

## 🛠️ Data Entry Example for Apparatus
Sa Firestore, i-click ang "Start Collection" > Name: `apparatus` > Document ID: (Kahit ano, e.g., `beaker-250`) > Add Fields:
- `name` (string): "Beaker 250ml"
- `category` (string): "Glassware"
- `stock` (number): 20
- `total` (number): 20
- `icon` (string): `Beaker` (Options: `Beaker`, `FlaskConical`, `Pipette`, `Flame`, `Microscope`, `Box`, `Scissors`, `Thermometer`)

## 🚀 Troubleshooting
Kung nakikita mo ang email sa **Auth** pero walang document sa **Firestore**:
1. **Security Rules**: Siguraduhin na ang rules sa iyong console ay kapareho ng nasa `firestore.rules` file ng project na ito.
2. **Refresh**: Minsan kailangan i-refresh ang Firestore tab pagkatapos ng unang registration.
