from flask import Flask, render_template, request, jsonify
import random
import string
import hashlib
import requests
import os

app = Flask(__name__)

# Load common passwords from file
try:
    with open('data/common_passwords.txt', 'r') as f:
        COMMON_PASSWORDS = set(pw.strip().lower() for pw in f if pw.strip())
except FileNotFoundError:
    # Fallback with some common passwords if file doesn't exist
    COMMON_PASSWORDS = {
        'password', '123456', 'password123', 'admin', 'qwerty', 
        'letmein', 'welcome', 'monkey', '1234567890', 'abc123',
        'password1', '12345678', 'qwerty123', 'iloveyou', 'admin123'
    }

def is_password_pwned(password):
    # Hash the password using SHA-1
    sha1 = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1[:5]
    suffix = sha1[5:]

    # Query the HIBP API
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return False  # If API fails, don't block password
        hashes = (line.split(':') for line in response.text.splitlines())
        for hash_suffix, count in hashes:
            if hash_suffix == suffix:
                return True  # Password found in breach database
        return False  # Not found
    except Exception:
        return False  # On error, don't block password

def generate_password(length, use_upper, use_lower, use_number, use_symbol):
    """Generate a password based on specified criteria"""
    chars = ''
    if use_upper: 
        chars += string.ascii_uppercase
    if use_lower: 
        chars += string.ascii_lowercase
    if use_number: 
        chars += string.digits
    if use_symbol: 
        chars += "!@#$%^&*()_+[]{}|;:,.<>?/~"

    if not chars: 
        return ''

    # Ensure at least one character from each selected category
    password = []
    
    if use_upper:
        password.append(random.choice(string.ascii_uppercase))
    if use_lower:
        password.append(random.choice(string.ascii_lowercase))
    if use_number:
        password.append(random.choice(string.digits))
    if use_symbol:
        password.append(random.choice("!@#$%^&*()_+[]{}|;:,.<>?/~"))
    
    # Fill remaining length with random characters
    remaining_length = length - len(password)
    for _ in range(remaining_length):
        password.append(random.choice(chars))
    
    # Shuffle the password to randomize character positions
    random.shuffle(password)
    
    return ''.join(password)

def has_sequential_chars(password, seq_length=3):
    for i in range(len(password) - seq_length + 1):
        chunk = password[i:i+seq_length]
        # Ascending
        if all(ord(chunk[j]) == ord(chunk[0]) + j for j in range(seq_length)):
            return True
        # Descending
        if all(ord(chunk[j]) == ord(chunk[0]) - j for j in range(seq_length)):
            return True
    return False

# def calculate_entropy(password):
#     """Calculate password entropy"""
#     charset_size = 0
    
#     if any(c.islower() for c in password):
#         charset_size += 26
#     if any(c.isupper() for c in password):
#         charset_size += 26
#     if any(c.isdigit() for c in password):
#         charset_size += 10
#     if any(c in "!@#$%^&*()_+[]{}|;:,.<>?/~" for c in password):
#         charset_size += 28
    
#     if charset_size == 0:
#         return 0
    
#     return len(password) * math.log2(charset_size)


# def estimate_crack_time(entropy):
#     """Estimate time to crack based on entropy"""
#     if entropy < 28:
#         return "Seconds"
#     elif entropy < 35:
#         return "Minutes"
#     elif entropy < 44:
#         return "Hours"
#     elif entropy < 59:
#         return "Days"
#     elif entropy < 65:
#         return "Months"
#     elif entropy < 77:
#         return "Years"
#     else:
#         return "Centuries"


