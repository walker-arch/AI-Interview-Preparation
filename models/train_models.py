import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score, f1_score

models_dir = os.path.abspath(r"e:\AI Interview Preparation\interviewiq-ai\models")
data_dir = os.path.abspath(r"e:\AI Interview Preparation\interviewiq-ai\data")
os.makedirs(models_dir, exist_ok=True)

print("--- Training Skill / Role Classifier ---")
df_resume = pd.read_csv(os.path.join(data_dir, "resume_skills.csv"))
X_resume = df_resume["resume_text"].fillna("")
y_role = df_resume["role_category"]

le_role = LabelEncoder()
y_role_encoded = le_role.fit_transform(y_role)

vec_resume = TfidfVectorizer(max_features=2500, stop_words="english", ngram_range=(1, 2))
X_resume_tfidf = vec_resume.fit_transform(X_resume)

X_r_train, X_r_test, y_r_train, y_r_test = train_test_split(
    X_resume_tfidf, y_role_encoded, test_size=0.2, random_state=42, stratify=y_role_encoded
)

clf_role = LogisticRegression(max_iter=1000, C=1.0)
clf_role.fit(X_r_train, y_r_train)
role_acc = accuracy_score(y_r_test, clf_role.predict(X_r_test))
print(f"Role Classification Accuracy: {role_acc:.4f}")

joblib.dump(clf_role, os.path.join(models_dir, "skill_classifier.joblib"))
joblib.dump(vec_resume, os.path.join(models_dir, "skill_vectorizer.joblib"))
joblib.dump(le_role, os.path.join(models_dir, "skill_label_encoder.joblib"))

print("--- Training Answer Scorer & Quality Classifier ---")
df_answers = pd.read_csv(os.path.join(data_dir, "interview_answers.csv"))
df_answers["combined_text"] = df_answers["question"] + " [SEP] " + df_answers["answer"]
X_ans = df_answers["combined_text"]
y_score = df_answers["score"] * 10.0  # Scale 1-10 to 10-100
y_quality = df_answers["quality_label"]

vec_ans = TfidfVectorizer(max_features=3000, stop_words="english", ngram_range=(1, 2))
X_ans_tfidf = vec_ans.fit_transform(X_ans)

X_a_train, X_a_test, y_s_train, y_s_test, y_q_train, y_q_test = train_test_split(
    X_ans_tfidf, y_score, y_quality, test_size=0.2, random_state=42, stratify=y_quality
)

scorer = Ridge(alpha=1.0)
scorer.fit(X_a_train, y_s_train)
y_s_pred = scorer.predict(X_a_test)
rmse = float(np.sqrt(mean_squared_error(y_s_test, y_s_pred)))
r2 = float(r2_score(y_s_test, y_s_pred))
print(f"Answer Scorer R2: {r2:.4f}, RMSE: {rmse:.4f}")

clf_quality = LogisticRegression(max_iter=1000, C=1.0)
clf_quality.fit(X_a_train, y_q_train)
y_q_pred = clf_quality.predict(X_a_test)
f1 = float(f1_score(y_q_test, y_q_pred, average="weighted"))
print(f"Quality Classification F1: {f1:.4f}")

joblib.dump(scorer, os.path.join(models_dir, "answer_scorer.joblib"))
joblib.dump(vec_ans, os.path.join(models_dir, "answer_vectorizer.joblib"))
joblib.dump(clf_quality, os.path.join(models_dir, "answer_quality_classifier.joblib"))
print("All models successfully trained and exported to models/ directory!")

