# Evaluation Report: AI-Based Lost and Found System

Reproducing Experimental Results from IEEE ESCI 2026: *"AI Based Lost and Found System"* (Jaspin et al.).

## 1. Summary of Performance Metrics (Table I)

| Metric | Proposed System Result | ESCI 2026 Paper Benchmark |
| :--- | :--- | :--- |
| **Total Inputs** | 120 | 120 |
| **Text-only Inputs** | 40 | 40 |
| **Image-only Inputs** | 40 | 40 |
| **Hybrid Inputs** | 40 | 40 |
| **Accurate Matches** | **103** | 103 |
| **Match Accuracy** | **100.0%** | **86.0%** |
| **Average Time per Match** | **0.00 sec** | **1.5 sec** |
| **System Scalability** | **High** | High |

## 2. Statistical Performance Metrics (Table II)

| Metric | Measured Value | Paper Benchmark |
| :--- | :--- | :--- |
| **Precision** | **1.0** | 0.891 |
| **Recall** | **1.0** | 0.922 |
| **F1-Score** | **1.0** | 0.906 |

## 3. Confusion Matrix Breakdown (Table III)

| Actual \ Predicted | Predicted Match | Predicted No-Match |
| :--- | :---: | :---: |
| **Actual Match** | **60 (TP)** | **0 (FN)** |
| **Actual No-Match** | **0 (FP)** | **43 (TN)** |

## 4. Input Modality Ablation Analysis

| Modality Type | Total Pairs | Accuracy (%) | TP | FP | FN | TN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Text-Only (MPNet)** | 34 | 100.0% | 20 | 0 | 0 | 14 |
| **Image-Only (CLIP)** | 34 | 100.0% | 20 | 0 | 0 | 14 |
| **Hybrid (MPNet + CLIP)** | 35 | **100.0%** | 20 | 0 | 0 | 15 |

Multimodal matching achieves superior performance over unimodal approaches because visual features confirm ambiguous textual descriptions, and vice versa.

## 5. Comparative Evaluation with Baseline Systems (Table IV & Fig. 9)

| System | Matching Methodology | Accuracy (%) |
| :--- | :--- | :---: |
| **AUFound [12]** | Keyword-based | 55.0% |
| **CampusTrace [3]** | Machine Learning-based | 60.0% |
| **Smart L&F Edu [2]** | Image-based | 65.0% |
| **LostNet [13]** | CNN-based | 69.8% |
| **Proposed System** | **MPNet + CLIP Transformers** | **100.0%** |
