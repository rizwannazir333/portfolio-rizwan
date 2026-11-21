"""Load the public Emotion dataset (dair-ai/emotion) as pandas DataFrames."""

from datasets import load_dataset

LABELS = ["sadness", "joy", "love", "anger", "fear", "surprise"]


def load_emotion():
    """Return (train_df, test_df), each with columns 'text' and 'label'."""
    dataset = load_dataset("dair-ai/emotion")
    train_df = dataset["train"].to_pandas()
    test_df = dataset["test"].to_pandas()
    return train_df, test_df
