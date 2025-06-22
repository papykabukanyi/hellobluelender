# Deployment Checklist

## Environment Variables

Ensure all required environment variables are properly set in the deployment environment:

- [ ] **REDIS_URL**: Redis connection string
- [ ] **JWT_SECRET_KEY**: Secret key for JWT authentication
- [ ] **SMTP_HOST**: SMTP server hostname
- [ ] **SMTP_PORT**: SMTP server port
- [ ] **SMTP_USER**: Email username/address
- [ ] **SMTP_PASS**: Email password or app password
- [ ] **SMTP_FROM**: From email address
- [ ] **SMTP_FROM_NAME**: From name for emails
- [ ] **GEMINI_API_KEY**: API key for Gemini AI

## Pre-Deployment Testing

- [ ] Verify all environment variables are set correctly
- [ ] Run `/api/test-email` endpoint to verify SMTP configuration
- [ ] Test chatbot functionality to ensure Gemini API key works
- [ ] Check admin map rendering for super admin users
- [ ] Verify leads page data display and filtering

## Deployment Steps

1. **Set up environment variables on Railway**:

   ```bash
   node setup-railway.js
   ```

2. **Deploy to Railway**:

   ```bash
   railway up
   ```

3. **Verify deployment health**:
   - Check `/healthcheck` endpoint
   - Monitor application logs for any errors
   - Test critical features after deployment

4. **Troubleshoot common issues**:
   - If emails are failing, verify SMTP configuration
   - If chatbot is not working, check Gemini API key
   - If map is not loading, check browser console for errors

## Post-Deployment Verification

- [ ] Test application form submission
- [ ] Verify email notifications are being sent
- [ ] Check admin dashboard functionality
- [ ] Test chatbot and lead capture
- [ ] Verify map display for super admin
- [ ] Monitor server logs for any errors

## Support Contacts

For deployment or configuration issues:

- Email: papykabukanyi@gmail.com
- Documentation: See the `/docs` folder for detailed guides
