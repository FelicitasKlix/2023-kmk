#!/bin/bash

# Start the notifications API service
cd pid-notifications-api
poetry run start &
NOTIFICATIONS_API_PID=$!

# Wait for the notifications API to be ready
echo "Waiting for notifications API to start..."
sleep 20  # Ajusta el tiempo de espera según sea necesario

# Start the main backend service
cd ../pid-be
poetry run start

# Wait for both services to finish
wait $NOTIFICATIONS_API_PID