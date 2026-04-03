git config user.email "dev@nidish.com"
git config user.name "Nidish Dev"

git add .gitignore
git commit -m "chore: add .gitignore"

git add README.md
git commit -m "docs: initial README documentation"

git add backend/package.json
git commit -m "chore: setup backend package.json with dependencies"

git add backend/.env
git commit -m "chore: add backend env config"

git add backend/validators/contentValidator.js
git commit -m "feat: implement server-side validation logic for content"

git add backend/routes/content.js
git commit -m "feat: create api route for content submission"

git add backend/server.js
git commit -m "feat: setup express server and middleware"

git add frontend/index.html
git commit -m "feat: init frontend HTML layout with Quill editor"

git add frontend/style.css
git commit -m "style: add frontend styling and dark mode UI"

git add frontend/app.js
git commit -m "feat: link frontend logic and DOM elements"

git add package.json
git commit -m "chore: root package.json for vercel deployment"

git add vercel.json
git commit -m "chore: setup vercel configuration"

git add api/content.js
git commit -m "feat: add serverless function for vercel api endpoint"

git add public/index.html public/style.css
git commit -m "feat: set up public static files for vercel deployment"

git add public/app.js
git commit -m "feat: add app.js configured for relative api url"

git add .
git commit -m "chore: final fixes and lock files updates"

git branch -M main
git remote -v
git push -u origin main
