"""
Driver Drowsiness Detection System

Uses MediaPipe Face Mesh to detect facial landmarks and calculate
Eye Aspect Ratio (EAR) to determine if the driver is drowsy.

EAR Formula:
    EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)

When eyes are open, EAR is relatively constant (~0.25-0.3).
When eyes close, EAR drops significantly (~0.05).
"""

import cv2
import numpy as np
import mediapipe as mp
from collections import deque
import time


class DrowsinessDetector:
    # MediaPipe Face Mesh eye landmark indices
    # Left eye landmarks
    LEFT_EYE = [362, 385, 387, 263, 373, 380]
    # Right eye landmarks
    RIGHT_EYE = [33, 160, 158, 133, 153, 144]

    def __init__(
        self,
        ear_threshold: float = 0.21,
        consecutive_frames: int = 20,
        alert_cooldown: float = 3.0
    ):
        """
        Initialize the drowsiness detector.

        Args:
            ear_threshold: EAR below this value indicates closed eyes
            consecutive_frames: Number of consecutive low-EAR frames to trigger alert
            alert_cooldown: Seconds to wait before next alert
        """
        self.ear_threshold = ear_threshold
        self.consecutive_frames = consecutive_frames
        self.alert_cooldown = alert_cooldown

        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils

        # State tracking
        self.ear_history = deque(maxlen=30)  # For smoothing
        self.low_ear_counter = 0
        self.last_alert_time = 0
        self.alert_active = False

    def calculate_ear(self, eye_landmarks: np.ndarray) -> float:
        """
        Calculate Eye Aspect Ratio (EAR) for given eye landmarks.

        The EAR is calculated as:
        EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)

        Where p1-p6 are the 6 landmark points of the eye.
        """
        # Vertical distances
        v1 = np.linalg.norm(eye_landmarks[1] - eye_landmarks[5])
        v2 = np.linalg.norm(eye_landmarks[2] - eye_landmarks[4])

        # Horizontal distance
        h = np.linalg.norm(eye_landmarks[0] - eye_landmarks[3])

        # Avoid division by zero
        if h == 0:
            return 0.0

        ear = (v1 + v2) / (2.0 * h)
        return ear

    def get_eye_landmarks(self, landmarks, eye_indices: list, frame_shape: tuple) -> np.ndarray:
        """Extract eye landmarks from face mesh."""
        h, w = frame_shape[:2]
        return np.array([
            [landmarks[idx].x * w, landmarks[idx].y * h]
            for idx in eye_indices
        ])

    def process_frame(self, frame: np.ndarray) -> dict:
        """
        Process a single frame and detect drowsiness.

        Returns:
            dict with keys: 'ear', 'is_drowsy', 'alert', 'face_detected'
        """
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        result = {
            'ear': None,
            'is_drowsy': False,
            'alert': False,
            'face_detected': False,
            'left_eye': None,
            'right_eye': None
        }

        if not results.multi_face_landmarks:
            self.low_ear_counter = 0
            return result

        result['face_detected'] = True
        landmarks = results.multi_face_landmarks[0].landmark

        # Get eye landmarks
        left_eye = self.get_eye_landmarks(landmarks, self.LEFT_EYE, frame.shape)
        right_eye = self.get_eye_landmarks(landmarks, self.RIGHT_EYE, frame.shape)

        result['left_eye'] = left_eye
        result['right_eye'] = right_eye

        # Calculate EAR for both eyes
        left_ear = self.calculate_ear(left_eye)
        right_ear = self.calculate_ear(right_eye)

        # Average EAR
        ear = (left_ear + right_ear) / 2.0
        result['ear'] = ear

        # Smooth EAR with history
        self.ear_history.append(ear)
        smoothed_ear = np.mean(self.ear_history)

        # Check for drowsiness
        if smoothed_ear < self.ear_threshold:
            self.low_ear_counter += 1
            if self.low_ear_counter >= self.consecutive_frames:
                result['is_drowsy'] = True

                # Check if we should trigger alert
                current_time = time.time()
                if current_time - self.last_alert_time > self.alert_cooldown:
                    result['alert'] = True
                    self.last_alert_time = current_time
                    self.alert_active = True
        else:
            self.low_ear_counter = 0
            self.alert_active = False

        return result

    def draw_landmarks(self, frame: np.ndarray, result: dict) -> np.ndarray:
        """Draw eye landmarks and status on frame."""
        frame = frame.copy()

        if result['face_detected']:
            # Draw eye contours
            if result['left_eye'] is not None:
                pts = result['left_eye'].astype(np.int32)
                cv2.polylines(frame, [pts], True, (0, 255, 0), 1)

            if result['right_eye'] is not None:
                pts = result['right_eye'].astype(np.int32)
                cv2.polylines(frame, [pts], True, (0, 255, 0), 1)

            # Display EAR
            if result['ear'] is not None:
                ear_text = f"EAR: {result['ear']:.3f}"
                cv2.putText(frame, ear_text, (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            # Display status
            if result['is_drowsy']:
                cv2.putText(frame, "DROWSY!", (10, 70),
                           cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 3)

                # Red border for alert
                cv2.rectangle(frame, (0, 0), (frame.shape[1]-1, frame.shape[0]-1),
                             (0, 0, 255), 10)
            else:
                cv2.putText(frame, "Alert", (10, 70),
                           cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
        else:
            cv2.putText(frame, "No face detected", (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Display threshold info
        cv2.putText(frame, f"Threshold: {self.ear_threshold}",
                   (10, frame.shape[0] - 10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

        return frame

    def release(self):
        """Release resources."""
        self.face_mesh.close()


def main():
    """Main function to run drowsiness detection."""
    print("Driver Drowsiness Detection System")
    print("===================================")
    print("Press 'q' to quit")
    print("Press '+'/'-' to adjust EAR threshold")
    print()

    # Initialize detector
    detector = DrowsinessDetector(
        ear_threshold=0.21,
        consecutive_frames=20,
        alert_cooldown=3.0
    )

    # Try to initialize sound (optional)
    sound_available = False
    try:
        import pygame
        pygame.mixer.init()
        # Generate a simple beep sound
        pygame.mixer.set_num_channels(1)
        sound_available = True
        print("Sound alerts enabled")
    except Exception as e:
        print(f"Sound alerts disabled: {e}")

    # Open webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return

    # Set resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("Starting detection...")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame")
            break

        # Flip frame horizontally for mirror effect
        frame = cv2.flip(frame, 1)

        # Process frame
        result = detector.process_frame(frame)

        # Draw visualization
        display_frame = detector.draw_landmarks(frame, result)

        # Play alert sound
        if result['alert'] and sound_available:
            try:
                # Generate beep using pygame
                beep = pygame.mixer.Sound(buffer=bytes([128] * 1000))
                beep.play()
            except:
                pass

        # Show frame
        cv2.imshow("Drowsiness Detection", display_frame)

        # Handle key input
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('+') or key == ord('='):
            detector.ear_threshold = min(0.35, detector.ear_threshold + 0.01)
            print(f"EAR threshold: {detector.ear_threshold:.2f}")
        elif key == ord('-'):
            detector.ear_threshold = max(0.10, detector.ear_threshold - 0.01)
            print(f"EAR threshold: {detector.ear_threshold:.2f}")

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    detector.release()

    print("Detection stopped")


if __name__ == "__main__":
    main()
