#!/usr/bin/env node

const { askAddChangedFiles, askCommitMessage } = require('./prompt')

askAddChangedFiles()
  .then(askCommitMessage)
  .catch(console.error)
