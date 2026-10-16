const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'workflow-loader',
  permission: 0,
  description: 'Load workflow commands',
  version: '1.0.0',
};

module.exports.setup = ({ api, client }) => {
  try {
    const workflowsPath = path.join(__dirname, 'workflows.js');
    
    if (!fs.existsSync(workflowsPath)) {
      client.logger('No workflows.js found, skipping', 'warn');
      return;
    }

    // Load workflows
    const workflows = require(workflowsPath);
    
    if (!Array.isArray(workflows)) {
      client.logger('workflows.js must export an array', 'error');
      return;
    }

    // Register each workflow
    let registered = 0;
    workflows.forEach(workflow => {
      try {
        client.commandRegistry.register(workflow);
        registered++;
      } catch (error) {
        client.logger(`Failed to register workflow ${workflow.name}: ${error.message}`, 'error');
      }
    });

    client.logger(`Loaded ${registered} workflow command(s)`, 'success');
  } catch (error) {
    client.logger(`Workflow loader error: ${error.message}`, 'error');
  }
};
