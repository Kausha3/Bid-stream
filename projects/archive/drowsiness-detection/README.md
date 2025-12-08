# Driver Drowsiness Detection System

A real-time drowsiness detection system using computer vision to monitor driver alertness and prevent accidents caused by fatigue.

## How It Works

The system uses the **Eye Aspect Ratio (EAR)** algorithm to detect drowsiness:

1. **Face Detection**: MediaPipe Face Mesh detects facial landmarks
2. **Eye Tracking**: Extracts 6 landmarks per eye
3. **EAR Calculation**: Computes eye openness ratio
4. **Drowsiness Detection**: Triggers alert when EAR drops below threshold for consecutive frames

### Eye Aspect Ratio Formula

```
EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
```

- **Open eyes**: EAR ~ 0.25-0.30
- **Closed eyes**: EAR ~ 0.05

## Features

- Real-time webcam processing
- Visual EAR display
- Drowsiness alert with screen flash
- Adjustable sensitivity threshold
- Smooth detection using frame history
- Alert cooldown to prevent spam

## Tech Stack

- **Python 3.8+**
- **OpenCV** - Video capture and image processing
- **MediaPipe** - Face mesh and landmark detection
- **NumPy** - Mathematical operations
- **Pygame** (optional) - Audio alerts

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

```bash
python detector.py
```

### Controls

| Key | Action |
|-----|--------|
| `q` | Quit |
| `+` | Increase EAR threshold (less sensitive) |
| `-` | Decrease EAR threshold (more sensitive) |

## Configuration

Default parameters in `DrowsinessDetector`:

```python
ear_threshold = 0.21        # EAR below this = eyes closed
consecutive_frames = 20     # Frames before alert triggers
alert_cooldown = 3.0        # Seconds between alerts
```

## Algorithm Details

### MediaPipe Face Mesh Landmarks

The system uses specific landmark indices for each eye:

- **Left Eye**: [362, 385, 387, 263, 373, 380]
- **Right Eye**: [33, 160, 158, 133, 153, 144]

### Detection Pipeline

```
Frame Capture -> RGB Conversion -> Face Mesh Detection
    -> Eye Landmark Extraction -> EAR Calculation
    -> Smoothing -> Threshold Check -> Alert
```

### Smoothing

Uses a rolling average of 30 frames to reduce noise and false positives from blinking.

## Limitations

- Requires good lighting conditions
- Single face detection only
- May need calibration for different users
- Glasses can affect accuracy

## Learning Highlights

- Computer vision fundamentals with OpenCV
- MediaPipe for facial landmark detection
- Mathematical formulas for eye state detection (EAR)
- Real-time video processing pipeline
- State management for consecutive frame counting
- Cooldown systems to prevent alert fatigue

## References

- [Eye Aspect Ratio Paper](http://vision.fe.uni-lj.si/cvww2016/proceedings/papers/05.pdf) - Soukupova & Cech, 2016
- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)
