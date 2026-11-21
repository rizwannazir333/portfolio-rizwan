"""A simple, explainable text classifier: TF-IDF features + logistic regression."""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline


def build_model(balanced=False):
    """Create the classifier.

    balanced=True gives rare classes a larger weight in the loss
    (cost-sensitive learning), which usually helps minority classes.
    """
    return make_pipeline(
        TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True),
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced" if balanced else None,
        ),
    )


def top_words(model, class_id, k=10):
    """Return the k words that push the model most towards `class_id`.

    For a linear model the explanation is the learned weight of each word,
    so the explanation is exact and easy for a person to read.
    """
    vectorizer = model.named_steps["tfidfvectorizer"]
    classifier = model.named_steps["logisticregression"]
    words = vectorizer.get_feature_names_out()
    weights = classifier.coef_[class_id]
    best = np.argsort(weights)[::-1][:k]
    return [words[i] for i in best]
