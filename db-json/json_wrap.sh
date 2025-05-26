#!/usr/bin/env bash
set -euo pipefail

# ───── CONFIG ─────
DB="class-scheduling-app"
CHUNK_SIZE=250
INPUT_PREFIX="class-scheduling-app."
OUTPUT_DIR="chunks"
# ──────────────────

mkdir -p "$OUTPUT_DIR"
rm -rf "${OUTPUT_DIR:?}"/*

# for each JSON array
for src in ${INPUT_PREFIX}*.json; do
  # extract "tags" from "class-scheduling-app.tags.json"
  coll=${src#${INPUT_PREFIX}}        # ⇒ "tags.json"
  coll=${coll%.json}                 # ⇒ "tags"

  echo "Processing $src → collection '$coll'..."

  # 1) flatten to NDJSON
  ndjson="${OUTPUT_DIR}/${coll}.ndjson"
  jq -c '.[]' "$src" > "$ndjson"

  # if empty, skip
  if [[ ! -s "$ndjson" ]]; then
    echo "no documents in $src, skipping"
    rm -f "$ndjson"
    continue
  fi

  # 2) split into N‑doc chunks
  echo "Splitting into chunks of $CHUNK_SIZE docs…"
  split \
    --numeric-suffixes=1 \
    --suffix-length=4 \
    --additional-suffix=.ndjson \
    -l "$CHUNK_SIZE" \
    "$ndjson" \
    "${OUTPUT_DIR}/${coll}_chunk_"

  # 3) wrap each chunk into a .js file
  for chunk in "${OUTPUT_DIR}/${coll}_chunk_"*.ndjson; do
    # pull the numeric suffix (e.g. _0001.ndjson → 1)
    num=$(basename "$chunk" | sed -E "s/^${coll}_chunk_0*([0-9]+)\.ndjson$/\1/")
    out="${OUTPUT_DIR}/${coll}_chunk_${num}.json"

    {
      echo "["
      # append a comma to every line, then strip the last comma
      awk '{ print $0 "," }' "$chunk" | sed '$ s/,$//'
      echo "]"
    } > "$out"

    echo "Created $out"
    # clean up this chunk’s NDJSON
    rm -f "$chunk"
  done

  # remove the flat NDJSON
  rm -f "$ndjson"
done
