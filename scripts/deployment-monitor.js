#!/usr/bin/env node

/**
 * Deployment Monitoring Script
 * Monitors deployment health and performance metrics
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  production: {
    url: 'https://desenyon-infinite-idea.vercel.app',
    healthEndpoint: '/api/health',
    criticalEndpoints: [
      '/api/projects',
      '/api/ai/orchestrate',
      '/api/auth/session'
    ]
  },
  staging: {
    url: 'https://staging-desenyon-infinite-idea.vercel.app',
    healthEndpoint: '/api/health',
    criticalEndpoints: [
      '/api/projects',
      '/api/ai/orchestrate',
      '/api/auth/session'
    ]
  }
};

class DeploymentMonitor {
  constructor(environment = 'production') {
    this.environment = environment;
    this.config = CONFIG[environment];
    this.results = {
      timestamp: new Date().toISOString(),
      environment,
      status: 'unknown',
      checks: [],
      metrics: {}
    };
  }

  async makeRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const req = https.get(url, { timeout }, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });
        
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            responseTime
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', reject);
    });
  }

  async checkHealth() {
    console.log(`🔍 Checking health for ${this.environment}...`);
    
    try {
      const response = await this.makeRequest(
        `${this.config.url}${this.config.healthEndpoint}`
      );

      const isHealthy = response.statusCode === 200;
      const healthData = JSON.parse(response.body);

      this.results.checks.push({
        name: 'Health Check',
        status: isHealthy ? 'pass' : 'fail',
        responseTime: response.responseTime,
        details: healthData
      });

      this.results.metrics.healthResponseTime = response.responseTime;
      
      console.log(`✅ Health check: ${isHealthy ? 'PASS' : 'FAIL'} (${response.responseTime}ms)`);
      
      return isHealthy;
    } catch (error) {
      console.error(`❌ Health check failed: ${error.message}`);
      
      this.results.checks.push({
        name: 'Health Check',
        status: 'fail',
        error: error.message
      });
      
      return false;
    }
  }

  async checkCriticalEndpoints() {
    console.log('🔍 Checking critical endpoints...');
    
    const results = [];
    
    for (const endpoint of this.config.criticalEndpoints) {
      try {
        const response = await this.makeRequest(`${this.config.url}${endpoint}`);
        const isWorking = response.statusCode < 500;
        
        results.push({
          name: `Endpoint: ${endpoint}`,
          status: isWorking ? 'pass' : 'fail',
          responseTime: response.responseTime,
          statusCode: response.statusCode
        });

        console.log(`${isWorking ? '✅' : '❌'} ${endpoint}: ${response.statusCode} (${response.responseTime}ms)`);
        
      } catch (error) {
        results.push({
          name: `Endpoint: ${endpoint}`,
          status: 'fail',
          error: error.message
        });
        
        console.error(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    this.results.checks.push(...results);
    return results.every(r => r.status === 'pass');
  }

  async checkPerformance() {
    console.log('🔍 Checking performance metrics...');
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(this.config.url);
      const loadTime = Date.now() - startTime;
      
      const performanceCheck = {
        name: 'Performance Check',
        status: loadTime < 3000 ? 'pass' : 'warn',
        responseTime: loadTime,
        details: {
          loadTime,
          threshold: 3000,
          status: loadTime < 3000 ? 'good' : 'slow'
        }
      };
      
      this.results.checks.push(performanceCheck);
      this.results.metrics.pageLoadTime = loadTime;
      
      console.log(`${loadTime < 3000 ? '✅' : '⚠️'} Page load time: ${loadTime}ms`);
      
      return loadTime < 5000; // Fail if over 5 seconds
    } catch (error) {
      console.error(`❌ Performance check failed: ${error.message}`);
      return false;
    }
  }

  async runAllChecks() {
    console.log(`🚀 Starting deployment monitoring for ${this.environment}...`);
    console.log(`📍 Target URL: ${this.config.url}`);
    console.log('─'.repeat(50));
    
    const healthOk = await this.checkHealth();
    const endpointsOk = await this.checkCriticalEndpoints();
    const performanceOk = await this.checkPerformance();
    
    const overallStatus = healthOk && endpointsOk && performanceOk ? 'pass' : 'fail';
    this.results.status = overallStatus;
    
    console.log('─'.repeat(50));
    console.log(`📊 Overall Status: ${overallStatus.toUpperCase()}`);
    
    // Save results to file
    const resultsPath = path.join(__dirname, '..', 'deployment-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    
    console.log(`📄 Results saved to: ${resultsPath}`);
    
    return overallStatus === 'pass';
  }

  generateSlackMessage() {
    const status = this.results.status === 'pass' ? '✅' : '❌';
    const emoji = this.results.status === 'pass' ? ':white_check_mark:' : ':x:';
    
    const failedChecks = this.results.checks.filter(c => c.status === 'fail');
    const warnChecks = this.results.checks.filter(c => c.status === 'warn');
    
    let message = `${emoji} Deployment Monitor - ${this.environment.toUpperCase()}\n`;
    message += `Status: ${status} ${this.results.status.toUpperCase()}\n`;
    message += `URL: ${this.config.url}\n`;
    message += `Timestamp: ${this.results.timestamp}\n\n`;
    
    if (this.results.metrics.healthResponseTime) {
      message += `Health Response: ${this.results.metrics.healthResponseTime}ms\n`;
    }
    
    if (this.results.metrics.pageLoadTime) {
      message += `Page Load Time: ${this.results.metrics.pageLoadTime}ms\n`;
    }
    
    if (failedChecks.length > 0) {
      message += `\n❌ Failed Checks (${failedChecks.length}):\n`;
      failedChecks.forEach(check => {
        message += `• ${check.name}: ${check.error || 'Failed'}\n`;
      });
    }
    
    if (warnChecks.length > 0) {
      message += `\n⚠️ Warnings (${warnChecks.length}):\n`;
      warnChecks.forEach(check => {
        message += `• ${check.name}: ${check.details?.status || 'Warning'}\n`;
      });
    }
    
    return message;
  }
}

// CLI execution
if (require.main === module) {
  const environment = process.argv[2] || 'production';
  const monitor = new DeploymentMonitor(environment);
  
  monitor.runAllChecks()
    .then(success => {
      if (process.env.SLACK_WEBHOOK_URL) {
        const message = monitor.generateSlackMessage();
        console.log('\n📱 Slack notification:');
        console.log(message);
      }
      
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Monitor failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentMonitor;