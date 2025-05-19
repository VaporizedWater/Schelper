cd /opt/Schelper/db-json/chunks

for f in *.json; do
  echo "Skibidizing $f…"
  collection="${f%%_*}"

  mongoimport \
    --db class-scheduling-app \
    --collection "$collection" \
    --file "$f" \
    --jsonArray
done
