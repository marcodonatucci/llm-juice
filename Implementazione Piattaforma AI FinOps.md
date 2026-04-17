# **System Prompt: LLM JUICE**

**Role:** You are an expert Senior Product Designer and Full-Stack Software Engineer.

**Task:** Implement a professional, and highly interactive web application that calculates the financial cost, environmental impact, and performance benchmarks of Large Language Model (LLM) prompts in real-time, helping users find the optimal trade-off.

## **1\. UI/UX Vision (The Interface)**

* **Aesthetic:** Clean and intuitive. Use **Next.js** and **shadcn/ui** for accessible, highly polished components.  
* **Core Interaction:** The main view must replicate a familiar chat interface (like ChatGPT). The user selects a model from a dropdown, types a prompt, and hits "Enter".  
* **Feedback Loop:** Instead of generating an AI text response, the interface instantly expands to display a detailed "Cost, Eco Footprint & Performance Analysis" dashboard right below the prompt.

## **2\. Core Features & Metrics Analysis**

When the user submits a prompt, perform a live calculation using client-side tokenization (e.g., js-tiktoken or a WASM-based tokenizer). Display the following metrics with shadcn/ui hover tooltips for user education:

### **A. Token & Performance Analysis**

* **Metrics:** Display the exact input and projected output token count.  
* **Tooltip:** *"Smaller input and output sizes lead to lower memory usage, faster inference times, and less overall energy consumed."*

### **B. FinOps: Real-Time Cost Breakdown**

* **Live Pricing:** Fetch pricing data asynchronously using the open-source LiteLLM model\_prices\_and\_context\_window.json standard.  
* **Metrics:** Display the Total Cost of the interaction, the Cost per 1M tokens, and a multi-model comparison table.  
* **Tooltip:** *"Unit Economics: Tracking the exact cost per query prevents unpredictable budget overruns when scaling applications."*

### **C. GreenOps: Eco Footprint Dashboard**

* **Carbon Emissions (g CO2e):** Fetch real-time carbon intensity data based on the data center's geolocation using the Electricity Maps API (/v3/carbon-intensity/latest).  
* **Comprehensive Footprint:** Integrate the EcoLogits API (https://api.ecologits.ai/v1beta) to dynamically estimate the holistic environmental impact based on Life-Cycle Assessment principles.  
* **Water Footprint (ml):** Calculate both on-site cooling and off-site electricity generation water usage.  
* **Energy Consumption (Wh):** Implement the standard calculation formula: $E\_{prompt}=\\frac{P\_{GPU}\\times N\_{GPU}\\times T\_{processing}}{3600}\\times PUE$.

### **D. Performance & Optimization Layer (The "Sweet Spot")**

* **Intelligence & Speed Benchmarks:** Integrate the free **Artificial Analysis API** (/data/llms/models) to fetch live metrics such as the "Intelligence Index", Output Speed (tokens/s), and Latency (Time to First Token).  
* **Human Preference Rating:** Display the model's Elo rating by fetching the latest **LMSYS Chatbot Arena** dataset to show crowdsourced model quality.  
* **Smart Routing Recommendation:** Implement logic inspired by **RouteLLM** to suggest cheaper and greener models for simpler tasks. E.g., *"You can achieve 95% of the performance for this task using Model X, saving 80% in costs and 60% in CO2 emissions"*.  
* **Tooltip:** *"The AI Pareto Frontier: Finding the exact balance between reasoning capability, financial cost, and environmental impact without over-provisioning compute resources."*.

## **3\. The Learning Hub (Blog Integration)**

Design a dedicated /learn page featuring a clean typographic layout to educate users on AI sustainability. Incorporate these core topics:

* **The Invisible Water Crisis:** Explain the difference between water withdrawal and permanent consumption.  
* **Hardware Matters:** Detail the efficiency leap of modern hardware (e.g., NVIDIA H100 vs A100).  
* **Green Prompting:** Teach users how specific prompt structures and caching can reduce token counts.  
* **Small Language Models (SLMs):** Discuss Knowledge Distillation and Quantization.  
* **The AI Pareto Frontier:** Explain how pushing for maximum accuracy often requires exponentially more energy, while slightly relaxing constraints can yield massive financial and ecological savings.  
* **Dynamic Model Routing (Tiering):** Educate decision-makers on why they shouldn't default to the heaviest models. Explain how routing systems can reduce costs and emissions by over 40% while maintaining the same performance level.

## **4\. Technical Constraints & Networking Features**

* **Stateless Architecture:** Ensure the core calculator works primarily client-side. Make asynchronous fetch calls to the LiteLLM JSON, Electricity Maps, EcoLogits, and Artificial Analysis APIs directly.  
* **Scalability Forecast:** Include a slider component on the dashboard to multiply the single-prompt metrics by estimated Monthly Active Users (MAU) and queries per user.  
* **Growth & Personal Branding:** Build an export feature using HTML5 Canvas to let users download their analysis as a highly shareable image card. Embed a subtle "Built by \- Cloud & AI Specialist" watermark with a LinkedIn call-to-action.