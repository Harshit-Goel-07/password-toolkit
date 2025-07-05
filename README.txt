# 🔐 Password Toolkit

A full-featured web-based Password Toolkit built using **Flask**, offering both a **Password Generator** and **Password Analyzer**. This toolkit helps users create strong passwords and evaluate password strength based on various metrics like length, character variety, sequential patterns, and data breach history (using Have I Been Pwned API).

![Password Toolkit Screenshot](screenshot.png)

---

## 🚀 Features

### ✅ Password Generator
- Create secure, customizable passwords.
- Choose from:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Symbols
- Password length range: 8–64 characters.
- Clipboard copy support.
- Keyboard shortcuts for quick generation.

### 🛡️ Password Analyzer
- Real-time password strength meter.
- Checks for:
  - Length & character diversity
  - Common password database
  - Sequential patterns (e.g., `123`, `abc`)
  - Known data breaches using [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- Dynamic UI feedback with warnings and tips.

---

## 🧑‍💻 Tech Stack

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS (Dark UI), JavaScript (Vanilla)
- **Security API:** HIBP (Pwned Passwords)
- **Styling:** Pure CSS with responsive design

---

## 📦 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/password-toolkit.git
cd password-toolkit
```

### 2. Create and activate a virtual environment (optional but recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the app
```bash
python app.py
```

Open your browser and go to `http://127.0.0.1:5000`.

---

## 📂 Project Structure

```
password-toolkit/
│
├── app.py                   # Flask backend logic
├── data/
│   └── common_passwords.txt # List of weak/common passwords
├── static/
│   ├── style.css            # Dark mode styles
│   └── script.js            # Frontend JS logic
├── templates/
│   └── index.html           # UI HTML template
├── README.md                # Project documentation
└── requirements.txt         # Python dependencies
```

---

## 🔑 API Integration

**HIBP Pwned Passwords API**

- Uses the first 5 characters of the SHA-1 hash of the password for anonymity.
- Returns breach status without exposing full password hashes.

---

## 🧪 Security Considerations

- All password processing happens **locally** in your browser and Flask backend.
- **No passwords are stored or logged**.
- Safe to test password strength without compromising your security.

---

## 📈 Future Improvements

- Entropy & crack time estimation
- Detailed recommendations
- Dark/Light theme toggle
- Localization and accessibility enhancements

---

## 📸 Screenshots

> *(Add screenshots here if available, or use tools like Lightshot / Snipping Tool to capture one from browser UI)*

---

## 🧾 License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

## 🙋‍♂️ Author

**Harshit Goel**  
Connect with me on [LinkedIn](https://www.linkedin.com/in/harshit-goel-dev)  
Twitter: [@goelcodes](https://twitter.com/goelcodes)  

---

## 🌟 Give this repo a ⭐ if it helped you or inspired you!