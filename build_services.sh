#!/bin/bash

# Install dependencies for notifications API
cd pid-notifications-api
poetry install

# Install dependencies for main backend service
cd ../pid-be
poetry install

# Return to the root directory
cd ..