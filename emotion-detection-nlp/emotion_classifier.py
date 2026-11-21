"""Emotion detection from text.

Trains a simple classifier that reads a sentence and predicts one of six
emotions, then answers two questions:

1. Does the model recognise rare emotions as well as common ones?
2. What happens to the model when some training labels are wrong?

Run:  python emotion_classifier.py
"""

import matplotlib.pyplot as plt
import numpy as np
from datasets import load_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score

EMOTIONS = ["sadness", "joy", "love", "anger", "fear", "surprise"]


def train(texts, labels, balanced):
    """Turn sentences into word scores (TF-IDF) and train logistic regression.

    balanced=True gives rare emotions more weight during training.
    """
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=2)
    X = vectorizer.fit_transform(texts)
    weights = "balanced" if balanced else None
    model = LogisticRegression(max_iter=1000, class_weight=weights).fit(X, labels)
    return vectorizer, model


def evaluate(vectorizer, model, texts, labels):
    """Return the F1-score for each emotion and the average over emotions."""
    predictions = model.predict(vectorizer.transform(texts))
    per_emotion = f1_score(labels, predictions, average=None)
    return per_emotion, per_emotion.mean()


def make_some_labels_wrong(labels, share, seed=0):
    """Replace a share of the labels with a different, random emotion."""
    rng = np.random.default_rng(seed)
    labels = np.array(labels)
    for i in np.where(rng.random(len(labels)) < share)[0]:
        labels[i] = rng.choice([e for e in range(6) if e != labels[i]])
    return labels


def top_words(vectorizer, model, emotion, k=8):
    """The words that push the model most strongly towards an emotion."""
    words = vectorizer.get_feature_names_out()
    best = np.argsort(model.coef_[emotion])[::-1][:k]
    return [words[i] for i in best]


def main():
    data = load_dataset("dair-ai/emotion")
    train_texts, train_labels = data["train"]["text"], data["train"]["label"]
    test_texts, test_labels = data["test"]["text"], data["test"]["label"]
    report = []

    # Question 1: rare emotions
    counts = np.bincount(train_labels)
    report.append("Training sentences per emotion:")
    report += [f"  {name:9} {count:5}" for name, count in zip(EMOTIONS, counts)]

    results = {}
    for balanced in [False, True]:
        vectorizer, model = train(train_texts, train_labels, balanced)
        per_emotion, average = evaluate(vectorizer, model, test_texts, test_labels)
        name = "balanced" if balanced else "standard"
        results[name] = per_emotion
        report.append(f"\n{name} model: average F1 = {average:.2f}")
        report += [f"  {e:9} F1 = {f:.2f}" for e, f in zip(EMOTIONS, per_emotion)]

    report.append("\nWords the balanced model uses for each emotion:")
    report += [f"  {e:9} {', '.join(top_words(vectorizer, model, i))}" for i, e in enumerate(EMOTIONS)]

    # Question 2: wrong labels
    shares = [0.0, 0.1, 0.2, 0.3]
    averages = []
    report.append("\nWrong training labels (balanced model):")
    for share in shares:
        noisy = make_some_labels_wrong(train_labels, share)
        vectorizer, model = train(train_texts, noisy, balanced=True)
        _, average = evaluate(vectorizer, model, test_texts, test_labels)
        averages.append(average)
        report.append(f"  {share:.0%} wrong labels: average F1 = {average:.2f}")

    text = "\n".join(report)
    print(text)
    with open("results/results.txt", "w") as f:
        f.write(text + "\n")
    plot(results, shares, averages)


def plot(results, shares, averages):
    fig, (left, right) = plt.subplots(1, 2, figsize=(11, 4))
    x = np.arange(len(EMOTIONS))
    left.bar(x - 0.2, results["standard"], 0.4, label="standard")
    left.bar(x + 0.2, results["balanced"], 0.4, label="balanced")
    left.set_xticks(x, EMOTIONS)
    left.set_ylim(0, 1)
    left.set_title("F1-score for each emotion")
    left.legend()

    right.plot([s * 100 for s in shares], averages, marker="o")
    right.set_ylim(0, 1)
    right.set_xlabel("Wrong training labels (%)")
    right.set_title("Average F1 when some labels are wrong")
    right.grid(alpha=0.3)

    fig.tight_layout()
    fig.savefig("results/results.png", dpi=150)


if __name__ == "__main__":
    main()
