# CI/CD Pipeline Setup Guide

## Overview
This guide explains how to set up the CI/CD pipeline for the University Admission Processing System using GitHub Actions.

## What the Pipeline Does

### 1. Test Job
- **Backend Testing**: Runs PHP 8.1, Composer, Laravel tests with MySQL 8.0
- **Frontend Testing**: Runs Node.js 18, npm, React tests
- **Database**: Uses MySQL service container for testing
- **Coverage**: Generates test coverage reports

### 2. Deploy Job (Only on main/master branch)
- **Automatic Deployment**: Deploys to AWS EC2 when tests pass
- **Backend**: Updates Laravel, runs migrations, optimizes
- **Frontend**: Builds React app and copies to backend public directory
- **Services**: Restarts Laravel and Nginx services

## Required GitHub Secrets

You need to add these secrets in your GitHub repository:

### Go to: `Settings` → `Secrets and variables` → `Actions`

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `EC2_HOST` | Your EC2 instance public IP or domain | `3.250.123.45` |
| `EC2_USER` | SSH username (usually `ec2-user`) | `ec2-user` |
| `EC2_KEY` | Your private SSH key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `EC2_PORT` | SSH port (usually 22) | `22` |

## How to Add Secrets

1. **Copy your SSH private key content:**
   ```bash
   cat ~/.ssh/your-key.pem
   ```

2. **In GitHub repository:**
   - Go to `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - Add each secret with the exact names above

## Pipeline Triggers

- **Push to main/master**: Runs tests and deploys
- **Pull Request**: Runs tests only (no deployment)
- **Manual**: Can be triggered manually from Actions tab

## File Structure

```
.github/
└── workflows/
    └── deploy.yml          # Main CI/CD workflow
```

## What Happens on Each Push

1. **Code is pushed** to main/master branch
2. **GitHub Actions triggers** automatically
3. **Tests run** in parallel (backend + frontend)
4. **If tests pass**: Automatic deployment to EC2
5. **If tests fail**: Deployment is skipped, logs show errors

## Monitoring

- **View runs**: Go to `Actions` tab in your repository
- **Check logs**: Click on any workflow run to see detailed logs
- **Deployment status**: Green checkmark = success, red X = failure

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Check `EC2_HOST` and `EC2_KEY` secrets
   - Verify EC2 security group allows SSH (port 22)
   - Ensure SSH key is correct

2. **Tests Failing**
   - Check test logs in the Actions tab
   - Verify database connection in test environment
   - Check PHP/Node.js version compatibility

3. **Deployment Failing**
   - Check EC2 instance is running
   - Verify file permissions on EC2
   - Check Nginx and Laravel service status

### Manual Deployment

If automatic deployment fails, you can deploy manually:

```bash
# SSH to your EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Navigate to project
cd /var/www/admission-system

# Pull latest code
git pull origin master

# Deploy backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Deploy frontend
cd ../frontend
npm ci --production
npm run build
sudo cp -r build/* ../backend/public/

# Restart services
sudo systemctl restart laravel-app
sudo systemctl reload nginx
```

## Security Notes

- **Never commit** `.env` files or SSH keys
- **Use strong passwords** for database and services
- **Regular updates** for dependencies and security patches
- **Monitor logs** for suspicious activity

## Next Steps

After setting up the CI/CD pipeline:

1. **Test the pipeline** by making a small change and pushing
2. **Monitor deployment** in the Actions tab
3. **Verify application** is working on your EC2 instance
4. **Set up monitoring** and alerting if needed

## Support

If you encounter issues:
1. Check the GitHub Actions logs first
2. Verify all secrets are correctly set
3. Test SSH connection manually
4. Check EC2 instance status and logs
