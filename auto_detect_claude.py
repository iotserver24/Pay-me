#!/usr/bin/env python3
"""
Auto-detect and configure the best available Anthropic/Claude API setup.

This script checks for API configuration in the following order:
1. Environment variables (ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL)
2. Configuration files (~/.anthropic, ~/.claude, .env)
3. Falls back to default settings if nothing is found
"""

import os
import sys
from pathlib import Path
from typing import Optional, Dict, Any


def get_env_var(var_names: list[str]) -> Optional[str]:
    """Check multiple environment variable names and return the first non-empty value."""
    for var_name in var_names:
        value = os.environ.get(var_name)
        if value and value.strip():
            return value.strip()
    return None


def read_config_file(file_path: Path) -> Dict[str, str]:
    """Read a simple key=value config file and return as dict."""
    config = {}
    if not file_path.exists():
        return config
    
    try:
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                # Skip comments and empty lines
                if not line or line.startswith('#'):
                    continue
                # Parse KEY=VALUE or KEY: VALUE
                if '=' in line:
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
                elif ':' in line:
                    key, value = line.split(':', 1)
                    config[key.strip()] = value.strip()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}", file=sys.stderr)
    
    return config


def detect_anthropic_config() -> Dict[str, Any]:
    """Detect the best available Anthropic/Claude API configuration."""
    config = {
        'api_key': None,
        'base_url': None,
        'model': None,
        'source': None,
        'warnings': []
    }
    
    # 1. Check environment variables (most common and preferred)
    api_key = get_env_var([
        'ANTHROPIC_API_KEY',
        'ANTROPIC_API_KEY',  # Common typo
    ])
    
    base_url = get_env_var([
        'ANTHROPIC_BASE_URL',
        'ANTHROPIC_API_BASE_URL',
    ])
    
    model = get_env_var([
        'ANTHROPIC_MODEL',
        'CLAUDE_MODEL',
    ])
    
    if api_key:
        config['api_key'] = api_key
        config['base_url'] = base_url or "https://api.anthropic.com"
        config['model'] = model or "claude-sonnet-4-20250514"
        config['source'] = "environment_variables"
        return config
    
    # 2. Check config files
    config_files = [
        Path.home() / '.anthropic',
        Path.home() / '.claude',
        Path.home() / '.config' / 'anthropic',
        Path.home() / '.config' / 'claude',
        Path('.env'),
        Path.home() / '.env',
    ]
    
    for config_file in config_files:
        if config_file.exists():
            file_config = read_config_file(config_file)
            
            # Check for API key in the file
            file_api_key = (
                file_config.get('api_key') or
                file_config.get('api_key') or
                file_config.get('ANTHROPIC_API_KEY')
            )
            
            if file_api_key:
                config['api_key'] = file_api_key
                config['base_url'] = (
                    file_config.get('base_url') or
                    file_config.get('ANTHROPIC_BASE_URL') or
                    "https://api.anthropic.com"
                )
                config['model'] = (
                    file_config.get('model') or
                    file_config.get('ANTHROPIC_MODEL') or
                    "claude-sonnet-4-20250514"
                )
                config['source'] = f"config_file:{config_file}"
                return config
    
    # 3. No configuration found - provide helpful defaults but warn
    config['warnings'].append(
        "No Anthropic API key found. Set ANTHROPIC_API_KEY environment variable "
        "or add api_key to ~/.anthropic config file."
    )
    config['base_url'] = "https://api.anthropic.com"
    config['model'] = "claude-sonnet-4-20250514"
    config['source'] = "defaults"
    
    return config


def create_anthropic_client(config: Dict[str, Any]):
    """Create and return an Anthropic client using the detected configuration."""
    try:
        from anthropic import Anthropic
    except ImportError:
        print("Error: anthropic package not installed.", file=sys.stderr)
        print("Install it with: pip install anthropic", file=sys.stderr)
        return None
    
    if not config['api_key']:
        print("Error: No API key available. Cannot create client.", file=sys.stderr)
        for warning in config['warnings']:
            print(f"  {warning}", file=sys.stderr)
        return None
    
    client_kwargs = {'api_key': config['api_key']}
    
    if config['base_url']:
        client_kwargs['base_url'] = config['base_url']
    
    try:
        client = Anthropic(**client_kwargs)
        return client
    except Exception as e:
        print(f"Error creating Anthropic client: {e}", file=sys.stderr)
        return None


def main():
    """Main function to detect config and demonstrate usage."""
    print("=" * 60)
    print("Anthropic/Claude API Auto-Detection")
    print("=" * 60)
    print()
    
    # Detect configuration
    config = detect_anthropic_config()
    
    # Display what was found
    print(f"Configuration Source: {config['source']}")
    print(f"Base URL: {config['base_url']}")
    print(f"Default Model: {config['model']}")
    
    if config['api_key']:
        # Mask the API key for security
        masked_key = config['api_key'][:8] + "..." if len(config['api_key']) > 8 else "***"
        print(f"API Key: {masked_key}")
    else:
        print("API Key: NOT FOUND")
        print()
        print("Warnings:")
        for warning in config['warnings']:
            print(f"  ⚠️  {warning}")
        print()
        print("To set up the API client, run:")
        print("  export ANTHROPIC_API_KEY='your-api-key-here'")
        sys.exit(1)
    
    print()
    print("-" * 60)
    print()
    
    # Create client
    client = create_anthropic_client(config)
    
    if client:
        print("✅ Anthropic client created successfully!")
        print()
        print("Example usage:")
        print(f"  model = '{config['model']}'")
        print("  response = client.messages.create(")
        print("    model=model,")
        print("    max_tokens=1024,")
        print("    messages=[{'role': 'user', 'content': 'Hello!'}]")
        print("  )")
        print()
        
        # Store config for other scripts to import
        print("Configuration available as module-level variables:")
        print("  from auto_detect_claude import get_client")
        print("  client = get_client()")
        
        return client
    else:
        print("❌ Failed to create Anthropic client.")
        sys.exit(1)


# Module-level variables for easy import
_cached_client = None
_cached_config = None


def get_config() -> Dict[str, Any]:
    """Get the detected configuration (cached)."""
    global _cached_config
    if _cached_config is None:
        _cached_config = detect_anthropic_config()
    return _cached_config


def get_client():
    """Get an Anthropic client (cached)."""
    global _cached_client
    if _cached_client is None:
        config = get_config()
        _cached_client = create_anthropic_client(config)
    return _cached_client


if __name__ == '__main__':
    main()
