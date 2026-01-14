# Anthropic/Claude API Auto-Detection Script

This script automatically detects and configures the best available Anthropic/Claude API setup in your environment.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Your API Key

Choose one of these methods:

**Option A: Environment Variable (Recommended)**
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

**Option B: Config File**
```bash
echo "api_key=your-api-key-here" > ~/.anthropic
```

**Option C: .env File**
```bash
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
```

### 3. Run the Script

```bash
python3 auto_detect_claude.py
```

## How It Works

The script checks for API configuration in this order:

1. **Environment Variables** (preferred)
   - `ANTHROPIC_API_KEY` - Your API key
   - `ANTHROPIC_BASE_URL` - Custom base URL (optional, defaults to https://api.anthropic.com)
   - `ANTHROPIC_MODEL` - Default model (optional)

2. **Configuration Files**
   - `~/.anthropic`
   - `~/.claude`
   - `~/.config/anthropic`
   - `~/.config/claude`
   - `.env`
   - `~/.env`

3. **Default Fallback**
   - Base URL: `https://api.anthropic.com`
   - Model: `claude-sonnet-4-20250514`

## Using in Your Own Code

### Method 1: Import the Client (Easiest)

```python
from auto_detect_claude import get_client

client = get_client()

if client:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.content[0].text)
```

### Method 2: Import Config Separately

```python
from auto_detect_claude import get_config

config = get_config()
print(f"Using: {config['source']}")
print(f"Model: {config['model']}")
```

### Method 3: Standalone Usage

```bash
python3 auto_detect_claude.py
```

This will:
- Detect available configuration
- Display what was found
- Show example usage code
- Create and test the client

## Configuration Options

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes | - |
| `ANTHROPIC_BASE_URL` | Custom API base URL | No | `https://api.anthropic.com` |
| `ANTHROPIC_MODEL` | Default model name | No | `claude-sonnet-4-20250514` |

### Config File Format

Files like `~/.anthropic` support simple key=value format:

```
api_key=your-api-key-here
base_url=https://api.anthropic.com
model=claude-sonnet-4-20250514
```

## Example Output

When you run `python3 auto_detect_claude.py`, you'll see:

```
============================================================
Anthropic/Claude API Auto-Detection
============================================================

Configuration Source: environment_variables
Base URL: https://api.anthropic.com
Default Model: claude-sonnet-4-20250514
API Key: sk-ant-...

------------------------------------------------------------

✅ Anthropic client created successfully!

Example usage:
  model = 'claude-sonnet-4-20250514'
  response = client.messages.create(
    model=model,
    max_tokens=1024,
    messages=[{'role': 'user', 'content': 'Hello!'}]
  )

Configuration available as module-level variables:
  from auto_detect_claude import get_client
  client = get_client()
```

## Troubleshooting

### "No API Key Found"
Make sure you've set the `ANTHROPIC_API_KEY` environment variable or created a config file with your API key.

### "anthropic package not installed"
Run: `pip install anthropic`

### "Failed to create Anthropic client"
Check that:
1. Your API key is valid
2. You have network access to the API endpoint
3. Your base URL is correct (if using a custom one)

## See Also

- `example_usage.py` - Complete working example
- `requirements.txt` - Python dependencies
