# 注疏分块

按体裁/编号分块撰写，每块一个 JSON 文件：`{ "<id>": { ti, zhu:[{w,v}], yi, shang } }`。
`scripts/gen-data.mjs` 合并本目录全部 `*.json` 为最终注疏表；缺篇即报错（占位率 0%）。
