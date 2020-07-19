const simpleGit = require('simple-git/promise')()
const { prompt } = require('enquirer')

const prefixes = [
  'chore',
  'feat',
  'test',
  'docs',
  'style',
  'docs',
  'fix',
  'refactor'
]

const askAddChangedFiles = paths => prompt({
  type: 'multiselect',
  name: 'files',
  message: 'Please select a file to add. (Multiple possible)',
  choices: paths,
  validate: value => value.length ? true : 'Must choose at least one.'
})

module.exports.askAddChangedFiles = async () => {
  const status = await simpleGit.status()
  const stagedFiles = (await simpleGit.diffSummary(['--staged'])).files.map(file => file.file)
  const changedFiles = status.not_added

  if (!changedFiles.length && !stagedFiles.length) throw new Error('No changed files.')
  if (!changedFiles.length && stagedFiles.length) return

  if (changedFiles.length && !stagedFiles.length) {
    const { files } = await askAddChangedFiles(changedFiles)

    return simpleGit.add(files)
  }

  if (changedFiles.length && stagedFiles.length) {
    const { whetherAddFiles } = await prompt({
      type: 'confirm',
      name: 'whetherAddFiles',
      message: 'Add the modified file?'
    })

    if (!whetherAddFiles) return

    const { files } = await askAddChangedFiles(changedFiles)

    return simpleGit.add(files)
  }
}

module.exports.askCommitMessage = async () => {
  const { prefix, message } = await prompt([
    {
      type: 'select',
      name: 'prefix',
      message: 'Please select a commit prefix',
      choices: prefixes,
      required: true
    },
    {
      type: 'input',
      name: 'message',
      message: 'Please enter a commit message',
      validate: value => value ? true : 'This field is required.'
    }
  ])

  return simpleGit.commit(`${prefix}: ${message}`)
}
