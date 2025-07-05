# 🔐 Password Toolkit

A full-featured web-based Password Toolkit built using **Flask**, offering both a **Password Generator** and **Password Analyzer**. This toolkit helps users create strong passwords and evaluate password strength based on various metrics like length, character variety, sequential patterns, and data breach history (using Have I Been Pwned API).

Live Demo: 👉 [Click here to use the Password Toolkit]([https://your-render-app-url.onrender.com](https://password-toolkit-clfw.onrender.com))


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
- Localization and accessibility enhancements

---

## 🙋‍♂️ Author

**Harshit Goel**  
Connect with me on [LinkedIn](https://www.linkedin.com/in/harshit-goel-cs)  
