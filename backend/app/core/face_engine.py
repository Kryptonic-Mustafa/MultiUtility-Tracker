import json
import base64
import numpy as np
import cv2
import logging
from typing import Optional, List, Dict, Tuple
from backend.app.models.db_models import UserModel

logger = logging.getLogger("face_engine")

class FaceEngine:
    def __init__(self):
        self.known_user_ids: List[str] = []
        self.known_names: List[str] = []
        self.known_roles: List[str] = []
        self.known_dept_ids: List[str] = []
        self.encodings_matrix: Optional[np.ndarray] = None
        self.face_rec_module = None
        self._init_face_rec()

    def _init_face_rec(self):
        try:
            import face_recognition
            self.face_rec_module = face_recognition
            logger.info("face_recognition library successfully initialized.")
        except Exception as e:
            logger.warning(f"face_recognition import failed: {e}. Falling back to OpenCV Cascade detector.")
            self.face_rec_module = None

    def reload_encodings(self, session):
        """Loads all user face encodings from TiDB into a continuous NumPy matrix."""
        try:
            users = session.query(UserModel).filter(UserModel.is_active == 1).all()

            user_ids = []
            names = []
            roles = []
            dept_ids = []
            encodings = []

            for u in users:
                if u.face_encoding:
                    try:
                        arr = json.loads(u.face_encoding)
                        if len(arr) == 128:
                            user_ids.append(u.user_id)
                            names.append(u.name)
                            roles.append(u.role)
                            dept_ids.append(u.dept_id or "")
                            encodings.append(arr)
                    except Exception as ex:
                        logger.error(f"Error parsing encoding for user {u.user_id}: {ex}")

            self.known_user_ids = user_ids
            self.known_names = names
            self.known_roles = roles
            self.known_dept_ids = dept_ids
            self.encodings_matrix = np.array(encodings) if encodings else None

            logger.info(f"Loaded {len(user_ids)} face encodings into memory matrix.")
        except Exception as e:
            logger.error(f"Failed to reload encodings from DB: {e}")

    def decode_image_base64(self, base64_str: str) -> Optional[np.ndarray]:
        """Decodes a base64 image string into an OpenCV BGR image array."""
        try:
            if "," in base64_str:
                base64_str = base64_str.split(",")[1]
            img_bytes = base64.b64decode(base64_str)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            logger.error(f"Failed to decode base64 image: {e}")
            return None

    def extract_encoding(self, bgr_image: np.ndarray) -> Tuple[Optional[List[float]], Optional[Dict]]:
        """Extracts 128-float facial encoding from an image."""
        if bgr_image is None:
            return None, None

        rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)

        if self.face_rec_module:
            locations = self.face_rec_module.face_locations(rgb_image, model="hog")
            if not locations:
                return None, None
            
            encodings = self.face_rec_module.face_encodings(rgb_image, known_face_locations=locations)
            if encodings:
                loc = locations[0] # (top, right, bottom, left)
                bbox = {"top": loc[0], "right": loc[1], "bottom": loc[2], "left": loc[3]}
                return encodings[0].tolist(), bbox
        
        # Fallback OpenCV Haar Cascade if face_recognition module unavailable
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            return None, None

        x, y, w, h = faces[0]
        bbox = {"top": int(y), "right": int(x + w), "bottom": int(y + h), "left": int(x)}
        
        # Fallback pseudo 128-dim feature vector based on resized face patch
        face_roi = gray[y:y+h, x:x+w]
        resized = cv2.resize(face_roi, (16, 8)).flatten()
        normalized = (resized / 255.0).tolist()
        return normalized, bbox

    def recognize_face(self, current_encoding: List[float], tolerance: float = 0.55) -> Optional[Dict]:
        """Vectorized L2 distance comparison against in-memory encodings matrix."""
        if self.encodings_matrix is None or len(self.encodings_matrix) == 0:
            return None

        target = np.array(current_encoding)
        distances = np.linalg.norm(self.encodings_matrix - target, axis=1)
        best_idx = np.argmin(distances)
        min_dist = distances[best_idx]

        if min_dist <= tolerance:
            confidence = round(float(1.0 - min_dist), 4)
            return {
                "user_id": self.known_user_ids[best_idx],
                "name": self.known_names[best_idx],
                "role": self.known_roles[best_idx],
                "dept_id": self.known_dept_ids[best_idx],
                "confidence": confidence,
                "distance": round(float(min_dist), 4)
            }
        return None

face_engine = FaceEngine()
