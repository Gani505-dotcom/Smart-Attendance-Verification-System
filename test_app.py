from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

print("✅ Flask app initialized")

@app.route('/')
def home():
    return "Flask is working!"

if __name__ == '__main__':
    print("🚀 Starting Flask server on http://localhost:5000")
    app.run(debug=True)