def analyze_password(pw):
    """Comprehensive password analysis"""
    if not pw:
        return {
            'analysis': {
                'length': False,
                'uppercase': False,
                'lowercase': False,
                'number': False,
                'symbol': False,
                'not_common': True,
                'sequential': True
                # 'entropy': 0
            },
            'strength_label': 'Very Weak',
            'strength_score': 0,
            # 'time_to_crack': 'Instantly',
            # 'recommendations': ['Enter a password to analyze']
        }
    
    # Basic analysis
    analysis = {
        'length': len(pw) >= 12,
        'uppercase': any(c.isupper() for c in pw),
        'lowercase': any(c.islower() for c in pw),
        'number': any(c.isdigit() for c in pw),
        'symbol': any(c in "!@#$%^&*()_+[]{}|;:,.<>?/~" for c in pw),
        'not_common': pw.lower() not in COMMON_PASSWORDS,
    }

    # Calculate entropy
    # entropy = calculate_entropy(pw)
    # analysis['entropy'] = round(entropy, 1)
    
    # Calculate strength score (0-100)
    strength_score = 0
    
    # Length scoring (0-30 points)
    if len(pw) >= 12:
        strength_score += 30
    elif len(pw) >= 8:
        strength_score += 20
    # elif len(pw) >= 6:
    #     strength_score += 10
    
    # Character diversity (0-40 points)
    if analysis['uppercase']:
        strength_score += 10
    if analysis['lowercase']:
        strength_score += 10
    if analysis['number']:
        strength_score += 10
    if analysis['symbol']:
        strength_score += 10
    
    # Not common password (0-20 points)
    if analysis['not_common']:
        strength_score += 20
    
    # Deduct points for sequential characters
    if has_sequential_chars(pw):
        strength_score -= 5  # Deduct points for sequential patterns
        analysis['sequential'] = False
        analysis['sequential_message'] = "Avoid sequential characters like 'abcd' or '1234' for better security."
    else:
        strength_score += 5   # Optionally award a small bonus
        analysis['sequential'] = True
        analysis['sequential_message'] = ""
    
    if is_password_pwned(pw):
        analysis['pwned'] = True
        analysis['pwned_message'] = "This password has appeared in data breaches. For better security, it is recommended to use a different password."
        strength_score -= 50
    else:
        analysis['pwned'] = False
        analysis['pwned_message'] = ""
        strength_score += 5

    # Clamp score
    strength_score = max(0, min(strength_score, 100))
    
    # Entropy bonus (0-10 points)
    # if entropy > 50:
    #     strength_score += 10
    # elif entropy > 35:
    #     strength_score += 5
    
    # Determine strength label
    if strength_score <= 25:
        label = 'Very Weak'
    elif strength_score <= 45:
        label = 'Weak'
    elif strength_score <= 65:
        label = 'Moderate'
    elif strength_score <= 90:
        label = 'Strong'
    else:
        label = 'Very Strong'
    
    # # Time to crack estimation
    # time_to_crack = estimate_crack_time(entropy)
    
    # Generate recommendations
    # recommendations = []
    # if not analysis['length']:
    #     recommendations.append('Use at least 12 characters')
    # if not analysis['uppercase']:
    #     recommendations.append('Add uppercase letters (A-Z)')
    # if not analysis['lowercase']:
    #     recommendations.append('Add lowercase letters (a-z)')
    # if not analysis['number']:
    #     recommendations.append('Add numbers (0-9)')
    # if not analysis['symbol']:
    #     recommendations.append('Add symbols (!@#$%)')
    # if not analysis['not_common']:
    #     recommendations.append('Avoid common passwords')
    # # if len(pw) > 0 and entropy < 50:
    # #     recommendations.append('Increase password complexity')
    
    # if not recommendations:
    #     recommendations.append('Excellent password! Consider using a password manager.')
    
    return {
        'analysis': analysis,
        'strength_label': label,
        'strength_score': strength_score
        # 'time_to_crack': time_to_crack,
        # 'recommendations': recommendations
    }


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/generate', methods=['POST'])
def generate():
    """Generate password endpoint"""
    data = request.json
    
    # Validate input
    length = max(8, min(64, data.get('length', 12)))  # Clamp between 8-64
    
    pw = generate_password(
        length,
        data.get('upper', True),
        data.get('lower', True),
        data.get('number', True),
        data.get('symbol', True)
    )
    
    return jsonify({'password': pw})


@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze password endpoint"""
    pw = request.json.get('password', '')
    result = analyze_password(pw)
    return jsonify(result)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)