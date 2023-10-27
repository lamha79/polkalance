#!/usr/bin/env bash -eu

# NOTE: Add contracts to this array to build them ⬇️
# IMPORTANT: Just use spaces (_no commas_) between multiple array items (it's a bash convention).
# NOTE: Modify the base output directory by setting the `DIR` environment variable.
DIR="${DIR:=./deployments}"


echo -e "\nBuilding './Cargo.toml'…"
cargo contract build --release --quiet --manifest-path ./Cargo.toml

echo "Copying build files to './packages/contracts/deployments/polkalance/'…"
mkdir -p ./packages/contracts/deployments/polkalance
cp ./target/ink/polkalance.contract ./packages/contracts/deployments/polkalance/
cp ./target/ink/polkalance.wasm ./packages/contracts/deployments/polkalance/
cp ./target/ink/polkalance.json ./packages/contracts/deployments/polkalance/metadata.json
