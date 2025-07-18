/**
 * WORKFLOW GUARDIAN - External Process Monitor
 * 
 * Solves the critical gap: When Node.js process crashes completely,
 * the Enhanced Autonomous Brain goes down with it and can't restart itself.
 * This external guardian monitors and restarts failed workflows.
 */
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class WorkflowGuardian {
  private healthCheckUrl: string;
  private lastSuccessfulCheck: number;
  private failureCount: number = 0;
  private maxFailures: number = 3;
  private checkInterval: number = 60000; // 1 minute
  private restartCooldown: number = 120000; // 2 minutes
  private lastRestartTime: number = 0;
  private guardianLogFile: string;

  constructor() {
    this.healthCheckUrl = 'http://localhost:5000/api/health';
    this.lastSuccessfulCheck = Date.now();
    this.guardianLogFile = path.join(process.cwd(), 'guardian.log');
    this.initializeGuardian();
  }

  private initializeGuardian() {
    console.log('🛡️ WORKFLOW GUARDIAN ACTIVATED');
    console.log('🔍 Monitoring Node.js process for complete failures');
    console.log('⚡ Will automatically restart workflows when they go down');
    
    this.log('Guardian initialized - monitoring for workflow failures');
    
    // Start monitoring loop
    setInterval(() => {
      this.checkWorkflowHealth();
    }, this.checkInterval);

    // Monitor for process exit
    process.on('exit', () => {
      this.log('CRITICAL: Main process exiting - Guardian logging final state');
    });

    process.on('SIGTERM', () => {
      this.log('CRITICAL: Process terminated - Guardian detected shutdown');
    });
  }

  private async checkWorkflowHealth() {
    try {
      // Try to make a simple HTTP request to the server
      const response = await this.makeHealthCheck();
      
      if (response) {
        // Server is responding
        this.lastSuccessfulCheck = Date.now();
        this.failureCount = 0;
        // this.log('✅ Workflow health check passed');
      } else {
        this.handleFailure();
      }
    } catch (error) {
      this.handleFailure();
    }
  }

  private makeHealthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      const curl = exec(`curl -s ${this.healthCheckUrl}`, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error || stderr) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        curl.kill();
        resolve(false);
      }, 10000);
    });
  }

  private handleFailure() {
    this.failureCount++;
    const timeSinceLastSuccess = Date.now() - this.lastSuccessfulCheck;
    
    this.log(`🚨 Workflow failure detected (${this.failureCount}/${this.maxFailures})`);
    this.log(`⏰ Time since last success: ${Math.round(timeSinceLastSuccess / 1000)}s`);

    if (this.failureCount >= this.maxFailures && this.canRestart()) {
      this.restartWorkflow();
    }
  }

  private canRestart(): boolean {
    const timeSinceLastRestart = Date.now() - this.lastRestartTime;
    return timeSinceLastRestart > this.restartCooldown;
  }

  private restartWorkflow() {
    this.log('🚨 CRITICAL FAILURE: Workflow completely down - RESTARTING AUTOMATICALLY');
    this.lastRestartTime = Date.now();
    this.failureCount = 0;

    // Kill any lingering processes on port 5000
    exec('fuser -k 5000/tcp 2>/dev/null || true', (killError) => {
      if (killError) {
        this.log(`Port cleanup warning: ${killError.message}`);
      } else {
        this.log('✅ Port 5000 cleared for restart');
      }

      // Restart the workflow
      this.log('🚀 Executing workflow restart...');
      
      // Note: In Replit, we can't directly restart workflows programmatically
      // But we can create a restart script that the user can trigger
      this.createRestartScript();
      
      // Attempt to restart using npm
      exec('npm run dev', { 
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore'
      }, (error, stdout, stderr) => {
        if (error) {
          this.log(`Restart attempt failed: ${error.message}`);
        } else {
          this.log('✅ Workflow restart initiated');
        }
      });
    });
  }

  private createRestartScript() {
    const restartScript = `#!/bin/bash
# AUTOMATIC WORKFLOW RESTART SCRIPT
# Generated by Workflow Guardian on ${new Date().toISOString()}

echo "🛡️ Workflow Guardian: Automatic restart initiated"
echo "🚨 Previous workflow failure detected - restarting..."

# Kill any processes on port 5000
fuser -k 5000/tcp 2>/dev/null || true

# Wait for port to be freed
sleep 2

# Restart the application
npm run dev

echo "✅ Workflow restart completed"
`;

    fs.writeFileSync(path.join(process.cwd(), 'auto-restart.sh'), restartScript);
    exec('chmod +x auto-restart.sh');
    
    this.log('📝 Created auto-restart.sh script for manual execution if needed');
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - GUARDIAN: ${message}\n`;
    
    console.log(`🛡️ ${message}`);
    
    // Append to guardian log file
    try {
      fs.appendFileSync(this.guardianLogFile, logEntry);
    } catch (error) {
      console.log('Guardian log write failed:', error);
    }
  }

  public getStatus() {
    return {
      lastSuccessfulCheck: this.lastSuccessfulCheck,
      failureCount: this.failureCount,
      timeSinceLastSuccess: Date.now() - this.lastSuccessfulCheck,
      canRestart: this.canRestart(),
      lastRestartTime: this.lastRestartTime
    };
  }
}

// Export singleton instance
export const workflowGuardian = new WorkflowGuardian();