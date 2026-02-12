# Sample Queries for Testing Task 3: Semantic Search

This document contains sample queries you can use to test the semantic search functionality, along with recommendations for vector stores and expected result types.

---

## 🎯 Quick Test Queries

### Easy Tests (High Similarity Expected)

These queries should return strong matches if your documents contain machine learning/AI content:

| # | Query | Vector Store | Top-K | Expected Results |
|---|-------|--------------|-------|------------------|
| 1 | "What is machine learning?" | Any | 5 | Introductory ML content, definitions |
| 2 | "Explain neural networks" | Any | 5 | Neural network architecture, basics |
| 3 | "What is deep learning?" | Any | 5 | Deep learning concepts, architectures |
| 4 | "How does backpropagation work?" | Any | 5 | Training algorithms, gradient descent |
| 5 | "What is supervised learning?" | Any | 5 | Learning paradigms, classification |

---

## 📊 Recommended Vector Store Testing Strategy

### Test 1: Compare Vector Stores with Same Query

**Query:** "How does attention mechanism work in transformers?"

**Test Plan:**
1. **FAISS - all-MiniLM-L6-v2** (fast, lightweight)
   - Expected: Good general understanding
   - Best for: Fast retrieval, general queries

2. **FAISS - all-mpnet-base-v2** (more accurate)
   - Expected: Better semantic understanding
   - Best for: Complex queries, nuanced understanding

3. **Chroma - all-MiniLM-L6-v2** (persistent storage)
   - Expected: Similar to FAISS MiniLM
   - Best for: Production use, persistent queries

4. **Chroma - paraphrase-MiniLM-L3-v2** (lightweight)
   - Expected: Good paraphrase detection
   - Best for: Finding similar phrasings

**What to Compare:**
- Similarity scores (which gives higher confidence?)
- Result relevance (which returns most relevant chunks?)
- Response time (which is faster?)
- Ranking order (do results differ?)

---

## 🔬 Comprehensive Test Suite

### Category 1: Fundamental Concepts

Perfect for testing if your documents cover ML basics.

```
1. "What is artificial intelligence?"
   Vector Store: FAISS_all-MiniLM-L6-v2
   Top-K: 5
   Expected: AI definitions, history, applications

2. "Define machine learning"
   Vector Store: FAISS_all-mpnet-base-v2
   Top-K: 3
   Expected: ML definitions, types of learning

3. "What are neural networks?"
   Vector Store: Chroma_all-MiniLM-L6-v2
   Top-K: 5
   Expected: Neural network structure, neurons, layers

4. "Explain artificial neurons"
   Vector Store: FAISS_all-MiniLM-L6-v2
   Top-K: 3
   Expected: Perceptrons, activation functions

5. "What is a perceptron?"
   Vector Store: FAISS_all-mpnet-base-v2
   Top-K: 5
   Expected: Basic neural network unit, history
```

### Category 2: Deep Learning Architectures

Tests understanding of specific architectures.

```
6. "How do convolutional neural networks work?"
   Vector Store: FAISS_all-mpnet-base-v2
   Top-K: 5
   Expected: CNNs, image processing, convolution layers

7. "What is a recurrent neural network?"
   Vector Store: Chroma_all-MiniLM-L6-v2
   Top-K: 5
   Expected: RNNs, sequential data, LSTM, GRU

8. "Explain transformer architecture"
   Vector Store: FAISS_all-mpnet-base-v2
   Top-K: 7
   Expected: Transformers, attention, encoder-decoder

9. "What are autoencoders?"
   Vector Store: FAISS_all-MiniLM-L6-v2
   Top-K: 5
   Expected: Dimensionality reduction, reconstruction

10. "Describe generative adversarial networks"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: GANs, generator, discriminator
```

### Category 3: Training & Optimization

Tests understanding of learning algorithms.

```
11. "How does gradient descent work?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: Optimization, loss functions, learning rate

12. "What is backpropagation?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Chain rule, weight updates, gradients

13. "Explain stochastic gradient descent"
    Vector Store: Chroma_all-mpnet-base-v2
    Top-K: 5
    Expected: SGD variants, mini-batch, convergence

14. "What is overfitting in machine learning?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Generalization, validation, regularization

15. "How to prevent overfitting?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 7
    Expected: Dropout, regularization, data augmentation
```

### Category 4: Attention Mechanisms (Your Example Query)

Perfect for testing the default query in the UI.

```
16. "How does attention mechanism work in transformers?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: Self-attention, multi-head attention, Q/K/V

17. "What is self-attention?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Attention computation, query-key-value

18. "Explain multi-head attention"
    Vector Store: Chroma_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Parallel attention heads, concatenation

19. "What are attention weights?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 3
    Expected: Softmax, attention scores, relevance
```

### Category 5: Natural Language Processing

Tests NLP-specific content.

