---
title: "How to design Experiments to evaluate your Agentic Systems"
type: article
topic: ai-development
subtopic: evaluation
subtopic: experimentation
status: processed
date: 2026-03-11
author: AVB @neural_avb
source: Twitter/X
tags:
  - ai-development
  - agentic-systems
  - evaluation
  - experimentation
  - llm-evals
  - rl-environments
---

# How to design Experiments to evaluate your Agentic Systems

> **Core Insight:** "Environments & evals are two sides of the same coin" - Prime RL school of thinking

## The Three Goals of Evaluation

| Goal | Description |
|------|-------------|
| **Improve accuracy** | Overall quality of outputs |
| **Improve latency** | Make it run FASTER |
| **Improve cost** | Make it cheaper to run |
| **Improve code quality** | Kill dependencies, simplify codebase |

> *Pick ONE goal while ensuring others stay acceptable*

## The 6-Step Framework

### Step 1: Decide what you want to evaluate

**Rule of thumb:** Treat each agent as a separate harness

**Key questions to ask:**
1. Where in the pipeline have I made the most egregious assumptions?
2. What part of my pipeline happens EARLIEST in the chain? (errors propagate downstream!)
3. What is my goal - what vector am I trying to optimize?

### Step 2: Decide your end goal

- Have a clear hypothesis
- Have a threshold for action
- Consider: **Value to users** + **Speed** + **Cost** + **Tech debt**

### Step 3: Isolate the black box and your knobs

- Create clean function: inputs in → outputs out
- Identify **independent variables** (knobs)
- Keep variables to **max 2-3** initially

**Examples of knobs:**
- Model names
- System prompts
- Tool availability (feature flags)

**Important:** Disable caching during experiments
- No DB writes, no cache writes
- Test cases must be transactional
- Test case 10 should have zero advantage over Test case 4

### Step 4: Design your test-cases

**Input = Expected Output format**

**Sources for test cases:**
1. **Production logs** (BEST) - already have inputs/outputs from real usage
2. **Analytics** - set up PostHog, let users use product for weeks
3. **Manual creation** - write test cases yourself
4. **Synthetic generation** - use LLM to generate

**Quality test-case properties:**
- Deduplicated and diverse
- Ground truth responses preferred
- Minimal overlap within each category

### Step 5: Design one or more evaluation metrics

**Deterministic metrics** (preferred - cheaper, faster, reliable):
- String matching
- JSON validation
- Length checks
- Precision, recall, IOU scores

**Probabilistic metrics:**
- LLM-as-a-judge (prompt smarter model to grade 1-5)

**Always record:**
- Total walltime
- Completion token usage
- Total cost
- Error rates

### Step 6: Draw graphs and plots

- Bar graphs: response times
- Scatter plots: Cost vs IOU, Walltime vs IOU
- Box plots: distribution of response times, chunk lengths
- Goal: **narrow distribution + high mean**

## Real World Example: Paper Breakdown

**Use case:** Evaluate retrieval subagent for research paper Q&A

**Goal:** Cut costs to support more free users

**Experiment:** Test smaller models to reduce inference bill

**Results:**
- Replaced GPT-5-mini with Gemini-3-Flash-Lite
- Faster + cheaper
- Bonus: New model makes auxiliary findings for follow-up subagents
  - Reduces cost significantly

## RL Environments vs Evaluation Harnesses

| Aspect | Eval Harness | RL Environment |
|--------|-------------|----------------|
| Prompts | Input test cases | Procedurally generated |
| Reward | IOU + latency + cost | Custom reward function |
| Training | N/A | End-to-end RL possible |

**Insight:** You can run prompt optimization (GEPA) or RL training on your eval harnesses

---

## Key Takeaways

1. **Evaluate early and often** - Don't wait until production
2. **Isolate modules** - Can't evaluate entire pipeline at once
3. **Production logs > synthetic data** - Real inputs are best
4. **Disable persistence** - Experiments must be repeatable
5. **One variable at a time** - Max 2-3 knobs
6. **Visualize everything** - Graphs reveal insights
7. **Treat evals as RL environments** - Opens up training possibilities

> *"I am SOOOO glad I ran this experiment! I have so many actionable insights it is crazy."* — AVB

---

## Related Concepts

- [[llm-evaluation-metrics]]
- [[agentic-architecture]]
- [[rl-environment-design]]
- [[retrieval-augmented-generation]]
- [[prompt-optimization]]

## Cross-References

- See also: [[2026-03-11-hippocampus-cryopreservation-vitrification]] - Neuroscience research paper
- Back to: [[LITERATURE-INDEX]]

---

*Imported: March 11, 2026*
*Source: Twitter/X @neural_avb*