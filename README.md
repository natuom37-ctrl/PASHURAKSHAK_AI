# PashuRakshak AI

### AI-Powered Livestock Disease Detection & Health Screening Platform

PashuRakshak AI is an AI-powered livestock health screening platform designed to assist farmers and livestock owners in identifying common cattle diseases through image-based analysis.

The platform combines a farmer-friendly web interface with a trained deep-learning image classification model to provide an initial AI-based prediction and relevant health-support information.

> **Detect Early. Act Faster. Protect Livestock.**

---

## Problem Statement

Livestock plays an important role in the livelihood of farmers. However, early identification of animal diseases can be challenging, particularly when veterinary assistance is not immediately available.

Diseases such as Lumpy Skin Disease and Foot-and-Mouth Disease can affect animal health, productivity, and farmer income.

PashuRakshak AI aims to make preliminary livestock disease screening more accessible by allowing users to upload an animal image and receive an AI-based classification.

---

## Our Solution

PashuRakshak AI provides an end-to-end livestock screening workflow:

```text
User
  ↓
Livestock Information
  ↓
Image Upload
  ↓
Image Preprocessing
  ↓
AI Disease Classification
  ↓
Prediction & Confidence
  ↓
Health Information / Precautions
  ↓
Screening History & Analytics
```

The system currently focuses on three image-classification categories:

* **Healthy**
* **Lumpy Disease**
* **Foot-and-Mouth Disease**

---

## Key Features

### AI-Based Disease Screening

Users can upload an image of livestock and run an AI-based screening to obtain a predicted health category.

### Multi-Class Classification

The current model classifies images into three categories:

| Class                  | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| Healthy                | Animal showing no disease signs according to the trained classification category |
| Lumpy Disease          | Image category associated with Lumpy Disease                                     |
| Foot-and-Mouth Disease | Image category associated with Foot-and-Mouth Disease                            |

### Confidence-Based Prediction

The platform can display the model's prediction and corresponding confidence/probability when available.

### Screening History

Previous screening results can be stored and reviewed, allowing users to track earlier screening activity.

### Analytics

The platform provides an analytics section to help visualize and understand screening data.

### Veterinary Support Information

The platform provides supporting information such as:

* Symptoms
* Recommended care
* Critical precautions
* Veterinary guidance

The system is intended as an AI-based screening and decision-support tool and does not replace professional veterinary diagnosis.

---

# AI Model

The disease-classification component was developed using **TensorFlow** and **MobileNetV2**.

### Model Configuration

```text
Architecture: MobileNetV2
Framework: TensorFlow
Input Size: 224 × 224 × 3
Output Classes: 3

Classes:
1. Healthy
2. Lumpy Disease
3. Foot-and-Mouth Disease
```

MobileNetV2 was selected as the backbone because its relatively lightweight architecture is suitable for applications where efficient inference is important.

---

## Dataset

The training dataset contains **3,244 cattle images** distributed across the three classification categories.

```text
Healthy
Lumpy Disease
Foot-and-Mouth Disease

Total Images: 3,244
```

The dataset was divided into training and validation data during model development.

---

## Model Performance

During training, the model achieved approximately:

```text
Training Accuracy:    ~90%
Validation Accuracy:  ~89%
```

> Performance values may vary depending on the training run, dataset split, preprocessing, and evaluation conditions.

---

# TensorFlow & TFLite

The trained TensorFlow/Keras model was also converted to **TensorFlow Lite (TFLite)** for lightweight deployment.

During development, the Keras and TFLite versions were compared to verify that the converted model maintained consistent prediction behavior.

Example validation:

```text
Original Keras Model
        ↓
Prediction
        ↓
Lumpy Disease

TFLite Model
        ↓
Prediction
        ↓
Lumpy Disease
```

The outputs were observed to be consistent with nearly identical probabilities for the tested example.

---

# System Architecture