```
20. "What is natural language processing?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: NLP tasks, language understanding

21. "How do language models work?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: LMs, tokenization, probability distribution

22. "What is word embedding?"
    Vector Store: Chroma_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Word2Vec, GloVe, semantic vectors

23. "Explain BERT model"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: Bidirectional encoding, pre-training, fine-tuning

24. "What is GPT?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Generative pre-training, autoregressive models
```

### Category 6: Computer Vision

Tests CV-specific queries.

```
25. "How does image classification work?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: CNNs, feature extraction, softmax

26. "What is object detection?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: YOLO, R-CNN, bounding boxes

27. "Explain image segmentation"
    Vector Store: Chroma_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Semantic segmentation, U-Net, masks

28. "What are pooling layers?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 3
    Expected: Max pooling, average pooling, downsampling
```

### Category 7: Learning Paradigms

Tests different types of learning.

```
29. "What is supervised learning?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Labeled data, classification, regression

30. "Explain unsupervised learning"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: Clustering, dimensionality reduction, anomaly detection

31. "What is reinforcement learning?"
    Vector Store: Chroma_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Agent, environment, reward, Q-learning

32. "Describe semi-supervised learning"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: Combining labeled/unlabeled data

33. "What is transfer learning?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Pre-trained models, fine-tuning, feature extraction
```

### Category 8: Advanced Topics

More complex queries for testing semantic understanding.

```
34. "How do you handle class imbalance?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 7
    Expected: SMOTE, oversampling, weighted loss

35. "What is batch normalization?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Normalizing activations, training stability

36. "Explain dropout regularization"
    Vector Store: Chroma_all-MiniLM-L6-v2
    Top-K: 5
    Expected: Random neuron deactivation, overfitting prevention

37. "What is data augmentation?"
    Vector Store: FAISS_all-mpnet-base-v2
    Top-K: 5
    Expected: Image transformations, synthetic data

38. "How does cross-validation work?"
    Vector Store: FAISS_all-MiniLM-L6-v2
    Top-K: 5
    Expected: K-fold, validation strategy, model evaluation
```

---

## 🎨 Testing Similarity Scores

### High Similarity Tests (Expected >80%)

These queries should return high similarity scores if your documents directly discuss these topics:

```
Query: "Define deep learning"
Expected Top Result Similarity: 85-95%
Vector Store: FAISS_all-mpnet-base-v2

Query: "What is a neural network?"
Expected Top Result Similarity: 80-90%
Vector Store: FAISS_all-MiniLM-L6-v2
```

### Medium Similarity Tests (Expected 50-80%)

Queries using different phrasing or related concepts:

```
Query: "How do machines learn from data?"
Expected Top Result Similarity: 60-75%
(Related to: machine learning definitions)
Vector Store: FAISS_all-mpnet-base-v2

Query: "Artificial brain networks"
Expected Top Result Similarity: 55-70%
(Related to: neural networks)
Vector Store: Chroma_paraphrase-MiniLM-L3-v2
```

### Low Similarity Tests (Expected <50%)

Queries on topics not well-covered in your documents:

```
Query: "How to cook pasta?"
Expected: Low similarity or no relevant results
Vector Store: Any

Query: "What is quantum computing?"
Expected: Low similarity (unless you have quantum ML content)
Vector Store: Any
```

---

## 🧪 Multi-Query Testing

### Test Set 1: Related Concepts

```json
{
  "queries": [
    "What is machine learning?",
    "Define artificial intelligence",
    "Explain deep learning"
  ],
  "vector_store_id": "FAISS_all-mpnet-base-v2",
  "top_k": 3
}
```

**Purpose:** Compare how similar queries return different results

### Test Set 2: Specific Architectures

```json
{
  "queries": [
    "How do CNNs work?",
    "What are recurrent neural networks?",
    "Explain transformers"
  ],
  "vector_store_id": "FAISS_all-mpnet-base-v2",
  "top_k": 5
}
```

**Purpose:** Test retrieval across different architecture types

### Test Set 3: Training Concepts

```json
{
  "queries": [
    "What is gradient descent?",
    "How does backpropagation work?",
    "Explain stochastic optimization"
  ],
  "vector_store_id": "FAISS_all-MiniLM-L6-v2",
  "top_k": 4
}
```

**Purpose:** Test related training algorithms

---

## 📈 Expected Results by Vector Store

### FAISS_all-MiniLM-L6-v2
- **Speed:** ⚡ Fastest
- **Accuracy:** ⭐⭐⭐ Good
- **Best For:** Quick searches, simple queries
- **Embedding Dim:** 384
- **Typical Similarity Range:** 0.65-0.92

### FAISS_all-mpnet-base-v2
- **Speed:** ⚡⚡ Fast
- **Accuracy:** ⭐⭐⭐⭐⭐ Excellent
- **Best For:** Complex queries, best accuracy
- **Embedding Dim:** 768
- **Typical Similarity Range:** 0.70-0.95

### Chroma_all-MiniLM-L6-v2
- **Speed:** ⚡⚡ Fast
- **Accuracy:** ⭐⭐⭐ Good
- **Best For:** Persistent storage, production
- **Embedding Dim:** 384
- **Typical Similarity Range:** 0.65-0.92

