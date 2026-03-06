#!/bin/bash
cd "$(dirname "$0")"

# define the uvicorn command
uvicorn main:app  --host 0.0.0.0 --port $PORT