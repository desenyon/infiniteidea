import * as Sentry from '@sentry/nextjs';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface AlertThreshold {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: AlertThreshold[] = [
    { metric: 'api_response_time', threshold: 5000, operator: 'gt', severity: 'high' },
    { metric: 'database_query_time', threshold: 2000, operator: 'gt', severity: 'medium' },
    { metric: 'memory_usage_percentage', threshold: 85, operator: 'gt', severity: 'high' },
    { metric: 'error_rate', threshold: 5, operator: 'gt', severity: 'critical' },
    { metric: 'ai_generation_time', threshold: 120000, operator: 'gt', severity: 'medium' }
  ];

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Check thresholds
    this.checkThresholds(metric);
    
    // Send to Sentry for performance monitoring
    if (process.env.NODE_ENV === 'production') {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `${metric.name}: ${metric.value}${metric.unit}`,
        level: 'info',
        data: {
          metric: metric.name,
          value: metric.value,
          unit: metric.unit,
          tags: metric.tags
        }
      });
    }
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find(t => t.metric === metric.name);
    if (!threshold) return;

    let alertTriggered = false;
    
    switch (threshold.operator) {
      case 'gt':
        alertTriggered = metric.value > threshold.threshold;
        break;
      case 'lt':
        alertTriggered = metric.value < threshold.threshold;
        break;
      case 'eq':
        alertTriggered = metric.value === threshold.threshold;
        break;
    }

    if (alertTriggered) {
      this.triggerAlert(metric, threshold);
    }
  }

  private triggerAlert(metric: PerformanceMetric, threshold: AlertThreshold): void {
    const alertMessage = `Performance threshold exceeded: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold.threshold}${metric.unit})`;
    
    console.warn(alertMessage, {
      metric: metric.name,
      value: metric.value,
      threshold: threshold.threshold,
      severity: threshold.severity,
      tags: metric.tags
    });

    // Send to Sentry based on severity
    if (threshold.severity === 'critical' || threshold.severity === 'high') {
      Sentry.captureMessage(alertMessage, {
        level: threshold.severity === 'critical' ? 'error' : 'warning',
        tags: {
          component: 'performance-monitor',
          metric: metric.name,
          severity: threshold.severity,
          ...metric.tags
        },
        extra: {
          metricValue: metric.value,
          threshold: threshold.threshold,
          unit: metric.unit
        }
      });
    }

    // Send webhook notification for critical alerts
    if (threshold.severity === 'critical') {
      this.sendWebhookAlert(metric, threshold, alertMessage);
    }
  }

  private async sendWebhookAlert(
    metric: PerformanceMetric, 
    threshold: AlertThreshold, 
    message: string
  ): Promise<void> {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    try {
      const payload = {
        text: `🚨 Critical Performance Alert`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Metric', value: metric.name, short: true },
            { title: 'Value', value: `${metric.value}${metric.unit}`, short: true },
            { title: 'Threshold', value: `${threshold.threshold}${metric.unit}`, short: true },
            { title: 'Severity', value: threshold.severity.toUpperCase(), short: true },
            { title: 'Environment', value: process.env.NODE_ENV || 'unknown', short: true },
            { title: 'Timestamp', value: metric.timestamp.toISOString(), short: true }
          ],
          footer: 'Desenyon Performance Monitor'
        }]
      };

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  getMetrics(metricName?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = metricName 
      ? this.metrics.filter(m => m.name === metricName)
      : this.metrics;
    
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getAverageMetric(metricName: string, timeWindowMs: number = 300000): number | null {
    const cutoff = new Date(Date.now() - timeWindowMs);
    const recentMetrics = this.metrics.filter(
      m => m.name === metricName && m.timestamp >= cutoff
    );

    if (recentMetrics.length === 0) return null;

    const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / recentMetrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  // Convenience methods for common metrics
  recordAPIResponseTime(endpoint: string, responseTime: number, statusCode?: number): void {
    this.recordMetric({
      name: 'api_response_time',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        endpoint,
        status_code: statusCode?.toString() || 'unknown'
      }
    });
  }

  recordDatabaseQueryTime(query: string, responseTime: number): void {
    this.recordMetric({
      name: 'database_query_time',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        query_type: query
      }
    });
  }

  recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal + usage.external;
    const usedMemory = usage.heapUsed;
    const percentage = (usedMemory / totalMemory) * 100;

    this.recordMetric({
      name: 'memory_usage_percentage',
      value: Math.round(percentage * 100) / 100,
      unit: 'percentage',
      timestamp: new Date(),
      tags: {
        heap_used: usage.heapUsed.toString(),
        heap_total: usage.heapTotal.toString()
      }
    });
  }

  recordAIGenerationTime(provider: string, responseTime: number, success: boolean): void {
    this.recordMetric({
      name: 'ai_generation_time',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        provider,
        success: success.toString()
      }
    });
  }

  recordErrorRate(endpoint: string, errorCount: number, totalRequests: number): void {
    const rate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    
    this.recordMetric({
      name: 'error_rate',
      value: Math.round(rate * 100) / 100,
      unit: 'percentage',
      timestamp: new Date(),
      tags: {
        endpoint,
        error_count: errorCount.toString(),
        total_requests: totalRequests.toString()
      }
    });
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware function for automatic API monitoring
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  metricName: string,
  tags?: Record<string, string>
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    let success = true;
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const responseTime = Date.now() - start;
      performanceMonitor.recordMetric({
        name: metricName,
        value: responseTime,
        unit: 'ms',
        timestamp: new Date(),
        tags: {
          ...tags,
          success: success.toString()
        }
      });
    }
  };
}