### Chroma_paraphrase-MiniLM-L3-v2
- **Speed:** ⚡⚡⚡ Very Fast
- **Accuracy:** ⭐⭐⭐ Good for paraphrases
- **Best For:** Finding rephrased content
- **Embedding Dim:** 384
- **Typical Similarity Range:** 0.60-0.88

---

## 🎯 Recommended Testing Order

### Phase 1: Basic Functionality (5 minutes)
1. Select **FAISS_all-MiniLM-L6-v2**
2. Set Top-K to **5**
3. Query: **"What is machine learning?"**
4. Verify results appear with scores

### Phase 2: Compare Vector Stores (10 minutes)
1. Use same query: **"How does attention mechanism work in transformers?"**
2. Test with each vector store
3. Compare similarity scores and results
4. Note which gives best results

### Phase 3: Test Different Query Types (10 minutes)
1. Test 5 queries from different categories above
2. Vary Top-K (3, 5, 10)
3. Check result relevance
4. Test search history feature

### Phase 4: Edge Cases (5 minutes)
1. Empty query (should show error)
2. Very long query (should work)
3. Query with no matches
4. Special characters in query

---

## 📝 Results Interpretation Guide

### Similarity Score Meanings

| Score Range | Color | Interpretation |
|-------------|-------|----------------|
| 0.90 - 1.00 | 🟢 Green | Excellent match - almost exact semantic match |
| 0.80 - 0.89 | 🟢 Green | Very good match - highly relevant |
| 0.70 - 0.79 | 🟡 Yellow | Good match - relevant content |
| 0.60 - 0.69 | 🟡 Yellow | Fair match - somewhat relevant |
| 0.50 - 0.59 | 🟡 Yellow | Weak match - tangentially related |
| Below 0.50 | 🔴 Red | Poor match - likely not relevant |

### What to Look For

✅ **Good Results:**
- Similarity scores > 0.70 for first result
- Source files match query topic
- Content directly answers or relates to query
- Ranking makes logical sense (most relevant first)

❌ **Poor Results:**
- All scores < 0.60
- Content unrelated to query
- Wrong source files returned
- Odd ranking order

---

## 🚀 Quick Copy-Paste Queries

Just copy these directly into the search box:

```
What is machine learning?
How does backpropagation work?
Explain neural networks
What is deep learning?
How does attention mechanism work in transformers?
What is supervised learning?
Explain gradient descent
What are convolutional neural networks?
How do language models work?
What is reinforcement learning?
```

---

## 📊 Expected Performance

### Response Times (Approximate)

- **Vector Store Loading:** 1-3 seconds (first query)
- **Search Query:** 0.1-0.5 seconds
- **Multi-Query (3 queries):** 0.3-1.5 seconds
- **Frontend Rendering:** < 0.1 seconds

### Result Quality

Assuming your documents contain ML/AI content:

- **High relevance (>0.80):** 30-50% of results
- **Good relevance (0.65-0.80):** 40-50% of results
- **Low relevance (<0.65):** 10-20% of results

---

## 🔍 Troubleshooting Query Results

### Problem: All Low Similarity Scores (<0.60)

**Possible Causes:**
- Documents don't contain related content
- Query uses very specific terminology not in documents
- Wrong vector store selected

**Solutions:**
1. Try more general queries
2. Check what documents are in `data/` directory
3. Try different vector store (mpnet-base-v2 is best)

### Problem: No Results Returned

**Possible Causes:**
- Vector store not properly loaded
- Empty vector store
- Backend error

**Solutions:**
1. Check browser console for errors
2. Verify backend is running
3. Regenerate vector store (Task 2)

### Problem: Results Don't Match Query

**Possible Causes:**
- Limited document coverage
- Semantic mismatch
- Model limitations

**Solutions:**
1. Use more specific queries
2. Try different vector store
3. Increase Top-K to see more results

---

## 📚 Document Coverage Check

Before testing, verify your documents contain relevant content:

```bash
# Check what documents you have
ls data/

# Check content of a document
head -20 data/your_document.txt
```

Your queries should match the content of your uploaded documents!

---

## ✅ Testing Checklist

Use this checklist to ensure comprehensive testing:

- [ ] Tested GET /api/search/vectorstores
- [ ] Tested at least 3 different queries
- [ ] Tested all available vector stores
- [ ] Tested different Top-K values (1, 5, 10)
- [ ] Verified similarity scores display correctly
- [ ] Verified color-coded progress bars
- [ ] Tested search history feature
- [ ] Tested clicking history items
- [ ] Tested error handling (empty query)
- [ ] Tested edge cases (long query, special chars)
- [ ] Verified response times are reasonable
- [ ] Compared results across vector stores
- [ ] Tested multi-query endpoint via API

---

**Happy Testing! 🎉**

If results don't match expectations, remember: semantic search quality depends heavily on the content of your uploaded documents. Make sure your documents cover the topics you're querying about!
