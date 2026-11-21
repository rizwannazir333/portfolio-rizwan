"""Simulate human feedback (annotations) of different quality.

Two kinds of annotation error are modelled:

* random:     a wrong label is picked uniformly at random. This is like a
              careless or inattentive annotator.
* confusable: a label is swapped for a similar emotion (love -> joy,
              surprise -> joy, fear -> sadness, ...). This is like a real
              annotator who hesitates between two close categories.
"""

import numpy as np

from data import LABELS

# For each emotion, the emotion an annotator is most likely to confuse it with.
CONFUSABLE = {
    "sadness": "fear",
    "joy": "love",
    "love": "joy",
    "anger": "sadness",
    "fear": "sadness",
    "surprise": "joy",
}


def corrupt_labels(labels, rate, kind, seed=0):
    """Return a copy of `labels` where a fraction `rate` of them are wrong.

    labels: 1-D array of integer class ids
    rate:   fraction of labels to change, between 0 and 1
    kind:   "random" or "confusable"
    """
    rng = np.random.default_rng(seed)
    labels = np.asarray(labels).copy()
    n_classes = len(LABELS)

    flip = rng.random(len(labels)) < rate
    for i in np.where(flip)[0]:
        if kind == "random":
            choices = [c for c in range(n_classes) if c != labels[i]]
            labels[i] = rng.choice(choices)
        elif kind == "confusable":
            labels[i] = LABELS.index(CONFUSABLE[LABELS[labels[i]]])
        else:
            raise ValueError(f"unknown kind: {kind}")
    return labels
