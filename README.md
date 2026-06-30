# 🧠 Transformer Mechanics Visualizer

An interactive, educational web application designed to build strong visual and mathematical intuition for the inner workings of the **Transformer Neural Network Architecture** (*"Attention Is All You Need"*, Vaswani et al., 2017). 

Built using **React**, **Tailwind CSS v4**, and **reactive SVG visuals** to demonstrate how Transformers process language, map long-range dependencies, and parallelize training.

---

## 🚀 Live Demo & Deployment
- **GitHub Repository:** [https://github.com/MurtuzaShaikh26/Transformer_Mech_Visualizer](https://github.com/MurtuzaShaikh26/Transformer_Mech_Visualizer)
- **Vercel Deployment:** Automatically linked to the main branch of the GitHub repository.

---

## 🎨 Interactive Modules

### 1. 🏗️ Architecture Overview
*   **Layer Stacks:** Visualizes the encoder-decoder structure showing that the encoder is a stack of $N=6$ identical layers, and the decoder inserts a third cross-attention sub-layer.
*   **Positional Encoding (PE) Injection:** Interactive wave graph visualizing the sine and cosine functions of varying frequencies. Includes a position vs. dimension matrix heatmap that updates dynamically as you select token positions or sequence lengths.
*   **Component Inspector:** Click on any block (Self-Attention, Cross-Attention, Feed-Forward) to view its mathematical formulas, dimensions, and explanations.

### 2. ⚡ Training vs. Inference Simulation
*   **Training Mode (Parallel):** Animates the parallelization advantage. Shows the entire target sequence being fed into the decoder all at once (Teacher Forcing), calculating predictions simultaneously rather than sequentially.
*   **Inference Mode (Auto-Regressive):** Animates step-by-step token generation. Demonstrates the auto-regressive property, showing how the decoder generates one symbol at a time and feeds it back as input for the next step.
*   **Playback Controls:** Interactive Play, Pause, Step-Forward, Speed adjustments, and Reset buttons.

### 3. 🔢 Masking Matrix Visualizer
*   **Step-by-Step Attention Math:** Click through the mathematical stages:
    $$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
    1. **Raw Dot Product ($QK^T$):** Initial semantic alignment scores.
    2. **Scaling ($/\sqrt{d_k}$):** Divides scores to avoid extreme value gradients.
    3. **Masking ($+M$):** Visualizes the upper-right triangle being set to $-\infty$ in the decoder matrix.
    4. **Softmax:** Computes attention percentages where masked cells become exactly $0\%$.
*   **Inspector Tooltip:** Hover over any grid cell to see the exact query-key word relationship, formulas, and visual logic (explaining how $-\infty$ prevents looking ahead to cheat during training).

### 4. 🔗 Attention Head Connections
*   **Bipartite Visualizations:** Renders dual-column token listings with smooth bezier curves representing attention weights.
*   **Winograd Schema Examples:** Preloaded sentences highlighting coreference resolution:
    *   *"The Law gave the committee its approval"* (Head 1 resolves *"its"* to *"Law"*; Head 2 resolves it to *"committee"*).
    *   *"The animal didn't cross the street because it was too tired"* (resolves *"it"* to *"animal"*).
    *   *"The animal didn't cross the street because it was too wide"* (resolves *"it"* to *"street"*).
*   **Multi-Head Toggle:** Switch between 8 independent attention heads to see specialized syntactic alignments, or overlay **all 8 heads** at once.

---

## 🛠️ Tech Stack & Setup

*   **Framework:** React (Vite template)
*   **Styling:** Tailwind CSS v4 (configured via PostCSS with `@tailwindcss/postcss`)
*   **Icons:** Lucide React
*   **Animations:** CSS Keyframes & SVG Transitions

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MurtuzaShaikh26/Transformer_Mech_Visualizer.git
   cd Transformer_Mech_Visualizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📚 Educational Value: Why this works
1. **Parallel Training vs. Sequential Inference:** Helps learners understand why training LLMs is fast (due to GPU parallel processing with attention masking) while inference remains bound by sequential token generation.
2. **The Masking Step:** Demystifies the mathematical trick of adding $-\infty$ before softmax to block forward information flow.
3. **Multi-Head Specialization:** Demonstrates how different projection subspaces learn distinct linguistic features like pronoun resolution or grammatical dependencies.

---
*Created for deep learning practitioners and students alike to explore the foundations of modern generative AI.*
