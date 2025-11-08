cd beatguessr-infra

sed -i "s/appVersion: .*/appVersion: $VERSION/" helm/values.yaml
sed -i "s/appVersion: .*/appVersion: $VERSION/" helm/Chart.yaml

git add .
git commit -m "chore: update Docker images to $VERSION on prod"
git push origin main
