# 北陸3県 人口の推移と将来推計

北陸経済連合会「データでみる北陸」のオープンデータ（2-1 北陸3県の人口総数の推移）を、グラフで見られる静的Webアプリです。

- 1960〜2050年の人口を、富山・石川・福井・3県計で比較（2025年以降は社人研の推計。元データ注記は「2025年まで実績」だが、数値が社人研推計と一致するため推計扱い）
- 指標切替：人口（千人）／1960年=100の指数／全国に占める割合

## 公開ページ
https://yukima77.github.io/hokuriku-opendata-population/

## 使い方
`index.html` をブラウザで開く、または `python -m http.server` で配信するだけです（ビルド不要）。

## データ更新
1. `data/raw/e2-1.xlsx` を最新のExcelに置き換える
2. `python scripts/convert.py` を実行して `data/population.js` を再生成する

## 出典・ライセンス
- データ：[データでみる北陸](https://hokurikudata.cloudfree.jp/)（北陸経済連合会）「2-1.北陸３県の人口総数の推移」 ©データでみる北陸（[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)）
- 数値はそのままグラフ化し、指数・割合・増減率は元データから計算しています。
- 本アプリは個人が作成したもので、北陸経済連合会が提供・保証するものではありません。
- グラフ描画：[Chart.js](https://www.chartjs.org/) 4.4.1（MIT License、`vendor/` に同梱）

## ライセンス
- コード（`index.html`、`app.js`、`scripts/`）：[MIT License](LICENSE)
- データ（`data/raw/`、`data/population.js`）：元データの条件（CC BY 4.0、©データでみる北陸）に従います。MITライセンスの対象外です。
- `vendor/` 内のChart.jsは、同梱のMITライセンス（`vendor/LICENSE-chart.js.txt`）に従います。
