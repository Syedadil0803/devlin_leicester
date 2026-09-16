#!/bin/sh
# Rebuilds the minified stylesheets the pages load. Edit css/style.css or css/bootstrap.css, then run:
#   sh tools/minify-css.sh
# Level 1 = safe optimisations only (whitespace, comments, number shortening); rules are never reordered.
cd "$(dirname "$0")/.." || exit 1
npx --yes clean-css-cli@5 -O1 -o css/style.min.css css/style.css
npx --yes clean-css-cli@5 -O1 -o css/bootstrap.min.css css/bootstrap.css
echo "Done: css/style.min.css, css/bootstrap.min.css"
