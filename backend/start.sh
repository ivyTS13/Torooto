#!/usr/bin/env bash
# This file starts the FastAPI app with uvicorn.
uvicorn src.main:app --host 0.0.0.0 --port $PORT