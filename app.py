from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta
import logging
from functools import wraps
import re
import face_recognition
import pickle
import base64
import io
from scipy.spatial import distance as dist

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
app.config.update({
    'SQLALCHEMY_DATABASE_URI': os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost/face_system'),
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'JWT_SECRET_KEY': os.getenv('JWT_SECRET_KEY', 'your-very-secret-key-here'),
    'JWT_ACCESS_TOKEN_EXPIRES': timedelta(hours=1),
    'JWT_TOKEN_LOCATION': ['headers'],
    'JWT_HEADER_NAME': 'Authorization',
    'JWT_HEADER_TYPE': 'Bearer',
    'UPLOAD_FOLDER': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'),
    'ALLOWED_EXTENSIONS': {'png', 'jpg', 'jpeg', 'gif'},
    'MAX_CONTENT_LENGTH': 2 * 1024 * 1024,  # 2MB
    'FACE_RECOGNITION_THRESHOLD': 0.6,
    'EYE_AR_THRESHOLD': 0.25,  # Eye Aspect Ratio threshold for blink detection
    'REQUIRED_BLINKS': 2,      # Number of consecutive blinks required
})

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
db = SQLAlchemy(app)
jwt = JWTManager(app)

# ====================== MODELS ======================
class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    roll_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    course = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(200), nullable=False)
    photo_url = db.Column(db.String(255))
    face_encoding = db.Column(db.Text)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=db.func.current_date())
    time = db.Column(db.Time, nullable=False, default=db.func.current_time())
    confidence = db.Column(db.Float)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    student = db.relationship('Student', backref='attendance_records')

# Initialize database
with app.app_context():
    try:
        db.create_all()
        logger.info("Database tables created successfully")
        
        if not Admin.query.first():
            default_admin = Admin(
                name="Admin",
                username="admin",
                email="admin@example.com",
                password=generate_password_hash("admin123")
            )
            db.session.add(default_admin)
            db.session.commit()
            logger.info("Default admin account created")
    except Exception as e:
        logger.error(f"Database initialization error: {str(e)}")
        raise

