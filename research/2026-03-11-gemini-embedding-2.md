---
title: "Gemini Embedding 2: Our first natively multimodal embedding model"
type: product-announcement
topic: ai-development
subtopic: embeddings
subtopic: multimodal-ai
subtopic: google-gemini
status: processed
date: 2026-03-11
author: Google
source: Google AI Blog
tags:
  - ai-development
  - embeddings
  - multimodal
  - gemini
  - rag
  - vertex-ai
  - vector-search
---

# Gemini Embedding 2: Our first natively multimodal embedding model

> **Release:** Public Preview via Gemini API and Vertex AI

## Overview

First fully multimodal embedding model built on Gemini architecture. Maps text, images, videos, audio, and documents into a single, unified embedding space.

**Key Capability:** Captures semantic intent across 100+ languages

---

## Supported Modalities

| Modality | Specifications |
|----------|----------------|
| **Text** | Up to 8,192 input tokens |
| **Images** | Up to 6 images per request (PNG, JPEG) |
| **Video** | Up to 120 seconds (MP4, MOV) |
| **Audio** | Native ingestion, no transcription needed |
| **Documents** | PDFs up to 6 pages |

### Unique Feature: Interleaved Input
- Pass multiple modalities (e.g., image + text) in a single request
- Captures complex relationships between media types

---

## Technical Specifications

### Matryoshka Representation Learning (MRL)
- Dynamically scales down dimensions
- **Default:** 3,072 dimensions
- **Recommended options:** 3,072, 1,536, 768
- Balance performance vs. storage costs

### Performance Claims
- **State-of-the-art** in multimodal depth
- Strong speech capabilities
- Outperforms leading models in:
  - Text tasks
  - Image tasks
  - Video tasks

---

## Use Cases

### Primary Applications
1. **Retrieval-Augmented Generation (RAG)**
2. **Semantic search**
3. **Sentiment analysis**
4. **Data clustering**
5. **Context engineering**

---

## Early Access Partner Results

### Everlaw (Legal Tech)
> *"Gemini's multi-modal embedding model improves precision and recall across millions of records, while unlocking powerful new search functionality for images and videos."*
- **Use case:** Legal discovery process
- **Impact:** Precision + recall improvements for large document sets

### Sparkonomy (Creator Economy)
> *"Native multi-modality slashes our latency by up to 70% by removing LLM inference and nearly doubles semantic similarity scores for text-image and text-video pairs — leaping from 0.4 to 0.8"*
- **Use case:** Creator Genome (index millions of minutes of video + images + text)
- **Impact:** 70% latency reduction, similarity 0.4 → 0.8

### Mindlid (Personal Wellness)
> *"20% lift in top-1 recall for our personal wellness app"*
- **Use case:** Embed text-based conversational memories with audio/visual
- **Impact:** 20% recall improvement

---

## Integration

### APIs
- Gemini API
- Google Vertex AI

### Python Example

```python
from google import genai
from google.genai import types

client = genai.Client()

with open("example.png", "rb") as f:
    image_bytes = f.read()
with open("sample.mp3", "rb") as f:
    audio_bytes = f.read()

result = client.models.embed_content(
    model="gemini-embedding-2-preview",
    contents=[
        "What is the meaning of life?",
        types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/png",
        ),
        types.Part.from_bytes(
            data=audio_bytes,
            mime_type="audio/mpeg",
        ),
    ],
)
print(result.embeddings)
```

### Supported Frameworks
- LangChain
- LlamaIndex
- Haystack
- Weaviate
- QDrant
- ChromaDB
- Vector Search

---

## Strategic Significance

- **First** natively multimodal embedding from Google
- **Unified** embedding space replaces multiple specialized models
- **Simplifies** complex multimodal pipelines
- **Enables** new use cases requiring image/video/audio understanding

---

## Related Concepts

- [[retrieval-augmented-generation|RAG]] - Retrieval-Augmented Generation
- [[multimodal-embeddings]]
- [[matryoshka-representation-learning]]
- [[vector-database]]
- [[langchain-integration]]
- [[llamaindex-integration]]

## Cross-References

- Back to: [[LITERATURE-INDEX]]

---

*Imported: March 11, 2026*
*Source: Google AI Blog*