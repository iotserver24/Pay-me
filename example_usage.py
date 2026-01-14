#!/usr/bin/env python3
"""
Example usage of the auto_detect_claude.py module.

This demonstrates how to import and use the auto-detection functionality
in your own scripts.
"""

# Import the auto-detection module
from auto_detect_claude import get_client, get_config

# Get the detected configuration
config = get_config()
print(f"Using configuration from: {config['source']}")
print(f"Base URL: {config['base_url']}")
print(f"Default Model: {config['model']}")
print()

# Get a client instance
client = get_client()

if client is None:
    print("Client could not be created. Check your API key setup.")
else:
    print("✅ Client ready!")
    print()
    
    # Example: Check available models (if you have an API key)
    # response = client.models.list()
    # print("Available models:", [m.id for m in response.data])
    
    # Example: Send a message (requires valid API key)
    try:
        response = client.messages.create(
            model=config['model'],
            max_tokens=1024,
            messages=[
                {"role": "user", "content": "Hello! Just testing the connection."}
            ]
        )
        print("Response:", response.content[0].text)
    except Exception as e:
        print(f"Note: Could not send message (expected without API key): {e}")
