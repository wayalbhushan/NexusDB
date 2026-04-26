# ⚡ NexusDB: Robust Vector Engine & Offline RAG

![NexusDB Dashboard](./docs/hero-screenshot.png)

NexusDB is a highly-concurrent, proprietary Vector Database and offline Retrieval-Augmented Generation (RAG) engine. Built entirely from scratch, this project bridges low-level systems engineering with high-fidelity enterprise data visualization.

Instead of relying on cloud vector APIs (like Pinecone or Weaviate), this project implements the core mathematical, algorithmic, and memory-management architecture required for high-dimensional semantic search natively in **C++17**, visualized via a custom **Next.js** observability console.

---

## 🧠 Core Architecture & Features

### 1. The C++17 Vector Engine
* **HNSW Indexing:** Implements Hierarchical Navigable Small World graphs for $O(\log N)$ vector retrieval.
* **Algorithmic Benchmarking:** Runs HNSW, KD-Tree, and Linear Brute Force search algorithms side-by-side to benchmark dimensional scaling limits.
* **Hardware Optimization:** Euclidean and Cosine similarity calculations optimized to leverage underlying compiler instructions (`-O2` / SIMD).

### 2. Air-Gapped AI Pipeline (Local RAG)
* **Local Inference:** Fully integrated with the local Ollama daemon.
* **Embedding Core:** Utilizes `nomic-embed-text` for 768-dimensional contextual mapping.
* **Generation Core:** Utilizes `llama3.2` for highly technical, context-aware synthesis.
* **Security Posture:** 100% offline execution. Zero API keys, zero data leaks. Capable of analyzing sensitive proprietary infrastructure logs locally.

### 3. Enterprise Observability Console (Next.js)
* **Dynamic Network Topology:** Uses HTML5 Canvas to render a live, parallax data topography, visually tracing vector retrievals via PCA-reduced semantic coordinates and microsecond telemetry.
* **Comet-Pro UI Design:** Glassmorphism overlays, distinct RAG citation cards, and real-time execution benchmarks.

---

## ⚙️ Data Flow Topology

```text
[ Raw Document / Text ]
          │
          ▼
[ Ollama: nomic-embed-text ]  ← Converts text to 768D semantic vector
          │
          ▼
[ C++ HNSW Vector Index ]     ← Maps vector into a multilayer small-world graph
          │
          ▼
[ Semantic KNN Search ]       ← Rapidly retrieves nearest contextual neighbors
          │
          ▼
[ Ollama: llama3.2 ]          ← Ingests context chunks and synthesizes an answer
          │
          ▼
[ Next.js RAG Terminal ]      ← Streams response with exact memory citation tags
```

## 🛠️ Installation & Setup (Windows)

This environment requires a C++ compiler (GCC) and the Ollama local AI daemon.

### 1. Install Dependencies

*   **MSYS2 (C++ Compiler):** Download from msys2.org. Install, open the MSYS2 UCRT64 terminal, and run:
    ```bash
    pacman -Syu
    pacman -S mingw-w64-ucrt-x86_64-gcc
    ```
    *Note: Add `C:\msys64\ucrt64\bin` to your Windows System PATH.*

*   **Ollama:** Download from ollama.com. Open PowerShell and pull the required offline models:
    ```powershell
    ollama pull nomic-embed-text
    ollama pull llama3.2
    ```

### 2. Clone & Compile the Engine

```powershell
git clone https://github.com/wayalbhushan/NexusDB.git
cd NexusDB

# Compile the C++ Engine
g++ -std=c++17 -O2 main.cpp -o db -lws2_32
```

### 3. Launch the Stack

You need two terminals to run the decoupled architecture.

**Terminal 1 (Backend Daemon):**
```powershell
./db
```

**Terminal 2 (Frontend Console):**
```powershell
cd nexus-ui
npm install
npm run dev
```

Navigate to `http://localhost:3000` to access the Nexus Observatory.

---

## 📡 REST API Reference

The C++ daemon exposes a lightweight HTTP server on port 8080 for programmatic access.

| Method | Endpoint | Payload | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/doc/insert` | `{"title":"...","text":"..."}` | Generates 768D embedding and stores chunk. |
| `POST` | `/doc/ask` | `{"question":"...","k":3}` | Triggers the full RAG generation pipeline. |
| `GET` | `/benchmark` | `?v=...&k=5&metric=cosine` | Benchmarks HNSW vs KD-Tree vs Brute Force. |
| `GET` | `/hnsw-info` | — | Returns diagnostic graph structure and layer stats. |
| `GET` | `/status` | — | Pings Ollama daemon connectivity. |

---

## 🔬 Algorithmic Deep Dive

Why build custom indices? To understand the mathematical limits of dimensional scaling.

### HNSW (Hierarchical Navigable Small World)
The production standard. Nodes are inserted into a multilayer probabilistic graph. Upper layers act as semantic "highways," allowing the search to skip vast amounts of irrelevant data before zooming into denser, lower layers. This achieves true $O(\log N)$ search complexity even in high-dimensional spaces (like 768D embeddings), which is why it powers modern platforms like Milvus and Pinecone.

### KD-Tree (K-Dimensional Tree)
A binary space partitioning tree. It aggressively prunes search spaces using axis-aligned bounds. While it achieves $O(\log N)$ in low dimensions, it suffers heavily from the Curse of Dimensionality. Above ~20 dimensions, the volume of the space scales so rapidly that almost all data points sit on the "boundaries" of the hyperspheres, forcing the algorithm to evaluate nearly every node—effectively degrading back to $O(N)$.

### Linear Brute Force
The baseline truth metric. Evaluates the Cosine or Euclidean distance of the query vector against every resident vector in memory. Complexity is strictly $O(N \cdot d)$. Used within this system solely to verify the accuracy/recall of the HNSW approximate nearest neighbors.

---

## ⚠️ Troubleshooting

| Issue | Resolution |
| :--- | :--- |
| **Ollama: OFFLINE** | Ensure the Ollama background process is running (`ollama serve`). |
| **AI CORE UNREACHABLE** | First-time queries suffer from a "Cold Start" (loading a 2GB model into RAM). Ensure your frontend timeout is set to at least 120s. |
| **High Inference Latency** | Local LLMs bottleneck on CPU matrix multiplication. If standard `llama3.2` is too slow on your hardware, switch the backend configuration to the 1B parameter model: `ollama pull llama3.2:1b`. |

---

**Architected and engineered by Bhushan wayal**
