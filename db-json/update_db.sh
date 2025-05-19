cd /opt/Schelper/db-json/chunks
for f in *.js; do
  echo "Skibidizing $f…"
  mongosh --file "$f"
done
