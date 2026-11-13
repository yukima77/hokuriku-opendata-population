"""data/raw/e2-1.xlsx (データでみる北陸 2-1) -> data/population.js

標準ライブラリのみ。使い方:  python scripts/convert.py
セル位置が想定と違う場合は assert で止まる（元データの構造が変わったことに気づくため）。
"""
import json
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "raw" / "e2-1.xlsx"
DST = ROOT / "data" / "population.js"
M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

ROWS = {3: "全国", 4: "北陸3県計", 5: "富山県", 6: "石川県", 7: "福井県"}
COLS = "BCDEFGHIJKLMNOPQRST"  # 1960..2050 (5年刻み)


def read_cells(path):
    z = zipfile.ZipFile(path)
    strings = []
    for si in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(M + "si"):
        # 直下の <t> のみ（<rPh> のふりがなは除外）
        strings.append("".join(t.text or "" for t in si.findall(M + "t")))
    cells = {}
    for c in ET.fromstring(z.read("xl/worksheets/sheet1.xml")).iter(M + "c"):
        v = c.find(M + "v")
        if v is None:
            continue
        cells[c.get("r")] = strings[int(v.text)] if c.get("t") == "s" else float(v.text)
    return cells


def main():
    cells = read_cells(SRC)
    years = [int(cells[f"{c}2"].replace("年", "")) for c in COLS]
    assert years == list(range(1960, 2051, 5)), years
    series = {}
    for r, name in ROWS.items():
        assert cells[f"A{r}"] == name, (r, cells[f"A{r}"])
        series[name] = [round(cells[f"{c}{r}"], 3) for c in COLS]
    # 3県の合計が「北陸3県計」と一致するか検算
    for i, y in enumerate(years):
        s = sum(series[k][i] for k in ("富山県", "石川県", "福井県"))
        assert abs(s - series["北陸3県計"][i]) < 0.01, (y, s)
    data = {
        "unit": "千人",  # [仮定] ファイルに単位表記なし。全国値・3県合計から千人と判断
        "years": years,
        "lastActual": 2020,  # 実績は2020年（国勢調査）まで。元データ注記は「2025年まで実績」だが、2025年の全国値(123,262千人)は社人研R5推計と一致するため推計扱い
        "series": series,
        "source": cells["A10"],
        "note": cells["A11"],
        "title": cells["A1"],
    }
    DST.write_text(
        "// 自動生成: scripts/convert.py\nwindow.POPULATION_DATA = "
        + json.dumps(data, ensure_ascii=False, indent=1)
        + ";\n",
        encoding="utf-8",
    )
    print("OK", DST)


if __name__ == "__main__":
    main()
