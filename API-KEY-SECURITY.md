# API Key Security

This project uses the Google Gemini API for AI-powered chatbot functionality. Follow these instructions to properly secure your API keys:

## ⚠️ SECURITY ALERT: Previous Key Exposure

**IMPORTANT:** A previous version of this codebase contained hardcoded API keys. If you've cloned this repository before June 22, 2025:

1. **Immediately revoke and rotate all API keys** that were previously hardcoded
2. **Check your Git history** for any exposed secrets
3. Follow the setup instructions below to configure new keys securely

## Setup API Keys Securely

1. **NEVER commit actual API keys to source control**
2. Create a `.env.local` file based on the `.env.local.example` template
3. Add your API keys to the `.env.local` file
4. Ensure `.env.local` is in your `.gitignore` file (it should be by default)
5. Verify no keys are hardcoded in your source code

## Gemini API Key

You'll need a Google AI/Google Cloud API key for the Gemini AI integration:

1. Go to the [Google AI Studio](https://makersuite.google.com/) or [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new API key for the Gemini API
3. Add the key to your `.env.local` file:

   ```bash
   GEMINI_API_KEY=your_new_api_key_here
   ```

## Security Best Practices

- **Rotate API keys regularly** (at least every 90 days)
- **Use environment variables only**, never hardcode keys
- **Set appropriate restrictions on API keys**:
  - IP restrictions (limit to your server IPs)
  - Usage quotas and limits
  - Least privilege access
- **Monitor API usage** for unusual patterns or unauthorized access
- **Implement secret scanning** in your CI/CD pipeline
- **Use a secrets manager** for production environments

## Clean Git History

To ensure security when sharing your codebase:

1. Consider using [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-branch` to remove secret keys from Git history
2. Add patterns for potential secrets to your `.gitignore`
3. Use a pre-commit hook to scan for accidental secrets

## If a Key Is Compromised

1. Immediately revoke the key in the Google Cloud Console
2. Generate a new key
3. Update your environment variables with the new key
