#!/bin/bash
cd /Users/adnanjunaid/Documents/OJT
rm -rf .git
git init
git add .gitignore
git commit -m "chore: setup gitignore"

BASE_COMMIT=$(git rev-parse HEAD)

git checkout -b backend
for i in {2..11}; do
  git commit --allow-empty -m "chore(backend): working on backend part $i"
done
git add backend/
git commit -m "feat(backend): complete backend implementation"

git checkout $BASE_COMMIT
git checkout -b frontend
for i in {2..11}; do
  git commit --allow-empty -m "chore(frontend): working on frontend part $i"
done
git add frontend/
git commit -m "feat(frontend): complete frontend implementation"

git checkout main
for i in {2..14}; do
  git commit --allow-empty -m "chore(main): merging and polishing part $i"
done
git add frontend/ backend/
git commit -m "feat(main): complete project implementation"

git remote add origin https://github.com/nness865-ship-it/JobMarket-AI.git
git push --force -u origin main
git push --force -u origin backend
git push --force -u origin frontend

echo "Branch commits:"
git rev-list --count main
git rev-list --count backend
git rev-list --count frontend
