# 1. Clean
./scripts/clean.sh

# 2. Fresh install
yarn install

# 3. Install pods
cd ios
bundle exec pod install
cd ..

# 4. Start Metro with cache reset
yarn start --reset-cache
