# Rizwan Ali

**AI Engineer · Data Analytics · Machine Learning · Deep Learning · NLP · LLMs & AI Agents · Chatbots · Explainable AI · Python**

**Portfolio website: https://rizwannazir333.github.io/portfolio-rizwan/**

AI Engineer at IFFCO Group, a food manufacturing company in the UAE, and Software Engineering graduate. I build and evaluate machine learning models and data analytics that are reliable, explainable and useful in the real world, and I am seeking a Master's degree to research trustworthy AI across machine learning, NLP and computer vision.

BS Hons Software Engineering · CGPA 3.66 / 4.00 · Abu Dhabi, UAE · Master's 2027: AI · Machine Learning · Computer Science

[Academic CV (PDF)](assets/Rizwan_Ali_CV_Photo.pdf) · [Europass CV (PDF)](assets/Rizwan_Ali_Europass_CV_Photo.pdf) · [LinkedIn](https://linkedin.com/in/rizwan-ali-ai-engineer) · [GitHub](https://github.com/rizwannazir333) · rizwan_nazir@163.com

## Projects

### [Heart Disease Risk Prediction Using Machine Learning and Deep Learning](https://github.com/rizwannazir333/heart-disease-prediction-final-year-project)

Research project · Final Year Project, BS Hons Software Engineering · Grade A · Jul 2025 – Jul 2026

**[Try the live app](https://rizwannazir333.github.io/portfolio-rizwan/app/)** · [Watch the 16-second demo (MP4)](assets/heartcare_demo.mp4) · [Model card](https://github.com/rizwannazir333/heart-disease-prediction-final-year-project/blob/main/MODEL_CARD.md)

![HeartCare web app: prediction result](assets/heartcare_result.jpg)

- Compared logistic regression, a random forest and a neural network with dropout (TensorFlow/Keras) on 13 clinical features from 597 patient records, and averaged their probabilities into three risk levels.
- With repeated stratified 5-fold cross-validation, logistic regression and the random forest reached ROC-AUC 0.90 (accuracy 0.82–0.83); recall stayed below precision, the main weakness to address.
- Half the records had missing values; median imputation fitted inside each training fold kept all 597 records, matched the scores of dropping them and roughly halved the variation between folds.
- Measured permutation feature importance on held-out folds; both models ranked major vessels, chest pain type and thalassemia among the strongest predictors.
- Wrote a model card on intended use and limitations; built a Flask and MySQL web app with tests and CI.

### [Emotion Detection from Text](emotion-detection-nlp/)

NLP project · Personal project · Nov 2026

![F1-score for each emotion, and average F1 with wrong labels](assets/emotion_results.png)

- Built a model that predicts the emotion of a sentence (6 emotions) with TF-IDF and logistic regression, trained on 16,000 sentences.
- Rare emotions were the weak point: F1 for *surprise* was only 0.39. Balanced class weights raised it to 0.71 and the average F1 from 0.72 to 0.83.
- Making 10–30% of the training labels wrong lowered average F1 step by step, from 0.83 to 0.71.

### Local LLM Writing Assistant, built three ways

Software project · Personal project · Nov 2026

**[See recorded runs](https://rizwannazir333.github.io/portfolio-rizwan/llm-demo/)** · [Part 1: Plain Ollama](https://github.com/rizwannazir333/ollama-writing-assistant) · [Part 2: LangChain](https://github.com/rizwannazir333/langchain-writing-assistant) · [Part 3: LangGraph](https://github.com/rizwannazir333/langgraph-writing-assistant)

- Built the same offline email-drafting and grammar-correction assistant with plain Ollama, LangChain and LangGraph on a 4-bit quantized 4B-parameter model, to compare what each framework adds.
- The LangGraph version reviews and corrects its own drafts, calls tools, waits for human approval and processes sentences in parallel with caching.
- Prepared lesson slides that teach LangChain and LangGraph using this project as the running example.

## Education

**BS Hons Software Engineering, Virtual University of Pakistan** · 2023 – 2026

CGPA 3.66 / 4.00 · Final year project: Grade A · Completed August 2026

Relevant courses: Artificial Intelligence, Machine Learning, Data Structures & Algorithms, Database Systems, Software Engineering.

## Research interests

- **Trustworthy and explainable AI:** faithful, stable explanations and well-calibrated predictions that people can rely on
- **Machine learning for healthcare:** risk prediction that holds up across patient groups and hospitals
- **Human-centred NLP and large language models:** how the quality of human feedback shapes NLP models; LLM agents with human approval; extracting information from text, including clinical notes
- **Computer vision:** image classification and analysis, including medical imaging
- **Data-centric AI:** learning from missing, imbalanced, small or noisy data, and building high-quality annotated datasets
- **Robust evaluation and generalisation:** testing whether models still work beyond their training data, across groups and settings

## Experience

**AI Engineer, Data Analytics, IFFCO Group** · UAE · Full-time · Nov 2026 – Present

*Food manufacturing*

- Develop demand and sales forecasting models by product, market and channel to support production planning and inventory decisions.
- Build machine learning models on production and quality-control data to predict out-of-specification batches, yield losses and waste.
- Analyse production line data, such as downtime, throughput and energy use, to find the causes of lost output and higher cost.
- Build Python and SQL data pipelines and automated KPI dashboards on sales, production and quality for operations, supply-chain and management teams.
- Explore AI use cases in the plant, such as computer vision for packaging and label inspection and LLM assistants for searching SOPs and internal documents.

**AI Engineer Intern, TechGeneyes** · Remote · Aug 2026 – Sep 2026

- Built and evaluated machine learning and deep learning models with scikit-learn and TensorFlow/Keras.
- Cleaned and explored data, engineered features and tuned hyperparameters with cross-validation.
- Reported model performance with precision, recall, F1-score and confusion matrices, and documented results for the team.

## Technical skills

| Area | Skills |
| --- | --- |
| ML methods | Logistic regression, random forests, neural networks, cross-validation, imputation, feature engineering, hyperparameter tuning |
| Data analytics | Exploratory data analysis, demand forecasting, root-cause analysis, KPI dashboards and reporting, SQL, data pipelines and report automation with Python |
| AI areas | Computer vision, NLP, chatbots, data annotation and label quality, explainable AI, AI for manufacturing |
| Evaluation | ROC-AUC, precision, recall, F1-score, confusion matrices, permutation feature importance, model cards |
| ML libraries | scikit-learn, TensorFlow, Keras, Pandas, NumPy, Matplotlib, Seaborn, Hugging Face Datasets |
| LLMs | Few-shot prompting, structured output, tool-using agents, human-in-the-loop; Ollama, LangChain, LangGraph, Pydantic |
| Software | Python, SQL, Flask, MySQL, Git, GitHub Actions (CI), pytest, Jupyter |

## Languages and references

- **English:** B2 (CEFR) in listening, reading, speaking and writing
- **References:** available on request
