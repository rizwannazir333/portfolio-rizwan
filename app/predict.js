// HeartCare prediction in the browser.
// Same models and same steps as models.py in
// github.com/rizwannazir333/heart-disease-prediction-final-year-project:
// StandardScaler -> Logistic Regression, Random Forest, ANN -> average -> Low / Medium / High.
(function (root) {
  "use strict";

  function scale(model, x) {
    return x.map(function (v, i) { return (v - model.scaler.mean[i]) / model.scaler.scale[i]; });
  }

  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

  function logistic(model, s) {
    var z = model.lr.intercept;
    for (var i = 0; i < s.length; i++) z += model.lr.coef[i] * s[i];
    return sigmoid(z);
  }

  function forest(model, s) {
    // scikit-learn compares float32 inputs with float32 thresholds
    var f = s.map(function (v) { return Math.fround(v); });
    var sum = 0;
    for (var k = 0; k < model.rf.length; k++) {
      var t = model.rf[k], n = 0;
      while (t.l[n] !== -1) n = f[t.f[n]] <= t.t[n] ? t.l[n] : t.r[n];
      sum += t.p[n];
    }
    return sum / model.rf.length;
  }

  function neural(model, s) {
    var a = s;
    model.ann.forEach(function (layer) {
      var out = layer.b.slice();
      for (var i = 0; i < a.length; i++)
        for (var j = 0; j < out.length; j++) out[j] += a[i] * layer.W[i][j];
      a = out.map(function (v) {
        return layer.act === "relu" ? Math.max(0, v) : layer.act === "sigmoid" ? sigmoid(v) : v;
      });
    });
    return a[0];
  }

  function round2(v) { return Math.round(v * 100) / 100; }

  function predict(model, x) {
    var s = scale(model, x);
    var lr = logistic(model, s), rf = forest(model, s), ann = neural(model, s);
    var avg = (lr + rf + ann) / 3;
    var risk = avg < 0.3 ? "Low" : avg < 0.7 ? "Medium" : "High";
    return { risk: risk, avg_prob: round2(avg * 100), lr_prob: round2(lr * 100),
             rf_prob: round2(rf * 100), ann_prob: round2(ann * 100) };
  }

  root.HeartCare = { predict: predict };
  if (typeof module !== "undefined") module.exports = root.HeartCare;
})(typeof window !== "undefined" ? window : globalThis);