```text
                  PASHURAKSHAK AI
                         │
                         ▼
                 Farmer / User
                         │
                         ▼
                Web Application
                         │
                         ▼
                  Image Upload
                         │
                         ▼
                 Preprocessing
                         │
                         ▼
             TensorFlow / MobileNetV2
                         │
                         ▼
                Disease Prediction
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           Healthy     Lumpy       FMD
                         │
                         ▼
                  Result & Confidence
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           History    Analytics   Guidance
```

---

# Technology Stack

## Frontend

* HTML
* CSS
* JavaScript
* Responsive/mobile-friendly web interface

## AI / Machine Learning

* Python
* TensorFlow
* Keras
* MobileNetV2
* TensorFlow Lite

## Backend

* Python-based inference API
* Model serving for image prediction

## Model Formats

* `.keras`
* `.tflite`

---

# Application Workflow

### 1. Start a New Screening

The user opens the **New Screening** section.

### 2. Provide Livestock Information

The user selects the relevant animal information supported by the application.

### 3. Upload Image

The user uploads an image of the livestock.

### 4. AI Processing

The image is preprocessed and passed to the trained classification model.

### 5. Prediction

The model generates probabilities for the three trained classes.

### 6. Display Result

The application displays the predicted category and supporting information.

### 7. Record Screening

The screening can be reviewed later through the **Screening History** section.

### 8. Review Analytics

Users can view available screening statistics through the **Analytics** module.

---

# Project Structure

A typical project structure is:

```text
PASHURAKSHAK_AI/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── main.py
│   ├── model/
│   │   ├── cattle_disease_model.keras
│   │   └── cattle_disease_model.tflite
│   └── requirements.txt
│
├── dataset/
│   ├── healthy/
│   ├── lumpy/
│   └── foot_and_mouth/
│
├── README.md
└── ...
```

> Update the folder names above if your actual repository uses a different structure.

---

# Running the Project Locally

## Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd PASHURAKSHAK_AI
```

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create and activate a virtual environment:

### Windows

```powershell
python -m venv venv
.\venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The backend will then be available locally at:

```text
http://localhost:8000
```

---

# Prototype Deployment

The project can be deployed as a web application with the frontend connected to the backend inference API.

For production deployment, environment-specific API URLs should be configured rather than hard-coding localhost endpoints.

---

# Current Limitations

The current prototype has several limitations:

* The model is trained for a limited number of disease categories.
* Model predictions depend on the quality and characteristics of the input image.
* The system should not be considered a replacement for professional veterinary diagnosis.
* Additional real-world validation is required before clinical or field deployment.
* Dataset expansion is required to improve robustness across different breeds, environments, lighting conditions, and image qualities.

---

# Future Scope

We plan to further develop PashuRakshak AI by:

* Expanding the number of livestock diseases
* Supporting additional livestock species
* Increasing and diversifying the training dataset
* Improving model robustness and accuracy
* Optimizing inference for mobile and edge devices
* Improving offline functionality
* Adding multilingual support for farmers
* Providing richer veterinary-support information
* Adding improved monitoring and livestock health records

---

# Impact

PashuRakshak AI aims to bridge the gap between modern AI technology and accessible livestock healthcare support.

By combining image-based AI screening with a simple digital interface, the platform can potentially help users recognize possible disease categories earlier and make more informed decisions about seeking veterinary assistance.

The broader goal is to contribute to:

* Better livestock health awareness
* Earlier identification of possible disease
* Reduced delays in seeking veterinary assistance
* Improved livestock productivity
* Better protection of farmer livelihoods

---

# Disclaimer

PashuRakshak AI is an **AI-based livestock disease screening and decision-support prototype**.

Its predictions should not be treated as a definitive veterinary diagnosis. Users should consult a qualified veterinarian for professional examination, diagnosis, treatment, and medical decisions.

---

# Team

**Project:** PashuRakshak AI

**Focus:** AI-Based Livestock Disease Detection

**Technologies:** TensorFlow · MobileNetV2 · TFLite · Python · Web Application

---

## Project Vision

> **Detect Early. Act Faster. Protect Livestock.**

PashuRakshak AI aims to make AI-assisted livestock health screening more accessible, practical, and farmer-friendly.