# ====================== HELPER FUNCTIONS ======================
def validate_email(email):
    return bool(re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user = get_jwt_identity()
            user = None
            
            if role == 'admin':
                user = Admin.query.filter_by(email=current_user).first()
            elif role == 'student':
                user = Student.query.filter_by(email=current_user).first()
            
            if not user:
                return jsonify({
                    'success': False,
                    'message': f'{role.capitalize()} not found'
                }), 404
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def check_duplicate_attendance(student_id):
    today = datetime.now().date()
    return Attendance.query.filter(
        Attendance.student_id == student_id,
        Attendance.date == today
    ).first()

def generate_face_encoding(image_path=None, image_bytes=None):
    try:
        if image_path:
            image = face_recognition.load_image_file(image_path)
        elif image_bytes:
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        else:
            return None
            
        face_locations = face_recognition.face_locations(image)
        
        if not face_locations:
            return None
            
        face_encoding = face_recognition.face_encodings(image, known_face_locations=[face_locations[0]])[0]
        return base64.b64encode(pickle.dumps(face_encoding)).decode('utf-8')
    except Exception as e:
        logger.error(f"Error generating face encoding: {str(e)}")
        return None

def compare_faces(known_encoding_str, unknown_image_bytes, tolerance=0.6):
    try:
        known_encoding = pickle.loads(base64.b64decode(known_encoding_str))
        unknown_image = face_recognition.load_image_file(io.BytesIO(unknown_image_bytes))
        unknown_face_locations = face_recognition.face_locations(unknown_image)
        
        if not unknown_face_locations:
            return (False, None)
            
        unknown_encodings = face_recognition.face_encodings(
            unknown_image,
            known_face_locations=unknown_face_locations
        )
        
        if not unknown_encodings:
            return (False, None)
            
        results = face_recognition.compare_faces(
            [known_encoding],
            unknown_encodings[0],
            tolerance=tolerance
        )
        
        face_distance = face_recognition.face_distance(
            [known_encoding],
            unknown_encodings[0]
        )[0]
        
        confidence = (1 - face_distance) * 100
        
        return (results[0], confidence)
    except Exception as e:
        logger.error(f"Error comparing faces: {str(e)}")
        return (False, None)

def eye_aspect_ratio(eye):
    """Calculate the eye aspect ratio for blink detection"""
    # Compute the euclidean distances between the two sets of
    # vertical eye landmarks (x, y)-coordinates
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    
    # Compute the euclidean distance between the horizontal
    # eye landmark (x, y)-coordinates
    C = dist.euclidean(eye[0], eye[3])
    
    # Compute the eye aspect ratio
    ear = (A + B) / (2.0 * C)
    return ear

def detect_blinks(image_bytes, required_blinks=2):
    """Detect eye blinks in the image"""
    try:
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
        face_landmarks_list = face_recognition.face_landmarks(image)
        
        if not face_landmarks_list:
            return (False, "No face detected")
            
        face_landmarks = face_landmarks_list[0]
        
        # Get the left and right eye coordinates
        left_eye = face_landmarks['left_eye']
        right_eye = face_landmarks['right_eye']
        
        # Calculate the eye aspect ratio for both eyes
        left_ear = eye_aspect_ratio(left_eye)
        right_ear = eye_aspect_ratio(right_eye)
        
        # Average the eye aspect ratio together for both eyes
        ear = (left_ear + right_ear) / 2.0
        
        # Check if the eye aspect ratio is below the blink threshold
        if ear < app.config['EYE_AR_THRESHOLD']:
            return (True, "Blink detected")
        else:
            return (False, "No blink detected")
    except Exception as e:
        logger.error(f"Error detecting blinks: {str(e)}")
        return (False, f"Error detecting blinks: {str(e)}")

def generate_unique_filename(original_filename, identifier):
    """Generate a unique filename using identifier and timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_ext = os.path.splitext(original_filename)[1]
    filename = f"{identifier}_{timestamp}{file_ext}"
    return secure_filename(filename)

# ====================== AUTHENTICATION ROUTES ======================
@app.route('/api/admin/register', methods=['POST'])
def register_admin():
    try:
        data = request.get_json()
        required_fields = ['name', 'username', 'email', 'password']
        
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        if not validate_email(data['email']):
            return jsonify({'success': False, 'message': 'Invalid email address'}), 400
        
        if Admin.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 409
            
        if Admin.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username already taken'}), 409
        
        admin = Admin(
            name=data['name'].strip(),
            username=data['username'].strip(),
            email=data['email'].lower().strip(),
            password=generate_password_hash(data['password'])
        )
        
        db.session.add(admin)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Admin registered successfully',
            'admin': {
                'id': admin.id,
                'name': admin.name,
                'username': admin.username,
                'email': admin.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Admin registration error: {str(e)}")
        return jsonify({'success': False, 'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Email and password required'}), 400
        
        admin = Admin.query.filter_by(email=data['email']).first()
        
        if not admin or not check_password_hash(admin.password, data['password']):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=admin.email)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'access_token': access_token,
            'admin': {
                'id': admin.id,
                'name': admin.name,
                'email': admin.email,
                'username': admin.username
            }
        })
    except Exception as e:
        logger.error(f"Admin login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed', 'error': str(e)}), 500

@app.route('/api/students/register', methods=['POST'])
def register_student():
    try:
        data = request.get_json()
        required_fields = ['name', 'email', 'roll_number', 'course', 'password']
        
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        if not validate_email(data['email']):
            return jsonify({'success': False, 'message': 'Invalid email address'}), 400
        
        if Student.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 409
            
        if Student.query.filter_by(roll_number=data['roll_number']).first():
            return jsonify({'success': False, 'message': 'Roll number already in use'}), 409
        
        student = Student(
            name=data['name'].strip(),
            email=data['email'].lower().strip(),
            roll_number=data['roll_number'].strip(),
            course=data['course'],
            password=generate_password_hash(data['password'])
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student registered successfully',
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_number': student.roll_number,
                'course': student.course
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Student registration error: {str(e)}")
        return jsonify({'success': False, 'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/students/login', methods=['POST'])
def student_login():
    try:
        data = request.get_json()
        if not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Email and password required'}), 400
        
        student = Student.query.filter_by(email=data['email']).first()
        
        if not student or not check_password_hash(student.password, data['password']):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=student.email)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': access_token,
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_number': student.roll_number,
                'course': student.course,
                'photo_url': student.photo_url
            }
        })
    except Exception as e:
        logger.error(f"Student login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed', 'error': str(e)}), 500

# ====================== ADMIN STUDENT MANAGEMENT ROUTES ======================
@app.route('/api/admin/students', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_students():
    try:
        students = Student.query.all()
        students_data = [{
            'id': student.id,
            'name': student.name,
            'email': student.email,
            'roll_number': student.roll_number,
            'course': student.course,
            'photo_url': student.photo_url,
            'active': student.active,
            'created_at': student.created_at.isoformat(),
            'updated_at': student.updated_at.isoformat()
        } for student in students]
        
        return jsonify({'success': True, 'students': students_data})
    except Exception as e:
        logger.error(f"Error fetching students: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch students', 'error': str(e)}), 500

@app.route('/api/admin/students', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_student():
    try:
        if 'photo' not in request.files:
            return jsonify({'success': False, 'message': 'No photo uploaded'}), 400
            
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400

        data = request.form
        required_fields = ['name', 'email', 'roll_number', 'course', 'password']
        
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        if not validate_email(data['email']):
            return jsonify({'success': False, 'message': 'Invalid email address'}), 400
        
        if Student.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 409
            
        if Student.query.filter_by(roll_number=data['roll_number']).first():
            return jsonify({'success': False, 'message': 'Roll number already in use'}), 409
        
        # Generate unique filename using roll number
        filename = generate_unique_filename(file.filename, data['roll_number'])
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        face_encoding = generate_face_encoding(image_path=filepath)
        
        if not face_encoding:
            os.remove(filepath)
            return jsonify({'success': False, 'message': 'No face detected in image'}), 400
        
        student = Student(
            name=data['name'].strip(),
            email=data['email'].lower().strip(),
            roll_number=data['roll_number'].strip(),
            course=data['course'],
            password=generate_password_hash(data['password']),
            photo_url=filename,
            face_encoding=face_encoding
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student created successfully',
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_number': student.roll_number,
                'course': student.course,
                'photo_url': student.photo_url
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        logger.error(f"Student creation error: {str(e)}")
        return jsonify({'success': False, 'message': 'Student creation failed', 'error': str(e)}), 500

@app.route('/api/admin/students/<int:id>', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_student(id):
    try:
        student = Student.query.get_or_404(id)
        return jsonify({
            'success': True,
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_number': student.roll_number,
                'course': student.course,
                'photo_url': student.photo_url,
                'active': student.active,
                'created_at': student.created_at.isoformat(),
                'updated_at': student.updated_at.isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error fetching student: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch student', 'error': str(e)}), 500

@app.route('/api/admin/students/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_student(id):
    try:
        student = Student.query.get_or_404(id)
        
        if 'photo' in request.files:
            file = request.files['photo']
            if file and allowed_file(file.filename):
                if student.photo_url:
                    old_file = os.path.join(app.config['UPLOAD_FOLDER'], student.photo_url)
                    if os.path.exists(old_file):
                        os.remove(old_file)
                
                # Generate unique filename using roll number
                filename = generate_unique_filename(file.filename, student.roll_number)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                student.photo_url = filename
                
                face_encoding = generate_face_encoding(image_path=filepath)
                if not face_encoding:
                    os.remove(filepath)
                    return jsonify({'success': False, 'message': 'No face detected in image'}), 400
                student.face_encoding = face_encoding

        data = request.form
        
        if 'email' in data and data['email'] != student.email:
            if Student.query.filter(Student.email == data['email'], Student.id != id).first():
                return jsonify({'success': False, 'message': 'Email already registered'}), 409
            student.email = data['email'].lower().strip()
        
        if 'roll_number' in data and data['roll_number'] != student.roll_number:
            if Student.query.filter(Student.roll_number == data['roll_number'], Student.id != id).first():
                return jsonify({'success': False, 'message': 'Roll number already in use'}), 409
            student.roll_number = data['roll_number'].strip()
        
        if 'name' in data:
            student.name = data['name'].strip()
        if 'course' in data:
            student.course = data['course']
        if 'password' in data and data['password']:
            student.password = generate_password_hash(data['password'])
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Student updated successfully',
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_number': student.roll_number,
                'course': student.course,
                'photo_url': student.photo_url
            }
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating student: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to update student', 'error': str(e)}), 500

@app.route('/api/admin/students/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_student(id):
    try:
        student = Student.query.get_or_404(id)
        
        if student.photo_url:
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], student.photo_url)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Student deleted successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting student: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to delete student', 'error': str(e)}), 500

# ====================== ADMIN PROFILE ROUTES ======================
@app.route('/api/admin/profile', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_profile():
    try:
        current_user = get_jwt_identity()
        admin = Admin.query.filter_by(email=current_user).first()
        
        if not admin:
            return jsonify({'success': False, 'message': 'Admin not found'}), 404
            
        return jsonify({
            'success': True,
            'admin': {
                'id': admin.id,
                'name': admin.name,
                'username': admin.username,
                'email': admin.email,
                'created_at': admin.created_at.isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error fetching admin profile: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch admin profile', 'error': str(e)}), 500

# ====================== STUDENT ROUTES ======================
@app.route('/api/students/profile', methods=['GET'])
@jwt_required()
@role_required('student')
def get_student_profile():
    try:
        current_user_email = get_jwt_identity()
        student = Student.query.filter_by(email=current_user_email).first()

        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404

        return jsonify({
            'success': True,
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_number': student.roll_number,
                'course': student.course,
                'photo_url': student.photo_url,
                'active': student.active,
                'created_at': student.created_at.isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error fetching student profile: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch student profile', 'error': str(e)}), 500

@app.route('/api/students/attendance/history', methods=['GET'])
@jwt_required()
@role_required('student')
def get_student_attendance_history():
    try:
        current_user_email = get_jwt_identity()
        student = Student.query.filter_by(email=current_user_email).first()
        
        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404
            
        attendance_records = Attendance.query.filter_by(
            student_id=student.id
        ).order_by(
            Attendance.date.desc(),
            Attendance.time.desc()
        ).all()
        
        history = [{
            'id': record.id,
            'date': record.date.strftime('%Y-%m-%d'),
            'time': record.time.strftime('%H:%M:%S'),
            'confidence': record.confidence
        } for record in attendance_records]
        
        return jsonify({'success': True, 'attendance_history': history})
    except Exception as e:
        logger.error(f"Error fetching attendance history: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch attendance history', 'error': str(e)}), 500

# ====================== ATTENDANCE ROUTES ======================
@app.route('/api/admin/attendance-reports', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_attendance_reports():
    try:
        # Get query parameters for filtering
        student_name = request.args.get('student_name', '').strip()
        roll_number = request.args.get('roll_number', '').strip()
        date = request.args.get('date', '').strip()
        course = request.args.get('course', '').strip()
        
        # Base query
        query = db.session.query(Attendance, Student).join(
            Student,
            Attendance.student_id == Student.id
        )
        
        # Apply filters
        if student_name:
            query = query.filter(Student.name.ilike(f'%{student_name}%'))
        if roll_number:
            query = query.filter(Student.roll_number.ilike(f'%{roll_number}%'))
        if date:
            query = query.filter(Attendance.date == date)
        if course:
            query = query.filter(Student.course == course)
        
        # Execute query and get results
        attendance_records = query.order_by(
            Attendance.date.desc(),
            Attendance.time.desc()
        ).all()

        reports = [{
            'id': attendance.id,
            'date': attendance.date.strftime('%Y-%m-%d'),
            'time': attendance.time.strftime('%H:%M:%S'),
            'confidence': attendance.confidence,
            'student': {
                'id': student.id,
                'name': student.name,
                'email': student.email,
                'roll_number': student.roll_number,
                'course': student.course,
                'photo_url': student.photo_url
            }
        } for attendance, student in attendance_records]

        return jsonify({
            'success': True,
            'reports': reports,
            'filters': {
                'student_name': student_name,
                'roll_number': roll_number,
                'date': date,
                'course': course
            },
            'count': len(reports)
        })
    except Exception as e:
        logger.error(f"Error fetching attendance reports: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch attendance reports', 'error': str(e)}), 500

@app.route('/api/attendance/mark', methods=['POST'])
@jwt_required()
@role_required('student')
def mark_attendance():
    try:
        current_user_email = get_jwt_identity()
        student = Student.query.filter_by(email=current_user_email).first()
        
        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404
            
        if not student.face_encoding:
            return jsonify({'success': False, 'message': 'No face encoding found for student'}), 400

        if check_duplicate_attendance(student.id):
            return jsonify({'success': False, 'message': 'Attendance already marked today'}), 400

        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image provided'}), 400
            
        webcam_image = request.files['image']
        if not allowed_file(webcam_image.filename):
            return jsonify({'success': False, 'message': 'Invalid image format'}), 400

        image_bytes = webcam_image.read()
        
        # First check for blinking
        blink_detected, blink_message = detect_blinks(image_bytes)
        
        if not blink_detected:
            return jsonify({
                'success': False,
                'message': blink_message,
                'details': 'Please blink while marking attendance to prove liveness'
            }), 400
        
        # If blink detected, proceed with face matching
        match, confidence = compare_faces(
            student.face_encoding,
            image_bytes,
            app.config['FACE_RECOGNITION_THRESHOLD']
        )
        
        if match and confidence >= app.config['FACE_RECOGNITION_THRESHOLD'] * 100:
            attendance = Attendance(
                student_id=student.id,
                confidence=confidence
            )
            db.session.add(attendance)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Attendance marked successfully!',
                'confidence': round(confidence, 2),
                'attendance': {
                    'date': attendance.date.strftime('%Y-%m-%d'),
                    'time': attendance.time.strftime('%H:%M:%S')
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Face verification failed',
                'confidence': round(confidence, 2) if confidence else None,
                'threshold': app.config['FACE_RECOGNITION_THRESHOLD'] * 100
            })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking attendance: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to mark attendance', 'error': str(e)}), 500

# ====================== ENHANCED ATTENDANCE WITH MULTIPLE BLINKS ======================
@app.route('/api/attendance/mark-enhanced', methods=['POST'])
@jwt_required()
@role_required('student')
def mark_attendance_enhanced():
    """Enhanced version that requires multiple consecutive blinks"""
    try:
        current_user_email = get_jwt_identity()
        student = Student.query.filter_by(email=current_user_email).first()
        
        if not student:
            return jsonify({'success': False, 'message': 'Student not found'}), 404
            
        if not student.face_encoding:
            return jsonify({'success': False, 'message': 'No face encoding found for student'}), 400

        if check_duplicate_attendance(student.id):
            return jsonify({'success': False, 'message': 'Attendance already marked today'}), 400

        if 'images' not in request.files:
            return jsonify({'success': False, 'message': 'No images provided'}), 400
            
        # Get all uploaded images (should be a sequence of frames)
        images = request.files.getlist('images')
        if len(images) < 3:  # Need at least 3 frames for blink detection
            return jsonify({'success': False, 'message': 'Need at least 3 consecutive frames'}), 400

        # Check all images are valid
        valid_images = []
        for img in images:
            if allowed_file(img.filename):
                img_bytes = img.read()
                valid_images.append(img_bytes)
        
        if not valid_images:
            return jsonify({'success': False, 'message': 'No valid images provided'}), 400

        # Detect blinks in the sequence of images
        blink_count = 0
        last_ear = None
        required_blinks = app.config['REQUIRED_BLINKS']
        
        for img_bytes in valid_images:
            image = face_recognition.load_image_file(io.BytesIO(img_bytes))
            face_landmarks_list = face_recognition.face_landmarks(image)
            
            if not face_landmarks_list:
                continue
                
            face_landmarks = face_landmarks_list[0]
            left_eye = face_landmarks['left_eye']
            right_eye = face_landmarks['right_eye']
            
            left_ear = eye_aspect_ratio(left_eye)
            right_ear = eye_aspect_ratio(right_eye)
            ear = (left_ear + right_ear) / 2.0
            
            # Detect blink (eye closure)
            if ear < app.config['EYE_AR_THRESHOLD']:
                # Only count if previous frame had eyes open
                if last_ear is None or last_ear >= app.config['EYE_AR_THRESHOLD']:
                    blink_count += 1
            
            last_ear = ear
        
        if blink_count < required_blinks:
            return jsonify({
                'success': False,
                'message': f'Insufficient blinks detected ({blink_count}/{required_blinks})',
                'details': 'Please perform natural blinking while marking attendance'
            }), 400
        
        # Use the last frame for face matching
        match, confidence = compare_faces(
            student.face_encoding,
            valid_images[-1],
            app.config['FACE_RECOGNITION_THRESHOLD']
        )
        
        if match and confidence >= app.config['FACE_RECOGNITION_THRESHOLD'] * 100:
            attendance = Attendance(
                student_id=student.id,
                confidence=confidence
            )
            db.session.add(attendance)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Attendance marked successfully!',
                'confidence': round(confidence, 2),
                'blinks_detected': blink_count,
                'attendance': {
                    'date': attendance.date.strftime('%Y-%m-%d'),
                    'time': attendance.time.strftime('%H:%M:%S')
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Face verification failed',
                'confidence': round(confidence, 2) if confidence else None,
                'threshold': app.config['FACE_RECOGNITION_THRESHOLD'] * 100
            })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error marking enhanced attendance: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to mark attendance', 'error': str(e)}), 500

# ====================== FACE ENCODING ROUTES ======================
@app.route('/api/admin/capture-face-encoding', methods=['POST'])
@jwt_required()
@role_required('admin')
def capture_face_encoding():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'message': 'No image provided'}), 400
            
        file = request.files['image']
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'message': 'Invalid image format'}), 400
        
        face_encoding = generate_face_encoding(image_bytes=file.read())
        
        if not face_encoding:
            return jsonify({'success': False, 'message': 'No face detected in image'}), 400
            
        return jsonify({
            'success': True,
            'message': 'Face encoding generated successfully',
            'face_encoding': face_encoding
        })
    except Exception as e:
        logger.error(f"Error capturing face encoding: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to capture face encoding', 'error': str(e)}), 500

# ====================== FILE SERVING ROUTE ======================
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ====================== MAIN APPLICATION ======================
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', False))