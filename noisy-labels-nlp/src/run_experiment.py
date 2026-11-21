"""How does the quality of human feedback affect an NLP model?

For each annotation error type and error rate, train a classifier on the
corrupted labels and evaluate it on the clean test set. Record:

* macro-F1 and per-class F1 (to see what happens to rare emotions)
* explanation stability: how many of the top-10 explanatory words per class
  stay the same as in the model trained on clean labels

Run from the project root:  python src/run_experiment.py
"""

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import f1_score

from data import LABELS, load_emotion
from feedback import corrupt_labels
from model import build_model, top_words

RATES = [0.0, 0.1, 0.2, 0.3, 0.4]
KINDS = ["random", "confusable"]
RESULTS = Path("results")


def explanation_overlap(model, reference_words):
    """Average share of top-10 words per class that match the clean model."""
    shares = []
    for class_id in range(len(LABELS)):
        words = set(top_words(model, class_id))
        shares.append(len(words & reference_words[class_id]) / len(words))
    return sum(shares) / len(shares)


def main():
    RESULTS.mkdir(exist_ok=True)
    train_df, test_df = load_emotion()
    rows = []

    for balanced in [False, True]:
        clean_model = build_model(balanced).fit(train_df.text, train_df.label)
        reference = {c: set(top_words(clean_model, c)) for c in range(len(LABELS))}

        for kind in KINDS:
            for rate in RATES:
                noisy = corrupt_labels(train_df.label, rate, kind)
                model = build_model(balanced).fit(train_df.text, noisy)
                pred = model.predict(test_df.text)

                per_class = f1_score(test_df.label, pred, average=None)
                row = {
                    "model": "balanced" if balanced else "standard",
                    "noise": kind,
                    "rate": rate,
                    "macro_f1": f1_score(test_df.label, pred, average="macro"),
                    "explanation_overlap": explanation_overlap(model, reference),
                }
                row.update({f"f1_{name}": f for name, f in zip(LABELS, per_class)})
                rows.append(row)
                print(f"{row['model']:9} {kind:10} rate={rate:.1f} "
                      f"macro-F1={row['macro_f1']:.3f} "
                      f"surprise-F1={row['f1_surprise']:.3f}")

    results = pd.DataFrame(rows).round(3)
    results.to_csv(RESULTS / "results.csv", index=False)
    save_explanations(train_df)
    plot(results)


def save_explanations(train_df):
    """Write the top words per class for the clean standard model."""
    model = build_model().fit(train_df.text, train_df.label)
    lines = [f"{name}: {', '.join(top_words(model, c))}"
             for c, name in enumerate(LABELS)]
    (RESULTS / "top_words.txt").write_text("\n".join(lines) + "\n")


def plot(results):
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.2))
    panels = [
        ("macro_f1", "Macro-F1 (all classes)"),
        ("f1_surprise", "F1 for 'surprise' (rarest class)"),
        ("explanation_overlap", "Explanation overlap with clean model"),
    ]
    for ax, (column, title) in zip(axes, panels):
        for (model, kind), group in results.groupby(["model", "noise"]):
            style = "-" if model == "standard" else "--"
            ax.plot(group.rate * 100, group[column], style, marker="o",
                    label=f"{model}, {kind} errors")
        ax.set_title(title)
        ax.set_xlabel("Annotation error rate (%)")
        ax.set_ylim(0, 1)
        ax.grid(alpha=0.3)
    axes[0].legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(RESULTS / "feedback_quality.png", dpi=150)


if __name__ == "__main__":
    main()
